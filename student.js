// student.js
//
// The four CRUD operations for student records. Every single one of
// them enforces the same rule: a student record belongs to whoever
// created it (its "ownerId"), and only that user may read, change,
// or delete it. This is the app's entire authorization model.

import { students, ids } from "./store.js";

// GET /api/students -> list only the records owned by the caller
export function getStudents(req, res) {
  // req.userId was set earlier by the authUser middleware, so by the
  // time this handler runs we already know who is asking.
  const myStudents = students.filter(
    (student) => student.ownerId === req.userId
  );
  res.json(myStudents);
}

// POST /api/students -> create a new student owned by the caller
export function addStudent(req, res) {
  const { name, rollNo, course } = req.body;

  if (!name || !rollNo || !course) {
    return res.status(400).json({ message: "Name, rollNo and course are required" });
  }

  const student = {
    id: ids.nextStudentId++,
    name: name,
    rollNo: rollNo,
    course: course,
    ownerId: req.userId, // stamped with the logged-in user's id
  };
  students.push(student);

  res.status(201).json(student);
}

// PUT /api/students/:id -> update one of the caller's own students
export function updateStudent(req, res) {
  // req.params.id is the :id segment from the URL. Route params are
  // always strings, so convert to a number before comparing ids.
  const requestedId = Number(req.params.id);

  // The ownership rule: both the id AND the ownerId must match.
  // Without the ownerId check, any logged-in user could edit any
  // student just by guessing an id.
  const student = students.find(
    (student) => student.id === requestedId && student.ownerId === req.userId
  );

  if (!student) {
    // Deliberately the same 404 whether the id doesn't exist at all
    // or it belongs to someone else — this avoids leaking which ids
    // exist for other users.
    return res.status(404).json({ message: "Student not found" });
  }

  // Only overwrite fields that were actually sent, so a partial
  // update (e.g. only { course }) doesn't wipe out the other fields.
  const { name, rollNo, course } = req.body;

  if (name) student.name = name;
  if (rollNo) student.rollNo = rollNo;
  if (course) student.course = course;

  res.json(student);
}

// DELETE /api/students/:id -> remove one of the caller's own students
export function deleteStudent(req, res) {
  const requestedId = Number(req.params.id);

  // findIndex applies the same ownership rule, but returns a numeric
  // position (or -1) instead of the object itself, since splice()
  // needs a position to remove from.
  const studentIndex = students.findIndex(
    (student) => student.id === requestedId && student.ownerId === req.userId
  );

  if (studentIndex === -1) {
    return res.status(404).json({ message: "Student not found" });
  }

  // splice(index, 1) removes exactly one element at that position,
  // mutating the array in place.
  students.splice(studentIndex, 1);

  res.json({ message: "Student deleted successfully" });
}