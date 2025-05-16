import Link from 'next/link';
import { Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-neon-green/20 bg-cyber-dark/80 backdrop-blur-sm">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="text-neon-pink">Contract</span>{' '}
            <span className="text-neon-green">Level</span> ©{' '}
            {new Date().getFullYear()}
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="https://github.com/contractlevel/competitions"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-neon-blue transition-colors"
            >
              <Github size={18} />
              <span className="text-sm">Source Code</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
