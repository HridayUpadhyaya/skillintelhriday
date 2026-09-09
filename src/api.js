import { supabase } from './supabaseClient'

export async function fetchLabourData() {
  const { data, error } = await supabase
    .from('job_postings')
    .select(`
      *,
      job_skills (
        skills (
          name
        )
      )
    `)

  if (error) throw error

  return data.map((job) => ({
    id: job.id,
    role: job.role,
    sector: job.sector,
    demand: job.demand,
    currentCapacity: job.current_capacity,
    growth: job.growth,
    employerValidation: job.employer_validation,
    placementRate: job.placement_rate,
    skills: (job.job_skills || [])
      .map((item) => item.skills?.name)
      .filter(Boolean)
  }))
}

export async function fetchCourseData() {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      course_skills (
        skill_type,
        skills (
          name
        )
      )
    `)

  if (error) throw error

  return data.map((course) => {
    const skillRows = course.course_skills || []

    return {
      id: course.id,
      name: course.name,
      role: course.role,
      currentSkills: skillRows
        .filter((item) => item.skill_type === 'current')
        .map((item) => item.skills?.name)
        .filter(Boolean),
      industrySkills: skillRows
        .filter((item) => item.skill_type === 'industry')
        .map((item) => item.skills?.name)
        .filter(Boolean)
    }
  })
}

export async function fetchEmployerData() {
  const { data, error } = await supabase
    .from('employers')
    .select(`
      *,
      districts (
        name
      ),
      employer_skills (
        skills (
          name
        )
      )
    `)

  if (error) throw error

  return data.map((employer) => ({
    id: employer.id,
    company: employer.company,
    sector: employer.sector,
    district: employer.districts?.name || '',
    hiring: employer.hiring,
    satisfaction: employer.satisfaction,
    skills: (employer.employer_skills || [])
      .map((item) => item.skills?.name)
      .filter(Boolean)
  }))
}