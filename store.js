// store.js
//
// This file is the "in-memory database" for the whole app.
// Instead of MongoDB or MySQL, data lives in plain JavaScript arrays.
// That keeps the project simple, but it also means:
//   - all data disappears when the server process restarts
//   - it is NOT safe for production use, only for learning
//
// Every other file imports these three exports to read/write data.

// Holds every registered user: { id, email, passwordHash }
export const users = [];

// Holds every student record: { id, name, rollNo, course, ownerId }
export const students = [];

// Auto-incrementing id counters.
// Kept inside one object (rather than two separate variables) so that
// other files can import a single reference and mutate it safely.
// Two separate counters (user ids vs. student ids) mean the two id
// spaces never collide with each other.
export const ids = {
  nextUserId: 1,
  nextStudentId: 1,
};