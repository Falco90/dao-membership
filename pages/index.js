import {
  Container,
  Box,
  Heading,
  Button,
  Text,
  Stack,
  OrderedList,
  ListItem,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import axios from "axios";
import { daoAddress, nftAddress } from "../config";
import BountyHunterDAO from "../artifacts/contracts/DAO.sol/BountyHunterDAO.json";
import Contract from "../artifacts/contracts/Contract.sol/Contract.json";
import Card from "../components/card";
import Leaderboard from "../components/leaderboard";
import Link from "next/link";

export default function Home() {
  const [contracts, setContracts] = useState([]);
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sheriff, setSheriff] = useState("");

  useEffect(() => {
    // fetchSheriff();
    fetchContracts();
    fetchPlayers();
  }, []);

  async function fetchPlayers() {
    const provider = new ethers.providers.JsonRpcProvider();
    const daoContract = new ethers.Contract(
      daoAddress,
      BountyHunterDAO.abi,
      provider
    );
    const data = await daoContract.fetchPlayers();
    console.log(data);
    const _players = data.map((p) => {
      let player = {
        id: p.playerId.toNumber(),
        address: p.playerAddress,
        contractsCompleted: p.contractsCompleted.toNumber(),
        totalRewardsEarned: ethers.utils.formatUnits(
          p.totalRewardsEarned,
          "ether"
        ),
      };
      return player;
    });
    console.log(_players);
    setPlayers(_players);
  }

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
    console.log(data);

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
    setContracts(_contracts);
    console.log(contracts);
    setIsLoading(false);
  }

  return (
    <Box>
      <Box my={5} rounded="10px" bg="whiteAlpha.600" p={5}>
        <Heading as="h2" size="md">
          Calling all bounty hunters,
        </Heading>
        <Text>
          <br></br>
          Let's keep the galaxy a safe place. Become a bounty hunter and you'll
          be rewarded handsomely. Report back to me for your bounty when you've
          captured one of the targets below.
          <br></br>
          <br></br> The Sheriff
        </Text>
      </Box>
      <Stack
        p={5}
        mb={5}
        alignItems="center"
        rounded="10px"
        bg="whiteAlpha.600"
      >
        <Heading size="md" mb={3}>
          Latest Contracts
        </Heading>
        <Stack direction="row" spacing={3} my={5}>
          {isLoading == false && contracts.length > 0
            ? contracts.slice(-4).map((contract) => {
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
            : "No Active Contracts"}
        </Stack>
        <Link href={"/contracts"}>
          <Button bg="orange">All Contracts</Button>
        </Link>
      </Stack>
      <Leaderboard players={players} />
    </Box>
  );
}
