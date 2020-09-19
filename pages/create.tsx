import * as React from "react";
import CreateNoteForm from "../components/MessageBox";

function CreateMessage(): JSX.Element {
  return (
    <CreateNoteForm
      handleSubmit={(values) =>
        new Promise((res) => {
          console.log(values);
          res();
        })
      }
    />
  );
}

export default CreateMessage;
