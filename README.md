# Contract Level Competitions

Developed for the [2025 Lens Spring Hackathon](https://lens.xyz/news/lens-spring-hackathon).

---

[CCAutomation deployment on ETH Sepolia](https://sepolia.etherscan.io/address/0x05e158c17da90ea53b4dfc939dcdaf3899e6afd1#code)

[Automation upkeep](https://automation.chain.link/sepolia/106496519080448525428577726796186347537085405451406677883800369809437331266302)

[ContentCompetition deployment on Lens Sepolia - 0xb616C2D766Ef04b426FD1DC456A31dbEC9697B18](https://explorer.testnet.lens.xyz/address/0xb616C2D766Ef04b426FD1DC456A31dbEC9697B18)

[CCIP tx for Competition creation](https://ccip.chain.link/#/side-drawer/msg/0x45aa360089328c06635025145c2e986d5b039fc99d9b2ba400a099a531ac9b65)

## Overview

Contract Level Competitions are automated and transparent competitions that anyone can create. To create a competition, a `theme`, `prizePool`, `submissionDeadline`, and `votingDeadline` must be provided. Submissions take the form of posts from the [Lens-V3 Global Feed]() (or could be from a custom feed). A post cannot be submitted to a competition after its `submissionDeadline`. Votes can only be cast between the `submissionDeadline` and the `votingDeadline` for submitted posts. Only one vote can be submitted per address (implementing reliable sybil-resistance would be a later feature). The prize pool is sent to the author of the post with the most votes when the `votingDeadline` has passed. If there is a tie, the post that got the winning amount of votes first is considered the winner. If no votes have been cast in a competition, the prize pool is sent back to the competition creator.

A small protocol fee (0.001% of prize pool) is deducted from each competition.

As well as a "Content" Competition platform for social posts on Lens with content such as images, videos, articles, etc, this platform could also be used to reliably facilitate other types of competitions such as hackathons, where entries are submitted as posts.

## Crosschain Automation

The initial plan was to use Chainlink Automation on Lens (Testnet) to automate prize distribution once voting concludes for each respective competition. Unfortunately Chainlink Automation was not available on Lens (Testnet), however CCIP was.

When a competition is created, its unique identifier, `competitionId` is sent across CCIP to Eth Sepolia with the `votingDeadline`. When the `votingDeadline` is reached, Chainlink Automation will send a message back across CCIP with the `competitionId` to distribute the prize to the author of the post with the most votes.

## Deployment

### ContentCompetition contract

`ContentCompetition` is intended to operate on Lens Sepolia, so it (currently) needs to be compiled with Foundry-zksync.

```
foundryup-zksync
```

To prevent compilation errors these sections of `CCAutomation` should be commented out or temporarily removed:

- `AutomationCompatible` import
- `AutomationCompatible` inheritance
- `cannotExecute` modifier on `checkUpkeep()`

Provide a `FOUNDRY_KEYSTORE_ACCOUNT` to deploy:

```
forge script script/deploy/DeployContentCompetition.s.sol --rpc-url https://rpc.testnet.lens.dev --broadcast --zksync --account <FOUNDRY_KEYSTORE_ACCOUNT>
```

### CCAutomation contract

`CCAutomation` is intended to operate on ETH Sepolia, so it needs to be compiled with regular Foundry.

```
foundryup
```

Ensure the code is restored if sections were previously commented out for Foundry-zksync compilation.

Provide a `FOUNDRY_KEYSTORE_ACCOUNT` and `ETH_RPC_URL` to deploy:

```
forge script script/deploy/DeployCCAutomation.s.sol --account <FOUNDRY_KEYSTORE_ACCOUNT> --rpc-url <ETH_RPC_URL> --broadcast
```

## Frontend

The frontend is built with Next.js, to run it:

```
cd frontend
npm i
npm run dev
```

## Testing and Verification

For unit tests run:

```
forge test --mt test_competitions --zksync
```

Certora is used for formal verification. Export a CERTORAKEY to run the conf.

```
export CERTORAKEY=<YOUR_KEY_HERE>
certoraRun ./certora/conf/Competitions.conf
```

## Interactions

Create competitions with cast send. Example:

```
cast send 0x766EBAb532F518b55FaaD3425EBE0Dc26F55604c "createCompetition(string,uint256,uint256)" "hackathon-theme" 1747064126 1747065326 --value 100000000000000 --rpc-url https://rpc.testnet.lens.dev --account myKeystore
```
