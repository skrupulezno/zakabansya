import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import boardRoutes from "./routes/boards.js";
import columnRoutes from "./routes/columns.js";
import cardRoutes from "./routes/cards.js";
import userRoutes from "./routes/users.js";

import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

dotenv.config();

const swaggerDocument = YAML.load("swagger.yaml");

const app = express();
const httpServer = createServer(app);

const allowedOrigins = ["http://localhost:5173", "http://192.145.29.87"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  },
});

app.set("io", io);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/columns", columnRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/users", userRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

io.on("connection", (socket) => {
  console.log("WebSocket connected:", socket.id);
  socket.on("disconnect", () => console.log("WS disconnected:", socket.id));
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`API running on :${PORT}`));
