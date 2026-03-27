import app from "./app";
import { envVars } from "./app/config/env";
import { prisma } from "./app/lib/prisma";

const port = envVars.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log(" Database connected");

    app.listen(port, () => {
      console.log(` Server running on port ${port}`);
    });
  } catch (error) {
    console.error(" Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

// For graceful shutdown
process.on("SIGINT", async () => {
  console.log("SIGINT received. Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});
