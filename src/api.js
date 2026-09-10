import { supabase } from './supabaseClient.js'

/* ==========================================================================
   SkillIntel Data Layer & Backend API Module
   ========================================================================== */

// Regional district demand and capacity breakdown for Maharashtra.
// Sum of Pune + Mumbai + Nashik + Nagpur equals the statewide total!
export const DISTRICT_BREAKDOWN = {
  "EV Technician": {
    "Pune": { demand: 380, currentCapacity: 140 },
    "Mumbai": { demand: 250, currentCapacity: 90 },
    "Nashik": { demand: 120, currentCapacity: 50 },
    "Nagpur": { demand: 100, currentCapacity: 40 }
  },
  "Battery Technician": {
    "Pune": { demand: 280, currentCapacity: 130 },
    "Mumbai": { demand: 160, currentCapacity: 70 },
    "Nashik": { demand: 110, currentCapacity: 50 },
    "Nagpur": { demand: 70, currentCapacity: 30 }
  },
  "Solar Technician": {
    "Pune": { demand: 150, currentCapacity: 60 },
    "Mumbai": { demand: 110, currentCapacity: 40 },
    "Nashik": { demand: 130, currentCapacity: 50 },
    "Nagpur": { demand: 150, currentCapacity: 60 }
  },
  "CNC Automation Operator": {
    "Pune": { demand: 290, currentCapacity: 270 },
    "Mumbai": { demand: 110, currentCapacity: 100 },
    "Nashik": { demand: 220, currentCapacity: 210 },
    "Nagpur": { demand: 100, currentCapacity: 100 }
  },
  "Data Analyst": {
    "Pune": { demand: 390, currentCapacity: 230 },
    "Mumbai": { demand: 380, currentCapacity: 220 },
    "Nashik": { demand: 70, currentCapacity: 45 },
    "Nagpur": { demand: 70, currentCapacity: 45 }
  },
  "Data Entry Operator": {
    "Pune": { demand: 100, currentCapacity: 400 },
    "Mumbai": { demand: 110, currentCapacity: 450 },
    "Nashik": { demand: 45, currentCapacity: 180 },
    "Nagpur": { demand: 45, currentCapacity: 170 }
  }
}

/**
 * Returns localized demand and training capacity for a given job and district.
 */
export function getJobForDistrict(job, district) {
  if (!job) return job
  if (!district || district === 'All Districts') return job
  const breakdown = DISTRICT_BREAKDOWN[job.role]?.[district]
  if (!breakdown) return job
  return {
    ...job,
    demand: breakdown.demand,
    currentCapacity: breakdown.currentCapacity
  }
}

/**
 * Calculates the demand intelligence score (0 - 100) for an occupation.
 */
export function calculateDemandScore(job) {
  if (!job) return 0

  const demand = Number(job.demand) || 0
  const currentCapacity = Number(job.currentCapacity ?? job.current_capacity) || 0
  const growth = Number(job.growth) || 0
  const employerValidation = Number(job.employerValidation ?? job.employer_validation) || 0
  const placementRate = Number(job.placementRate ?? job.placement_rate) || 0

  // 50% growth or more = maximum growth score
  const growthScore = Math.min(Math.max(growth * 2, 0), 100)

  // Calculate training supply pressure safely (avoid division by zero)
  let supplyScore = 0
  if (demand > 0) {
    const supplyGap = (demand - currentCapacity) / demand
    supplyScore = Math.min(Math.max(supplyGap * 100, 0), 100)
  }

  const score =
    (demand / 1000) * 30 +
    growthScore * 0.20 +
    employerValidation * 0.20 +
    placementRate * 0.20 +
    supplyScore * 0.10

  if (isNaN(score)) return 0
  return Math.round(Math.max(0, Math.min(score, 100)))
}

/* ==========================================================================
   Default / Fallback Datasets
   ========================================================================== */

