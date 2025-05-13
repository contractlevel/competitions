import { ethers } from 'ethers';
import {
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  FEED_CONTRACT_ABI,
  FEED_CONTRACT_ADDRESS,
  LENS_TESTNET_CHAIN_ID,
} from './contract-config';

// Demo post content with images
const DEMO_POST_CONTENT = {
  '1': {
    content:
      "I've built a decentralized identity solution that helps users control their personal data while interacting with web3 applications. #Web3Innovation",
    image:
      'https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2832&auto=format&fit=crop',
  },
  '2': {
    content:
      'Introducing BlockVote: A transparent voting system built on blockchain that ensures election integrity and increases voter participation. #Web3Innovation',
    image:
      'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2940&auto=format&fit=crop',
  },
  '3': {
    content:
      'My project focuses on decentralized healthcare records, giving patients control over their medical data while ensuring privacy and security. #Web3Innovation',
    image:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2940&auto=format&fit=crop',
  },
  '4': {
    content:
      'Introducing DeFi Inclusion: A simplified DeFi platform designed for users in developing countries with limited banking access. #DeFiApplications',
    image:
      'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?q=80&w=2797&auto=format&fit=crop',
  },
  '5': {
    content:
      'MicroLend: A peer-to-peer lending protocol that enables microloans without collateral, using reputation systems instead. #DeFiApplications',
    image:
      'https://images.unsplash.com/photo-1607944024060-0450380ddd33?q=80&w=2787&auto=format&fit=crop',
  },
  '6': {
    content:
      'My NFT collection represents carbon credits, allowing companies to offset their emissions while supporting reforestation projects. #NFTShowcase',
    image:
      'https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=2940&auto=format&fit=crop',
  },
  '7': {
    content:
      'Introducing Virtual Land NFTs that connect to real-world conservation efforts. Each purchase protects actual rainforest land. #NFTShowcase',
    image:
      'https://images.unsplash.com/photo-1619551734325-81aaf323686c?q=80&w=2864&auto=format&fit=crop',
  },
  '8': {
    content:
      'My music NFTs give fans ownership stakes in songs, allowing them to earn royalties alongside their favorite artists. #NFTShowcase',
    image:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2940&auto=format&fit=crop',
  },
  '9': {
    content:
      'Educational NFTs that grant access to exclusive courses and mentorship programs, creating a new model for online learning. #NFTShowcase',
    image:
      'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=2874&auto=format&fit=crop',
  },
};

export async function addLensTestnetToMetaMask() {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: `0x${LENS_TESTNET_CHAIN_ID.toString(16)}`, // Convert to hex
          chainName: 'Lens Testnet',
          nativeCurrency: {
            name: 'Lens',
            symbol: 'LENS',
            decimals: 18,
          },
          rpcUrls: [
            process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.testnet.lens.xyz',
          ],
          blockExplorerUrls: ['https://testnet-explorer.lens.xyz'],
        },
      ],
    });
    return true;
  } catch (error) {
    console.error('Error adding Lens Testnet to MetaMask:', error);
    return false;
  }
}

export async function connectWallet() {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      // Check if connected to Lens testnet
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const requiredChainIdHex = `0x${LENS_TESTNET_CHAIN_ID.toString(16)}`; // Convert to hex

      if (chainId !== requiredChainIdHex) {
        try {
          // Try to switch to Lens testnet
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: requiredChainIdHex }],
          });
        } catch (switchError: any) {
          // If the network doesn't exist in MetaMask, add it
          if (switchError.code === 4902) {
            await addLensTestnetToMetaMask();
          } else {
            throw switchError;
          }
        }
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      const feedContract = new ethers.Contract(
        FEED_CONTRACT_ADDRESS,
        FEED_CONTRACT_ABI,
        signer
      );

      return { accounts, provider, signer, contract, feedContract };
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      throw error;
    }
  } else {
    throw new Error('Please install MetaMask or another Ethereum wallet');
  }
}

export async function getReadOnlyContracts() {
  // For read-only operations, we can use a provider without requiring a wallet connection
  try {
    const rpcUrl =
      process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.testnet.lens.xyz';
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    // Check if contracts are deployed before creating contract instances
    const contractCode = await provider.getCode(CONTRACT_ADDRESS);
    const feedContractCode = await provider.getCode(FEED_CONTRACT_ADDRESS);

    if (contractCode === '0x' || feedContractCode === '0x') {
      return null;
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      provider
    );
    const feedContract = new ethers.Contract(
      FEED_CONTRACT_ADDRESS,
      FEED_CONTRACT_ABI,
      provider
    );

    return { provider, contract, feedContract };
  } catch (error) {
    console.error('Error creating provider:', error);
    return null;
  }
}

