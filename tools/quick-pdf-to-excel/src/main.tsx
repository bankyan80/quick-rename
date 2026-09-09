import React from "react";
import ReactDOM from "react-dom/client";
import "./shared/design.css";
import App from "./App";
import { buildApp } from "./config/app";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App config={buildApp()} />
  </React.StrictMode>,
);