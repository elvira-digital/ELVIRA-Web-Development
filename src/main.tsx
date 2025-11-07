import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/react-query";
import { loadGoogleMapsAPI } from "./lib/googleMapsLoader";
import "./index.css";
import App from "./App.tsx";

// Load Google Maps API
loadGoogleMapsAPI().catch((error) => {
  console.warn("Google Maps API failed to load:", error);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  </StrictMode>
);
