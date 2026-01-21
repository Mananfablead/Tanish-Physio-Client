// Define global for browser environment before importing any modules that depend on it
if (typeof window !== "undefined") {
  window.global = window;
}

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
