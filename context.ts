/**
 * Place static values here
 * currently used for network config
 **/
import * as React from "react";

const backend = process.env.API || "http://localhost:8080";
const frontend = process.env.WEB || "http://localhost:3000";

const AppContext = React.createContext({
  backend,
  frontend,
});

export default AppContext;
