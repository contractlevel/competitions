// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

interface ICompetitions {
    function createCompetition(string memory theme, uint256 submissionDeadline, uint256 votingDeadline)
        external
        payable
        returns (uint256 competitionId);
    function submitPost(uint256 competitionId, uint256 postId) external;
    function vote(uint256 competitionId, uint256 postId) external;
    function distributePrizePool(uint256 competitionId)
        external
        returns (address winner, uint256 winningPostId, uint256 prizePool);
    function withdrawProtocolFees() external; // onlyOwner
    function getCompetition(uint256 competitionId)
        external
        view
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
    function getSubmissionDeadline(uint256 competitionId) external view returns (uint256);
    function getVotingDeadline(uint256 competitionId) external view returns (uint256);
    function getVotes(uint256 competitionId, uint256 postId) external view returns (uint256);
    function getWinningAuthor(uint256 competitionId) external view returns (address);
    function getSubmitted(uint256 competitionId, uint256 postId) external view returns (bool);
    function getVoted(uint256 competitionId, address voter) external view returns (bool);
    function getPrizeDistributed(uint256 competitionId) external view returns (bool);
    function getCreator(uint256 competitionId) external view returns (address);
    function getPrizePool(uint256 competitionId) external view returns (uint256);
    function getWinningPostId(uint256 competitionId) external view returns (uint256);
    function getSubmissions(uint256 competitionId) external view returns (uint256[] memory);
    function getProtocolFee(uint256 prizePool) external view returns (uint256);
}
