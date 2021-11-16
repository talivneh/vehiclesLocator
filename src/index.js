import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import "tailwindcss/tailwind.css";
import { RecoilRoot } from "recoil";

ReactDOM.render(
  <RecoilRoot>
    <App />
  </RecoilRoot>,
  document.getElementById("root")
);
