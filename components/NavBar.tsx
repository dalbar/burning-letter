/**
 * Top bar for navigtion
 **/
import React from "react";
import { Box, Link, Heading, Flex, Text } from "@chakra-ui/core";
import NextLink from "next/link";
import { useRouter } from "next/router";

const MenuItem = ({ children }: { children: React.ReactNode }) => (
  <Box mt={{ base: 4, md: 0 }} mr={6} display="block" cursor="pointer">
    {children}
  </Box>
);

function Header(): JSX.Element {
  const router = useRouter();

  function isActive(route: string): boolean {
    return router.pathname === route;
  }

  function itemColor(isActive: boolean): string {
    return isActive ? "white" : "gray.400";
  }

  return (
    <Flex
      as="nav"
      align="center"
      wrap="wrap"
      padding="1.5rem"
      bg="gray.900"
      color="white"
      justify="space-between"
      position="absolute"
      boxSizing="border-box"
      w="100%"
      left="0"
      top="0"
    >
      <Flex align="center" mr={5}>
        <Link href="/">
          <Heading cursor="pointer" size="md">
            BurningLetter
          </Heading>
        </Link>
      </Flex>

      <Flex align="center">
        <MenuItem>
          <Link as={NextLink} href="/">
            <Text color={itemColor(isActive("/"))}> Home </Text>
          </Link>
        </MenuItem>
        <MenuItem>
          <Link as={NextLink} href="/create">
            <Text color={itemColor(isActive("/create"))}> Create </Text>
          </Link>
        </MenuItem>
      </Flex>
    </Flex>
  );
}

export default Header;
