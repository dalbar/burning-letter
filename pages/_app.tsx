/**
 * Set general app layout and custom providers here
 * Every page will be loaded as specified in this component
 **/
import { ChakraProvider, Box } from "@chakra-ui/core";
import * as React from "react";
import { AppProps } from "next/app";
import Header from "../components/NavBar";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <ChakraProvider resetCSS>
      <Box h="100vh">
        <Header />
        <Box h="100%" pt="73px" boxSizing="border-box">
          <Component {...pageProps} />
        </Box>
      </Box>
    </ChakraProvider>
  );
}

export default MyApp;
