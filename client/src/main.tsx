import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import "./index.css";

import App from "./App";
import { queryClient } from "@/lib/queryClient";
import { store } from "@/store/store";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={3000}
          />
        </QueryClientProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
);
