// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script} from "forge-std/Script.sol";
import {HelperConfig} from "../HelperConfig.s.sol";
import {CCAutomation} from "../../src/CCAutomation.sol";

/// @notice deploy to eth
contract DeployCCAutomation is Script {
    /*//////////////////////////////////////////////////////////////
                                  RUN
    //////////////////////////////////////////////////////////////*/
    function run() public returns (CCAutomation, HelperConfig) {
        HelperConfig config = new HelperConfig();
        (, address link, address ccipRouter, uint256 ccipGasLimit,,,) = config.activeNetworkConfig();

        vm.startBroadcast();
        CCAutomation ccAuto = new CCAutomation(link, ccipRouter, ccipGasLimit);
        vm.stopBroadcast();
        return (ccAuto, config);
    }
}
