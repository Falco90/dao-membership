const { ethers } = require("hardhat");

describe("Bounty Hunter Game", function () {
  it("Should create NFTs and give NFTs and ERC20 tokens as rewards to players", async function () {
    const Game = await ethers.getContractFactory("Game");
    const game = await Game.deploy([
      { level: 1, contractsRequired: 2, bonus: 20 },
      { level: 2, contractsRequired: 3, bonus: 30 },
      { level: 3, contractsRequired: 10, bonus: 40 },
    ]);
    await game.deployed();
    const gameContractAddress = game.address;

    const NFT = await ethers.getContractFactory("Contract");
    const nft = await NFT.deploy(gameContractAddress);
    await nft.deployed();
    const nftContractAddress = nft.address;

    const ERC20 = await ethers.getContractFactory("BountyHunterToken");
    const erc20 = await ERC20.deploy(gameContractAddress);
    await erc20.deployed();
    const erc20ContractAddress = erc20.address;

    const Badge = await ethers.getContractFactory("Badge");
    const badge = await Badge.deploy(gameContractAddress, [
      "https://bafybeif7paugung5dmodjz3bhy3zjf4jugp6m366ook45hrp6rb35hdkju.ipfs.infura-ipfs.io/",
      "https://bafybeicznunnpif34csub2dsqhw7bbnu3stcb3mfl5ysdsebiubwb6q7f4.ipfs.infura-ipfs.io/",
    ]);
    await badge.deployed();
    const badgeContractAddress = badge.address;

    let reward = ethers.utils.parseUnits("1000", "ether");
    await nft.createToken(
      "https://bafybeigki5qc5u2l6rjtv2btsasxaxzwo3dx26d4b5d523u27a5mtgqqeu.ipfs.infura-ipfs.io/"
    );
    await game.createContract(nftContractAddress, 1, reward);

    reward = ethers.utils.parseUnits("2000", "ether");
    await nft.createToken(
      "https://bafybeiaaoqhaccuefvh5rke7zypfwd3oc4er2wrnckeg4naicpjrakyy3m.ipfs.infura-ipfs.io/"
    );
    await game.createContract(nftContractAddress, 2, reward);

    const [_, playerAddress] = await ethers.getSigners();

    await game
      .connect(playerAddress)
      .completeContract(
        nftContractAddress,
        1,
        erc20ContractAddress,
        badgeContractAddress
      );

    let activeContracts = await game.fetchContracts();

    activeContracts = await Promise.all(
      activeContracts.map(async (c) => {
        const tokenURI = await nft.tokenURI(c.tokenId);
        let contract = {
          tokenId: c.tokenId,
          reward: c.reward,
          completed: c.completed,
          completedBy: c.completedBy,
          owner: c.owner,
          tokenURI: tokenURI,
        };
        return contract;
      })
    );

    let completedContracts = await game.fetchCompletedContracts();

    completedContracts = await Promise.all(
      completedContracts.map(async (c) => {
        const tokenURI = await nft.tokenURI(c.tokenId);
        let contract = {
          tokenId: c.tokenId,
          reward: c.reward,
          completed: c.completed,
          completedBy: c.completedBy,
          owner: c.owner,
          tokenURI: tokenURI,
        };
        return contract;
      })
    );

    await badge.connect(playerAddress).claim();

    const erc20Balance = await erc20.balanceOf(playerAddress.address);
    const trophyBalance = await nft.balanceOf(playerAddress.address);
    const badgeBalance = await badge.balanceOf(playerAddress.address);
    console.log("Active contracts: ", activeContracts);
    console.log("Completed contracts: ", completedContracts);

    console.log("ERC20 Token balance by connected player: ", erc20Balance);
    console.log("Trophy balance by connected player: ", trophyBalance);
    console.log("Badge balance by connected player: ", badgeBalance);
  });
});
