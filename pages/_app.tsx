/**
 * Set general app layout and custom providers here
 * Every page will be loaded as specified in this component
 **/
import * as React from "react";
import { css, Global } from "@emotion/core";
import { AppProps } from "next/app";
import Header from "../components/NavBar";
import { ThemeProvider } from "emotion-theming";
import theme from "../theme";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <ThemeProvider theme={theme}>
      <Global
        styles={css`
          height: 100%;
          body {
            margin: 0;
            padding: 0;
            background: ${theme.colors.background};
            width: 100%;
            height: 100vh;

            font-family: "Karla", sans-serif;

            input,
            select,
            textarea {
              font: 400 15px Karla;
              font-family: "Karla", sans-serif;
            }

            .heading,
            h1,
            h2,
            .title,
            .logo,
            h3 {
              font-family: "Rubik", sans-serif;

              color: ${theme.colors.onBackground};
            }
            a {
              text-decoration: none;
              color: ${theme.colors.secondary};
            }
          }

          p,
          label {
            color: ${theme.colors.onBackground};
            font-weight: 500;
            padding: 0;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          #__next {
            height: 100%;
          }
        `}
      />
      <div
        css={css`
          height: 100%;
          display: grid;
          grid-template-rows: 80px auto 60px;
          grid-template-columns: auto;
          grid-gap: 1rem;
          grid-template-areas:
            "nav"
            "main"
            "footer";
        `}
      >
        <div className="nav">
          <Header />
        </div>
        <div className="main">
          <Component className="page" {...pageProps} />
        </div>
        <div
  css={(theme) => `background: ${theme.colors.elevation.dp01}`}
  className="footer"
  />
      </div>
    </ThemeProvider>
  );
}

export default MyApp;
