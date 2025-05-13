// ⚠️ IMPORTANT: Replace these with your actual contract addresses ⚠️
// The current addresses are placeholders and will not work
export const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with your ContentCompetition contract address
export const FEED_CONTRACT_ADDRESS =
  '0x0000000000000000000000000000000000000000'; // Replace with your Lens Feed contract address

// Lens Testnet Chain ID
export const LENS_TESTNET_CHAIN_ID = 37111;

export const CONTRACT_ABI = [
  // createCompetition
  {
    inputs: [
      { name: 'theme', type: 'string' },
      { name: 'submissionDeadline', type: 'uint256' },
      { name: 'votingDeadline', type: 'uint256' },
    ],
    name: 'createCompetition',
    outputs: [
      { name: 'ccipMessageId', type: 'bytes32' },
      { name: 'competitionId', type: 'uint256' },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  // submitPost
  {
    inputs: [
      { name: 'competitionId', type: 'uint256' },
      { name: 'postId', type: 'uint256' },
    ],
    name: 'submitPost',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // vote
  {
    inputs: [
      { name: 'competitionId', type: 'uint256' },
      { name: 'postId', type: 'uint256' },
    ],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // getCompetition
  {
    inputs: [{ name: 'competitionId', type: 'uint256' }],
    name: 'getCompetition',
    outputs: [
      {
        components: [
          { name: 'creator', type: 'address' },
          { name: 'prizeDistributed', type: 'bool' },
          { name: 'theme', type: 'string' },
          { name: 'submissionDeadline', type: 'uint256' },
          { name: 'votingDeadline', type: 'uint256' },
          { name: 'prizePool', type: 'uint256' },
          { name: 'submissions', type: 'uint256[]' },
          { name: 'winningPostId', type: 'uint256' },
        ],
        name: 'competition',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // getVotes
  {
    inputs: [
      { name: 'competitionId', type: 'uint256' },
      { name: 'postId', type: 'uint256' },
    ],
    name: 'getVotes',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // getWinningAuthor
  {
    inputs: [{ name: 'competitionId', type: 'uint256' }],
    name: 'getWinningAuthor',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// Feed contract ABI (for getting post details)
export const FEED_CONTRACT_ABI = [
  // getPost
  {
    inputs: [{ name: 'postId', type: 'uint256' }],
    name: 'getPost',
    outputs: [
      {
        components: [
          { name: 'author', type: 'address' },
          { name: 'authorPostSequentialId', type: 'uint256' },
          { name: 'postSequentialId', type: 'uint256' },
          { name: 'contentURI', type: 'string' },
          { name: 'rootPostId', type: 'uint256' },
          { name: 'repostedPostId', type: 'uint256' },
          { name: 'quotedPostId', type: 'uint256' },
          { name: 'repliedPostId', type: 'uint256' },
          { name: 'creationTimestamp', type: 'uint80' },
          { name: 'creationSource', type: 'address' },
          { name: 'lastUpdatedTimestamp', type: 'uint80' },
          { name: 'lastUpdateSource', type: 'address' },
          { name: 'isDeleted', type: 'bool' },
        ],
        name: 'post',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // getPostAuthor
  {
    inputs: [{ name: 'postId', type: 'uint256' }],
    name: 'getPostAuthor',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
];
