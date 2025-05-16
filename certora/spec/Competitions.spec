// Verification of the Competitions contract

using MockFeed as feed;

/*//////////////////////////////////////////////////////////////
                            METHODS
//////////////////////////////////////////////////////////////*/
methods {
    function getSubmissionDeadline(uint256 competitionId) external returns (uint256) envfree;
    function getVotingDeadline(uint256 competitionId) external returns (uint256) envfree;
    function getPrizeDistributed(uint256 competitionId) external returns (bool) envfree;
    function getCreator(uint256 competitionId) external returns (address) envfree;
    function getPrizePool(uint256 competitionId) external returns (uint256) envfree;
    function getWinningPostId(uint256 competitionId) external returns (uint256) envfree;
    function getSubmissions(uint256 competitionId) external returns (uint256[] memory) envfree;
    function getVotes(uint256 competitionId, uint256 postId) external returns (uint256) envfree;
    function getWinningAuthor(uint256 competitionId) external returns (address) envfree;
    function getSubmitted(uint256 competitionId, uint256 postId) external returns (bool) envfree;
    function getVoted(uint256 competitionId, address voter) external returns (bool) envfree;
    function getPrizeDistributed(uint256 competitionId) external returns (bool) envfree;
    function getCreator(uint256 competitionId) external returns (address) envfree;
    function getPrizePool(uint256 competitionId) external returns (uint256) envfree;
    function getWinningPostId(uint256 competitionId) external returns (uint256) envfree;
    function getSubmissions(uint256 competitionId) external returns (uint256[] memory) envfree;
    function getProtocolFee(uint256 prizePool) external returns (uint256) envfree;
    function vote(uint256 competitionId, uint256 postId) external;
    function submitPost(uint256 competitionId, uint256 postId) external;
    function distributePrizePool(uint256 competitionId) external returns (address, uint256, uint256);
    function getProtocolFees() external returns (uint256) envfree;
    function owner() external returns (address) envfree;
    function createCompetition(string memory, uint256, uint256) external returns (uint256);
    function submitPost(uint256 compId, uint256 postId) external;
    function vote(uint256 compId, uint256 postId) external;  
    function distributePrizePool(uint256 compId) external;

    // External contract
    function feed.postExists(uint256 postId) external returns (bool) envfree;
    function feed.getPostAuthor(uint256 postId) external returns (address) envfree;

    // Harness
    function getCompetitionCount() external returns (uint256) envfree;
    function getSubmissionsLength(uint256 compId) external returns (uint256) envfree;
}

/*//////////////////////////////////////////////////////////////
                          DEFINITIONS
//////////////////////////////////////////////////////////////*/
/// @notice number of CALLVALUE opcodes used per createCompetition
definition MsgValueOpcodePerCreateCompetition() returns mathint = 3;

definition NotCreated(uint256 compId) returns bool =
        compId >= getCompetitionCount() || compId == 0 &&
        getCreator(compId) == 0 &&
        getPrizePool(compId) == 0 &&
        getPrizeDistributed(compId) == false &&
        getWinningPostId(compId) == 0 &&
        getSubmissionsLength(compId) == 0 &&
        getSubmissionDeadline(compId) == 0 &&
        getVotingDeadline(compId) == 0;

// /// @notice functions that cant be called when the competition is not created
// definition RequiresExistingCompetition(method f) returns bool =
//     f.selector == sig:vote(uint256,uint256).selector ||
//     f.selector == sig:distributePrizePool(uint256).selector ||
//     f.selector == sig:withdrawProtocolFees().selector ||
//     f.selector == sig:getCompetition(uint256).selector;

definition SubmissionPeriod(env e, uint256 compId) returns bool =
    compId < getCompetitionCount() &&
    getSubmissionDeadline(compId) > e.block.timestamp;

definition VotingPeriod(env e, uint256 compId) returns bool =
    compId < getCompetitionCount() &&
    getVotingDeadline(compId) > e.block.timestamp;

