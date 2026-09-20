import express from "express";
import cors from "cors";
import { validateRequestBody } from "./validate-schema";
import { SignInRequestSchema } from "./types/auth";
import { signInHandler } from "./handlers/auth";
import { CreateGoSpreadsheetRequestSchema } from "./types/go-spreadsheet";
import { createGoSpreadsheetHandler } from "./handlers/go-spreadsheet";
import {
  disconnectGoogle,
  finishGoogleAuthorization,
  getGoogleAuthorizationStatus,
  startGoogleAuthorization,
} from "./handlers/google-auth";

const app = express();
const PORT = 5000;

app.use(cors({
  origin: process.env.CLIENT_URL ?? "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Server is running");
});

app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from backend!" });
});

app.get(
  "/api/auth/google",
  startGoogleAuthorization
);

app.get(
  "/api/auth/google/callback",
  finishGoogleAuthorization
);

app.get(
  "/api/auth/google/status",
  getGoogleAuthorizationStatus
);

app.post(
  "/api/auth/google/disconnect",
  disconnectGoogle
);

app.post("/api/sign-in",
  validateRequestBody(SignInRequestSchema),
  signInHandler
);

app.post("/api/create-go-spreadsheet",
  validateRequestBody(CreateGoSpreadsheetRequestSchema),
  createGoSpreadsheetHandler
);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
