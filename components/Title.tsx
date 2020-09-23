/**
 * Generic title component for fitting dark mode
 **/
import * as React from "react";
import { Text } from "@chakra-ui/core";

interface TitleProps {
  children: React.ReactChild;
}

function Title({ children }: TitleProps): JSX.Element {
  return (
    <Text mb="5" fontSize="lg" color="gray.600">
      {children}
    </Text>
  );
}

export default Title;
