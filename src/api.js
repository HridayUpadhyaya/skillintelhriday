import { supabase } from './supabaseClient.js'

/* ==========================================================================
   SkillIntel Data Layer & Backend API Module
   ========================================================================== */

export const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const SKILL_SYNONYMS = {
  'python': ['python programming', 'python 3', 'python scripting'],
  'data analysis': ['data analytics', 'data processing', 'analytics'],
  'machine learning': ['ml', 'artificial intelligence', 'ai'],
  'javascript': ['js', 'ecmascript', 'es6', 'vanilla js'],
  'react': ['reactjs', 'react.js'],
  'node': ['nodejs', 'node.js'],
  'aws': ['amazon web services', 'aws cloud'],
  'cybersecurity': ['cyber security', 'information security', 'infosec'],
  'bms': ['battery management systems', 'battery management system'],
};

// Regional district demand and capacity breakdown for Maharashtra.
// Extrapolated across 12 districts.
export const DISTRICT_BREAKDOWN = {
  "EV Technician": {
    "Pune": { demand: 190, currentCapacity: 70 },
    "Mumbai": { demand: 150, currentCapacity: 60 },
    "Nashik": { demand: 70, currentCapacity: 30 },
    "Nagpur": { demand: 60, currentCapacity: 25 },
    "Aurangabad": { demand: 50, currentCapacity: 20 },
    "Thane": { demand: 110, currentCapacity: 45 },
    "Kolhapur": { demand: 45, currentCapacity: 15 },
    "Solapur": { demand: 40, currentCapacity: 15 },
    "Amravati": { demand: 35, currentCapacity: 10 },
    "Sangli": { demand: 40, currentCapacity: 10 },
    "Ratnagiri": { demand: 30, currentCapacity: 10 },
    "Jalgaon": { demand: 30, currentCapacity: 10 }
  },
  "Battery Technician": {
    "Pune": { demand: 140, currentCapacity: 60 },
    "Mumbai": { demand: 110, currentCapacity: 50 },
    "Nashik": { demand: 50, currentCapacity: 25 },
    "Nagpur": { demand: 45, currentCapacity: 20 },
    "Aurangabad": { demand: 35, currentCapacity: 15 },
    "Thane": { demand: 85, currentCapacity: 40 },
    "Kolhapur": { demand: 30, currentCapacity: 15 },
    "Solapur": { demand: 30, currentCapacity: 15 },
    "Amravati": { demand: 25, currentCapacity: 10 },
    "Sangli": { demand: 30, currentCapacity: 10 },
    "Ratnagiri": { demand: 20, currentCapacity: 10 },
    "Jalgaon": { demand: 20, currentCapacity: 10 }
  },
  "Solar Technician": {
    "Pune": { demand: 90, currentCapacity: 40 },
    "Mumbai": { demand: 70, currentCapacity: 30 },
    "Nashik": { demand: 60, currentCapacity: 25 },
    "Nagpur": { demand: 80, currentCapacity: 35 },
    "Aurangabad": { demand: 50, currentCapacity: 20 },
    "Thane": { demand: 55, currentCapacity: 25 },
    "Kolhapur": { demand: 35, currentCapacity: 10 },
    "Solapur": { demand: 40, currentCapacity: 10 },
    "Amravati": { demand: 20, currentCapacity: 5 },
    "Sangli": { demand: 25, currentCapacity: 5 },
    "Ratnagiri": { demand: 10, currentCapacity: 2 },
    "Jalgaon": { demand: 5, currentCapacity: 3 }
  },
  "CNC Automation Operator": {
    "Pune": { demand: 180, currentCapacity: 150 },
    "Mumbai": { demand: 60, currentCapacity: 50 },
    "Nashik": { demand: 130, currentCapacity: 120 },
    "Nagpur": { demand: 60, currentCapacity: 55 },
    "Aurangabad": { demand: 100, currentCapacity: 90 },
    "Thane": { demand: 75, currentCapacity: 70 },
    "Kolhapur": { demand: 45, currentCapacity: 40 },
    "Solapur": { demand: 20, currentCapacity: 25 },
    "Amravati": { demand: 15, currentCapacity: 20 },
    "Sangli": { demand: 20, currentCapacity: 25 },
    "Ratnagiri": { demand: 5, currentCapacity: 15 },
    "Jalgaon": { demand: 10, currentCapacity: 20 }
  },
  "Data Analyst": {
    "Pune": { demand: 300, currentCapacity: 180 },
    "Mumbai": { demand: 350, currentCapacity: 200 },
    "Nashik": { demand: 40, currentCapacity: 25 },
    "Nagpur": { demand: 45, currentCapacity: 30 },
    "Aurangabad": { demand: 30, currentCapacity: 20 },
    "Thane": { demand: 90, currentCapacity: 55 },
    "Kolhapur": { demand: 15, currentCapacity: 10 },
    "Solapur": { demand: 10, currentCapacity: 5 },
    "Amravati": { demand: 10, currentCapacity: 5 },
    "Sangli": { demand: 10, currentCapacity: 5 },
    "Ratnagiri": { demand: 5, currentCapacity: 2 },
    "Jalgaon": { demand: 5, currentCapacity: 3 }
  },
  "Data Entry Operator": {
    "Pune": { demand: 50, currentCapacity: 200 },
    "Mumbai": { demand: 60, currentCapacity: 250 },
    "Nashik": { demand: 25, currentCapacity: 100 },
    "Nagpur": { demand: 25, currentCapacity: 100 },
    "Aurangabad": { demand: 20, currentCapacity: 90 },
    "Thane": { demand: 45, currentCapacity: 180 },
    "Kolhapur": { demand: 15, currentCapacity: 60 },
    "Solapur": { demand: 15, currentCapacity: 60 },
    "Amravati": { demand: 15, currentCapacity: 50 },
    "Sangli": { demand: 10, currentCapacity: 40 },
    "Ratnagiri": { demand: 10, currentCapacity: 35 },
    "Jalgaon": { demand: 10, currentCapacity: 35 }
  },
  "Full Stack Developer": {
    "Pune": { demand: 400, currentCapacity: 250 },
    "Mumbai": { demand: 450, currentCapacity: 280 },
    "Nashik": { demand: 50, currentCapacity: 30 },
    "Nagpur": { demand: 60, currentCapacity: 40 },
    "Aurangabad": { demand: 35, currentCapacity: 20 },
    "Thane": { demand: 130, currentCapacity: 90 },
    "Kolhapur": { demand: 20, currentCapacity: 15 },
    "Solapur": { demand: 15, currentCapacity: 10 },
    "Amravati": { demand: 10, currentCapacity: 15 },
    "Sangli": { demand: 15, currentCapacity: 10 },
    "Ratnagiri": { demand: 5, currentCapacity: 10 },
    "Jalgaon": { demand: 10, currentCapacity: 10 }
  },
  "Cybersecurity Analyst": {
    "Pune": { demand: 250, currentCapacity: 70 },
    "Mumbai": { demand: 280, currentCapacity: 80 },
    "Nashik": { demand: 20, currentCapacity: 5 },
    "Nagpur": { demand: 30, currentCapacity: 10 },
    "Aurangabad": { demand: 15, currentCapacity: 5 },
    "Thane": { demand: 55, currentCapacity: 15 },
    "Kolhapur": { demand: 5, currentCapacity: 2 },
    "Solapur": { demand: 5, currentCapacity: 1 },
    "Amravati": { demand: 5, currentCapacity: 1 },
    "Sangli": { demand: 5, currentCapacity: 1 },
    "Ratnagiri": { demand: 5, currentCapacity: 0 },
    "Jalgaon": { demand: 5, currentCapacity: 0 }
  },
  "IoT Technician": {
    "Pune": { demand: 160, currentCapacity: 50 },
    "Mumbai": { demand: 150, currentCapacity: 45 },
    "Nashik": { demand: 40, currentCapacity: 10 },
    "Nagpur": { demand: 40, currentCapacity: 15 },
    "Aurangabad": { demand: 30, currentCapacity: 10 },
    "Thane": { demand: 50, currentCapacity: 15 },
    "Kolhapur": { demand: 15, currentCapacity: 5 },
    "Solapur": { demand: 10, currentCapacity: 5 },
    "Amravati": { demand: 10, currentCapacity: 2 },
    "Sangli": { demand: 5, currentCapacity: 2 },
    "Ratnagiri": { demand: 5, currentCapacity: 1 },
    "Jalgaon": { demand: 5, currentCapacity: 0 }
  },
  "AI/ML Engineer": {
    "Pune": { demand: 280, currentCapacity: 80 },
    "Mumbai": { demand: 320, currentCapacity: 95 },
    "Nashik": { demand: 20, currentCapacity: 5 },
    "Nagpur": { demand: 25, currentCapacity: 10 },
    "Aurangabad": { demand: 15, currentCapacity: 5 },
    "Thane": { demand: 60, currentCapacity: 20 },
    "Kolhapur": { demand: 10, currentCapacity: 2 },
    "Solapur": { demand: 5, currentCapacity: 1 },
    "Amravati": { demand: 5, currentCapacity: 1 },
    "Sangli": { demand: 5, currentCapacity: 1 },
    "Ratnagiri": { demand: 0, currentCapacity: 0 },
    "Jalgaon": { demand: 5, currentCapacity: 0 }
  },
  "Cloud Infrastructure Engineer": {
    "Pune": { demand: 220, currentCapacity: 120 },
    "Mumbai": { demand: 250, currentCapacity: 130 },
    "Nashik": { demand: 25, currentCapacity: 15 },
    "Nagpur": { demand: 35, currentCapacity: 20 },
    "Aurangabad": { demand: 20, currentCapacity: 10 },
    "Thane": { demand: 60, currentCapacity: 40 },
    "Kolhapur": { demand: 10, currentCapacity: 5 },
    "Solapur": { demand: 5, currentCapacity: 5 },
    "Amravati": { demand: 5, currentCapacity: 2 },
    "Sangli": { demand: 5, currentCapacity: 2 },
    "Ratnagiri": { demand: 2, currentCapacity: 1 },
    "Jalgaon": { demand: 3, currentCapacity: 0 }
  },
  "Drone Pilot & Technician": {
    "Pune": { demand: 80, currentCapacity: 20 },
    "Mumbai": { demand: 60, currentCapacity: 15 },
    "Nashik": { demand: 40, currentCapacity: 5 },
    "Nagpur": { demand: 40, currentCapacity: 10 },
    "Aurangabad": { demand: 35, currentCapacity: 5 },
    "Thane": { demand: 40, currentCapacity: 10 },
    "Kolhapur": { demand: 20, currentCapacity: 5 },
    "Solapur": { demand: 15, currentCapacity: 2 },
    "Amravati": { demand: 20, currentCapacity: 3 },
    "Sangli": { demand: 10, currentCapacity: 2 },
    "Ratnagiri": { demand: 10, currentCapacity: 2 },
    "Jalgaon": { demand: 10, currentCapacity: 1 }
  },
  "3D Printing Technician": {
    "Pune": { demand: 80, currentCapacity: 30 },
    "Mumbai": { demand: 60, currentCapacity: 20 },
    "Nashik": { demand: 30, currentCapacity: 10 },
    "Nagpur": { demand: 25, currentCapacity: 10 },
    "Aurangabad": { demand: 35, currentCapacity: 15 },
    "Thane": { demand: 20, currentCapacity: 10 },
    "Kolhapur": { demand: 15, currentCapacity: 5 },
    "Solapur": { demand: 5, currentCapacity: 2 },
    "Amravati": { demand: 5, currentCapacity: 2 },
    "Sangli": { demand: 5, currentCapacity: 2 },
    "Ratnagiri": { demand: 5, currentCapacity: 2 },
    "Jalgaon": { demand: 5, currentCapacity: 2 }
  },
  "Electric Bus Mechanic": {
    "Pune": { demand: 100, currentCapacity: 35 },
    "Mumbai": { demand: 140, currentCapacity: 45 },
    "Nashik": { demand: 30, currentCapacity: 10 },
    "Nagpur": { demand: 40, currentCapacity: 10 },
    "Aurangabad": { demand: 20, currentCapacity: 5 },
    "Thane": { demand: 45, currentCapacity: 15 },
    "Kolhapur": { demand: 10, currentCapacity: 3 },
    "Solapur": { demand: 10, currentCapacity: 2 },
    "Amravati": { demand: 5, currentCapacity: 2 },
    "Sangli": { demand: 5, currentCapacity: 1 },
    "Ratnagiri": { demand: 2, currentCapacity: 1 },
    "Jalgaon": { demand: 3, currentCapacity: 1 }
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

/**
 * Helper to get just skill names from an array of skill objects (or strings for backward compatibility)
 */
export function getSkillNames(skills) {
  if (!skills || !Array.isArray(skills)) return [];
  return skills.map(skill => typeof skill === 'string' ? skill : skill.name);
}

/**
 * Helper to filter skills by proficiency level
 */
export function getSkillsByLevel(skills, level) {
  if (!skills || !Array.isArray(skills)) return [];
  return skills.filter(skill => typeof skill === 'object' && skill.level === level);
}

/**
 * Fuzzy skill matching (synonyms and substring matching)
 */
export function fuzzySkillMatch(skillA, skillB) {
  if (!skillA || !skillB) return false;
  const a = (typeof skillA === 'string' ? skillA : skillA.name).toLowerCase().trim();
  const b = (typeof skillB === 'string' ? skillB : skillB.name).toLowerCase().trim();
  
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  
  // Check synonyms
  for (const [key, synonyms] of Object.entries(SKILL_SYNONYMS)) {
    const isA = a === key || synonyms.includes(a);
    const isB = b === key || synonyms.includes(b);
    if (isA && isB) return true;
  }
  return false;
}

/**
 * Find matching skills from candidate against required
 */
export function findMatchingSkills(candidateSkills, requiredSkills) {
  if (!candidateSkills || !requiredSkills) return [];
  return candidateSkills.filter(cSkill => 
    requiredSkills.some(rSkill => fuzzySkillMatch(cSkill, rSkill))
  );
}

/**
 * Simple linear regression forecast
 */
export function calculateForecast(trendData) {
  if (!trendData) return 0;
  
  const years = Object.keys(trendData).map(y => parseInt(y.replace('_projected', ''), 10));
  const values = Object.values(trendData);
  
  if (years.length < 2) return values[0] || 0;
  
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  const n = years.length;
  
  for (let i = 0; i < n; i++) {
    sumX += years[i];
    sumY += values[i];
    sumXY += years[i] * values[i];
    sumXX += years[i] * years[i];
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const nextYear = Math.max(...years) + 1;
  return Math.round(slope * nextYear + intercept);
}

/**
 * Get trend direction string
 */
export function getTrendDirection(trendData) {
  if (!trendData) return 'Stable';
  const values = Object.values(trendData);
  if (values.length < 2) return 'Stable';
  
  const first = values[0];
  const last = values[values.length - 1];
  
  const change = (last - first) / first;
  if (change > 0.05) return 'Rising';
  if (change < -0.05) return 'Declining';
  return 'Stable';
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
      { name: "Battery Diagnostics", level: "Advanced" },
      { name: "EV Electrical Systems", level: "Intermediate" },
      { name: "BMS", level: "Intermediate" },
      { name: "High Voltage Safety", level: "Advanced" }
    ],
    trendData: { '2023': 400, '2024': 600, '2025': 850, '2026_projected': 1100 },
    trainerRequirements: { current: 15, needed: 45, qualification: 'B.E. Automobile / EV Specialization' },
    equipmentRequirements: ['EV Powertrain Simulators', 'High Voltage Safety Gear', 'Battery Analyzers']
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
      { name: "Battery Diagnostics", level: "Intermediate" },
      { name: "Battery Management Systems", level: "Advanced" },
      { name: "Cell Testing", level: "Intermediate" },
      { name: "Thermal Management", level: "Beginner" }
    ],
    trendData: { '2023': 300, '2024': 450, '2025': 620, '2026_projected': 800 },
    trainerRequirements: { current: 10, needed: 30, qualification: 'B.E. Electrical / Energy Systems' },
    equipmentRequirements: ['Battery Pack Assembly Kit', 'Thermal Imaging Cameras', 'Cell Testers']
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
      { name: "Solar Installation", level: "Intermediate" },
      { name: "Electrical Safety", level: "Advanced" },
      { name: "Solar PV", level: "Intermediate" },
      { name: "Inverter Maintenance", level: "Intermediate" }
    ],
    trendData: { '2023': 250, '2024': 380, '2025': 540, '2026_projected': 700 },
    trainerRequirements: { current: 12, needed: 25, qualification: 'Diploma in Electrical / Renewable Energy' },
    equipmentRequirements: ['PV Modules', 'Grid-tie Inverters', 'Solar Installation Toolkits']
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
      { name: "CNC Programming", level: "Intermediate" },
      { name: "Automation", level: "Beginner" },
      { name: "Robotics", level: "Beginner" },
      { name: "Precision Measurement", level: "Intermediate" }
    ],
    trendData: { '2023': 600, '2024': 650, '2025': 720, '2026_projected': 750 },
    trainerRequirements: { current: 35, needed: 40, qualification: 'B.E. Mechanical / Production' },
    equipmentRequirements: ['CNC Lathe Machines', 'CMM Machines', 'Robotic Arms']
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
      { name: "Data Analytics", level: "Intermediate" },
      { name: "Python", level: "Advanced" },
      { name: "SQL", level: "Advanced" },
      { name: "Data Visualization", level: "Intermediate" }
    ],
    trendData: { '2023': 500, '2024': 700, '2025': 910, '2026_projected': 1150 },
    trainerRequirements: { current: 20, needed: 40, qualification: 'M.Sc. IT / Data Science' },
    equipmentRequirements: ['Computer Labs', 'Cloud Access', 'Analytics Software Licenses']
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
      { name: "Typing", level: "Intermediate" },
      { name: "Data Processing", level: "Beginner" },
      { name: "Office Software", level: "Intermediate" }
    ],
    trendData: { '2023': 800, '2024': 550, '2025': 300, '2026_projected': 150 },
    trainerRequirements: { current: 50, needed: 15, qualification: 'Any Graduate' },
    equipmentRequirements: ['Basic Desktop PCs', 'Office Suites']
  },
  {
    id: "e44d3221-a3f8-410a-b333-6c8413b567a1",
    role: "Full Stack Developer",
    sector: "Information Technology",
    demand: 1200,
    currentCapacity: 780,
    growth: 28,
    employerValidation: 90,
    placementRate: 85,
    skills: [
      { name: "React", level: "Intermediate" },
      { name: "Node.js", level: "Intermediate" },
      { name: "SQL/NoSQL", level: "Intermediate" },
      { name: "API Development", level: "Advanced" }
    ],
    trendData: { '2023': 850, '2024': 1000, '2025': 1200, '2026_projected': 1400 },
    trainerRequirements: { current: 30, needed: 50, qualification: 'B.E. Computer Science' },
    equipmentRequirements: ['High-end Workstations', 'Cloud Environments']
  },
  {
    id: "f8c85311-b0e5-4786-8a9d-16c87cf28b52",
    role: "Cybersecurity Analyst",
    sector: "Information Technology",
    demand: 680,
    currentCapacity: 190,
    growth: 45,
    employerValidation: 95,
    placementRate: 88,
    skills: [
      { name: "Network Security", level: "Advanced" },
      { name: "Ethical Hacking", level: "Intermediate" },
      { name: "Incident Response", level: "Intermediate" },
      { name: "SIEM Tools", level: "Advanced" }
    ],
    trendData: { '2023': 200, '2024': 400, '2025': 680, '2026_projected': 900 },
    trainerRequirements: { current: 8, needed: 30, qualification: 'B.E. CS / CEH Certification' },
    equipmentRequirements: ['Security Lab Servers', 'Firewall Appliances', 'Penetration Testing Tools']
  },
  {
    id: "a1a8c3d7-4638-4e89-9a74-9b2f6b8c56f3",
    role: "IoT Technician",
    sector: "Electronics/IoT",
    demand: 520,
    currentCapacity: 160,
    growth: 40,
    employerValidation: 82,
    placementRate: 78,
    skills: [
      { name: "Microcontrollers", level: "Intermediate" },
      { name: "Sensors & Actuators", level: "Intermediate" },
      { name: "Wireless Protocols", level: "Beginner" },
      { name: "Python Scripting", level: "Intermediate" }
    ],
    trendData: { '2023': 200, '2024': 350, '2025': 520, '2026_projected': 680 },
    trainerRequirements: { current: 6, needed: 22, qualification: 'B.E. Electronics and Telecommunication' },
    equipmentRequirements: ['IoT Development Kits', 'Sensor Modules', 'Oscilloscopes']
  },
  {
    id: "b3f3b0e1-7e72-4d2d-8b01-9a738c6b24e4",
    role: "AI/ML Engineer",
    sector: "Information Technology",
    demand: 750,
    currentCapacity: 220,
    growth: 52,
    employerValidation: 93,
    placementRate: 90,
    skills: [
      { name: "Machine Learning Algorithms", level: "Advanced" },
      { name: "Python", level: "Advanced" },
      { name: "TensorFlow/PyTorch", level: "Intermediate" },
      { name: "Data Modeling", level: "Advanced" }
    ],
    trendData: { '2023': 250, '2024': 450, '2025': 750, '2026_projected': 1100 },
    trainerRequirements: { current: 10, needed: 35, qualification: 'M.Tech / Ph.D. in Computer Science' },
    equipmentRequirements: ['GPU Servers', 'Cloud Compute Resources']
  },
  {
    id: "c4f4b0e2-8e83-4d3e-9c02-0a838d7c35f5",
    role: "Cloud Infrastructure Engineer",
    sector: "Information Technology",
    demand: 640,
    currentCapacity: 350,
    growth: 35,
    employerValidation: 89,
    placementRate: 84,
    skills: [
      { name: "AWS/Azure/GCP", level: "Advanced" },
      { name: "Infrastructure as Code", level: "Intermediate" },
      { name: "Docker/Kubernetes", level: "Advanced" },
      { name: "Networking", level: "Intermediate" }
    ],
    trendData: { '2023': 300, '2024': 450, '2025': 640, '2026_projected': 800 },
    trainerRequirements: { current: 15, needed: 30, qualification: 'B.E. IT / Cloud Certifications' },
    equipmentRequirements: ['Cloud Subscription Credits', 'Networking Labs']
  },
  {
    id: "d5f5b0e3-9e94-4d4f-ad03-1b949e8d46g6",
    role: "Drone Pilot & Technician",
    sector: "Aerospace/Agriculture",
    demand: 380,
    currentCapacity: 80,
    growth: 48,
    employerValidation: 75,
    placementRate: 72,
    skills: [
      { name: "Drone Piloting", level: "Advanced" },
      { name: "UAV Maintenance", level: "Intermediate" },
      { name: "Aviation Regulations", level: "Beginner" },
      { name: "Data Processing", level: "Intermediate" }
    ],
    trendData: { '2023': 100, '2024': 200, '2025': 380, '2026_projected': 550 },
    trainerRequirements: { current: 4, needed: 18, qualification: 'DGCA Certified Drone Instructor' },
    equipmentRequirements: ['Training Drones', 'Simulation Software', 'Repair Toolkits']
  },
  {
    id: "e6f6b0e4-0f05-4d5g-be04-2c050f9e57h7",
    role: "3D Printing Technician",
    sector: "Manufacturing",
    demand: 290,
    currentCapacity: 110,
    growth: 33,
    employerValidation: 70,
    placementRate: 68,
    skills: [
      { name: "CAD Modeling", level: "Intermediate" },
      { name: "3D Printer Operation", level: "Advanced" },
      { name: "Material Science", level: "Beginner" },
      { name: "Post-Processing", level: "Intermediate" }
    ],
    trendData: { '2023': 120, '2024': 190, '2025': 290, '2026_projected': 400 },
    trainerRequirements: { current: 5, needed: 12, qualification: 'B.E. Mechanical / Design' },
    equipmentRequirements: ['FDM Printers', 'SLA Printers', 'CAD Workstations']
  },
  {
    id: "f7f7b0e5-1g16-4d6h-cf05-3d161g0f68i8",
    role: "Electric Bus Mechanic",
    sector: "Automotive/Transport",
    demand: 410,
    currentCapacity: 130,
    growth: 38,
    employerValidation: 85,
    placementRate: 80,
    skills: [
      { name: "Heavy EV Powertrains", level: "Advanced" },
      { name: "High Voltage Systems", level: "Advanced" },
      { name: "Bus Diagnostics", level: "Intermediate" },
      { name: "Fleet Maintenance", level: "Intermediate" }
    ],
    trendData: { '2023': 150, '2024': 250, '2025': 410, '2026_projected': 580 },
    trainerRequirements: { current: 6, needed: 20, qualification: 'Automotive Engineering Diploma' },
    equipmentRequirements: ['Heavy Duty EV Lifts', 'Commercial EV Diagnostics Kits']
  }
]