definition AfterVotingPeriod(env e, uint256 compId) returns bool =
    compId < getCompetitionCount() &&
    getVotingDeadline(compId) < e.block.timestamp;

definition PrizeDistributed(uint256 compId) returns bool =
    compId < getCompetitionCount() &&
    getPrizeDistributed(compId);

/*//////////////////////////////////////////////////////////////
                             GHOSTS
//////////////////////////////////////////////////////////////*/
persistent ghost mathint g_totalPrizePoolsAccumulated {
    init_state axiom g_totalPrizePoolsAccumulated == 0;
}

persistent ghost mathint g_totalPrizePoolsDistributed {
    init_state axiom g_totalPrizePoolsDistributed == 0;
}

persistent ghost mathint g_totalProtocolFeesAccumulated {
    init_state axiom g_totalProtocolFeesAccumulated == 0;
}

persistent ghost mathint g_totalProtocolFeesWithdrawn {
    init_state axiom g_totalProtocolFeesWithdrawn == 0;
}

/// @notice this tracks the total value of CALLVALUE opcodes used in mints, and must be divided by MsgValueOpcodePerCreateCompetition()
persistent ghost mathint g_totalCallvaluePreDivision {
    init_state axiom g_totalCallvaluePreDivision == 0;
}

/*//////////////////////////////////////////////////////////////
                             HOOKS
//////////////////////////////////////////////////////////////*/
hook Sstore currentContract.s_competitions[KEY uint256 compId].prizePool uint256 newValue (uint256 oldValue) {
    g_totalPrizePoolsAccumulated = g_totalPrizePoolsAccumulated + newValue;
}

hook Sstore currentContract.s_competitions[KEY uint256 compId].prizeDistributed bool newValue (bool oldValue) {
    if (newValue) g_totalPrizePoolsDistributed = g_totalPrizePoolsDistributed + getPrizePool(compId);
}

hook Sstore currentContract.s_protocolFees uint256 newValue (uint256 oldValue) {
    if (newValue > oldValue) {
        g_totalProtocolFeesAccumulated = g_totalProtocolFeesAccumulated + newValue;
    } else {
        g_totalProtocolFeesWithdrawn = g_totalProtocolFeesWithdrawn + (oldValue - newValue);
    }
}

/*//////////////////////////////////////////////////////////////
                           INVARIANTS
//////////////////////////////////////////////////////////////*/
/// @notice voting deadline must be after submission deadline
invariant votingDeadline_after_submissionDeadline(uint256 compId)
    getCreator(compId) != 0 =>
        getVotingDeadline(compId) > getSubmissionDeadline(compId); 

invariant prizePool_no_zeroValue(uint256 compId)
    compId != 0 && getCreator(compId) != 0 => getPrizePool(compId) > 0;

// invariant feesAccountancy()
//     nativeBalances[currentContract.owner()] >= 
//         (g_totalProtocolFeesAccumulated - g_totalProtocolFeesWithdrawn) + getProtocolFees();

// valid states:
// 1. notCreated
/// createCompetition()
// 2. submissionPeriod
/// submitPost()
// 3. votingPeriod
/// vote()
// 4. afterVotingPeriod
/// distributePrizePool()
// 5. prizeDistributed

// invariant notCreated(env e, uint256 compId)
//     NotCreated(compId) && 
//         !SubmissionPeriod(e, compId) && !VotingPeriod(e, compId) &&
//         !AfterVotingPeriod(e, compId) && !PrizeDistributed(compId);

// invariant submissionPeriod(env e, uint256 compId)
//     SubmissionPeriod(e, compId) =>
//         !NotCreated(compId) && !VotingPeriod(e, compId) &&
//         !AfterVotingPeriod(e, compId) && !PrizeDistributed(compId);

// invariant votingPeriod(env e, uint256 compId)
//     VotingPeriod(e, compId) =>
//         !NotCreated(compId) && !SubmissionPeriod(e, compId) &&
//         !AfterVotingPeriod(e, compId) && !PrizeDistributed(compId);

