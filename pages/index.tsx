/**
 * Landing/Start page of application
 **/
import Head from "next/head";
import * as React from "react";
import Flex from "../components/Flex";
import Container from "../components/Container";
import css from "@emotion/css";
import Title from "../components/Title";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import { useRouter } from "next/router";

export default function Home(): JSX.Element {
  const [value, setValue ] = React.useState("");
  const router = useRouter()
  return (
    <Flex>
      <Container css={css`height: auto;`}>
        <Title> Find a Note to Decrypt </Title>
        <div css={css`height: 100%; margin-top: 10px;`}>
          <FormInput>
            <label htmlFor="secret">
              Note Id
            </label>
            <div
              css={css`
                    display: flex;
                    justify-content: space-between;
                  `}
            >
              <input
                type="text"
                placeholder="enter id here"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                css={(theme) => `
                      flex-grow: 1;
                      margin-right: 1rem;
                      color: ${theme.colors.onBackground};
                      background: ${theme.colors.elevation.dp02};

                    `}
              />
            </div>
          </FormInput>
          <div css={css`
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
`}>
            <Button onClick={() => router.push(`notes/${value}`)} disabled={value === ""}> Open </Button>
          </div>
        </div>
      </Container>
    </Flex>
  );
}
