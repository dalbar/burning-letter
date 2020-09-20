import * as React from "react";
import { useRouter } from "next/router";

function Note(): JSX.Element {
  const router = useRouter();
  const { uuid } = router.query;
  return <div>{uuid}</div>;
}

export default Note;
