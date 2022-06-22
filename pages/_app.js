import { ChakraProvider, Container } from "@chakra-ui/react";
import Layout from "../components/layouts/main";
import Theme from "../lib/theme";
import Fonts from "../components/fonts";

// 1. Set up Metamask

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={Theme}>
      <Fonts />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
  );
}

export default MyApp;
