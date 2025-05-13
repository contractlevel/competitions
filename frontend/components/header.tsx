'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ConnectKitButton } from 'connectkit';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-neon-blue/30 sticky top-0 bg-cyber-dark/90 backdrop-blur-md z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold flex items-center group">
          <motion.div
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="h-6 w-6 mr-2 relative">
              <Image
                src="/logo-alt.png"
                alt="Contract Level Logo"
                width={24}
                height={24}
                className="text-neon-pink group-hover:text-white transition-colors duration-300 filter brightness-0 invert opacity-70 group-hover:opacity-100"
              />
            </div>
          </motion.div>
          <span className="hidden sm:inline text-neon-pink neon-text group-hover:text-neon-blue transition-colors duration-300">
            Contract Level
          </span>
          <span className="sm:hidden text-neon-pink neon-text">CL</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-neon-blue hover:bg-cyber-dark/50"
            >
              Home
            </Button>
          </Link>
          <Link href="/create" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-neon-pink hover:bg-cyber-dark/50"
            >
              Create
            </Button>
          </Link>
          <Link href="/submit" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-neon-blue hover:bg-cyber-dark/50"
            >
              Submit
            </Button>
          </Link>
          <Link href="/vote" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-neon-purple hover:bg-cyber-dark/50"
            >
              Vote
            </Button>
          </Link>
          <ConnectKitButton.Custom>
            {({ isConnecting, show, address, ensName }) => {
              return (
                <Button
                  onClick={show}
                  size="sm"
                  className="h-8 cyber-button"
                  disabled={isConnecting}
                >
                  {isConnecting
                    ? 'Connecting...'
                    : address
                    ? `${
                        ensName ??
                        `${address.slice(0, 6)}...${address.slice(-4)}`
                      }`
                    : 'Connect Wallet'}
                </Button>
              );
            }}
          </ConnectKitButton.Custom>
          <ThemeToggle />
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-4 md:hidden">
          <ConnectKitButton.Custom>
            {({ isConnecting, show, address, ensName }) => {
              return (
                <Button
                  onClick={show}
                  size="sm"
                  className="h-8 cyber-button"
                  disabled={isConnecting}
                >
                  {isConnecting
                    ? 'Connecting...'
                    : address
                    ? `${
                        ensName ??
                        `${address.slice(0, 6)}...${address.slice(-4)}`
                      }`
                    : 'Connect'}
                </Button>
              );
            }}
          </ConnectKitButton.Custom>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-neon-blue hover:bg-cyber-dark/50"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 ease-in-out border-b border-neon-blue/20',
          mobileMenuOpen ? 'max-h-[300px]' : 'max-h-0 border-b-0'
        )}
      >
        <div className="container mx-auto px-4 py-3 flex flex-col space-y-2">
          <Link href="/" passHref onClick={() => setMobileMenuOpen(false)}>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start w-full text-gray-300 hover:text-neon-blue hover:bg-cyber-dark/50"
            >
              Home
            </Button>
          </Link>
          <Link
            href="/create"
            passHref
            onClick={() => setMobileMenuOpen(false)}
          >
            <Button
              variant="ghost"
              size="sm"
              className="justify-start w-full text-gray-300 hover:text-neon-pink hover:bg-cyber-dark/50"
            >
              Create
            </Button>
          </Link>
          <Link
            href="/submit"
            passHref
            onClick={() => setMobileMenuOpen(false)}
          >
            <Button
              variant="ghost"
              size="sm"
              className="justify-start w-full text-gray-300 hover:text-neon-blue hover:bg-cyber-dark/50"
            >
              Submit
            </Button>
          </Link>
          <Link href="/vote" passHref onClick={() => setMobileMenuOpen(false)}>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start w-full text-gray-300 hover:text-neon-green hover:bg-cyber-dark/50"
            >
              Vote
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
