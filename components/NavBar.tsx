/**
 * Top bar for navigtion
 **/
import React from "react";
import NextLink from "next/link";
import { css } from "@emotion/core";
import { useRouter } from "next/router";
import Logo from "./Logo";

const MenuItem = ({ children }: { children: React.ReactNode }) => (
  <div
    css={(theme) => css`
      margin-right: ${theme.spacing[4]};
      cursor: pointer;
      color: ${theme.colors.onBackground};
      align-content: center;
    `}
  >
    {children}
  </div>
);

function Header(): JSX.Element {
  const router = useRouter();

  return (
    <nav
      css={(theme) => `
        justify-content: space-between;
        display: flex;
        align-content: center;
        color: white;
        position: fixed;
        background: ${theme.colors.elevation.dp01};
        overflow: hidden;
        width: 100%;
        height: 80px;
        padding: 0 ${theme.spacing[4]};
        font-size: 1.3rem;
        top: 0;
        a:link {
          text-decoration: none;
        }

        a:visited {
          text-decoration: none;

      color: ${theme.colors.onBackground}
        }

        a:hover {
          text-decoration: underline;
        }

        a:active {
          text-decoration: underline;
        }
      `}
    >
      <Logo />

      <div
        css={css`
          display: flex;
          flex-direction: row-reverse;
          flex-grow: 1;
          align-items: center;
        `}
      >
        <MenuItem>
          <NextLink href="/create">Create</NextLink>
        </MenuItem>
        <MenuItem>
          <NextLink href="/">Decrypt</NextLink>
        </MenuItem>
      </div>
    </nav>
  );
}

export default Header;
