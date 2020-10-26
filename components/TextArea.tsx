import { css } from "@emotion/core";
import * as React from "react";
import FormInput from "./FormInput";
import styled from "@emotion/styled";
import theme from "../theme";

const TextArea = styled.textarea`
  padding: ${theme.spacing[2]};
  color: ${theme.colors.onBackground};
  width: 100%;
  height: 100%;

  background: ${theme.colors.elevation.dp02};

  border: none;
  overflow: auto;
  outline: none;

  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
`;

export default TextArea;
