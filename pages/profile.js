import {
  Box,
  Heading,
  Stack,
  Button,
  Image,
  Text,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { nftAddress, gameAddress, badgeAddress } from "../config";
import Game from "../artifacts/contracts/game.sol/Game.json";
import Contract from "../artifacts/contracts/Trophy.sol/Trophy.json";
import Badge from "../artifacts/contracts/Badge.sol/Badge.json";
import Web3Modal from "web3modal";
import axios from "axios";
import Trophy from "../components/trophy";
import { useRouter } from "next/router";

const Profile = () => {
  const [contracts, setContracts] = useState([]);
  const [playerData, setPlayerData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [badgeUrl, setBadgeUrl] = useState("");

  const router = useRouter();

  useEffect(() => {
    fetchMyPlayerData();
    fetchMyContracts();
    fetchBadge();
  }, []);

  async function claimBadge() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const badgeContract = new ethers.Contract(badgeAddress, Badge.abi, signer);

    await badgeContract.claim();
    fetchBadge();
    router.reload();
  }

  async function fetchBadge() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const address = signer.getAddress();

    const tokenContract = new ethers.Contract(badgeAddress, Badge.abi, signer);

    const balance = await tokenContract.balanceOf(address);

    if (balance > 0) {
      const tokenURI = await tokenContract.fetchMyBadge();
      const meta = await axios.get(tokenURI);
      setBadgeUrl(meta.data);
    }
  }

  async function fetchMyPlayerData() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();

    const gameContract = new ethers.Contract(gameAddress, Game.abi, signer);
    const data = await gameContract.fetchPlayerData(signerAddress);
    setPlayerData(data);
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
    const gameContract = new ethers.Contract(gameAddress, Game.abi, signer);
    const data = await gameContract.fetchMyContracts();

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
    setIsLoading(false);
  }

  return (
    <Box>
      <Stack
        display="flex"
        direction="column"
        my={5}
        rounded="10px"
        bg="whiteAlpha.600"
        p={5}
      >
        <Heading alignSelf="center">My Profile</Heading>
        {isLoading == false && playerData.playerAddress ? (
          <Flex direction="row" alignItems="center" justifyContent="justify">
            <Box>
              <Text>
                Contracts completed: {playerData.contractsCompleted.toString()}
              </Text>
              <Text>
                Total rewards earned: ${playerData.totalRewardsEarned.toString().slice(0, -18)}
              </Text>
            </Box>
            <Spacer />
            {playerData.contractsCompleted > 0? (
            <Stack direction="column" alignItems="center">
              {badgeUrl == "" ? (
                <Button onClick={claimBadge}> Claim Badge</Button>
                ) : (
                  <Stack direction="column" alignItems="center">
                <Text>{badgeUrl.level}</Text>
                <Image src={badgeUrl.image} w="150px" />
                </Stack>
              )}
            </Stack>
            ) : ""
                }
          </Flex>
        ) : (
          ""
        )}
      </Stack>
      <Stack
        alignItems="center"
        p={5}
        my={5}
        rounded="10px"
        bg="whiteAlpha.600"
      >
        <Heading size="md">Trophies</Heading>
        <Stack direction="row" spacing={3} p={5}>
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
                    <Trophy
                      name={contract.name}
                      reward={contract.reward}
                      image={contract.image}
                    ></Trophy>
                  </Link>
                );
              })
            : <Text>Complete contracts to earn trophies</Text>}
        </Stack>
      </Stack>
    </Box>
  );
};

export default Profile;
