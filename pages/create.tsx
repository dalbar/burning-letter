import * as React from "react";
import { Flex } from "@chakra-ui/core";
import CreateNoteForm from "../components/CreateNoteForm";

function CreateMessage(): JSX.Element {
  return (
    <Flex justify="center" align="center">
      <CreateNoteForm
        handleSubmit={(values) =>
          new Promise((res) => {
            console.log(values);
            res();
          })
        }
      />
    </Flex>
  );
}

export default CreateMessage;
