// auth.js
//
// This is Express AUTHENTICATION MIDDLEWARE: a function that runs
// in between the incoming request and the actual route handler,
// specifically for every route that requires a logged-in user.
//
//   Request
//     ↓
//   authUser middleware
//     ↓ read + verify the token
//     ↓ attach req.userId
//     ↓ call next()
//     ↓
//   protected route handler runs

import jwt from "jsonwebtoken";

export function authUser(req, res, next) {
  // Step 1: read the Authorization header.
  // Expected format:  "Bearer eyJhbGciOiJIUzI1NiIs..."
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header is required" });
  }

  // Step 2: extract just the token part.
  // "Bearer TOKEN".split(" ") -> ["Bearer", "TOKEN"], so index [1] is
  // the actual token string.
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  // Step 3: verify the token's signature and expiry.
  // jwt.verify() throws if the token was tampered with, signed with
  // a different secret, or has expired — so this must be wrapped in
  // a try/catch.
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 4: expose the logged-in user's id to everything downstream.
    // Every protected handler can now safely read req.userId to know
    // exactly who is making the request.
    req.userId = decoded.userId;

    // Step 5: hand control to the next function in the chain — the
    // actual route handler. Skipping this call would leave the
    // request hanging forever with no response ever sent.
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}