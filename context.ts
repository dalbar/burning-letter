/**
 * Place static values here
 * currently used for network config
 **/
import * as React from "react";

const backend = "http://localhost:8080";
const frontend = "http://localhost:3000";

const AppContext = React.createContext({
  backend,
  frontend,
});

export default AppContext;
