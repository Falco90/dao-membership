import { Box, Image, VStack, Text, Heading } from "@chakra-ui/react";
import { forwardRef } from "react";

const Trophy = forwardRef((props, ref) => {
  const { href, onClick, name, reward, image} = props;

  return (
    <Box
      href={href}
      onClick={onClick}
      ref={ref}
      cursor="pointer"
      w="150px"
      rounded="10px"
      overflow="hidden"
      boxShadow="xl"
      bgGradient="linear(to-t, yellow.400, yellow.600)"
      border="0px" 
    >
      <Image src={image} h="150px"/>
      <VStack py={1} spacing={0.5}>
        <Text fontSize="18px" fontWeight="semibold">
          {name}
          </Text>
      </VStack>
    </Box>
  );
});

export default Trophy;