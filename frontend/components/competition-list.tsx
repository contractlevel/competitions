'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  fetchCompetition,
  isContractDeployed,
  getMockCompetitionDeadlines,
} from '@/lib/contract-utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { CONTRACT_ADDRESS } from '@/lib/contract-config';
import CompetitionCard from './competition-card';
import { motion } from 'framer-motion';

interface Competition {
  id: string;
  theme: string;
  prizePool: string;
  submissionDeadline: number;
  votingDeadline: number;
  submissions: string[];
  winningPostId?: string;
  winningAuthor?: string;
}

export default function CompetitionList() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [useMockData, setUseMockData] = useState(false);
  const [contractStatus, setContractStatus] = useState<
    'checking' | 'deployed' | 'not-deployed'
  >('checking');

  useEffect(() => {
    async function checkContract() {
      try {
        const deployed = await isContractDeployed();
        setContractStatus(deployed ? 'deployed' : 'not-deployed');

        if (!deployed) {
          setError(`Contract not deployed at address ${CONTRACT_ADDRESS}`);
          setUseMockData(true);
          loadMockData();
          setLoading(false);
          return false;
        }

        return true;
      } catch (err) {
        console.error('Error checking contract:', err);
        setContractStatus('not-deployed');
        setError('Failed to check contract deployment status');
        setUseMockData(true);
        loadMockData();
        setLoading(false);
        return false;
      }
    }

    async function fetchCompetitions() {
      setLoading(true);
      setError('');
      setUseMockData(false);

      // First check if the contract is deployed
      const contractDeployed = await checkContract();
      if (!contractDeployed) return;

      try {
        // In a real implementation, you would have a way to get all competition IDs
        // For now, we'll try to fetch competitions with IDs 1-5
        const competitionIds = ['1', '2', '3', '4', '5'];
        const fetchedCompetitions = [];

        for (const id of competitionIds) {
          try {
            const competition = await fetchCompetition(id);
            fetchedCompetitions.push(competition);
          } catch (err) {
            // Skip competitions that don't exist
            console.log(`Competition ${id} not found or error fetching`);
          }
        }

        if (fetchedCompetitions.length === 0) {
          // If no competitions were found, use mock data for demonstration
          setUseMockData(true);
          loadMockData();
        } else {
          setCompetitions(fetchedCompetitions);
        }
      } catch (err: any) {
        console.error('Error fetching competitions:', err);
        setError(err.message || 'Failed to fetch competitions');
        setUseMockData(true);
        loadMockData();
      } finally {
        setLoading(false);
      }
    }

    function loadMockData() {
      // Use mock data as fallback with consistent deadlines
      const mockCompetitions = [
        {
          id: '1',
          theme:
            'Web3 Innovation - Create a dApp that solves a real-world problem using blockchain technology',
          prizePool: '0.5',
          ...getMockCompetitionDeadlines('1'),
          submissions: ['1', '2', '3'],
        },
        {
          id: '2',
          theme:
            'DeFi Applications - Showcase a decentralized finance application that improves financial inclusion',
          prizePool: '1.0',
          ...getMockCompetitionDeadlines('2'),
          submissions: ['4', '5'],
        },
        {
          id: '3',
          theme:
            'NFT Showcase - Create an innovative NFT project with real utility beyond digital art',
          prizePool: '0.3',
          ...getMockCompetitionDeadlines('3'),
          submissions: ['6', '7', '8', '9'],
          winningPostId: '7', // Add winner for completed competition
          winningAuthor: '0x7890123456789012345678901234567890123456', // Add winning author address
        },
      ];
      setCompetitions(mockCompetitions);
    }

    fetchCompetitions();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full cyber-card">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div>
                  <Skeleton className="h-6 w-[180px] bg-cyber-light/20" />
                  <Skeleton className="h-4 w-[120px] mt-2 bg-cyber-light/20" />
                </div>
                <Skeleton className="h-8 w-[100px] bg-cyber-light/20" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2 bg-cyber-light/20" />
              <Skeleton className="h-4 w-full mb-2 bg-cyber-light/20" />
              <Skeleton className="h-4 w-2/3 mb-4 bg-cyber-light/20" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/3 bg-cyber-light/20" />
                <Skeleton className="h-8 w-[100px] bg-cyber-light/20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* @review - config {contractStatus === "not-deployed" && (
        <Alert variant="destructive" className="mb-4 animate-in fade-in-50 duration-300 cyber-card-pink">
          <AlertCircle className="h-4 w-4 text-neon-pink" />
          <AlertTitle className="text-neon-pink">Contract Not Found</AlertTitle>
          <AlertDescription className="text-gray-300">
            The contract could not be found at the specified address. Please check your contract address in the
            configuration.
            <div className="mt-2 text-xs font-mono break-all text-neon-blue">{CONTRACT_ADDRESS}</div>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4 animate-in fade-in-50 duration-300 cyber-card-pink">
          <AlertCircle className="h-4 w-4 text-neon-pink" />
          <AlertTitle className="text-neon-pink">Error</AlertTitle>
          <AlertDescription className="text-gray-300">{error}</AlertDescription>
        </Alert>
      )} */}

      {useMockData && (
        <Alert className="mb-4 animate-in fade-in-50 duration-300 cyber-card">
          <AlertTriangle className="h-4 w-4 text-neon-yellow" />
          <AlertTitle className="text-neon-yellow">Using Demo Data</AlertTitle>
          <AlertDescription className="text-gray-300">
            Unable to fetch real competition data. Showing demo data instead.
          </AlertDescription>
        </Alert>
      )}

      {competitions.length === 0 ? (
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="text-neon-blue">No Competitions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">No active competitions found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {competitions.map((competition, index) => (
            <motion.div
              key={competition.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <CompetitionCard competition={competition} />
            </motion.div>
          ))}
        </div>
      )}

      {useMockData && (
        <Alert className="mt-6 animate-in fade-in-50 duration-300 cyber-card">
          <Info className="h-4 w-4 text-neon-blue" />
          <AlertTitle className="text-neon-blue">
            Configuration Required
          </AlertTitle>
          <AlertDescription className="text-gray-300">
            <p className="mb-2">
              To use real data, please update the contract addresses in{' '}
              <code className="text-neon-pink">lib/contract-config.ts</code>:
            </p>
            <pre className="bg-cyber-dark p-2 rounded text-xs overflow-x-auto border border-neon-blue/30">
              {`export const CONTRACT_ADDRESS = "0x123..."; // Your ContentCompetition contract\nexport const FEED_CONTRACT_ADDRESS = "0x456..."; // Your Lens Feed contract`}
            </pre>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
