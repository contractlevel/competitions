// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {BaseTest} from "../BaseTest.t.sol";

contract VoteTest is BaseTest {
    function test_competitions_vote_revertsWhen_zeroCompetitionId() public {
        vm.expectRevert(abi.encodeWithSignature("Competitions__NoZeroValue()"));
        comp.vote(0, 1);
    }

    function test_competitions_vote_revertsWhen_zeroPostId() public {
        uint256 competitionId = _createCompetition();
        vm.expectRevert(abi.encodeWithSignature("Competitions__NoZeroValue()"));
        comp.vote(competitionId, 0);
    }

    function test_competitions_vote_revertsWhen_submissionDeadlineNotPassed() public {
        uint256 competitionId = _createCompetition();
        vm.expectRevert(abi.encodeWithSignature("Competitions__VotingNotStarted()"));
        comp.vote(competitionId, 1);
    }

    function test_competitions_vote_revertsWhen_votingDeadlinePassed() public {
        uint256 competitionId = _createCompetition();
        vm.warp(comp.getVotingDeadline(competitionId) + 1);
        vm.expectRevert(abi.encodeWithSignature("Competitions__VotingClosed()"));
        comp.vote(competitionId, 1);
    }

    function test_competitions_vote_revertsWhen_alreadyVoted() public {
        uint256 competitionId = _createCompetition();
        uint256 postId = _createPost();
        _changePrank(user);
        comp.submitPost(competitionId, postId);
        vm.warp(comp.getVotingDeadline(competitionId) - 1);
        comp.vote(competitionId, postId);
        vm.expectRevert(abi.encodeWithSignature("Competitions__AlreadyVoted()"));
        comp.vote(competitionId, postId);
    }

    function test_competitions_vote_revertsWhen_invalidPost() public {
        uint256 competitionId = _createCompetition();
        vm.warp(comp.getVotingDeadline(competitionId) - 1);
        vm.expectRevert(abi.encodeWithSignature("Competitions__InvalidPost()"));
        comp.vote(competitionId, 1);
    }

    function test_competitions_vote_success() public {
        uint256 competitionId = _createCompetition();
        uint256 postId = _createPost();
        _changePrank(user);
        comp.submitPost(competitionId, postId);
        vm.warp(comp.getVotingDeadline(competitionId) - 1);
        comp.vote(competitionId, postId);
        assertEq(comp.getVotes(competitionId, postId), 1);
        assertEq(comp.getVoted(competitionId, user), true);
    }
}
