import * as React from "react";
import { Flex } from "@chakra-ui/core";
import CreateNoteForm from "../components/CreateNoteForm";

function CreateMessage(): JSX.Element {
  return (
    <Flex justify="center" align="center">
      <CreateNoteForm
        handleSubmit={async (values) => {
          console.log(values);
          await fetch("api/create", {
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(values),
          });
        }}
      />
    </Flex>
  );
}

export default CreateMessage;
