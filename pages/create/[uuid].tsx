/**
 * This component is supposed to give the user a summary of his creation process
 **/
import * as React from "react";
import { useRouter } from "next/router";
import { css } from "@emotion/core";
import styled from "@emotion/styled";
import NextLink from "next/link";
import AppContext from "../../context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import Flex from "../../components/Flex";
import Button from "../../components/Button";
import theme from "../../theme";
import Title from "../../components/Title";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${theme.colors.elevation.dp01};
  padding: ${theme.spacing[6]};

  width: 100%;
  max-width: 800px;
  max-height: 400px;
  margin: 0 30px;

  color: ${theme.colors.onBackground};
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

function CreatedNote(): JSX.Element {
  const router = useRouter();
  const { frontend } = React.useContext(AppContext);
  const { uuid } = router.query;

  const link = `${frontend}/notes/${uuid}`;

  return (
    <Flex>
      <Container>
        <Title>Your note was created</Title>
        <Content>
          <div
            css={css`
              display: flex;
              justify-content: space-between;
            `}
          >
            <input
              readOnly={true}
              css={(theme) => `
              flex-grow: 1;
              margin-right: 1rem;
              color: ${theme.colors.onBackground};
              background: ${theme.colors.elevation.dp02};
              padding: ${theme.spacing[2]};
              whitespace: nowrap;
              border-width: 0px;
            `}
              value={link}
            />
            <Button
              css={css`
                height: 100%;
              `}
              onClick={() => {
                return navigator.clipboard.writeText(link);
              }}
            >
              <FontAwesomeIcon icon={faCopy} />
            </Button>
          </div>
          <div
            css={css`
              flex-grow: 1;
              padding: 1rem 0rem;
              flex-grow: 1;
              height: 100%;
            `}
          >
            <div>Your note was created successfully. Remember:</div>
            <ul
              css={css`
                padding-left: 15px;
                font-size: 1rem;
              `}
            >
              <li>Notes are deleted after they have been read</li>
              <li>Notes are deleted after specified expiry time</li>
              <li>Note are encrypted with your secret</li>
              <li>We do not store any secrets</li>
            </ul>
          </div>
          <div>
            <p>
              Click <NextLink href="/create">here</NextLink> to create an other
              note.
            </p>
          </div>
        </Content>
      </Container>
    </Flex>
  );
}

export default CreatedNote;