// invariant afterVotingPeriod(env e, uint256 compId)
//     AfterVotingPeriod(e, compId) =>
//         !NotCreated(compId) && !SubmissionPeriod(e, compId) &&
//         !VotingPeriod(e, compId);

// invariant prizeDistributed(env e, uint256 compId)
//     PrizeDistributed(compId) => AfterVotingPeriod(e, compId) {
//         preserved {
//             requireInvariant afterVotingPeriod(e, compId);
//         }
//     }





/*//////////////////////////////////////////////////////////////
                             RULES
//////////////////////////////////////////////////////////////*/
rule createCompetition_revertsWhen_zeroMsgValue() {
    env e;
    calldataarg args;
    
    require e.msg.value == 0;

    createCompetition@withrevert(e, args);
    assert lastReverted;
}

rule createCompetition_revertsWhen_invalidSubmissionDeadline() {
    env e;
    string theme;
    uint256 submissionDeadline;
    uint256 votingDeadline;

    require e.msg.value > 0;

    require submissionDeadline <= e.block.timestamp;

    createCompetition@withrevert(e, theme, submissionDeadline, votingDeadline);
    assert lastReverted;
}

rule createCompetition_revertsWhen_invalidVotingDeadline() {
    env e;
    string theme;
    uint256 submissionDeadline;
    uint256 votingDeadline;

    require e.msg.value > 0;

    require votingDeadline <= submissionDeadline;

    createCompetition@withrevert(e, theme, submissionDeadline, votingDeadline);
    assert lastReverted;
}

rule createCompetition_revertsWhen_invalidTheme() {
    env e;
    string theme = "";
    uint256 submissionDeadline;
    uint256 votingDeadline;

    require e.msg.value > 0;

    createCompetition@withrevert(e, theme, submissionDeadline, votingDeadline);
    assert lastReverted;
}

rule createCompetition_success() {
    env e;
    calldataarg args;

    uint256 compId = createCompetition(e, args);

    assert getCreator(compId) == e.msg.sender;
    assert getPrizePool(compId) == e.msg.value - getProtocolFee(e.msg.value);
}

rule vote_revertsWhen_zeroCompetitionId() {
    env e;
    uint256 postId;
    require postId > 0;
    vote@withrevert(e, 0, postId);
    assert lastReverted;
}

rule vote_revertsWhen_zeroPostId() {
    env e;
    uint256 compId;
    require compId > 0;
    vote@withrevert(e, compId, 0);
    assert lastReverted;
}

rule vote_revertsWhen_submissionDeadlineNotPassed() {
    env e;
    uint256 compId;
    uint256 postId;
    require compId > 0;
    require postId > 0;

    require e.block.timestamp <= getSubmissionDeadline(compId);

    vote@withrevert(e, compId, postId);
    assert lastReverted;
}

rule vote_revertsWhen_votingDeadlinePassed() {
    env e;
    uint256 compId;
    uint256 postId;
    require compId > 0;
    require postId > 0;
    require e.block.timestamp > getVotingDeadline(compId);

    vote@withrevert(e, compId, postId);
    assert lastReverted;
}

rule vote_revertsWhen_alreadyVoted() {
    env e;
    uint256 compId;
    uint256 postId;
    require compId > 0;
    require postId > 0;
    require getVoted(compId, e.msg.sender);

    require e.block.timestamp > getSubmissionDeadline(compId);
    require e.block.timestamp <= getVotingDeadline(compId);

    vote@withrevert(e, compId, postId);
    assert lastReverted;
}

rule vote_revertsWhen_invalidPost() {
    env e;
    uint256 compId;
    uint256 postId;
    require compId > 0;
    require postId > 0;
    require !getSubmitted(compId, postId);

    require e.block.timestamp > getSubmissionDeadline(compId);
    require e.block.timestamp <= getVotingDeadline(compId);

    vote@withrevert(e, compId, postId);
    assert lastReverted;
}

