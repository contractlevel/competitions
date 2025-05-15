// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

interface IContentCompetition {
    function createCompetition(string memory theme, uint256 submissionDeadline, uint256 votingDeadline)
        external
        payable
        returns (bytes32 ccipMessageId, uint256 competitionId);
    function submitPost(uint256 competitionId, uint256 postId) external;
    function vote(uint256 competitionId, uint256 postId) external;
    function withdrawProtocolFees() external;

    // getters
    function getCalculatedProcolFee(uint256 prizePool) external returns (uint256);
    function getAllowedChainSelector() external returns (uint64);
    function getCompetition(uint256 competitionId)
        external
        returns (
            address creator,
            bool prizeDistributed,
            string memory theme,
            uint256 submissionDeadline,
            uint256 votingDeadline,
            uint256 prizePool,
            uint256 winningPostId,
            uint256[] memory submissions
        );
    function getSubmissionDeadline(uint256 competitionId) external returns (uint256);
    function getVotingDeadline(uint256 competitionId) external returns (uint256);
    function getVotes(uint256 competitionId, uint256 postId) external returns (uint256);
    function getWinningAuthor(uint256 competitionId) external returns (address);
    function getSubmitted(uint256 competitionId, uint256 postId) external returns (bool);
    function getVoted(uint256 competitionId, address voter) external returns (bool);
    function getPrizeDistributed(uint256 competitionId) external returns (bool);
    function getCompetitionCreator(uint256 competitionId) external returns (address);
}
