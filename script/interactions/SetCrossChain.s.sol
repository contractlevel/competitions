// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script} from "forge-std/Script.sol";
import {HelperConfig} from "../HelperConfig.s.sol";
import {ContentCompetition} from "../../src/crosschain/ContentCompetition.sol";
import {ICrossChain} from "../../src/interfaces/ICrossChain.sol";

contract SetCrossChain is Script {
    /*//////////////////////////////////////////////////////////////
                                  RUN
    //////////////////////////////////////////////////////////////*/
    function run() public returns (address, HelperConfig) {
        HelperConfig config = new HelperConfig();
        (,,,, uint64 allowedChainSelector, address allowedPeer, address deployedContract) = config.activeNetworkConfig();

        vm.startBroadcast();
        ICrossChain(deployedContract).setAllowedChain(allowedChainSelector);
        ICrossChain(deployedContract).setAllowedPeer(allowedPeer);
        // if chainid == 11155111, set forwarder
        vm.stopBroadcast();
        return (deployedContract, config);
    }
}
