import React from "react";
import ReactDOM from "react-dom/client";

import { QueryProvider } from "@/app/providers/QueryProvider";
import { RouterProvider } from "@/app/providers/RouterProvider";

import "./index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <QueryProvider>
      <RouterProvider />
    </QueryProvider>
  </React.StrictMode>
);