export async function isContractDeployed() {
  try {
    const contracts = await getReadOnlyContracts();
    return contracts !== null;
  } catch (error) {
    console.error('Error checking if contract is deployed:', error);
    return false;
  }
}

export async function fetchCompetition(competitionId) {
  try {
    // First check if the contract is deployed
    const contracts = await getReadOnlyContracts();
    if (!contracts) {
      throw new Error('Contract not deployed at the specified address');
    }

    const { contract } = contracts;

    // Try to call the function
    try {
      // Updated to handle the new tuple return format
      const [
        creator,
        prizeDistributed,
        theme,
        submissionDeadline,
        votingDeadline,
        prizePool,
        winningPostId,
        submissions,
      ] = await contract.getCompetition(competitionId);

      return {
        id: competitionId,
        creator,
        prizeDistributed,
        theme,
        submissionDeadline: submissionDeadline.toNumber(),
        votingDeadline: votingDeadline.toNumber(),
        prizePool: ethers.utils.formatEther(prizePool),
        submissions: submissions.map((id) => id.toString()),
        winningPostId:
          winningPostId.toString() !== '0' ? winningPostId.toString() : null,
      };
    } catch (callError) {
      console.error(
        `Error calling getCompetition for ID ${competitionId}:`,
        callError
      );

      // Check if this might be due to the competition not existing
      if (
        callError.message.includes('revert') ||
        callError.code === 'CALL_EXCEPTION'
      ) {
        throw new Error(
          `Competition #${competitionId} not found or cannot be accessed`
        );
      }

      throw callError;
    }
  } catch (error) {
    console.error('Error fetching competition:', error);
    throw error;
  }
}

export async function fetchWinningAuthor(competitionId) {
  try {
    // First check if the contract is deployed
    const contracts = await getReadOnlyContracts();
    if (!contracts) {
      return null;
    }

    const { contract } = contracts;

    // Try to call the function
    try {
      const winningAuthor = await contract.getWinningAuthor(competitionId);
      return winningAuthor;
    } catch (callError) {
      console.error(
        `Error calling getWinningAuthor for ID ${competitionId}:`,
        callError
      );
      return null;
    }
  } catch (error) {
    console.error('Error fetching winning author:', error);
    return null;
  }
}

export async function checkIfPostSubmitted(competitionId, postId) {
  try {
    const contracts = await getReadOnlyContracts();
    if (!contracts) {
      return false;
    }
    const { contract } = contracts;
    return await contract.getSubmitted(competitionId, postId);
  } catch (error) {
    console.error('Error checking if post is submitted:', error);
    return false;
  }
}

export async function checkIfUserVoted(competitionId, userAddress) {
  try {
    const contracts = await getReadOnlyContracts();
    if (!contracts) {
      return false;
    }
    const { contract } = contracts;
    return await contract.getVoted(competitionId, userAddress);
  } catch (error) {
    console.error('Error checking if user voted:', error);
    return false;
  }
}

