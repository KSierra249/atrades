import express from "express";
import cors from "cors";
import { validateRequestBody } from "./validate-schema";
import { SignInRequestSchema } from "./types/auth";
import { signInHandler } from "./handlers/auth";
import { CreateGoSpreadsheetRequestSchema } from "./types/go-spreadsheet";
import { createGoSpreadsheetHandler } from "./handlers/go-spreadsheet";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Server is running");
});

app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from backend!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.post("/api/sign-in",
  validateRequestBody(SignInRequestSchema),
  signInHandler
);

app.post("/api/create-go-spreadsheet",
  validateRequestBody(CreateGoSpreadsheetRequestSchema),
  createGoSpreadsheetHandler
);

