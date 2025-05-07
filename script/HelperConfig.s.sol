// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script} from "forge-std/Script.sol";

contract HelperConfig is Script {
    /*//////////////////////////////////////////////////////////////
                               VARIABLES
    //////////////////////////////////////////////////////////////*/
    uint256 internal constant INITIAL_CCIP_GAS_LIMIT = 200_000;

    /*//////////////////////////////////////////////////////////////
                             NETWORK CONFIG
    //////////////////////////////////////////////////////////////*/
    struct NetworkConfig {
        address feed;
        address link;
        address ccipRouter;
        uint256 ccipGasLimit;
        uint64 allowedChainSelector;
        address allowedPeer;
    }

    NetworkConfig public activeNetworkConfig;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    constructor() {
        if (block.chainid == 37111) activeNetworkConfig = getLensSepoliaConfig();
        if (block.chainid == 11155111) activeNetworkConfig = getEthSepoliaConfig();
        // else activeNetworkConfig = getOrCreateAnvilEthConfig();
    }

    /*//////////////////////////////////////////////////////////////
                                 GETTER
    //////////////////////////////////////////////////////////////*/
    function getLensSepoliaConfig() public pure returns (NetworkConfig memory) {
        return NetworkConfig({
            feed: 0x31232Cb7dE0dce17949ffA58E9E38EEeB367C871, // https://lens.xyz/docs/protocol/resources/contracts#deployed-contracts-lens-testnet
            link: 0x7f1b9eE544f9ff9bB521Ab79c205d79C55250a36,
            ccipRouter: 0xf5Aa9fe2B78d852490bc4E4Fe9ab19727DD10298, // https://docs.chain.link/ccip/directory/testnet/chain/ethereum-testnet-sepolia-lens-1
            ccipGasLimit: INITIAL_CCIP_GAS_LIMIT,
            allowedChainSelector: 16015286601757825753, // eth sepolia selector https://docs.chain.link/ccip/directory/testnet/chain/ethereum-testnet-sepolia
            allowedPeer: address(0) // update with CCAutomation on eth sepolia
        });
    }

    function getEthSepoliaConfig() public pure returns (NetworkConfig memory) {
        return NetworkConfig({
            feed: address(0),
            link: 0x779877A7B0D9E8603169DdbD7836e478b4624789,
            ccipRouter: 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59, // https://docs.chain.link/ccip/directory/testnet/chain/ethereum-testnet-sepolia
            ccipGasLimit: INITIAL_CCIP_GAS_LIMIT,
            allowedChainSelector: 6827576821754315911, // lens sepolia selector
            allowedPeer: address(0) // update with ContentCompetition on lens sepolia
        });
    }

    // function getOrCreateAnvilEthConfig() public returns (NetworkConfig memory) {
    //     return NetworkConfig({
    //         feed: ,
    //         link: ,
    //         ccipRouter: ,
    //         ccipGasLimit: ,
    //         allowedChainSelector: ,
    //         allowedPeer:
    //     });
    // }
}
