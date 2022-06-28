import { HStack, VStack, Heading, Box } from "@chakra-ui/react";
import Link from "next/link";

const Navbar = () => {
  return (
    <VStack justify="center">
      <Heading size="2xl" mt={3}  fontFamily="'Bookman Opti Bold'">SPACE COWBOYS</Heading>
      <HStack width="100%" justify="center" mt={2} mb={4}>
        <Link color="lightPurple" href={"/"}>Home</Link>
        <Link href={"/contracts"}>Contracts</Link>
        <Link href={"/profile"}>My Profile</Link>
      </HStack>
    </VStack>
  );
};

export default Navbar;
