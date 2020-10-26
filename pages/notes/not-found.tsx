import React from "react";
import Flex from "../../components/Flex";
import Container from "../../components/Container";
import css from "@emotion/css";
import Title from "../../components/Title";

const NotFound = () => {
 return <Flex>
    <Container css={css`height: auto;`}>
      <Title> Note does not exist </Title>
      <p> The Note that you were looking for does not exist on our server. </p>
    </Container>
  </Flex>
}

export default NotFound;