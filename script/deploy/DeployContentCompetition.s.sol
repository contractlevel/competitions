// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script} from "forge-std/Script.sol";
import {HelperConfig} from "../HelperConfig.s.sol";
import {ContentCompetition} from "../../src/ContentCompetition.sol";

/// @notice deploy to lens
contract DeployContentCompetition is Script {
    /*//////////////////////////////////////////////////////////////
                                  RUN
    //////////////////////////////////////////////////////////////*/
    function run() public returns (ContentCompetition, HelperConfig) {
        HelperConfig config = new HelperConfig();
        (address feed, address link, address ccipRouter, uint256 ccipGasLimit,,,) = config.activeNetworkConfig();

        vm.startBroadcast();
        ContentCompetition comp = new ContentCompetition(feed, link, ccipRouter, ccipGasLimit);
        vm.stopBroadcast();
        return (comp, config);
    }
}