export const labourData = [
  {
    id: "5cfa5340-94c0-4bc4-881c-48967bb94e7e",
    role: "EV Technician",
    sector: "Automotive",
    demand: 850,
    currentCapacity: 320,
    growth: 42,
    employerValidation: 91,
    placementRate: 88,
    skills: [
      "Battery Diagnostics",
      "EV Electrical Systems",
      "BMS",
      "High Voltage Safety"
    ]
  },
  {
    id: "06e280e2-ffa3-4f93-84f0-66caf39d080f",
    role: "Battery Technician",
    sector: "Automotive / Energy",
    demand: 620,
    currentCapacity: 280,
    growth: 38,
    employerValidation: 88,
    placementRate: 84,
    skills: [
      "Battery Diagnostics",
      "Battery Management Systems",
      "Cell Testing",
      "Thermal Management"
    ]
  },
  {
    id: "99487563-d058-454b-a573-9b1b2e2f7d1f",
    role: "Solar Technician",
    sector: "Renewable Energy",
    demand: 540,
    currentCapacity: 210,
    growth: 35,
    employerValidation: 85,
    placementRate: 81,
    skills: [
      "Solar Installation",
      "Electrical Safety",
      "Solar PV",
      "Inverter Maintenance"
    ]
  },
  {
    id: "27c0d740-e6a4-43d6-997c-8a9fc292877b",
    role: "CNC Automation Operator",
    sector: "Manufacturing",
    demand: 720,
    currentCapacity: 680,
    growth: 18,
    employerValidation: 79,
    placementRate: 76,
    skills: [
      "CNC Programming",
      "Automation",
      "Robotics",
      "Precision Measurement"
    ]
  },
  {
    id: "a371908c-7bc0-4a7f-9d62-9572c6686eeb",
    role: "Data Analyst",
    sector: "Information Technology",
    demand: 910,
    currentCapacity: 540,
    growth: 31,
    employerValidation: 86,
    placementRate: 82,
    skills: [
      "Data Analytics",
      "Python",
      "SQL",
      "Data Visualization"
    ]
  },
  {
    id: "906c2f07-89be-44f4-9a2b-ac9ac987162f",
    role: "Data Entry Operator",
    sector: "Business Services",
    demand: 300,
    currentCapacity: 1200,
    growth: -14,
    employerValidation: 42,
    placementRate: 39,
    skills: [
      "Typing",
      "Data Processing",
      "Office Software"
    ]
  }
]

export const courseData = [
  {
    id: "7e4f96e9-7ab9-4c63-847e-5adc4c2e6af0",
    name: "EV Technician",
    role: "EV Technician",
    currentSkills: [
      "Battery Diagnostics",
      "BMS",
      "Basic Electrical Systems"
    ],
    industrySkills: [
      "Battery Diagnostics",
      "EV Electrical Systems",
      "BMS",
      "High Voltage Safety",
      "CAN Bus Diagnostics"
    ]
  },
  {
    id: "25720305-8d48-439a-a1a9-1b0eb4b4b97f",
    name: "Solar Technician",
    role: "Solar Technician",
    currentSkills: [
      "Solar Installation",
      "Basic Electrical Systems"
    ],
    industrySkills: [
      "Solar Installation",
      "Electrical Safety",
      "Solar PV",
      "Inverter Maintenance"
    ]
  },
  {
    id: "bb74c9b7-8570-4b3e-b012-c977e67f4464",
    name: "CNC Automation Operator",
    role: "CNC Automation Operator",
    currentSkills: [
      "CNC Programming",
      "Precision Measurement"
    ],
    industrySkills: [
      "CNC Programming",
      "Automation",
      "Robotics",
      "Precision Measurement"
    ]
  }
]

export const employerData = [
  {
    id: "d675cf06-16b7-4309-b814-767933626e99",
    company: "AutoVolt Mobility",
    sector: "Automotive",
    district: "Pune",
    hiring: 85,
    satisfaction: 88,
    skills: [
      "Battery Diagnostics",
      "EV Electrical Systems",
      "BMS",
      "High Voltage Safety"
    ]
  },
  {
    id: "b431c225-fd79-4a11-95d2-cd45fbfd386e",
    company: "MahaSolar Energy",
    sector: "Renewable Energy",
    district: "Pune",
    hiring: 72,
    satisfaction: 91,
    skills: [
      "Solar Installation",
      "Solar PV",
      "Inverter Maintenance",
      "Electrical Safety"
    ]
  },
  {
    id: "7c8e2131-d5c8-4cbd-9ae6-51283e97e110",
    company: "TechData Solutions",
    sector: "Information Technology",
    district: "Pune",
    hiring: 94,
    satisfaction: 86,
    skills: [
      "Python",
      "SQL",
      "Data Analytics",
      "Data Visualization"
    ]
  },
  {
    id: "b95be9a4-5410-484c-a460-b8c9a8c9fbf7",
    company: "Precision Manufacturing Ltd",
    sector: "Manufacturing",
    district: "Nashik",
    hiring: 68,
    satisfaction: 79,
    skills: [
      "CNC Programming",
      "Automation",
      "Robotics",
      "Precision Measurement"
    ]
  },
  {
    id: "emp-mum-1",
    company: "Apex FinTech Solutions",
    sector: "Information Technology",
    district: "Mumbai",
    hiring: 92,
    satisfaction: 89,
    skills: [
      "Python",
      "SQL",
      "Data Analytics",
      "Data Visualization"
    ]
  },
  {
    id: "emp-mum-2",
    company: "Metro Fleet Mobility",
    sector: "Automotive",
    district: "Mumbai",
    hiring: 88,
    satisfaction: 85,
    skills: [
      "Battery Diagnostics",
      "EV Electrical Systems",
      "BMS",
      "High Voltage Safety"
    ]
  },
  {
    id: "emp-nag-1",
    company: "Vidarbha Renewables & Solar",
    sector: "Renewable Energy",
    district: "Nagpur",
    hiring: 78,
    satisfaction: 86,
    skills: [
      "Solar Installation",
      "Solar PV",
      "Inverter Maintenance",
      "Electrical Safety"
    ]
  },
  {
    id: "emp-nag-2",
    company: "Central India Engineering",
    sector: "Manufacturing",
    district: "Nagpur",
    hiring: 70,
    satisfaction: 81,
    skills: [
      "CNC Programming",
      "Automation",
      "Robotics",
      "Precision Measurement"
    ]
  }
]

