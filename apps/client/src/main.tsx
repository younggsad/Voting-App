import React from "react";
import ReactDOM from "react-dom/client";

import { QueryProvider } from "@/app/providers/QueryProvider";
import { RouterProvider } from "@/app/providers/RouterProvider";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <RouterProvider />
    </QueryProvider>
  </React.StrictMode>
);
