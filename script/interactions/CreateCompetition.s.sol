// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script} from "forge-std/Script.sol";
import {HelperConfig} from "../HelperConfig.s.sol";
import {ContentCompetition} from "../../src/crosschain/ContentCompetition.sol";
import {IContentCompetition} from "../../src/interfaces/IContentCompetition.sol";

contract SetCrossChain is Script {
    /*//////////////////////////////////////////////////////////////
                                  RUN
    //////////////////////////////////////////////////////////////*/
    function run() public returns (bytes32 ccipMessageId, uint256 competitionId) {
        HelperConfig config = new HelperConfig();
        (,,,,,, address deployedContract) = config.activeNetworkConfig();
        // 0xF32B69c20C355BDcfaCACD14463776fC7Ed2Aee1 // ccipSend commented out
        // 0x738b14136d388Da2371Ab4920926aC51D831ABD4 // everything commented out
        // 0x994d566C49B3B83ddE92C7E8bbF676A952B28d69 // even more commented

        string memory theme = "Lens Hackathon 2025";
        uint256 submissionDeadline = block.timestamp + 5 minutes;
        uint256 votingDeadline = block.timestamp + 30 minutes;

        vm.startBroadcast();
        (ccipMessageId, competitionId) = IContentCompetition(0x994d566C49B3B83ddE92C7E8bbF676A952B28d69)
            .createCompetition{value: 1e14}(theme, submissionDeadline, votingDeadline);
        vm.stopBroadcast();
        return (ccipMessageId, competitionId);
    }
}
