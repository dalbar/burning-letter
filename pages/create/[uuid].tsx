/**
 * This component is supposed to give the user a summary of his creation process
 **/
import * as React from "react";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { Box, Flex, Link, Text, Button, List, ListItem } from "@chakra-ui/core";
import AppContext from "../../context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

function CreatedNote(): JSX.Element {
  const router = useRouter();
  const { frontend } = React.useContext(AppContext);
  const { uuid } = router.query;

  const link = `${frontend}/notes/${uuid}`;

  return (
    <Flex h="100%" justify="center" align="center">
      <Box w="40rem" p="4" bg="gray.900" borderRadius="25px">
        <Text mb="5" fontSize="lg" color="gray.600">
          Your note was created
        </Text>
        <Flex mb="1">
          <Box borderRadius="5px" borderWidth="1px" py="1" px="3">
            <Text whiteSpace="nowrap"> {link} </Text>
          </Box>
          <Button
            ml="2"
            onClick={() => {
              navigator.clipboard.writeText(link);
            }}
          >
            <FontAwesomeIcon icon={faCopy} />
          </Button>
        </Flex>
        <Box p="4">
          <Text>Your note was created successfully. Remember:</Text>
          <List mt="3" styleType="disc" stylePosition="inside" spacing="1">
            <ListItem>Notes are deleted after they have been read </ListItem>
            <ListItem>Notes are deleted after specified expirery time</ListItem>
            <ListItem>Note are encrypted with your secret </ListItem>
            <ListItem>We do not store any secrets </ListItem>
          </List>
          <Flex whiteSpace="pre-wrap" mt="6">
            <Text>Click </Text>
            <Link as={NextLink} href="/create">
              <Text cursor="pointer" color="blue.200" fontWeight="bold">
                here
              </Text>
            </Link>
            <Text> to create an other note.</Text>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
}

export default CreatedNote;
