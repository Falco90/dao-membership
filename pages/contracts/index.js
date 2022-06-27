import {
  Box,
  Heading,
  Stack,
  Table,
  TableContainer,
  Tr,
  Th,
  Td,
  Thead,
  Tbody,
  Button,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { nftAddress, daoAddress } from "../../config";
import BountyHunterDAO from "../../artifacts/contracts/DAO.sol/BountyHunterDAO.json";
import Contract from "../../artifacts/contracts/Trophy.sol/Trophy.json";
import axios from "axios";
import Card from "../../components/card";

const AllContracts = () => {
  const [activeContracts, setActiveContracts] = useState([]);
  const [completedContracts, setCompletedContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
    fetchCompletedContracts();
  }, []);

  async function fetchContracts() {
    const provider = new ethers.providers.JsonRpcProvider();
    const tokenContract = new ethers.Contract(
      nftAddress,
      Contract.abi,
      provider
    );
    const daoContract = new ethers.Contract(
      daoAddress,
      BountyHunterDAO.abi,
      provider
    );
    const data = await daoContract.fetchContracts();

    const _contracts = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let reward = ethers.utils.formatUnits(i.reward.toString(), "ether");
        let contract = {
          reward,
          tokenId: i.tokenId.toNumber(),
          completed: i.completed,
          completedBy: i.completedBy,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return contract;
      })
    );
    setActiveContracts(_contracts);
    setIsLoading(false);
  }

  async function fetchCompletedContracts() {
    const provider = new ethers.providers.JsonRpcProvider();
    const tokenContract = new ethers.Contract(
      nftAddress,
      Contract.abi,
      provider
    );
    const daoContract = new ethers.Contract(
      daoAddress,
      BountyHunterDAO.abi,
      provider
    );
    const data = await daoContract.fetchCompletedContracts();

    const _contracts = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let reward = ethers.utils.formatUnits(i.reward.toString(), "ether");
        let contract = {
          reward,
          tokenId: i.tokenId.toNumber(),
          completedBy: i.completedBy,
          completed: i.completed,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return contract;
      })
    );
    setCompletedContracts(_contracts);
    setIsLoading(false);
  }

  return (
    <Box>
      <Heading size="md">Active Contracts</Heading>
      <Stack direction="row" spacing={3}>
        {activeContracts.length > 0
          ? activeContracts.map((contract) => {
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
                    completed={contract.completed}
                  ></Card>
                </Link>
              );
            })
          : "No contracts completed yet"}
      </Stack>
      <Box mt={5}>
        <Heading size="md">Completed Contracts</Heading>
        <Stack direction="row" spacing={3}>
          {completedContracts.length > 0
            ? completedContracts.map((contract) => {
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
                      completed={contract.completed}
                    ></Card>
                  </Link>
                );
              })
            : "No contracts completed yet"}
        </Stack>
      </Box>
    </Box>
  );
};

export default AllContracts;
