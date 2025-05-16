// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {BaseTest} from "../BaseTest.t.sol";

contract DistributePrizePoolTest is BaseTest {
    function test_competitions_distributePrizePool_revertsWhen_zeroCompetitionId() public {
        vm.expectRevert(abi.encodeWithSignature("Competitions__NoZeroValue()"));
        comp.distributePrizePool(0);
    }

    function test_competitions_distributePrizePool_revertsWhen_votingNotFinished() public {
        uint256 competitionId = _createCompetition();
        vm.expectRevert(abi.encodeWithSignature("Competitions__VotingNotFinished()"));
        comp.distributePrizePool(competitionId);
    }

    function test_competitions_distributePrizePool_revertsWhen_prizeAlreadyDistributed() public {
        uint256 competitionId = _createCompetition();
        vm.warp(comp.getVotingDeadline(competitionId) + 1);
        comp.distributePrizePool(competitionId);
        vm.expectRevert(abi.encodeWithSignature("Competitions__PrizeAlreadyDistributed()"));
        comp.distributePrizePool(competitionId);
    }

    function test_competitions_distributePrizePool_sendToCreatorWhen_noSubmissions() public {
        uint256 competitionId = _createCompetition();
        vm.warp(comp.getVotingDeadline(competitionId) + 1);

        uint256 balanceBefore = creator.balance;

        (address winner, uint256 winningPostId, uint256 prizePool) = comp.distributePrizePool(competitionId);

        uint256 balanceAfter = creator.balance;
        assertEq(balanceAfter - balanceBefore, prizePool);
        assertEq(winner, comp.getCreator(competitionId));
        assertEq(winningPostId, 0);
        assertEq(prizePool, comp.getPrizePool(competitionId));
        assertEq(comp.getPrizeDistributed(competitionId), true);
        assertEq(comp.getWinningPostId(competitionId), winningPostId);
    }

    function test_competitions_distributePrizePool_sendToCreatorWhen_noVotes() public {
        uint256 competitionId = _createCompetition();
        uint256 postId = _createPost();
        comp.submitPost(competitionId, postId);
        vm.warp(comp.getVotingDeadline(competitionId) + 1);

        uint256 balanceBefore = creator.balance;

        (address winner, uint256 winningPostId, uint256 prizePool) = comp.distributePrizePool(competitionId);

        uint256 balanceAfter = creator.balance;
        assertEq(balanceAfter - balanceBefore, prizePool);
        assertEq(winner, comp.getCreator(competitionId));
        assertEq(winningPostId, 0);
        assertEq(prizePool, comp.getPrizePool(competitionId));
        assertEq(comp.getPrizeDistributed(competitionId), true);
        assertEq(comp.getWinningPostId(competitionId), winningPostId);
    }

    function test_competitions_distributePrizePool_sendToWinner() public {
        uint256 competitionId = _createCompetition();
        uint256 postId = _createPost();
        comp.submitPost(competitionId, postId);
        vm.warp(comp.getSubmissionDeadline(competitionId) + 1);
        comp.vote(competitionId, postId);
        vm.warp(comp.getVotingDeadline(competitionId) + 1);

        uint256 balanceBefore = author.balance;

        (address winner, uint256 winningPostId, uint256 prizePool) = comp.distributePrizePool(competitionId);

        uint256 balanceAfter = author.balance;
        assertEq(balanceAfter - balanceBefore, prizePool);
        assertEq(winner, author);
        assertEq(winningPostId, postId);
        assertEq(prizePool, comp.getPrizePool(competitionId));
        assertEq(comp.getPrizeDistributed(competitionId), true);
        assertEq(comp.getWinningPostId(competitionId), postId);
    }
}
