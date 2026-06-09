import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { initClarity } from "./lib/clarity.ts";
import { initPosthog } from "./lib/posthog.ts";

initClarity(import.meta.env.VITE_CLARITY_PROJECT_ID);
initPosthog();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
