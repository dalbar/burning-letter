import * as React from "react";
import { css } from "@emotion/core";

function Logo(): JSX.Element {
  return (
    <div
      className="logo"
      css={(theme) => css`
        font-weight: bold;
        color: ${theme.colors.onBackground};
        font-size: 1.3rem;
        display: flex;
        align-items: center;
      `}
    >
      BurningLetter
    </div>
  );
}

export default Logo;