export const courseData = [
  {
    id: "7e4f96e9-7ab9-4c63-847e-5adc4c2e6af0",
    name: "EV Technician",
    role: "EV Technician",
    currentSkills: [
      { name: "Battery Diagnostics", level: "Beginner" },
      { name: "BMS", level: "Beginner" },
      { name: "Basic Electrical Systems", level: "Intermediate" }
    ],
    industrySkills: [
      { name: "Battery Diagnostics", level: "Advanced" },
      { name: "EV Electrical Systems", level: "Intermediate" },
      { name: "BMS", level: "Intermediate" },
      { name: "High Voltage Safety", level: "Advanced" },
      { name: "CAN Bus Diagnostics", level: "Intermediate" }
    ]
  },
  {
    id: "25720305-8d48-439a-a1a9-1b0eb4b4b97f",
    name: "Solar Technician",
    role: "Solar Technician",
    currentSkills: [
      { name: "Solar Installation", level: "Beginner" },
      { name: "Basic Electrical Systems", level: "Beginner" }
    ],
    industrySkills: [
      { name: "Solar Installation", level: "Intermediate" },
      { name: "Electrical Safety", level: "Advanced" },
      { name: "Solar PV", level: "Intermediate" },
      { name: "Inverter Maintenance", level: "Intermediate" }
    ]
  },
  {
    id: "bb74c9b7-8570-4b3e-b012-c977e67f4464",
    name: "CNC Automation Operator",
    role: "CNC Automation Operator",
    currentSkills: [
      { name: "CNC Programming", level: "Beginner" },
      { name: "Precision Measurement", level: "Beginner" }
    ],
    industrySkills: [
      { name: "CNC Programming", level: "Intermediate" },
      { name: "Automation", level: "Beginner" },
      { name: "Robotics", level: "Beginner" },
      { name: "Precision Measurement", level: "Intermediate" }
    ]
  },
  {
    id: "c8f8c0e6-2h27-4d7i-dg06-4e272h1g79j9",
    name: "Full Stack Development Program",
    role: "Full Stack Developer",
    currentSkills: [
      { name: "HTML/CSS", level: "Intermediate" },
      { name: "JavaScript Basics", level: "Beginner" }
    ],
    industrySkills: [
      { name: "React", level: "Intermediate" },
      { name: "Node.js", level: "Intermediate" },
      { name: "SQL/NoSQL", level: "Intermediate" },
      { name: "API Development", level: "Advanced" }
    ]
  },
  {
    id: "d9g9d1f7-3i38-5e8j-eh17-5f383i2h80k0",
    name: "Cybersecurity Bootcamp",
    role: "Cybersecurity Analyst",
    currentSkills: [
      { name: "Networking Basics", level: "Intermediate" },
      { name: "OS Fundamentals", level: "Intermediate" }
    ],
    industrySkills: [
      { name: "Network Security", level: "Advanced" },
      { name: "Ethical Hacking", level: "Intermediate" },
      { name: "Incident Response", level: "Intermediate" },
      { name: "SIEM Tools", level: "Advanced" }
    ]
  },
  {
    id: "eahae2g8-4j49-6f9k-fi28-6g494j3i91l1",
    name: "IoT & Embedded Systems",
    role: "IoT Technician",
    currentSkills: [
      { name: "Basic Electronics", level: "Intermediate" },
      { name: "C Programming", level: "Beginner" }
    ],
    industrySkills: [
      { name: "Microcontrollers", level: "Intermediate" },
      { name: "Sensors & Actuators", level: "Intermediate" },
      { name: "Wireless Protocols", level: "Beginner" },
      { name: "Python Scripting", level: "Intermediate" }
    ]
  },
  {
    id: "fibif3h9-5k50-7g0l-gj39-7h505k4j02m2",
    name: "Applied AI and Machine Learning",
    role: "AI/ML Engineer",
    currentSkills: [
      { name: "Python", level: "Intermediate" },
      { name: "Mathematics/Statistics", level: "Intermediate" }
    ],
    industrySkills: [
      { name: "Machine Learning Algorithms", level: "Advanced" },
      { name: "Python", level: "Advanced" },
      { name: "TensorFlow/PyTorch", level: "Intermediate" },
      { name: "Data Modeling", level: "Advanced" }
    ]
  },
  {
    id: "gjcjg4i0-6l61-8h1m-hk40-8i616l5k13n3",
    name: "Cloud Computing Architect",
    role: "Cloud Infrastructure Engineer",
    currentSkills: [
      { name: "Networking", level: "Beginner" },
      { name: "Linux Administration", level: "Intermediate" }
    ],
    industrySkills: [
      { name: "AWS/Azure/GCP", level: "Advanced" },
      { name: "Infrastructure as Code", level: "Intermediate" },
      { name: "Docker/Kubernetes", level: "Advanced" },
      { name: "Networking", level: "Intermediate" }
    ]
  },
  {
    id: "hkdkh5j1-7m72-9i2n-il51-9j727m6l24o4",
    name: "Commercial Drone Operations",
    role: "Drone Pilot & Technician",
    currentSkills: [
      { name: "Basic Aviation Rules", level: "Beginner" },
      { name: "Photography/Videography", level: "Beginner" }
    ],
    industrySkills: [
      { name: "Drone Piloting", level: "Advanced" },
      { name: "UAV Maintenance", level: "Intermediate" },
      { name: "Aviation Regulations", level: "Beginner" },
      { name: "Data Processing", level: "Intermediate" }
    ]
  },
  {
    id: "ileli6k2-8n83-0j3o-jm62-0k838n7m35p5",
    name: "Additive Manufacturing Program",
    role: "3D Printing Technician",
    currentSkills: [
      { name: "CAD Modeling", level: "Beginner" },
      { name: "Basic Manufacturing", level: "Beginner" }
    ],
    industrySkills: [
      { name: "CAD Modeling", level: "Intermediate" },
      { name: "3D Printer Operation", level: "Advanced" },
      { name: "Material Science", level: "Beginner" },
      { name: "Post-Processing", level: "Intermediate" }
    ]
  },
  {
    id: "jmfmj7l3-9o94-1k4p-kn73-1l949o8n46q6",
    name: "Heavy Duty EV Maintenance",
    role: "Electric Bus Mechanic",
    currentSkills: [
      { name: "Diesel Mechanics", level: "Advanced" },
      { name: "Basic Electrical", level: "Beginner" }
    ],
    industrySkills: [
      { name: "Heavy EV Powertrains", level: "Advanced" },
      { name: "High Voltage Systems", level: "Advanced" },
      { name: "Bus Diagnostics", level: "Intermediate" },
      { name: "Fleet Maintenance", level: "Intermediate" }
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
      { name: "Battery Diagnostics", level: "Advanced" },
      { name: "EV Electrical Systems", level: "Intermediate" },
      { name: "BMS", level: "Intermediate" },
      { name: "High Voltage Safety", level: "Advanced" }
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
      { name: "Solar Installation", level: "Intermediate" },
      { name: "Solar PV", level: "Intermediate" },
      { name: "Inverter Maintenance", level: "Intermediate" },
      { name: "Electrical Safety", level: "Advanced" }
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
      { name: "Python", level: "Advanced" },
      { name: "SQL", level: "Advanced" },
      { name: "Data Analytics", level: "Intermediate" },
      { name: "Data Visualization", level: "Intermediate" }
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
      { name: "CNC Programming", level: "Intermediate" },
      { name: "Automation", level: "Beginner" },
      { name: "Robotics", level: "Beginner" },
      { name: "Precision Measurement", level: "Intermediate" }
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
      { name: "Python", level: "Advanced" },
      { name: "SQL", level: "Advanced" },
      { name: "Data Analytics", level: "Intermediate" },
      { name: "Data Visualization", level: "Intermediate" }
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
      { name: "Battery Diagnostics", level: "Advanced" },
      { name: "EV Electrical Systems", level: "Intermediate" },
      { name: "BMS", level: "Intermediate" },
      { name: "High Voltage Safety", level: "Advanced" }
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
      { name: "Solar Installation", level: "Intermediate" },
      { name: "Solar PV", level: "Intermediate" },
      { name: "Inverter Maintenance", level: "Intermediate" },
      { name: "Electrical Safety", level: "Advanced" }
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
      { name: "CNC Programming", level: "Intermediate" },
      { name: "Automation", level: "Beginner" },
      { name: "Robotics", level: "Beginner" },
      { name: "Precision Measurement", level: "Intermediate" }
    ]
  },
  {
    id: "8c7a6b5c-4d3e-2f1g-0h9i-8j7k6l5m4n3o",
    company: "Aurangabad Tech Innovators",
    sector: "Information Technology",
    district: "Aurangabad",
    hiring: 45,
    satisfaction: 80,
    skills: [
      { name: "React", level: "Intermediate" },
      { name: "Node.js", level: "Intermediate" },
      { name: "API Development", level: "Advanced" }
    ]
  },
  {
    id: "9d8b7c6d-5e4f-3g2h-1i0j-9k8l7m6n5o4p",
    company: "Thane Cyber Defence",
    sector: "Information Technology",
    district: "Thane",
    hiring: 60,
    satisfaction: 92,
    skills: [
      { name: "Network Security", level: "Advanced" },
      { name: "Ethical Hacking", level: "Intermediate" },
      { name: "SIEM Tools", level: "Advanced" }
    ]
  },
  {
    id: "0e9c8d7e-6f5g-4h3i-2j1k-0l9m8n7o6p5q",
    company: "Kolhapur Smart Systems",
    sector: "Electronics/IoT",
    district: "Kolhapur",
    hiring: 25,
    satisfaction: 78,
    skills: [
      { name: "Microcontrollers", level: "Intermediate" },
      { name: "Sensors & Actuators", level: "Intermediate" },
      { name: "Python Scripting", level: "Intermediate" }
    ]
  },
  {
    id: "1f0d9e8f-7g6h-5i4j-3k2l-1m0n9o8p7q6r",
    company: "Solapur Cloud Services",
    sector: "Information Technology",
    district: "Solapur",
    hiring: 30,
    satisfaction: 85,
    skills: [
      { name: "AWS/Azure/GCP", level: "Advanced" },
      { name: "Infrastructure as Code", level: "Intermediate" },
      { name: "Docker/Kubernetes", level: "Advanced" }
    ]
  },
  {
    id: "2g1e0f9g-8h7i-6j5k-4l3m-2n1o0p9q8r7s",
    company: "Amravati AeroTech",
    sector: "Aerospace/Agriculture",
    district: "Amravati",
    hiring: 20,
    satisfaction: 74,
    skills: [
      { name: "Drone Piloting", level: "Advanced" },
      { name: "UAV Maintenance", level: "Intermediate" }
    ]
  },
  {
    id: "3h2f1g0h-9i8j-7k6l-5m4n-3o2p1q0r9s8t",
    company: "Sangli PrintWorks",
    sector: "Manufacturing",
    district: "Sangli",
    hiring: 15,
    satisfaction: 70,
    skills: [
      { name: "CAD Modeling", level: "Intermediate" },
      { name: "3D Printer Operation", level: "Advanced" }
    ]
  },
  {
    id: "4i3g2h1i-0j9k-8l7m-6n5o-4p3q2r1s0t9u",
    company: "Ratnagiri Transit Solutions",
    sector: "Automotive/Transport",
    district: "Ratnagiri",
    hiring: 18,
    satisfaction: 82,
    skills: [
      { name: "Heavy EV Powertrains", level: "Advanced" },
      { name: "Bus Diagnostics", level: "Intermediate" }
    ]
  },
  {
    id: "5j4h3i2j-1k0l-9m8n-7o6p-5q4r3s2t1u0v",
    company: "Jalgaon ML Labs",
    sector: "Information Technology",
    district: "Jalgaon",
    hiring: 10,
    satisfaction: 88,
    skills: [
      { name: "Machine Learning Algorithms", level: "Advanced" },
      { name: "Python", level: "Advanced" },
      { name: "Data Modeling", level: "Advanced" }
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
    )],
    // Provide sensible defaults for new fields if not in db
    trendData: {},
    trainerRequirements: { current: 0, needed: 0, qualification: '' },
    equipmentRequirements: []
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

  // Ensure regional employers are represented
  const existingCompanies = new Set(fetched.map((e) => e.company))
  const additional = employerData.filter((e) => !existingCompanies.has(e.company))
  return [...fetched, ...additional]
}