/* ==========================================================================
   Supabase Asynchronous Data Fetching Functions
   ========================================================================== */

export async function fetchLabourData() {
  if (!supabase) return labourData

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

  if (error) {
    console.warn('Supabase fetchLabourData error, using fallback:', error)
    return labourData
  }
  if (!data || data.length === 0) return labourData

  return data.map((job) => ({
    id: job.id,
    role: job.role || 'Unknown Role',
    sector: job.sector || 'General',
    demand: Number(job.demand) || 0,
    currentCapacity: Number(job.current_capacity) || 0,
    growth: Number(job.growth) || 0,
    employerValidation: Number(job.employer_validation) || 0,
    placementRate: Number(job.placement_rate) || 0,
    skills: [...new Set(
      (job.job_skills || [])
        .map((item) => item.skills?.name)
        .filter(Boolean)
    )]
  }))
}

export async function fetchCourseData() {
  if (!supabase) return courseData

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

  if (error) {
    console.warn('Supabase fetchCourseData error, using fallback:', error)
    return courseData
  }
  if (!data || data.length === 0) return courseData

  return data.map((course) => {
    const skillRows = course.course_skills || []

    return {
      id: course.id,
      name: course.name || 'Unnamed Course',
      role: course.role || 'General',
      currentSkills: [...new Set(
        skillRows
          .filter((item) => item.skill_type === 'current')
          .map((item) => item.skills?.name)
          .filter(Boolean)
      )],
      industrySkills: [...new Set(
        skillRows
          .filter((item) => item.skill_type === 'industry')
          .map((item) => item.skills?.name)
          .filter(Boolean)
      )]
    }
  })
}

export async function fetchEmployerData() {
  if (!supabase) return employerData

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

  if (error) {
    console.warn('Supabase fetchEmployerData error, using fallback:', error)
    return employerData
  }
  if (!data || data.length === 0) return employerData

  const fetched = data.map((employer) => ({
    id: employer.id,
    company: employer.company || 'Unknown Employer',
    sector: employer.sector || 'General',
    district: employer.districts?.name || 'General',
    hiring: Number(employer.hiring) || 0,
    satisfaction: Number(employer.satisfaction) || 0,
    skills: [...new Set(
      (employer.employer_skills || [])
        .map((item) => item.skills?.name)
        .filter(Boolean)
    )]
  }))

  // Ensure regional employers from Mumbai and Nagpur are represented
  const existingCompanies = new Set(fetched.map((e) => e.company))
  const additional = employerData.filter((e) => !existingCompanies.has(e.company))
  return [...fetched, ...additional]
}

export async function fetchDistricts() {
  const defaultDistricts = ['Pune', 'Mumbai', 'Nashik', 'Nagpur']
  if (!supabase) return defaultDistricts

  const { data, error } = await supabase
    .from('districts')
    .select('name')
    .order('name')

  if (error || !data || data.length === 0) {
    return defaultDistricts
  }

  const fetched = data.map((d) => d.name).filter(Boolean)
  return [...new Set([...defaultDistricts, ...fetched])]
}

/* ==========================================================================
   Report Export Utilities (Direct Browser File Downloads)
   ========================================================================== */

/**
 * Generates and downloads a complete intelligence report as CSV to user's Downloads folder.
 */
