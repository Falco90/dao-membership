import { useState, useEffect } from "react";
import {
  Container,
  Input,
  Stack,
  NumberInput,
  NumberInputField,
  FormLabel,
  Button,
  InputLeftAddon,
  InputGroup,
  Textarea,
  Image,
  Heading,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import BountyHunterDAO from "../artifacts/contracts/DAO.sol/BountyHunterDAO.json";
import NFT from "../artifacts/contracts/Trophy.sol/Trophy.json";
import ERC20 from "../artifacts/contracts/ERC20.sol/BountyHunterToken.json";
import Web3Modal from "web3modal";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

import { nftAddress, daoAddress, erc20Address } from "../config";

const Admin = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [balance, setBalance] = useState(null);
  const [formInput, setFormInput] = useState({
    reward: "",
    name: "",
    description: "",
  });
  const router = useRouter();

  useEffect(() => {
    fetchContractBalance();
  }, []);

  async function fetchContractBalance() {
    const provider = new ethers.providers.JsonRpcProvider();
    const erc20Contract = new ethers.Contract(
      erc20Address,
      ERC20.abi,
      provider
    );
    const data = await erc20Contract.balanceOf(daoAddress);
    console.log(data);
    setBalance(data);
  }

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      console.log(added.path);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      console.log(url);
      setFileUrl(url);
    } catch (e) {
      console.log(e);
    }
  }

  async function createContract() {
    const { name, description, reward } = formInput;
    if (!name || !description || !reward || !fileUrl) return;
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });

    try {
      const added = await client.add(data);
      console.log(added);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      console.log(url);
      addContract(url);
    } catch (e) {
      console.log("Error uploading file: ", e);
    }
  }

  async function addContract(url) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    let contract = new ethers.Contract(nftAddress, NFT.abi, signer);
    let transaction = await contract.createToken(url);
    console.log("Token created");
    let tx = await transaction.wait();

    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();

    const reward = ethers.utils.parseUnits(formInput.reward, "ether");

    contract = new ethers.Contract(daoAddress, BountyHunterDAO.abi, signer);

    transaction = await contract.createContract(nftAddress, tokenId, reward);
    console.log("contract created");

    await transaction.wait();
    router.push("/");
  }

  return (
    <Container>
      <Heading>Sheriff's office</Heading>
      <Heading size="md">
        Treasury: {balance ? balance.toString().slice(0, -18) : ""}
      </Heading>
      <Stack spacing={3} mt={5}>
        <FormLabel>Create Contract</FormLabel>
        <Input
          placeholder="Target Name"
          value={formInput.name}
          onChange={(event) =>
            setFormInput({ ...formInput, name: event.target.value })
          }
          id="name"
          size="md"
        />
        <Textarea
          value={formInput.description}
          onChange={(event) =>
            setFormInput({ ...formInput, description: event.target.value })
          }
        />
        <InputGroup>
          <InputLeftAddon>$</InputLeftAddon>
          <NumberInput w="100%" min={0}>
            <NumberInputField
              id="reward"
              value={formInput.reward}
              onChange={(event) =>
                setFormInput({ ...formInput, reward: event.target.value })
              }
            />
          </NumberInput>
        </InputGroup>
        <Input type="file" name="Asset" onChange={onChange} />
        {fileUrl && <Image src={fileUrl} />}
        <Button onClick={createContract} bg="orange">
          Create Contract
        </Button>
      </Stack>
    </Container>
  );
};

export default Admin;