rule vote_success() {
    env e;
    uint256 compId;
    uint256 postId;

    uint256 votesBefore = getVotes(compId, postId);

    vote(e, compId, postId);

    uint256 votesAfter = getVotes(compId, postId);
    assert votesAfter == votesBefore + 1;
    assert getVoted(compId, e.msg.sender);
}

rule submitPost_revertsWhen_zeroCompetitionId() {
    env e;
    uint256 postId;
    require postId > 0;
    submitPost@withrevert(e, 0, postId);
    assert lastReverted;
}

rule submitPost_revertsWhen_zeroPostId() {
    env e;
    uint256 compId;
    require compId > 0;
    submitPost@withrevert(e, compId, 0);
    assert lastReverted;
}

rule submitPost_revertsWhen_submissionDeadlinePassed() {
    env e;
    uint256 compId;
    uint256 postId;
    require compId > 0;
    require postId > 0;
    require e.block.timestamp > getSubmissionDeadline(compId);

    submitPost@withrevert(e, compId, postId);
    assert lastReverted;
}

rule submitPost_revertsWhen_postAlreadySubmitted() {
    env e;
    uint256 compId;
    uint256 postId;
    require compId > 0;
    require postId > 0;
    require e.block.timestamp <= getSubmissionDeadline(compId);

    require getSubmitted(compId, postId);
    submitPost@withrevert(e, compId, postId);
    assert lastReverted;
}

rule submitPost_revertsWhen_invalidPost() {
    env e;
    uint256 compId;
    uint256 postId;
    require compId > 0;
    require postId > 0;
    require e.block.timestamp <= getSubmissionDeadline(compId);

    require !feed.postExists(postId);

    submitPost@withrevert(e, compId, postId);
    assert lastReverted;
}

rule submitPost_success() {
    env e;
    uint256 compId;
    uint256 postId;

    uint256 submissionsBefore = getSubmissions(compId).length;
    bool submittedBefore = getSubmitted(compId, postId);

    submitPost(e, compId, postId);

    bool submittedAfter = getSubmitted(compId, postId);
    assert submittedAfter != submittedBefore;
    assert submittedAfter;
    uint256 submissionsAfter = getSubmissions(compId).length;
    assert submissionsAfter == submissionsBefore + 1;
}

rule distributePrizePool_revertsWhen_zeroCompetitionId() {
    env e;
    uint256 compId;
    require compId > 0;
    distributePrizePool@withrevert(e, 0);
    assert lastReverted;
}

rule distributePrizePool_revertsWhen_votingNotFinished() {
    env e;
    uint256 compId;
    require compId > 0;
    require e.block.timestamp <= getVotingDeadline(compId);

    distributePrizePool@withrevert(e, compId);
    assert lastReverted;
}

rule distributePrizePool_sendToCreatorWhen_noSubmissions() {
    env e;
    uint256 compId;
    
    require getSubmissions(compId).length == 0;

    address creator = getCreator(compId);
    uint256 balanceBefore = nativeBalances[creator];

    distributePrizePool(e, compId);

    uint256 balanceAfter = nativeBalances[creator];
    assert balanceAfter - balanceBefore == getPrizePool(compId);
    assert getPrizeDistributed(compId);
    assert getWinningPostId(compId) == 0;
}

rule distributePrizePool_revertsWhen_prizeAlreadyDistributed() {
    env e;
    uint256 compId;
    require compId > 0;
    require getSubmissions(compId).length > 0;
    require e.block.timestamp > getVotingDeadline(compId);
    require getVotes(compId, getSubmissions(compId)[0]) > 0;

    require getPrizeDistributed(compId);
    distributePrizePool@withrevert(e, compId);
    assert lastReverted;
}
rule distributePrizePool_success() {
    env e;
    uint256 compId;

    distributePrizePool(e, compId);

    assert getPrizeDistributed(compId);
    assert getWinningPostId(compId) != 0 =>
        getWinningAuthor(compId) == feed.getPostAuthor(getWinningPostId(compId));
}