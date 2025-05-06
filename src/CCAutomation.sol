// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {AutomationCompatible} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import {CrossChain, IRouterClient, Client} from "./CrossChain.sol";

/// @notice This contract is necessary to enable automation for the ContentCompetition system
/// @title CCAutomation - Content Competition (Crosschain) Automation
/// @author @contractlevel
// Owner must:
// 1. set Lens selector
// 2. set allowed peer for ContentCompetion address
// 3. set ccip gas limit
// 4. fund this contract with LINK
// 5. set automation forwarder
contract CCAutomation is AutomationCompatible, CrossChain {
    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/
    error CCAutomation__OnlyForwarder();
    error CCAutomation__NotEnoughLink(uint256 linkBalance, uint256 fees);

    /*//////////////////////////////////////////////////////////////
                               VARIABLES
    //////////////////////////////////////////////////////////////*/
    struct Competition {
        uint256 votingDeadline;
        bool hasConcluded; // @review - rename this??
    }

    /// @dev number of competitions, used for competitionId
    uint256 internal s_competitionCount;
    /// @dev track competitions details for each competitionId
    mapping(uint256 competitionId => Competition competitions) internal s_competitions;
    /// @dev Chainlink Automation forwarder
    address internal s_forwarder;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/
    event CompetitionCreated(
        bytes32 indexed ccipMessagedId, uint256 indexed competitionId, uint256 indexed votingDeadline
    );
    event CompetitionAutomated(bytes32 indexed ccipMessageId, uint256 indexed competitionId);
    event ForwarderSet(address indexed forwarder);

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    constructor(address link, address ccipRouter, uint256 ccipGasLimit) CrossChain(link, ccipRouter, ccipGasLimit) {
        s_competitionCount = 1;
    }

    /*//////////////////////////////////////////////////////////////
                                EXTERNAL
    //////////////////////////////////////////////////////////////*/
    function checkUpkeep(bytes calldata /* checkData */ )
        external
        view
        cannotExecute
        returns (bool upkeepNeeded, bytes memory performData)
    {
        /// @dev read values from storage
        uint256 competitionCount = s_competitionCount;
        address forwarder = s_forwarder;
        uint64 dstChainSelector = s_allowedChain;
        address receiver = s_allowedPeer;

        // @review - is this loop logic correct?
        for (uint256 competitionId = 1; competitionId < competitionCount; ++competitionId) {
            Competition storage s_comp = s_competitions[competitionId];

            /// @dev if a valid competition is found, create performData
            if (block.timestamp > s_comp.votingDeadline && !s_comp.hasConcluded) {
                /// @dev build ccip message
                bytes memory data = abi.encode(competitionId);
                Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(receiver, data);
                uint256 fees = _getCCIPFees(dstChainSelector, evm2AnyMessage);

                upkeepNeeded = true;
                performData = abi.encode(competitionId, fees, forwarder, dstChainSelector, evm2AnyMessage);
                return (upkeepNeeded, performData);
            }
        }
        /// @dev no eligible competition found
        upkeepNeeded = false;
        performData = "";
    }

    function performUpkeep(bytes calldata performData) external {
        /// @dev decode perform data
        (
            uint256 competitionId,
            uint256 fees,
            address forwarder,
            uint64 dstChainSelector,
            Client.EVM2AnyMessage memory evm2AnyMessage
        ) = abi.decode(performData, (uint256, uint256, address, uint64, Client.EVM2AnyMessage));

        /// @dev revert if not chainlink forwarder
        if (msg.sender != forwarder) revert CCAutomation__OnlyForwarder();

        /// @dev set to true so chainlink automation doesn't call again
        s_competitions[competitionId].hasConcluded = true;

        /// @dev approve link and ccip send
        i_link.approve(i_ccipRouter, fees);
        bytes32 ccipMessageId = IRouterClient(i_ccipRouter).ccipSend(dstChainSelector, evm2AnyMessage);

        /// @dev emit event
        emit CompetitionAutomated(ccipMessageId, competitionId);
    }

    /// @notice onlyOwner utility function for withdrawing LINK
    function withdrawLink() external onlyOwner {
        i_link.transfer(msg.sender, i_link.balanceOf(address(this)));
    }

    /*//////////////////////////////////////////////////////////////
                                INTERNAL
    //////////////////////////////////////////////////////////////*/
    /// @param message Any2EVMMessage.
    function _ccipReceive(Client.Any2EVMMessage memory message)
        internal
        override
        onlyAllowed(message.sourceChainSelector, abi.decode(message.sender, (address)))
    {
        /// @dev decode competitionId and votingDeadline
        (uint256 competitionId, uint256 votingDeadline) = abi.decode(message.data, (uint256, uint256));

        /// @dev update storage with the competitionId and the votingDeadline
        Competition storage s_comp = s_competitions[competitionId];
        s_comp.votingDeadline = votingDeadline;

        /// @dev update competitionCount storage
        s_competitionCount = competitionId;

        emit CompetitionCreated(message.messageId, competitionId, votingDeadline);
    }

    /*//////////////////////////////////////////////////////////////
                                 SETTER
    //////////////////////////////////////////////////////////////*/
    function setForwarder(address forwarder) external onlyOwner {
        s_forwarder = forwarder;
        emit ForwarderSet(forwarder);
    }
}
