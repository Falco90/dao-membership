import { useRouter } from "next/router";
import {
  Button,
  Image,
  Box,
  Stack,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
} from "@chakra-ui/react";
import { nftAddress, daoAddress, erc20Address, badgeAddress } from "../../config";
import BountyHunterDAO from "../../artifacts/contracts/DAO.sol/BountyHunterDAO.json";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

const ContractDetails = (props) => {
  const router = useRouter();
  const currentContract = router.query;
  console.log(currentContract);

  async function completeContract() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(
      daoAddress,
      BountyHunterDAO.abi,
      signer
    );
    const transaction = await contract.completeContract(
      nftAddress,
      currentContract.tokenId,
      erc20Address,
      badgeAddress
    );
    await transaction.wait();
  }

  return (
    <Stack alignItems="center">
      <Image
        src={currentContract.image}
        border="2px"
        h="250px"
        w="250px"
      ></Image>
      <TableContainer>
        <Table>
          <Thead>
            <Th>TARGET DETAILS</Th>
            <Th></Th>
          </Thead>
          <Tbody>
            <Tr>
              <Td>Name:</Td>
              <Td>{currentContract.name}</Td>
            </Tr>
            <Tr>
              <Td>Reward:</Td>
              <Td>{currentContract.reward}</Td>
            </Tr>
            <Tr>
              <Td>Status:</Td>
              <Td>
                {currentContract.completed === false ? "not completed" : "completed"}
              </Td>
            </Tr>
            {currentContract.completed ? (
              <Tr>
                <Td>Completed By:</Td>
                <Td>{currentContract.completedBy}</Td>
              </Tr>
            ) : ""}
          </Tbody>
        </Table>
      </TableContainer>
        <Button onClick={completeContract}>Complete contract</Button>
    </Stack>
  );
};

export default ContractDetails;
