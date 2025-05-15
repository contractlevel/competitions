// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {CCIPReceiver} from "@chainlink/contracts/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {IRouterClient, Client} from "@chainlink/contracts/src/v0.8/ccip/interfaces/IRouterClient.sol";

import {ICrossChain} from "../interfaces/ICrossChain.sol";

/// @notice this contract is a fork of CrossChain.sol because Lens testnet doesn't have LINK (?!)
/// @notice inherit this for crosschain functionality
// Owner must:
// 1. set allowed chain selector
// 2. set allowed peer address
// 3. fund this contract with GRASS
abstract contract LensCrossChain is Ownable, CCIPReceiver, ICrossChain {
    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/
    error CrossChain__ChainNotAllowed(uint64 chainSelector);
    error CrossChain__PeerNotAllowed(address peer);
    error CrossChain__NotEnoughGrass(uint256 grassBalance, uint256 fees);

    /*//////////////////////////////////////////////////////////////
                               VARIABLES
    //////////////////////////////////////////////////////////////*/
    /// @dev gas limit for CCIP
    uint256 internal s_ccipGasLimit;
    /// @dev CCIP selector for allowed chain
    uint64 internal s_allowedChain;
    /// @dev address for crosschain peer contract
    address internal s_allowedPeer;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/
    event AllowedPeerSet(address indexed peer);
    event AllowedChainSet(uint64 indexed chainSelector);
    event CCIPGasLimitSet(uint256 indexed gasLimit);

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/
    modifier onlyAllowed(uint64 chainSelector, address peer) {
        uint64 allowedChain = s_allowedChain;
        if (chainSelector != allowedChain) revert CrossChain__ChainNotAllowed(chainSelector);
        if (peer != s_allowedPeer) revert CrossChain__PeerNotAllowed(peer);
        _;
    }

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    constructor(address ccipRouter, uint256 ccipGasLimit) Ownable(msg.sender) CCIPReceiver(ccipRouter) {
        s_ccipGasLimit = ccipGasLimit;
    }

    /*//////////////////////////////////////////////////////////////
                                INTERNAL
    //////////////////////////////////////////////////////////////*/
    function _buildCCIPMessage(address receiver, bytes memory data)
        internal
        view
        returns (Client.EVM2AnyMessage memory evm2AnyMessage)
    {
        evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: data,
            tokenAmounts: new Client.EVMTokenAmount[](0), // no tokens are being sent
            extraArgs: Client._argsToBytes(
                Client.GenericExtraArgsV2({gasLimit: s_ccipGasLimit, allowOutOfOrderExecution: true})
            ),
            feeToken: address(0)
        });
    }

    function _getCCIPFees(uint64 dstChainSelector, Client.EVM2AnyMessage memory evm2AnyMessage)
        internal
        view
        returns (uint256 fees)
    {
        fees = IRouterClient(i_ccipRouter).getFee(dstChainSelector, evm2AnyMessage);
        uint256 grassBalance = address(this).balance;
        if (fees > grassBalance) revert CrossChain__NotEnoughGrass(grassBalance, fees);
    }

    /*//////////////////////////////////////////////////////////////
                                 SETTER
    //////////////////////////////////////////////////////////////*/
    function setAllowedPeer(address peer) external onlyOwner {
        s_allowedPeer = peer;
        emit AllowedPeerSet(peer);
    }

    function setAllowedChain(uint64 chainSelector) external onlyOwner {
        s_allowedChain = chainSelector;
        emit AllowedChainSet(chainSelector);
    }

    function setCcipGasLimit(uint256 gasLimit) external onlyOwner {
        s_ccipGasLimit = gasLimit;
        emit CCIPGasLimitSet(gasLimit);
    }
}
