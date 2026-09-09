// ── API layer ───────────────────────────────────────────────────────
// Bug 2 fix: this module was missing entirely; App.jsx imports from it.
// Wraps the static data in async functions so the existing useEffect /
// Promise.all loading pattern works unchanged.  When a real backend is
// available, swap these implementations for actual fetch() calls.
import { labourData, courseData, employerData } from './data'
export async function fetchLabourData() {
  return labourData
}
export async function fetchCourseData() {
  return courseData
}
export async function fetchEmployerData() {
  return employerData
}
