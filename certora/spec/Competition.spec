/*//////////////////////////////////////////////////////////////
                            METHODS
//////////////////////////////////////////////////////////////*/
methods {
    // function getCompetition(uint256 compId) external returns (ContentCompetition.Competition) envfree;
    function getSubmissionDeadline(uint256 competitionId) external returns (uint256) envfree;
    function getVotingDeadline(uint256 competitionId) external returns (uint256) envfree;
    function getPrizeDistributed(uint256 competitionId) external returns (bool) envfree;
    function getCompetitionCreator(uint256 competitionId) external returns (address) envfree;
}

/*//////////////////////////////////////////////////////////////
                           INVARIANTS
//////////////////////////////////////////////////////////////*/
/// @notice voting deadline must be after submission deadline
invariant votingDeadline_after_submissionDeadline(uint256 compId)
    getCompetitionCreator(compId) != 0 =>
        getVotingDeadline(compId) > getSubmissionDeadline(compId); 

// /// @notice if prize has been distributed, voting deadline should have passed
// invariant prizeDistributed_after_voting(env e, uint256 compId)
//     getPrizeDistributed(e, compId) => e.block.timestamp > getVotingDeadline(e, compId);
