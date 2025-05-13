'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import CompetitionList from '@/components/competition-list';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Search, Trophy, Send, Vote } from 'lucide-react';
import { CONTRACT_ADDRESS, FEED_CONTRACT_ADDRESS } from '@/lib/contract-config';
import { isContractDeployed } from '@/lib/contract-utils';
import CyberHero from '@/components/cyber-hero';
import { motion } from 'framer-motion';

export default function Home() {
  // Add this near the top of your component
  console.log('RPC URL:', process.env.NEXT_PUBLIC_RPC_URL);
  const [searchId, setSearchId] = useState('');
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    // Check if the contract addresses have been updated from the default
    const defaultAddress = '0x0000000000000000000000000000000000000000';
    if (
      CONTRACT_ADDRESS === defaultAddress ||
      FEED_CONTRACT_ADDRESS === defaultAddress
    ) {
      setIsConfigured(false);
    } else {
      // Check if the contract is actually deployed
      isContractDeployed().then((deployed) => {
        setIsConfigured(deployed);
      });
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId) {
      window.location.href = `/competition/${searchId}`;
    }
  };

  return (
    <main className="min-h-screen">
      <CyberHero
        title="Competitions"
        description="Create competitions, submit Lens posts, and vote for your favorites to win prizes."
        className="mb-12"
      />

      {/* @review - config {!isConfigured && (
        <div className="container mx-auto px-4">
          <Alert className="mb-8 animate-in fade-in-50 duration-300 cyber-card">
            <Info className="h-4 w-4 text-neon-blue" />
            <AlertTitle className="text-neon-blue">Configuration Required</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                Please update the contract addresses in <code className="text-neon-pink">lib/contract-config.ts</code>{" "}
                to use real data:
              </p>
              <pre className="bg-cyber-darker p-2 rounded text-xs overflow-x-auto border border-neon-blue/30">
                {`export const CONTRACT_ADDRESS = "0x123..."; // Your ContentCompetition contract\nexport const FEED_CONTRACT_ADDRESS = "0x456..."; // Your Lens Feed contract`}
              </pre>
            </AlertDescription>
          </Alert>
        </div>
      )} */}

      <div className="container mx-auto px-4 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* All cards have the same height with h-full and fixed content height */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link href="/create" className="block h-full">
              <Card className="cyber-card-pink h-full flex flex-col transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-full bg-neon-pink/10 text-neon-pink group-hover:bg-neon-pink group-hover:text-white transition-colors duration-300">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-neon-pink">
                      Create Competition
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Set up a new competition with a prize pool
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-400">
                    Define a theme, set deadlines, and fund a prize pool to
                    start a new content competition.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Link href="/submit" className="block h-full">
              <Card className="cyber-card h-full flex flex-col transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-full bg-neon-blue/10 text-neon-blue group-hover:bg-neon-blue group-hover:text-white transition-colors duration-300">
                      <Send className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-neon-blue">
                      Submit Post
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Submit your Lens post to a competition
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-400">
                    Enter your Lens post ID to submit it to an active
                    competition.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Link href="/vote" className="block h-full">
              <Card className="cyber-card-green h-full flex flex-col transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-full bg-neon-green/10 text-neon-green group-hover:bg-neon-green group-hover:text-black transition-colors duration-300">
                      <Vote className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-neon-green">Vote</CardTitle>
                  </div>
                  <CardDescription>
                    Vote for your favorite submissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-400">
                    Browse submissions and vote for your favorites during the
                    voting period.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="w-full max-w-md mx-auto cyber-card-purple">
            <CardHeader>
              <CardTitle className="text-neon-purple">
                Find a Competition
              </CardTitle>
              <CardDescription>
                Enter a competition ID to view details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Competition ID"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="cyber-input"
                />
                <Button type="submit" className="cyber-button">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-6 text-neon-blue neon-text-blue">
          Active Competitions
        </h2>
        <CompetitionList />
      </div>
    </main>
  );
}
