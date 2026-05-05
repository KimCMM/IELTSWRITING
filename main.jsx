import React from "react";
import { createRoot } from "react-dom/client";
import IELTSProcessTrainerFullSystem from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <IELTSProcessTrainerFullSystem />
  </React.StrictMode>
);
