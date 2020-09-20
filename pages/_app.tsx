import { ChakraProvider, Box } from "@chakra-ui/core";
import * as React from "react";
import { AppProps } from "next/app";
import Header from "../components/NavBar";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <ChakraProvider resetCSS>
      <Box h="100vh">
        <Header />
        <Component {...pageProps} />
      </Box>
    </ChakraProvider>
  );
}

export default MyApp;
