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
        address deployedContract;
    }

    NetworkConfig public activeNetworkConfig;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    constructor() {
        if (block.chainid == 37111) activeNetworkConfig = getLensSepoliaConfig();
        if (block.chainid == 11155111) activeNetworkConfig = getEthSepoliaConfig();
        if (block.chainid == 232) activeNetworkConfig = getLensMainnetConfig();
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
            allowedPeer: 0x05e158c17dA90eA53b4dFC939dCDaf3899e6aFD1, // CCAutomation on Eth Sepolia
            deployedContract: 0xb616C2D766Ef04b426FD1DC456A31dbEC9697B18
        });
    }

    function getLensMainnetConfig() public pure returns (NetworkConfig memory) {
        return NetworkConfig({
            feed: 0xcB5E109FFC0E15565082d78E68dDDf2573703580, // https://lens.xyz/docs/protocol/resources/contracts#deployed-contracts-lens-mainnet
            link: address(0),
            ccipRouter: address(0),
            ccipGasLimit: 0,
            allowedChainSelector: 0,
            allowedPeer: address(0),
            deployedContract: address(0)
        });
    }

    function getEthSepoliaConfig() public pure returns (NetworkConfig memory) {
        return NetworkConfig({
            feed: address(0),
            link: 0x779877A7B0D9E8603169DdbD7836e478b4624789,
            ccipRouter: 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59, // https://docs.chain.link/ccip/directory/testnet/chain/ethereum-testnet-sepolia
            ccipGasLimit: INITIAL_CCIP_GAS_LIMIT,
            allowedChainSelector: 6827576821754315911, // lens sepolia selector
            allowedPeer: 0xb616C2D766Ef04b426FD1DC456A31dbEC9697B18, // update with ContentCompetition on lens sepolia
            deployedContract: 0x05e158c17dA90eA53b4dFC939dCDaf3899e6aFD1
        });
        // forwarder: 0xA963D00af8652329eb79E9c42B6c90f10A972685
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
