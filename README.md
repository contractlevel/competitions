# Contract Level Competitions

**Developed for the [2025 Lens Spring Hackathon](https://lens.xyz/news/lens-spring-hackathon)**

**[Watch demo video](https://www.youtube.com/watch?v=uFq8fUUIt0g)**

**Try it at [contractlevel.com](https://contractlevel.com)!**

## Overview

Contract Level Competitions is a decentralized platform built on the Lens Chain, empowering anyone to create and participate in transparent, community-driven competitions. By integrating with the Lens ecosystem, the platform leverages Lens posts from the global feed as competition entries, fostering social engagement and content creation. Whether it's a creative challenge, a hackathon, or a content showdown, Contract Level Competitions brings a novel, blockchain-based approach to incentivizing participation and rewarding excellence.

### Key Highlights

- **Built on Lens Chain**: Fully deployed on Lens mainnet.
- **Lens Social Integration**: Utilizes Lens posts as submissions, tapping into the power of the Lens Social Primitive.
- **Seamless Onboarding**: Implements ConnectKit + Continue with Family for a smooth, user-friendly wallet connection experience.

## Table of Contents

- [Contract Level Competitions](#contract-level-competitions)
  - [Overview](#overview)
    - [Key Highlights](#key-highlights)
  - [Table of Contents](#table-of-contents)
  - [Features and Functionality](#features-and-functionality)
    - [Competition Creation](#competition-creation)
    - [Submission Process](#submission-process)
    - [Voting Mechanism](#voting-mechanism)
    - [Prize Distribution](#prize-distribution)
  - [Technical Architecture](#technical-architecture)
    - [Smart Contracts](#smart-contracts)
    - [Cross-Chain Adaptation](#cross-chain-adaptation)
    - [Frontend](#frontend)
  - [Deployment and Usage Instructions](#deployment-and-usage-instructions)
    - [Contract Deployment](#contract-deployment)
    - [Creating a Competition](#creating-a-competition)
    - [Participating](#participating)
    - [Testing and Verification](#testing-and-verification)
      - [Unit Tests](#unit-tests)
      - [Formal Verification](#formal-verification)
    - [Frontend](#frontend-1)
  - [Future Enhancements](#future-enhancements)
  - [Links and Resources](#links-and-resources)
  - [Additional Comments](#additional-comments)

## Features and Functionality

### Competition Creation

- **How It Works**: Anyone can create a competition by specifying a `theme`, `prize pool`, `submission deadline`, and `voting deadline`.
- **Flexibility**: Themes can range from social media content (e.g., images, videos, articles) to hackathon-style challenges.

### Submission Process

- **Lens Posts as Entries**: Submissions are posts from the Lens global feed, ensuring compatibility across Lens-based platforms.
- **Deadline Enforcement**: Posts cannot be submitted after the `submissionDeadline` passes.

### Voting Mechanism

- **Time-Bound Voting**: Votes are cast between the `submissionDeadline` and `votingDeadline`.
- **One Vote Per Address**: Each address is limited to a single vote per competition (sybil-resistance planned for future iterations).
- **Transparency**: Voting is fully on-chain, ensuring fairness and auditability.

### Prize Distribution

- **Winner Determination**: The post with the most votes wins the prize pool. In case of a tie, the earliest submission with the highest votes prevails.
- **Fallback Mechanism**: If no votes are cast, the prize pool is returned to the competition creator.
- **Protocol Fee**: A minimal fee (0.001% of the prize pool) is deducted to sustain the platform.

## Technical Architecture

### Smart Contracts

- **Core Contract**: The `Competitions` contract handles all competition logic, including creation, submissions, voting, and prize distribution.
- **Lens Integration**: Interacts with the Lens V3 global feed contract to validate and retrieve post data.
- **Mainnet Deployment**: Live on Lens mainnet at [0xd2550fCb1C389401E9F8802e68b093fcc0595993](https://explorer.lens.xyz/address/0xd2550fCb1C389401E9F8802e68b093fcc0595993).

### Cross-Chain Adaptation

- **Original Vision**: Planned to use Chainlink Automation for automated prize distribution, tested on Lens testnet with CCIP.
- **Mainnet Adjustment**: Due to CCIP's unavailability on Lens mainnet, prize distribution is currently manual (callable by anyone post-voting). Automation will be reintroduced when supported.

### Frontend

- **Next.js Application**: Hosted at [contractlevel.com](http://contractlevel.com), providing an intuitive interface for creating and managing competitions.
- **Onboarding**: Utilizes ConnectKit + Continue with Family for effortless wallet connections.

## Deployment and Usage Instructions

### Contract Deployment

The `Competitions` contract can be deployed by running the following script:

```
forge script script/deploy/DeployCompetitions.s.sol --broadcast --zksync --rpc-url <RPC_URL_HERE> --account <KEYSTORE_ACCOUNT_HERE>
```

- **Mainnet**: Deployed on Lens Chain at [0xd2550fCb1C389401E9F8802e68b093fcc0595993](https://explorer.lens.xyz/address/0xd2550fCb1C389401E9F8802e68b093fcc0595993).
- **Testnet**: Available on Lens Sepolia at [0xcA7090a104562915F8717bd692F8A2d6795f2A2E](https://explorer.testnet.lens.xyz/address/0xcA7090a104562915F8717bd692F8A2d6795f2A2E).

### Creating a Competition

- **Via Frontend**: Visit [contractlevel.com](http://contractlevel.com) to create a competition with a few clicks.
- **Via CLI**: Use `cast` to interact with the contract directly. Example:
  ```bash
  cast send 0xd2550fCb1C389401E9F8802e68b093fcc0595993 "createCompetition(string,uint256,uint256)" "hackathon-theme" 1747064126 1747065326 --value 100000000000000 --rpc-url https://rpc.lens.dev --account myKeystore
  ```

### Participating

- **Submit a Post**: Create a Lens post and submit its postId to an active competition before the submissionDeadline.

- **Vote**: Cast your vote for a submitted post between the submissionDeadline and votingDeadline.

- **Prize Distribution**: After the votingDeadline, anyone can trigger distributePrizePool to send the prize to the winner.

### Testing and Verification

#### Unit Tests

- **Framework**: Foundry, forking Lens mainnet to replicate real-world conditions.

- **Execution**: Run tests with:

```
forge test --mt test_competitions --zksync
```

#### Formal Verification

- **Tool**: Certora, ensuring critical properties (e.g., prize distribution only happens once per competition).

- **Execution**: Run verification with:

```
export CERTORAKEY=<YOUR_KEY_HERE>
certoraRun ./certora/conf/Competitions.conf
```

### Frontend

To build the frontend run:

```
cd frontend
npm i
npm run dev
```

## Future Enhancements

- **Sybil-Resistance**: Implement robust mechanisms to prevent vote manipulation and ensure fair participation.

- **Automation**: Integrate Chainlink Automation when available on Lens mainnet for fully automated prize distribution.

## Links and Resources

- **Mainnet Deployment**: 0xd2550fCb1C389401E9F8802e68b093fcc0595993

- **Testnet Deployment**: 0xcA7090a104562915F8717bd692F8A2d6795f2A2E

## Additional Comments

Deployed contracts were unable to be verified on the lens explorer because only <= 0.8.24 was compatible, and the Lens Feed contract is 0.8.26.

CCIP was upgraded at the end of the Lens hackathon, and Lens mainnet can now securely connect to Ethereum mainnet. The timing of this upgrade is unfortunate as there is not enough time to refactor the project back to the original vision and deploy, but exciting to know that reliably Automation can now be implemented in Lens mainnet smart contracts.
