// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {BaseTest, console2, Vm} from "../BaseTest.t.sol";

contract CreateCompetitionTest is BaseTest {
    function test_competitions_createCompetition_revertsWhen_zeroMsgValue() public {
        string memory theme = "pirates";
        uint256 submissionDeadline = block.timestamp + 10 minutes;
        uint256 votingDeadline = submissionDeadline + 10 minutes;

        _changePrank(creator);
        vm.expectRevert(abi.encodeWithSignature("Competitions__PrizePoolRequired()"));
        comp.createCompetition(theme, submissionDeadline, votingDeadline);
    }

    function test_competitions_createCompetition_revertsWhen_invalidSubmissionDeadline() public {
        string memory theme = "pirates";
        uint256 invalidSubmissionDeadline = block.timestamp;
        uint256 votingDeadline = invalidSubmissionDeadline + 10 minutes;

        _changePrank(creator);
        vm.expectRevert(abi.encodeWithSignature("Competitions__InvalidSubmissionDeadline()"));
        comp.createCompetition{value: ONE_ETH}(theme, invalidSubmissionDeadline, votingDeadline);
    }

    function test_competitions_createCompetition_revertsWhen_invalidVotingDeadline() public {
        string memory theme = "pirates";
        uint256 submissionDeadline = block.timestamp + 10 minutes;
        uint256 invalidVotingDeadline = submissionDeadline - 1;

        _changePrank(creator);
        vm.expectRevert(abi.encodeWithSignature("Competitions__InvalidVotingDeadline()"));
        comp.createCompetition{value: ONE_ETH}(theme, submissionDeadline, invalidVotingDeadline);
    }

    function test_competitions_createCompetition_revertsWhen_invalidTheme() public {
        string memory invalidTheme = "";
        uint256 submissionDeadline = block.timestamp + 10 minutes;
        uint256 votingDeadline = submissionDeadline + 10 minutes;

        _changePrank(creator);
        vm.expectRevert(abi.encodeWithSignature("Competitions__InvalidTheme()"));
        comp.createCompetition{value: ONE_ETH}(invalidTheme, submissionDeadline, votingDeadline);
    }

    function test_competitions_createCompetition_success() public {
        string memory theme = "pirates";
        uint256 submissionDeadline = block.timestamp + 10 minutes;
        uint256 votingDeadline = submissionDeadline + 10 minutes;

        _changePrank(creator);
        uint256 competitionId = comp.createCompetition{value: ONE_ETH}(theme, submissionDeadline, votingDeadline);

        assertEq(competitionId, 1);
        assertEq(comp.getSubmissionDeadline(competitionId), submissionDeadline);
        assertEq(comp.getVotingDeadline(competitionId), votingDeadline);
        assertEq(comp.getCreator(competitionId), creator);
        assertEq(comp.getPrizePool(competitionId), ONE_ETH - comp.getProtocolFee(ONE_ETH));
        assertEq(comp.getTheme(competitionId), theme);
    }
}
