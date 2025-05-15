// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script} from "forge-std/Script.sol";
import {Competitions} from "../../src/Competitions.sol";
import {HelperConfig} from "../HelperConfig.s.sol";

contract DeployCompetitions is Script {
    /*//////////////////////////////////////////////////////////////
                                  RUN
    //////////////////////////////////////////////////////////////*/
    function run() public returns (Competitions, HelperConfig) {
        HelperConfig config = new HelperConfig();
        (address feed,,,,,,) = config.activeNetworkConfig();

        vm.startBroadcast();
        Competitions comp = new Competitions(feed);
        vm.stopBroadcast();
        return (comp, config);
    }
}
