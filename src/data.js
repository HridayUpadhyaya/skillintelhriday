// ── Labour market data ──────────────────────────────────────────────

export const labourData = [
  {
    id: "ev-tech",
    role: "EV Technician",
    sector: "Automotive",
    district: "Pune",
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
    id: "battery-tech",
    role: "Battery Technician",
    sector: "Automotive / Energy",
    district: "Pune",
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
    id: "solar-tech",
    role: "Solar Technician",
    sector: "Renewable Energy",
    district: "Mumbai",
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
    id: "cnc-operator",
    role: "CNC Automation Operator",
    sector: "Manufacturing",
    district: "Nashik",
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
    id: "data-analyst",
    role: "Data Analyst",
    sector: "Information Technology",
    district: "Pune",
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
    id: "data-entry",
    role: "Data Entry Operator",
    sector: "Business Services",
    district: "Nagpur",
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


// ── Course / curriculum data ────────────────────────────────────────

export const courseData = [
  {
    id: "course-ev",
    name: "EV Technician",
    role: "EV Technician",
    duration: "6 months",

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
    id: "course-solar",
    name: "Solar Technician",
    role: "Solar Technician",
    duration: "4 months",

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
    id: "course-cnc",
    name: "CNC Automation Operator",
    role: "CNC Automation Operator",
    duration: "8 months",

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


// ── Demand score calculator ─────────────────────────────────────────

export function calculateDemandScore(job) {
  if (!job.demand || job.demand <= 0) return 0

  const growthScore = Math.min(
    Math.max(job.growth * 2, 0),
    100
  )

  const supplyGap =
    (job.demand - job.currentCapacity) / job.demand

  const supplyScore = Math.min(
    Math.max(supplyGap * 100, 0),
    100
  )

  const score =
    (job.demand / 1000) * 30 +
    growthScore * 0.20 +
    (job.employerValidation || 0) * 0.20 +
    (job.placementRate || 0) * 0.20 +
    supplyScore * 0.10

  return Math.round(Math.min(score, 100))
}


// ── Employer data ───────────────────────────────────────────────────

export const employerData = [
  {
    id: "emp-autovolt",
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
    id: "emp-mahasolar",
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
    id: "emp-techdata",
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
    id: "emp-precision",
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
  }
]
