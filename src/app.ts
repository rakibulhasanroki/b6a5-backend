import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { allowedORigin } from "./app/config";
import path from "path";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { Routes } from "./app/routes";
import { startEventStatusCron } from "./app/corn/eventStatus.corn";
import { PaymentController } from "./app/module/payment/payment.controller";

const app: Application = express();

// payment
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhookEvent,
);

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

// Api routes
app.use("/api/v1", Routes);

// corn
startEventStatusCron();

// notFound middleware
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

export default app;
