# Space Cowboys

In this example a sheriff can reward bounties to players who capture wanted criminals. The sheriff can create NFT's of the suspects which will be added as "Wanted" posters to the active contracts list. When a player completes the contract they will receive the NFT as a trophy along with bounty in Bounty Hunter Tokens (BHT). After completion of the first contract a player can claim their Badge, which is a dynamic NFT. Afer completing certain milestones (set by the deployer of the game contract), the badge will upgrade (bronze, silver, gold), and the player will receive a bonus in Bounty Hunter Tokens. A leaderboard keeps track of which bounty hunter has completed most contracts and earned the most rewards.

The mechanics demonstrated in this project can be applied to other settings as well, for example within DAO's to reward member participation.

## Instructions to run on localhost:

1.      npx hardhat node
2.      npx hardhat run scripts/deploy.js --network localhost
3.      npm run dev

## General Flow

1. Deployer of the contract goes to the "/admin" route to create new contracts and add them to the list
2. Player completes contracts from the list and gets trophy and erc20 tokens
3. After completing the first contract the player can claim their badge
4. After reaching certain milestones the badge gets upgraded and player receives bonuses