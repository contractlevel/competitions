import { formatDate, truncateAddress } from '@/lib/contract-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { CalendarDays, Crown, Trophy, Users } from 'lucide-react';

interface CompetitionCardProps {
  competition: {
    id: string;
    theme: string;
    prizePool: string;
    submissionDeadline: number;
    votingDeadline: number;
    submissions: string[];
    winningPostId?: string;
    winningAuthor?: string;
  };
}

export default function CompetitionCard({ competition }: CompetitionCardProps) {
  const now = Math.floor(Date.now() / 1000);
  const isSubmissionOpen = now < competition.submissionDeadline;
  const isVotingOpen =
    now >= competition.submissionDeadline && now < competition.votingDeadline;
  const isCompleted = now >= competition.votingDeadline;

  return (
    <Card className="w-full overflow-hidden transition-all duration-300 hover:shadow-lg cyber-card relative">
      {/* Glitch effect line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-neon-blue opacity-70"></div>

      {/* Header with glowing title */}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 text-neon-blue neon-text-blue">
              <Trophy className="h-5 w-5 text-neon-blue" />
              Competition #{competition.id}
            </CardTitle>
            <CardDescription className="flex items-center mt-1 text-neon-pink">
              Prize Pool: {competition.prizePool} GHO
            </CardDescription>
          </div>
          <Badge
            variant={
              isSubmissionOpen
                ? 'default'
                : isVotingOpen
                ? 'secondary'
                : 'outline'
            }
            className={`px-3 py-1 ${
              isSubmissionOpen
                ? 'cyber-badge-green'
                : isVotingOpen
                ? 'cyber-badge'
                : 'cyber-badge-pink'
            }`}
          >
            {isSubmissionOpen
              ? 'Submission Open'
              : isVotingOpen
              ? 'Voting Open'
              : 'Completed'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* Theme section with cyber styling */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-1 text-neon-blue">Theme</h3>
          <p className="bg-cyber-dark p-3 rounded-md border border-neon-blue/20 text-gray-300">
            {competition.theme}
          </p>
        </div>

        {/* Competition details with cyber icons */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center text-sm text-gray-400">
            <CalendarDays className="h-4 w-4 mr-2 text-neon-pink" />
            {isSubmissionOpen ? (
              <span>
                Submissions close: {formatDate(competition.submissionDeadline)}
              </span>
            ) : isVotingOpen ? (
              <span>Voting ends: {formatDate(competition.votingDeadline)}</span>
            ) : (
              <span>
                Completed on: {formatDate(competition.votingDeadline)}
              </span>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <Users className="h-4 w-4 mr-2 text-neon-blue" />
            <span>{competition.submissions.length} submissions</span>
          </div>

          {/* Show winner info for completed competitions */}
          {isCompleted && competition.winningAuthor && (
            <div className="flex items-center text-sm text-neon-green">
              <Crown className="h-4 w-4 mr-2 text-neon-green" />
              <span>Winner: {truncateAddress(competition.winningAuthor)}</span>
            </div>
          )}
        </div>

        {/* View details button with cyber styling */}
        <div className="flex justify-end gap-2">
          <Link href={`/competition/${competition.id}`} passHref>
            <Button variant="outline" size="sm" className="cyber-button">
              View Details
            </Button>
          </Link>

          {/* Add View Winner button for completed competitions */}
          {isCompleted && competition.winningPostId && (
            <Link href={`/competition/${competition.id}#winner`} passHref>
              <Button
                variant="outline"
                size="sm"
                className="cyber-button bg-gradient-to-r from-neon-green/20 to-neon-blue/20 border-neon-green/50"
              >
                <Crown className="mr-2 h-4 w-4 text-neon-green" />
                View Winner
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
