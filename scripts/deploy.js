// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Game = await hre.ethers.getContractFactory("Game");
  const game = await Game.deploy([
    { level: 1, contractsRequired: 2, bonus: 2000 },
    { level: 2, contractsRequired: 3, bonus: 3000 },
    { level: 3, contractsRequired: 10, bonus: 5000 },
  ]);

  await game.deployed();

  console.log("Game contract deployed to:", game.address);

  const Trophy = await hre.ethers.getContractFactory("Trophy");
  const trophy = await Trophy.deploy(game.address);

  await trophy.deployed();

  console.log("Trophy NFT contract deployed to: ", nft.address);

  const ERC20 = await hre.ethers.getContractFactory("BountyHunterToken");
  const erc20 = await ERC20.deploy(game.address);

  await erc20.deployed();

  console.log("ERC20 contract deployed to:", erc20.address);

  const Badge = await hre.ethers.getContractFactory("Badge");
  const badge = await Badge.deploy(game.address, [
    "https://bafybeifgijnohkz6fqmpapuul6gkmchrfdofnm54bnt43syuwcesa2co2a.ipfs.infura-ipfs.io/",
    "https://bafybeia6pgaxtpol6ntmrkgqsm3b6dtckbwjbcmtnrmu5aivinjz3gb4l4.ipfs.infura-ipfs.io/",
    "https://bafybeieqqe7a3ru2v43u2hifoyehcnnlzzmkbkngg7yuoyzokn43364tgi.ipfs.infura-ipfs.io/",
  ]);

  await badge.deployed();

  console.log("Badge NFT contract deployed to: ", badge.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
