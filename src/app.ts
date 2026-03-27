import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { allowedORigin } from "./app/config";
import path from "path";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";

const app: Application = express();

// CORS config
app.use(
  cors({
    origin: allowedORigin,
    credentials: true,
  }),
);

// 🛡️ Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

// 📦 Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🪵 Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// 🏠 Health check route
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../public/index.html"));
});

// notFound middleware
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

export default app;
