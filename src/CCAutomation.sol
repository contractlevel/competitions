// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {CCIPReceiver} from "@chainlink/contracts/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {IRouterClient, Client} from "@chainlink/contracts/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {AutomationCompatible} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

contract CCAutomation is AutomationCompatible, Ownable, CCIPReceiver {
    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/
    error CCAutomation__OnlyForwarder();
    error CCAutomation__NotAllowed(uint64 chainSelector, address peer);
    error CCAutomation__NotEnoughLink(uint256 linkBalance, uint256 fees);

    /*//////////////////////////////////////////////////////////////
                               VARIABLES
    //////////////////////////////////////////////////////////////*/
    struct Competition {
        uint256 votingDeadline;
        bool hasConcluded; // @review - rename this??
    }

    LinkTokenInterface internal immutable i_link;

    uint256 internal s_competitionCount;
    mapping(uint256 competitionId => Competition competitions) internal s_competitions;
    address internal s_forwarder;
    mapping(uint64 chainSelector => mapping(address peer => bool isAllowed)) internal s_allowedPeers;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/
    event ForwarderSet(address indexed forwarder);
    event CompetitionCreated(bytes32 indexed ccipMessagedId, uint256 competitionId, uint256 votingDeadline);
    event AllowedPeerSet(uint64 chainSelector, address indexed peer, bool isAllowed);

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    constructor(address link, address ccipRouter) Ownable(msg.sender) CCIPReceiver(ccipRouter) {
        i_link = LinkTokenInterface(link);
        s_competitionCount = 1;
    }

    /*//////////////////////////////////////////////////////////////
                                EXTERNAL
    //////////////////////////////////////////////////////////////*/
    function checkUpkeep(bytes calldata checkData)
        external
        cannotExecute
        returns (bool upkeepNeeded, bytes memory performData)
    {
        uint256 competitionCount = s_competitionCount;
        for (uint256 competitionId = 1; competitionId < competitionCount; ++competitionId) {
            Competition storage comp = s_competitions[competitionId];
            if (block.timestamp > comp.votingDeadline && !comp.hasConcluded) {
                upkeepNeeded = true;
                performData = abi.encode(competitionId);
                return (upkeepNeeded, performData);
            }
        }
        // No eligible competition found
        upkeepNeeded = false;
        performData = "";
    }

    function performUpkeep(bytes calldata performData) external {
        if (msg.sender != s_forwarder) revert CCAutomation__OnlyForwarder();

        /// @dev get competitionId
        uint256 competitionId = abi.decode(performData, (uint256));
        /// @dev set to true so chainlink automation doesn't call again
        s_competitions[competitionId].hasConcluded = true;

        /// @dev build ccip message
        // @review - can this logic go in checkUpkeep? probably
        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver), // ABI-encoded receiver address
            data: abi.encode(text), // ABI-encoded string
            tokenAmounts: new Client.EVMTokenAmount[](0), // Empty array indicating no tokens are being sent
            extraArgs: Client._argsToBytes(
                // Additional arguments, setting gas limit and allowing out-of-order execution.
                // Best Practice: For simplicity, the values are hardcoded. It is advisable to use a more dynamic approach
                // where you set the extra arguments off-chain. This allows adaptation depending on the lanes, messages,
                // and ensures compatibility with future CCIP upgrades. Read more about it here: https://docs.chain.link/ccip/best-practices#using-extraargs
                Client.EVMExtraArgsV2({
                    gasLimit: 200_000, // Gas limit for the callback on the destination chain
                    allowOutOfOrderExecution: true // Allows the message to be executed out of order relative to other messages from the same sender
                })
            ),
            // Set the feeToken  address, indicating LINK will be used for fees
            feeToken: address(s_linkToken)
        });

        uint256 fees = IRouterClient(i_ccipRouter).getFee(destinationChainSelector, evm2AnyMessage);
        uint256 linkBalance = i_link.balanceOf(address(this));
        if (fees > linkBalance) revert CCAutomation__NotEnoughLink(linkBalance, fees);

        i_link.approve(i_ccipRouter, fees);
        IRouterClient(i_ccipRouter).ccipSend(destinationChainSelector, evm2AnyMessage);

        // Send the message through the router and store the returned message ID
        messageId = IRouterClient(i_ccipRouter).ccipSend(destinationChainSelector, evm2AnyMessage);

        // Emit an event with message details
        emit MessageSent(messageId, destinationChainSelector, receiver, text, address(s_linkToken), fees);
    }

    /*//////////////////////////////////////////////////////////////
                                INTERNAL
    //////////////////////////////////////////////////////////////*/
    /// @param message Any2EVMMessage.
    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
        /// @dev revert if sender is not allowed
        uint64 sourceChainSelector = any2EvmMessage.sourceChainSelector;
        address sender = abi.decode(any2EvmMessage.sender, (address));
        if (!s_allowedPeers[sourceChainSelector][sender]) revert CCAutomation__NotAllowed(sourceChainSelector, sender);

        /// @dev update storage with the competitionId and the votingDeadline
        (uint256 competitionId, uint256 votingDeadline) = abi.decode(any2EvmMessage.data, (uint256, uint256));
        Competition storage comp = s_competitions[competitionId];
        comp.votingDeadline = votingDeadline;

        /// @dev update competitionCount storage
        s_competitionCount = competitionId;

        emit CompetitionCreated(any2EvmMessage.messageId, competitionId, votingDeadline);
    }

    /*//////////////////////////////////////////////////////////////
                                 SETTER
    //////////////////////////////////////////////////////////////*/
    function setForwarder(address forwarder) external onlyOwner {
        s_forwarder = forwarder;
        emit ForwarderSet(forwarder);
    }

    function setAllowedPeers(uint64 chainSelector, address peer, bool isAllowed) external onlyOwner {
        s_allowedPeers[chainSelector][peer] = isAllowed;
        emit AllowedPeerSet(chainSelector, peer, isAllowed);
    }
}
