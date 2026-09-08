// register.js
//
// Handles: POST /api/register
// Job: create a brand-new user account from an email + password.
//
// The single most important rule in this file: the plain-text
// password the user typed is NEVER saved anywhere. Only a one-way
// hash of it is stored, so even a full database leak would not
// expose anyone's actual password.

import bcrypt from "bcryptjs";
import { users, ids } from "./store.js";

export async function registerUser(req, res) {
  // Step 1: pull email and password out of the JSON request body.
  const { email, password } = req.body;

  // Step 2: both fields are required. Fail fast with a clear message
  // if either one is missing, before doing any real work.
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required" });
  }

  // Step 3: refuse to register the same email twice.
  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  // Step 4: hash the password before storing it.
  // bcrypt.hash(password, 10) — the "10" is the cost factor: hashing
  // runs 2^10 rounds internally. Higher = more secure but slower to
  // compute. This is a one-way operation: there is no way to turn a
  // hash back into the original password.
  const passwordHash = await bcrypt.hash(password, 10);

  // Step 5: build the user record and save it.
  // Notice "password" never appears here — only "passwordHash".
  const user = {
    id: ids.nextUserId++,
    email: email,
    passwordHash: passwordHash,
  };
  users.push(user);

  // Step 6: 201 Created signals that a new resource (the user) now exists.
  res.status(201).json({ message: "User registered successfully" });
}