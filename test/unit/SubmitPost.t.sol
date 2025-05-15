// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {BaseTest} from "../BaseTest.t.sol";

contract SubmitPostTest is BaseTest {
    function test_competitions_submitPost_revertsWhen_zeroCompetitionId() public {
        vm.expectRevert(abi.encodeWithSignature("Competitions__NoZeroValue()"));
        comp.submitPost(0, 1);
    }

    function test_competitions_submitPost_revertsWhen_zeroPostId() public {
        uint256 competitionId = _createCompetition();
        vm.expectRevert(abi.encodeWithSignature("Competitions__NoZeroValue()"));
        comp.submitPost(competitionId, 0);
    }

    function test_competitions_submitPost_revertsWhen_submissionDeadlinePassed() public {
        uint256 competitionId = _createCompetition();
        vm.warp(comp.getSubmissionDeadline(competitionId) + 1);
        _changePrank(user);
        vm.expectRevert(abi.encodeWithSignature("Competitions__SubmissionsClosed()"));
        comp.submitPost(competitionId, 1);
    }

    function test_competitions_submitPost_revertsWhen_postAlreadySubmitted() public {
        uint256 competitionId = _createCompetition();
        uint256 postId = _createPost();
        _changePrank(user);
        comp.submitPost(competitionId, postId);
        vm.expectRevert(abi.encodeWithSignature("Competitions__PostAlreadySubmitted()"));
        comp.submitPost(competitionId, postId);
    }

    function test_competitions_submitPost_revertsWhen_invalidPost() public {
        uint256 competitionId = _createCompetition();
        vm.expectRevert(abi.encodeWithSignature("Competitions__InvalidPost()"));
        comp.submitPost(competitionId, 1);
    }

    function test_competitions_submitPost_success() public {
        uint256 competitionId = _createCompetition();
        uint256 postId = _createPost();
        _changePrank(user);
        comp.submitPost(competitionId, postId);
        assertEq(comp.getSubmissions(competitionId).length, 1);
        assertEq(comp.getSubmissions(competitionId)[0], postId);
    }
}
