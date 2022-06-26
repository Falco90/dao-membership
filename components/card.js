import { Box, Image, VStack, Text, Heading } from "@chakra-ui/react";
import { forwardRef } from "react";

const Card = forwardRef((props, ref) => {
  const { href, onClick, name, reward, image, completed } = props;

  return (
    <Box
      href={href}
      onClick={onClick}
      ref={ref}
      cursor="pointer"
      w="150px"
      rounded="10px"
      overflow="hidden"
      boxShadow="lg"
      bgGradient="linear(to-t, gray.100, gray.300)"
      border="2px" 
    >
      {completed == true ? (
        <Heading align="center" as="h3" size="md">
          Completed
        </Heading>
      ) : (
        <Heading align="center" as="h3" size="md">
          Wanted
        </Heading>
      )}
      <Image src={image} h="150px"/>
      <VStack py={1} spacing={0.5}>
        <Text fontSize="18px" fontWeight="semibold">
          {name}
        </Text>
        <Text fontWeight="semibold">${reward}</Text>
      </VStack>
    </Box>
  );
});

export default Card;