export async function fetchDistricts() {
  const defaultDistricts = [
    'Pune', 'Mumbai', 'Nashik', 'Nagpur', 'Aurangabad', 'Thane', 
    'Kolhapur', 'Solapur', 'Amravati', 'Sangli', 'Ratnagiri', 'Jalgaon'
  ]
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
    'Trend (Forecast 2027)',
    'Trend Direction',
    'Employer Validation',
    'Placement Rate',
    'Requested Skills (Advanced)',
    'Trainer Requirements (Gap)',
    'Required Equipment'
  ]

  let totalDemand = 0;
  let totalCapacity = 0;

  const rows = (labourData || []).map((job) => {
    const demand = Number(job.demand) || 0
    const capacity = Number(job.currentCapacity) || 0
    const gap = demand - capacity
    const score = calculateDemandScore(job)
    
    totalDemand += demand;
    totalCapacity += capacity;
    
    const advancedSkills = getSkillsByLevel(job.skills, 'Advanced').map(s => s.name).join('; ')
    const forecast = calculateForecast(job.trendData)
    const direction = getTrendDirection(job.trendData)
    const trainerGap = job.trainerRequirements ? (job.trainerRequirements.needed - job.trainerRequirements.current) : 0
    const equip = job.equipmentRequirements ? job.equipmentRequirements.join('; ') : ''

    return [
      `"${job.role}"`,
      `"${job.sector}"`,
      `"${district}"`,
      demand,
      capacity,
      gap > 0 ? `+${gap}` : gap,
      score,
      `${job.growth || 0}%`,
      forecast,
      `"${direction}"`,
      `${job.employerValidation || 0}%`,
      `${job.placementRate || 0}%`,
      `"${advancedSkills}"`,
      trainerGap > 0 ? `+${trainerGap} Needed` : 'Adequate',
      `"${equip}"`
    ]
  })

  // Summary Row
  const totalGap = totalDemand - totalCapacity;
  rows.push([
    '"SUMMARY"', '""', '""', totalDemand, totalCapacity, totalGap > 0 ? `+${totalGap}` : totalGap, 
    '""', '""', '""', '""', '""', '""', '""', '""', '""'
  ])

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
    'Trainer Gap',
    'Equipment Procurement Focus',
    'Strategic Recommendation',
    'Forecast 2027'
  ]

  let totalAdjustment = 0;

  const rows = (districtLabourData || []).map((job) => {
    const demand = Number(job.demand) || 0
    const capacity = Number(job.currentCapacity) || 0
    const gap = demand - capacity
    let recommendation = 'Maintain current training capacity'
    
    if (gap > 0) {
      recommendation = `Expand training capacity by +${gap} seats to meet industry deficit`
      totalAdjustment += gap;
    } else if (gap < 0) {
      recommendation = `Review program: potential oversupply of ${Math.abs(gap)} seats`
      totalAdjustment += gap;
    }

    const trainerGap = job.trainerRequirements ? (job.trainerRequirements.needed - job.trainerRequirements.current) : 0
    const equip = job.equipmentRequirements ? job.equipmentRequirements.join('; ') : ''
    const forecast = calculateForecast(job.trendData)

    return [
      `"${job.role}"`,
      `"${job.sector}"`,
      `"${district}"`,
      demand,
      capacity,
      gap > 0 ? `+${gap} seats` : `${gap} seats`,
      trainerGap > 0 ? `+${trainerGap}` : '0',
      `"${equip}"`,
      `"${recommendation}"`,
      forecast
    ]
  })

  // Summary row
  rows.push([
    '"SUMMARY"', '""', '""', '""', '""', totalAdjustment > 0 ? `+${totalAdjustment} net seats` : `${totalAdjustment} net seats`,
    '""', '""', '""', '""'
  ])

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
