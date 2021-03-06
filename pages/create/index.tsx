/**
 * CreateMessage loads a form for creating a message
 * It is a nextjs page and is mostly concerned with layout and submitting data
 **/
import * as React from "react";
import CreateNoteForm from "../../components/CreateNoteForm";
import AppContext from "../../context";
import { useRouter } from "next/router";
import Flex from "../../components/Flex";

function CreateMessage(): JSX.Element {
  const { backend } = React.useContext(AppContext);
  const router = useRouter();

  return (
    <Flex>
      <CreateNoteForm
        handleSubmit={async (values) => {
          const res = await fetch(`${backend}/notes`, {
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(values),
          });

          const { id } = await res.json();

          router.push(`create/${id}`);
        }}
      />
    </Flex>
  );
}

export default CreateMessage;
