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
