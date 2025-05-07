// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {BaseTest, console2, Vm} from "../BaseTest.t.sol";

contract CreateCompetitionTest is BaseTest {
    function test_contentCompetition_createCompetition_revertsWhen_zeroMsgValue() public {
        string memory theme = "pirates";
        uint256 submissionDeadline = block.timestamp + 10 minutes;
        uint256 votingDeadline = submissionDeadline + 10 minutes;
        _changePrank(creator);
        vm.expectRevert(abi.encodeWithSignature("ContentCompetition__PrizePoolRequired()"));
        comp.createCompetition(theme, submissionDeadline, votingDeadline);
    }
}
