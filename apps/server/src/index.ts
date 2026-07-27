import { app } from "@/app";

const PORT = process.env.PORT ?? 4000;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("Server failed to start:", error);
});