export async function fetchPost(postId) {
  try {
    // First check if the contract is deployed
    const contracts = await getReadOnlyContracts();
    if (!contracts) {
      // If contract is not deployed, use mock data
      if (DEMO_POST_CONTENT[postId]) {
        // Generate mock author addresses based on post ID
        const mockAuthorAddresses = {
          '1': '0x1234567890123456789012345678901234567890',
          '2': '0x2345678901234567890123456789012345678901',
          '3': '0x3456789012345678901234567890123456789012',
          '4': '0x4567890123456789012345678901234567890123',
          '5': '0x5678901234567890123456789012345678901234',
          '6': '0x6789012345678901234567890123456789012345',
          '7': '0x7890123456789012345678901234567890123456',
          '8': '0x8901234567890123456789012345678901234567',
          '9': '0x9012345678901234567890123456789012345678',
        };

        const now = Math.floor(Date.now() / 1000);

        // Set creation timestamps based on competition
        let creationTimestamp;

        if (postId >= '1' && postId <= '3') {
          // Competition 1 - submissions are still open, so posts should be recent
          // Random time within the last 2 days
          creationTimestamp = now - Math.floor(Math.random() * 172800);
        } else if (postId >= '4' && postId <= '5') {
          // Competition 2 - in voting phase, so posts should be before submission deadline
          // Between 3-5 days ago (before the submission deadline which is 12 hours ago)
          creationTimestamp = now - 259200 - Math.floor(Math.random() * 172800);
        } else if (postId >= '6' && postId <= '9') {
          // Competition 3 - completed, so posts should be well before voting deadline
          // Between 5-7 days ago (before the submission deadline which is 2 days ago)
          creationTimestamp = now - 432000 - Math.floor(Math.random() * 172800);
        } else {
          // Default fallback
          creationTimestamp = now - 86400 * (Number.parseInt(postId) % 5);
        }

        return {
          id: postId,
          author:
            mockAuthorAddresses[postId] ||
            '0x0000000000000000000000000000000000000000',
          contentURI: `ipfs://mock-content-uri-${postId}`,
          creationTimestamp: creationTimestamp,
          isDeleted: false,
        };
      }
      throw new Error('Feed contract not deployed at the specified address');
    }

    const { feedContract } = contracts;

    try {
      const post = await feedContract.getPost(postId);

      return {
        id: postId,
        author: post.author,
        contentURI: post.contentURI,
        creationTimestamp: post.creationTimestamp.toNumber(),
        isDeleted: post.isDeleted,
      };
    } catch (callError) {
      console.error(`Error calling getPost for ID ${postId}:`, callError);

      if (
        callError.message.includes('revert') ||
        callError.code === 'CALL_EXCEPTION'
      ) {
        throw new Error(`Post #${postId} not found or cannot be accessed`);
      }

      throw callError;
    }
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
}

export async function fetchPostContent(contentURI) {
  try {
    // For demo purposes, check if we're using a mock content URI
    const postId = contentURI.split('-').pop();
    if (postId && DEMO_POST_CONTENT[postId]) {
      return DEMO_POST_CONTENT[postId];
    }

    const response = await fetch(contentURI);
    if (!response.ok) {
      throw new Error(`Failed to fetch post content: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching post content:', error);
    throw error;
  }
}

export async function fetchPostVotes(competitionId, postId) {
  try {
    const contracts = await getReadOnlyContracts();
    if (!contracts) {
      // If contract is not deployed, use mock data
      if (DEMO_POST_CONTENT[postId]) {
        // For competition 3, ensure the winning post (ID 7) has the most votes
        if (competitionId === '3') {
          if (postId === '7') {
            // Winning post should have the highest vote count
            return 42;
          } else {
            // Other posts should have fewer votes
            // Generate deterministic but seemingly random vote counts
            const seed = Number.parseInt(postId) * 7;
            return (seed % 20) + 10; // Between 10 and 29 votes
          }
        } else {
          // For other competitions, generate reasonable vote counts
          const seed =
            Number.parseInt(competitionId) * 10 + Number.parseInt(postId);
          return ((seed * 7) % 30) + 5; // Between 5 and 34 votes
        }
      }
      return 0;
    }

    const { contract } = contracts;
    try {
      const votes = await contract.getVotes(competitionId, postId);
      return votes.toNumber();
    } catch (callError) {
      console.error(
        `Error calling getVotes for competition ${competitionId}, post ${postId}:`,
        callError
      );
      return 0;
    }
  } catch (error) {
    console.error('Error fetching post votes:', error);
    return 0;
  }
}

export function formatDate(timestamp) {
  return new Date(timestamp * 1000).toLocaleString();
}

export function timestampFromDate(date) {
  return Math.floor(date.getTime() / 1000);
}

export function truncateAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatEther(wei) {
  return ethers.utils.formatEther(wei);
}

// Add this function to the existing contract-utils.ts file
export function getMockCompetitionDeadlines(competitionId: string) {
  const now = Math.floor(Date.now() / 1000);

  // Different deadlines for each competition
  switch (competitionId) {
    case '1':
      return {
        submissionDeadline: now + 172800, // 2 days from now
        votingDeadline: now + 345600, // 4 days from now
      };
    case '2':
      return {
        submissionDeadline: now - 43200, // 12 hours ago
        votingDeadline: now + 129600, // 1.5 days from now
      };
    case '3':
      return {
        submissionDeadline: now - 259200, // 3 days ago
        votingDeadline: now - 86400, // 1 day ago (completed)
      };
    default:
      // Default fallback
      return {
        submissionDeadline: now + 86400, // 1 day from now
        votingDeadline: now + 172800, // 2 days from now
      };
  }
}
