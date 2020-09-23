/**
 * This component is dealing with fetching, decrypting and presenting of notes
 **/
import * as React from "react";
import { useRouter } from "next/router";
import AppContext from "../../context";
import {
  Box,
  Input,
  Flex,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  Text,
} from "@chakra-ui/core";
import Title from "../../components/Title";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faLock,
  faLockOpen,
} from "@fortawesome/free-solid-svg-icons";

/**
 * Note needs to keep track of multiple states and reflect them in the UI
 * 1. loading = true
 * - the note is being fetched initially
 * - Note has to indicate that this process is going on
 * 2. loading = false && secret = null
 * - note is loaded
 * - user has not provided a decryption key yet
 * - present user with form to receive secret
 * 3. loading = false && secret != null && failedDecrypt = true && isDecrypted = false
 * - user entered an invalid secret
 * - reset secret and present 2
 * - indicate that secret is invalid
 * 4. loading = true && secret != null && failedDecrypt = false && isDecrypted = true
 * - message has been decrypted with success
 * - present decryped message
 *
 * You might wonder why there is failedDecrypt and isDecrypted as they seem to be the negation of the other one
 * - this is not true, because isDecrypted = false does not equal failedDecrypt = true
 * - reason:
 *   - if the user does not submit a secret then the decryption is not done so isDecrypted = false
 *   - but decryption also did not fail because it was not attempted in the first place, hence failedDecrypt = false
 **/
function Note(): JSX.Element {
  const [loading, setLoading] = React.useState(true);
  const [note, setNote] = React.useState(null);
  const [secret, setSecret] = React.useState(null);
  const [failedDecrypt, setFailedDecrypt] = React.useState(false);
  const [isDecrypted, setIsDecrypted] = React.useState(false);
  const { backend } = React.useContext(AppContext);

  const router = useRouter();
  const { uuid } = router.query;

  React.useEffect(() => {
    async function fetchNote() {
      if (loading) {
        const res = await fetch(`${backend}/notes/${uuid}`);
        const note = await res.text();
        setLoading(false);
        setNote(note);
      } else if (secret && !isDecrypted) {
        try {
          const resp = await fetch(
            `${backend}/decrypt?message=${note}&secret=${secret}`
          );

          if (resp.status != 200) {
            setFailedDecrypt(true);
          } else {
            const plaintext = await resp.text();

            setIsDecrypted(true);
            setNote(plaintext);
          }
        } catch (e) {
          setFailedDecrypt(true);
        }
      }
    }
    fetchNote();
  }, [
    note,
    isDecrypted,
    setIsDecrypted,
    setFailedDecrypt,
    setNote,
    loading,
    setLoading,
    uuid,
    secret,
  ]);

  return (
    <Flex h="100%" align="center" justify="center">
      <Box boxShadow="sm" w="30rem" p="4" bg="gray.900" borderRadius="25px">
        {!loading ? (
          <Box>
            <Title>Load and Decrypt the requested note</Title>
            <NoteComponent note={note} isDecrypted={isDecrypted} />
            {!isDecrypted && (
              <DecryptComponent
                failedDecrypt={failedDecrypt}
                handleSubmit={setSecret}
              />
            )}
          </Box>
        ) : (
          <div> Loading </div>
        )}
      </Box>
    </Flex>
  );
}

/**
 * NoteComponent is rendering the given note and indicates whether it is plaintext or cipher
 **/
function NoteComponent({
  isDecrypted,
  note,
}: {
  isDecrypted: boolean;
  note: string;
}): JSX.Element {
  return (
    <Box>
      <FormLabel> Note </FormLabel>
      <Textarea
        value={note}
        readOnly
        id="note"
        placeholder="Start writing your burning letter here."
        h="400px"
        resize="vertical"
      />
      <Flex my="3" pr="2" direction="row-reverse">
        <Flex align="center">
          <Text color="gray.500" fontWeight="bold" mr="2">
            status:
          </Text>
          <Box fontSize="12px" w="12px">
            <FontAwesomeIcon
              color="#FFD700"
              icon={isDecrypted ? faLockOpen : faLock}
            />
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}

/**
 * DecryptComponent is a form for the entering the decryption key
 * props:
 * - handleSubmit: callback function that will be provided with the secret
 * - failedDecrypt: indicates if previous decryption was successful
 **/
function DecryptComponent({
  handleSubmit,
  failedDecrypt,
}: {
  handleSubmit: (sec: string) => void;
  failedDecrypt: boolean;
}): JSX.Element {
  const [hiddenSecret, setHiddenSecret] = React.useState(true);
  const [secret, setSecret] = React.useState("");
  return (
    <Box>
      <FormControl>
        <FormLabel> Secret </FormLabel>

        <Flex>
          <Input
            value={secret}
            onChange={(e) => {
              setSecret(e.target.value);
            }}
            type={hiddenSecret ? "password" : "text"}
            placeholder="Enter your encryption secret."
          />

          <Flex ml="3" fontSize={12}>
            <Button
              variant="outline"
              p="2"
              onClick={() => setHiddenSecret(!hiddenSecret)}
            >
              <FontAwesomeIcon
                size="sm"
                icon={hiddenSecret ? faEyeSlash : faEye}
              />
            </Button>
          </Flex>
        </Flex>
        {failedDecrypt && (
          <Text mt="4" ml="1" color="red.400">
            Error: decryption failed with the submitted secret
          </Text>
        )}
      </FormControl>

      <Flex direction="row-reverse" mt="6">
        <Button onClick={() => handleSubmit(secret)}>Decrypt</Button>
      </Flex>
    </Box>
  );
}
export default Note;
