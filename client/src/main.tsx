
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  const root = createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  console.error("APP CRASH:", error);
  // Fallback UI in case of crash
  rootElement.innerHTML = `
    <div style="padding: 20px; color: red; font-family: sans-serif;">
      <h1>Application Error</h1>
      <pre>${error instanceof Error ? error.message : String(error)}</pre>
      <p>Check the console for more details.</p>
    </div>
  `;
}
