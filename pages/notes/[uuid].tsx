/**
 * This component is dealing with fetching, decrypting and presenting of notes
 **/
import * as React from "react";
import { useRouter } from "next/router";
import AppContext from "../../context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Flex from "../../components/Flex";
import Button from "../../components/Button";
import theme from "../../theme";
import Title from "../../components/Title";
import {
  faEye,
  faEyeSlash,
  faLock,
  faLockOpen,
} from "@fortawesome/free-solid-svg-icons";
import { css } from "@emotion/core";
import styled from "@emotion/styled";
import FormInput from "../../components/FormInput";
import TextArea from "../../components/TextArea";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${theme.colors.elevation.dp01};
  padding: ${theme.spacing[6]};
  width: 100%;
  max-width: 800px;
  max-height: 1000px;
  margin: 0 30px;

  color: ${theme.colors.onBackground};

  input {
    padding: ${theme.spacing[2]};
    border-width: 0px;
  }
`;

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

        if (res.status === 404) {
          return router.push("/notes/not-found");
        }

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

            const regex = /\\n/gm;
            const subst = `\r\n`;

            setNote(plaintext.replace(regex, subst));
          }
        } catch (e) {
          setFailedDecrypt(true);
        }
      }
    }

    if (uuid) fetchNote();
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
    <Flex>
      {!loading ? (
        <Container>
          <Title>Load and Decrypt the requested note</Title>
          <NoteComponent note={note} isDecrypted={isDecrypted} />
          {!isDecrypted && (
            <DecryptComponent
              failedDecrypt={failedDecrypt}
              handleSubmit={setSecret}
            />
          )}
        </Container>
      ) : (
        <Container
          css={css`
            height: auto;
          `}
        >
          Loading
        </Container>
      )}
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
    <div
      css={css`
        flex-grow: 1;
        display: flex;
        flex-direction: column;
      `}
    >
      <FormInput
        css={css`
          flex-grow: 1;
        `}
      >
        <label htmlFor="note">Note</label>
        <TextArea value={note || ""} readOnly id="note" />
      </FormInput>

      <div
        css={css`
          display: flex;
          flex-direction: row-reverse;
        `}
      >
        <div
          css={css`
            display: flex;
          `}
        >
          <p>status:</p>
          <div
            css={css`
              margin-left: 8px;
            `}
          >
            <FontAwesomeIcon
              color="#FFD700"
              icon={isDecrypted ? faLockOpen : faLock}
            />
          </div>
        </div>
      </div>
    </div>
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
    <FormInput>
      <label> Secret </label>
      <div
        css={css`
          display: flex;
        `}
      >
        <input
          css={(theme) => `
                      flex-grow: 1;
                      margin-right: 1rem;
                      color: ${theme.colors.onBackground};
                      background: ${theme.colors.elevation.dp02};

                    `}
          value={secret}
          onChange={(e) => {
            setSecret(e.target.value);
          }}
          type={hiddenSecret ? "password" : "text"}
          placeholder="Enter your encryption secret."
        />

        <Button onClick={() => setHiddenSecret(!hiddenSecret)}>
          <FontAwesomeIcon icon={hiddenSecret ? faEyeSlash : faEye} />
        </Button>
      </div>
      {failedDecrypt && (
        <p
          css={css`
            margin-top: 5px;
          `}
        >
          Error: decryption failed with the submitted secret
        </p>
      )}

      <div
        css={css`
          display: flex;
          flex-direction: row-reverse;
          margin-top: 2em;
        `}
      >
        <Button onClick={() => handleSubmit(secret)}>Decrypt</Button>
      </div>
    </FormInput>
  );
}
export default Note;
