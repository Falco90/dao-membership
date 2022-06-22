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
  const DAO = await hre.ethers.getContractFactory("BountyHunterDAO");
  const dao = await DAO.deploy([1, 3, 5, 10, 25, 50, 100]);

  await dao.deployed();

  console.log("Bounty Hunter DAO deployed to:", dao.address);

  const NFT = await hre.ethers.getContractFactory("Contract");
  const nft = await NFT.deploy(dao.address);

  await nft.deployed();

  console.log("NFT deployed to: ", nft.address);

  const ERC20 = await hre.ethers.getContractFactory("MyToken");
  const erc20 = await ERC20.deploy(dao.address);

  await erc20.deployed();

  console.log("Contract ERC20 deployed to:", erc20.address);

  const Badge = await hre.ethers.getContractFactory("Badge");
  const badge = await Badge.deploy(
    dao.address,
    "https://cdn5.vectorstock.com/i/1000x1000/81/09/modern-bronze-circle-metal-badges-labels-vector-16488109.jpg",
    "https://cdn.w600.comps.canstockphoto.com/awesome-silver-badge-with-blue-ribbon-image_csp33850773.jpg",
    "https://i.pinimg.com/736x/2d/ef/52/2def52596775ecbb7d98c8a400129570.jpg",
    [1, 2, 3]
  );

  await badge.deployed();

  console.log("Badge deployed to: ", badge.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
