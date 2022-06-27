import { Box, Heading, Stack, Wrap, WrapItem, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { nftAddress, gameAddress } from "../../config";
import Game from "../../artifacts/contracts/game.sol/Game.json";
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
    const gameContract = new ethers.Contract(gameAddress, Game.abi, provider);
    const data = await gameContract.fetchContracts();

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
    const gameContract = new ethers.Contract(gameAddress, Game.abi, provider);
    const data = await gameContract.fetchCompletedContracts();

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
      <Stack
        direction="column"
        alignItems="center"
        my={5}
        rounded="10px"
        bg="whiteAlpha.600"
        p={5}
      >
        <Heading size="md" mb={3}>
          Active Contracts
        </Heading>
        <Stack direction="row" spacing={3} my={5}>
          {activeContracts.length > 0 ? (
            <Wrap>
              {activeContracts.map((contract) => {
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
              })}
            </Wrap>
          ) : 
            <Text>No Active Contracts</Text>
          }
        </Stack>
      </Stack>
      <Stack
        direction="column"
        alignItems="center"
        my={5}
        rounded="10px"
        bg="whiteAlpha.600"
        p={5}
      >
        <Heading size="md" mb={3}>
          Completed Contracts
        </Heading>
        <Stack direction="row" spacing={3} my={8}>
          {completedContracts.length > 0 ? (
            <Wrap>
              {completedContracts.map((contract) => {
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
              })}
            </Wrap>
          ) : 
            <Text>No contracts completed yet</Text>
          }
        </Stack>
      </Stack>
    </Box>
  );
};

export default AllContracts;
