import styled from "@emotion/styled";
import theme from "../theme";

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

export default Container;