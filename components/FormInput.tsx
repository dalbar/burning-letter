import styled from "@emotion/styled";
import theme from "../theme";

const FormInput = styled.div`
  margin-bottom: ${theme.spacing[6]};
  overflow: hidden;
  label {
    display: block;
    margin-bottom: ${theme.spacing[2]};
  }
`;

export default FormInput;
