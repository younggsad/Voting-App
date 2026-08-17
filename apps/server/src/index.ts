import { app } from "@/app";
import { prisma } from "@/lib/prisma";

const PORT = Number(process.env.PORT) || 4000;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("Server failed to start:", error);
  process.exitCode = 1;
});

const shutdown = async (signal: string) => {
  console.log(`${signal} received. Shutting down server...`);

  server.close(async (error) => {
    if (error) {
      console.error("Failed to close HTTP server:", error);
      process.exitCode = 1;
    }

    await prisma.$disconnect();

    console.log("Server shut down successfully");
  });
};

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
