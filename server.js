// server.js
//
// The application's entry point. This file wires everything together:
// it creates the Express app, applies global middleware, and declares
// every single route the API exposes.

import dotenv from "dotenv";
dotenv.config(); // must run before anything that reads process.env

import express from "express";

import { registerUser } from "./register.js";
import { loginUser } from "./login.js";
import { authUser } from "./auth.js";
import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from "./student.js";

const app = express();

// Parses incoming JSON request bodies into req.body.
// Without this line, req.body would always be undefined.
app.use(express.json());

// CORS (Cross-Origin Resource Sharing) middleware.
// Browsers block a page from calling an API on a different
// origin (domain/port/protocol) unless the server explicitly opts
// in via these headers. This runs on EVERY request, before any route.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  // Browsers automatically send an OPTIONS "preflight" request before
  // PUT/DELETE calls, to ask permission first. Respond immediately so
  // the browser then sends the real request.
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// ---------- PUBLIC ROUTES (no token required) ----------

// A simple health check — confirms the server process is running.
app.get("/", (req, res) => {
  res.json({ message: "Secure Student Records API is running" });
});

// Create a new account.
app.post("/api/register", registerUser);

// Exchange credentials for a JWT token.
app.post("/api/login", loginUser);

// ---------- PROTECTED ROUTES (token required) ----------
// Notice authUser is listed BEFORE the actual handler in every one
// of these. Express runs middleware left to right, so the token is
// always verified first; the handler only runs if next() was called.

app.get("/api/students", authUser, getStudents);
app.post("/api/students", authUser, addStudent);
app.put("/api/students/:id", authUser, updateStudent);
app.delete("/api/students/:id", authUser, deleteStudent);

// ---------- START THE SERVER ----------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});