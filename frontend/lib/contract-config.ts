// ⚠️ IMPORTANT: Replace these with your actual contract addresses ⚠️
// The current addresses are placeholders and will not work
export const CONTRACT_ADDRESS = '0xd2550fCb1C389401E9F8802e68b093fcc0595993'; // testnet deployment
export const FEED_CONTRACT_ADDRESS =
  '0xcB5E109FFC0E15565082d78E68dDDf2573703580'; // testnet global lens feed
// Lens Testnet Chain ID
export const LENS_TESTNET_CHAIN_ID = 232;

export const COMPETITIONS_ABI = [
  'function createCompetition(string theme, uint256 submissionDeadline, uint256 votingDeadline) external payable returns (uint256)',
  'function submitPost(uint256 competitionId, uint256 postId) external',
  'function vote(uint256 competitionId, uint256 postId) external',
  'function distributePrizePool(uint256 competitionId) external returns (address, uint256, uint256)',
  'function getCompetition(uint256 competitionId) external view returns (address, bool, string, uint256, uint256, uint256, uint256, uint256[])',
  'function getSubmissionDeadline(uint256 competitionId) external view returns (uint256)',
  'function getVotingDeadline(uint256 competitionId) external view returns (uint256)',
  'function getVotes(uint256 competitionId, uint256 postId) external view returns (uint256)',
  'function getWinningAuthor(uint256 competitionId) external view returns (address)',
  'function getSubmitted(uint256 competitionId, uint256 postId) external view returns (bool)',
  'function getVoted(uint256 competitionId, address voter) external view returns (bool)',
  'function getPrizeDistributed(uint256 competitionId) external view returns (bool)',
  'function getCreator(uint256 competitionId) external view returns (address)',
  'function getPrizePool(uint256 competitionId) external view returns (uint256)',
  'function getWinningPostId(uint256 competitionId) external view returns (uint256)',
  'function getSubmissions(uint256 competitionId) external view returns (uint256[])',
  'function getTheme(uint256 competitionId) external view returns (string)',
] as const;

export const FEED_ABI = [
  // Minimal ABI entries as strings
  'function postExists(uint256 postId) external view returns (bool)',
  'function getPostAuthor(uint256 postId) external view returns (address)',

  // Full ABI object for getPost
  {
    inputs: [{ internalType: 'uint256', name: 'postId', type: 'uint256' }],
    name: 'getPost',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'author', type: 'address' },
          {
            internalType: 'uint256',
            name: 'authorPostSequentialId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'postSequentialId',
            type: 'uint256',
          },
          { internalType: 'string', name: 'contentURI', type: 'string' },
          { internalType: 'uint256', name: 'rootPostId', type: 'uint256' },
          { internalType: 'uint256', name: 'repostedPostId', type: 'uint256' },
          { internalType: 'uint256', name: 'quotedPostId', type: 'uint256' },
          { internalType: 'uint256', name: 'repliedPostId', type: 'uint256' },
          { internalType: 'uint80', name: 'creationTimestamp', type: 'uint80' },
          { internalType: 'address', name: 'creationSource', type: 'address' },
          {
            internalType: 'uint80',
            name: 'lastUpdatedTimestamp',
            type: 'uint80',
          },
          {
            internalType: 'address',
            name: 'lastUpdateSource',
            type: 'address',
          },
          { internalType: 'bool', name: 'isDeleted', type: 'bool' },
        ],
        internalType: 'struct IFeed.Post',
        name: 'post',
        type: 'tuple',
      },
    ],
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
