export const labourData = [
  {
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


// Calculate the intelligence score for each occupation
export function calculateDemandScore(job) {

  // Convert growth into a 0-100 score.
  // 50% growth or more = maximum score.
  const growthScore = Math.min(
    Math.max(job.growth * 2, 0),
    100
  )

  // Calculate training supply pressure.
  const supplyGap =
    (job.demand - job.currentCapacity) / job.demand

  const supplyScore = Math.min(
    Math.max(supplyGap * 100, 0),
    100
  )

  const score =
    (job.demand / 1000) * 30 +
    growthScore * 0.20 +
    job.employerValidation * 0.20 +
    job.placementRate * 0.20 +
    supplyScore * 0.10

  return Math.round(Math.min(score, 100))
}

export const employerData = [
  {
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