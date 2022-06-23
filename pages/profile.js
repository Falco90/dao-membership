import { Box, Heading, Stack, Button } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { nftAddress, daoAddress, badgeAddress } from "../config";
import BountyHunterDAO from "../artifacts/contracts/DAO.sol/BountyHunterDAO.json";
import Contract from "../artifacts/contracts/Contract.sol/Contract.json";
import Badge from "../artifacts/contracts/Badge.sol/Badge.json";
import Web3Modal from "web3modal";
import axios from "axios";
import Card from "../components/card";

const Profile = () => {
  const [contracts, setContracts] = useState([]);
  const [playerData, setPlayerData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyPlayerData();
    fetchMyContracts();
  }, []);

  async function claimBadge() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const badgeContract = new ethers.Contract(
      badgeAddress,
      Badge.abi,
      signer
    );

    const data = await badgeContract.claim();
    console.log("badge: ", data);
  }

  async function fetchMyPlayerData() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();

    const daoContract = new ethers.Contract(
      daoAddress,
      BountyHunterDAO.abi,
      signer
    );

    console.log("signer address: ", signer);

    const data = await daoContract.fetchPlayerData(signerAddress);
    setPlayerData(data);
    console.log("Player data: " + playerData.contractsCompleted);
  }

  async function fetchMyContracts() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const tokenContract = new ethers.Contract(
      nftAddress,
      Contract.abi,
      provider
    );
    const daoContract = new ethers.Contract(
      daoAddress,
      BountyHunterDAO.abi,
      signer
    );
    const data = await daoContract.fetchMyContracts();

    const _contracts = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let reward = ethers.utils.formatUnits(i.reward.toString(), "ether");
        let contract = {
          reward,
          tokenId: i.tokenId.toNumber(),
          completedBy: i.completedBy,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return contract;
      })
    );
    setContracts(_contracts);
    console.log(contracts);
    setIsLoading(false);
  }

  return (
    <Box>
      {isLoading == false && playerData ? (
        <Box>
        <p>Player ID: {playerData.playerId.toString()}</p>
        <p>Contracts completed: {playerData.contractsCompleted.toString()}</p>
        <p>Total rewards earned: {playerData.totalRewardsEarned.toString()}</p>
        <p>Amount of contracts to complete until next promotion: </p>
        <Button onClick={claimBadge}> Claim Badge</Button>
        </Box>
      )
      : "" }
    <Heading as="h4">My Completed Contracts</Heading>
    <Stack direction="row" spacing={3}>
      {isLoading == false && contracts.length > 0
        ? contracts.map((contract) => {
            return (
              <Link
                href={{
                  pathname: "/contracts/" + contract.tokenId,
                  query: contract,
                }}
                passHref
                key={contract.tokenId}
              >
                <Card
                  name={contract.name}
                  reward={contract.reward}
                  image={contract.image}
                ></Card>
              </Link>
            );
          })
        : "No contracts completed yet"}
    </Stack>
  </Box>
  );
};

export default Profile;
