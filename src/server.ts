import errorHandler from "@/common/middleware/errorHandler";
import { env } from "@/common/utils/envConfig";
import cors from "cors";
import express, { type Express } from "express";
import { pino } from "pino";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
//app.use(helmet());
//app.use(rateLimiter);

// Request logging
//app.use(requestLogger);

// Routes
//app.use("/health-check", healthCheckRouter);
//app.use("/users", userRouter);

// Swagger UI
//app.use(openAPIRouter);

app.use(express.static("www"));

// Error handlers
app.use(errorHandler());

export { app, logger };