export function exportIntelligenceReport({ district, sector, labourData }) {
  const dateStr = new Date().toISOString().split('T')[0]
  const safeDistrict = (district || 'All_Districts').replace(/\s+/g, '_')
  const safeSector = (sector || 'All_Sectors').replace(/[\s/]+/g, '_')
  const filename = `MahaSkillIntel_Report_${safeDistrict}_${safeSector}_${dateStr}.csv`

  const headers = [
    'Occupation',
    'Sector',
    'District Scope',
    'Projected Demand (Openings)',
    'Current Training Capacity (Seats)',
    'Capacity Gap',
    'Demand Score (/100)',
    'Growth Rate',
    'Employer Validation',
    'Placement Rate',
    'Requested Skills'
  ]

  const rows = (labourData || []).map((job) => {
    const demand = Number(job.demand) || 0
    const capacity = Number(job.currentCapacity) || 0
    const gap = demand - capacity
    const score = calculateDemandScore(job)
    const skillsStr = `"${(job.skills || []).join('; ')}"`

    return [
      `"${job.role}"`,
      `"${job.sector}"`,
      `"${district}"`,
      demand,
      capacity,
      gap > 0 ? `+${gap}` : gap,
      score,
      `${job.growth || 0}%`,
      `${job.employerValidation || 0}%`,
      `${job.placementRate || 0}%`,
      skillsStr
    ]
  })

  const csvContent = [
    `# MahaSkillIntel Market Intelligence Report`,
    `# Export Date: ${new Date().toLocaleString()}`,
    `# District Filter: ${district}`,
    `# Sector Filter: ${sector}`,
    '',
    headers.join(','),
    ...rows.map((r) => r.join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return filename
}

/**
 * Generates and downloads a district action plan CSV to user's Downloads folder.
 */
export function exportDistrictActionPlan({ district, districtLabourData }) {
  const dateStr = new Date().toISOString().split('T')[0]
  const safeDistrict = (district || 'All_Districts').replace(/\s+/g, '_')
  const filename = `MahaSkillIntel_Action_Plan_${safeDistrict}_${dateStr}.csv`

  const headers = [
    'Priority Occupation',
    'Sector',
    'District',
    'Annual Demand',
    'Current Training Capacity',
    'Recommended Capacity Adjustment',
    'Strategic Recommendation'
  ]

  const rows = (districtLabourData || []).map((job) => {
    const demand = Number(job.demand) || 0
    const capacity = Number(job.currentCapacity) || 0
    const gap = demand - capacity
    let recommendation = 'Maintain current training capacity'
    if (gap > 0) {
      recommendation = `Expand training capacity by +${gap} seats to meet industry deficit`
    } else if (gap < 0) {
      recommendation = `Review program: potential oversupply of ${Math.abs(gap)} seats`
    }

    return [
      `"${job.role}"`,
      `"${job.sector}"`,
      `"${district}"`,
      demand,
      capacity,
      gap > 0 ? `+${gap} seats` : `${gap} seats`,
      `"${recommendation}"`
    ]
  })

  const csvContent = [
    `# MahaSkillIntel District Action Plan`,
    `# Target District: ${district}`,
    `# Generated: ${new Date().toLocaleString()}`,
    '',
    headers.join(','),
    ...rows.map((r) => r.join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return filename
}
/* ==========================================================================
   Skill Intelligence Utilities
   ========================================================================== */

export const PROFICIENCY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert'
]

export function getSkillNames(skills = []) {
  return (skills || [])
    .map((skill) => {
      if (typeof skill === 'string') return skill
      return skill?.name || ''
    })
    .filter(Boolean)
}

export function getSkillsByLevel(skills = [], level) {
  return (skills || []).filter((skill) => {
    if (typeof skill === 'string') {
      return level === 'Beginner'
    }

    return (skill?.level || 'Beginner') === level
  })
}

export function fuzzySkillMatch(skillA, skillB) {
  if (!skillA || !skillB) return false

  const a = String(skillA).toLowerCase().trim()
  const b = String(skillB).toLowerCase().trim()

  if (a === b) return true
  if (a.includes(b) || b.includes(a)) return true

  const normalize = (value) =>
    value
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

  return normalize(a) === normalize(b)
}

export function findMatchingSkills(candidateSkills = [], requiredSkills = []) {
  const candidates = getSkillNames(candidateSkills)
  const required = getSkillNames(requiredSkills)

  return required.filter((requiredSkill) =>
    candidates.some((candidateSkill) =>
      fuzzySkillMatch(candidateSkill, requiredSkill)
    )
  )
}

export function calculateForecast(trendData) {
  if (!trendData || typeof trendData !== 'object') {
    return 0
  }

  const values = Object.entries(trendData)
    .filter(([key, value]) => !key.includes('projected') && Number.isFinite(Number(value)))
    .map(([, value]) => Number(value))

  if (values.length === 0) return 0

  const latest = values[values.length - 1]

  return Math.round(latest * 1.1)
}

export function getTrendDirection(trendData) {
  if (!trendData || typeof trendData !== 'object') {
    return 'Stable'
  }

  const values = Object.entries(trendData)
    .filter(([key, value]) => !key.includes('projected') && Number.isFinite(Number(value)))
    .map(([, value]) => Number(value))

  if (values.length < 2) {
    return 'Stable'
  }

  const first = values[0]
  const last = values[values.length - 1]

  if (last > first * 1.05) return 'Rising'
  if (last < first * 0.95) return 'Declining'

  return 'Stable'
}
