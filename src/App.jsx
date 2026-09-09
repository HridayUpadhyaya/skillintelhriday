import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import './App.css'
import { calculateDemandScore } from './data'
import {
  fetchLabourData,
  fetchCourseData,
  fetchEmployerData
} from './api'

// Sub-components to resolve ReferenceErrors
const Page = ({ children }) => <div className="page-content">{children}</div>
const Stat = ({ title, number, change }) => (
  <div className="stat-card">
    <div className="stat-title">{title}</div>
    <div className="stat-number">{number}</div>
    <div className="stat-change">{change}</div>
  </div>
)
const Role = ({ name, sector, value, width, low }) => (
  <div className="role">
    <div className="role-info">
      <strong>{name}</strong>
      <span>{sector}</span>
    </div>
    <div className="bar-container">
      <div className={`bar ${low ? 'low' : ''}`} style={{ width }}></div>
    </div>
    <strong>{value}</strong>
  </div>
)
const Alert = ({ type, title, text }) => (
  <div className={`alert alert-${type}`}>
    <strong>{title}</strong>: {text}
  </div>
)

function App() {
  const [labourData, setLabourData] = useState([])
  const [courseData, setCourseData] = useState([])
  const [employerData, setEmployerData] = useState([])

  const [loadingData, setLoadingData] = useState(true)
  const [dataError, setDataError] = useState('')

  const [selectedDistrict, setSelectedDistrict] = useState('Pune')
  const [selectedSector, setSelectedSector] = useState('All Sectors')
  const [page, setPage] = useState('Dashboard')
  
  // Career Advisor State
  const [careerInterest, setCareerInterest] = useState('All Sectors')
  const [candidateSkills, setCandidateSkills] = useState([])
  const [showCareerResults, setShowCareerResults] = useState(false)
  
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')
  const toastTimeout = useRef(null)

  // Optimized Callback for Toasts to prevent memory leaks
  const showToast = useCallback((message) => {
    setToast(message)
    if (toastTimeout.current) clearTimeout(toastTimeout.current)
    toastTimeout.current = setTimeout(() => setToast(''), 2500)
  }, [])

  const openModal = useCallback((type, payload = {}) => setModal({ type, ...payload }), [])
  const closeModal = useCallback(() => setModal(null), [])

  const downloadTextFile = useCallback((filename, content, mimeType = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }, [])

  const safeDemandScore = useCallback((job) => {
    const score = Number(calculateDemandScore(job))
    return Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0
  }, [])

  const exportLabourReport = useCallback(() => {
    const rows = filteredLabourData.map((job) => ({
      Role: job.role,
      Sector: job.sector,
      Demand: job.demand,
      Capacity: job.currentCapacity,
      Growth: job.growth,
      EmployerValidation: job.employerValidation,
      PlacementRate: job.placementRate,
      DemandScore: safeDemandScore(job)
    }))

    if (!rows.length) return showToast('No data to export.')

    const headers = Object.keys(rows[0])
    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        headers.map((header) => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n')

    downloadTextFile(
      `mahasSkillIntel-${selectedDistrict}-${selectedSector.replace(/\s+/g, '-')}.csv`,
      csv,
      'text/csv;charset=utf-8'
    )
    showToast('Report exported successfully.')
  }, [selectedDistrict, selectedSector, downloadTextFile, showToast, safeDemandScore])

  const generateDistrictPlan = useCallback(() => {
    const rows = filteredLabourData
      .map((job) => ({
        role: job.role,
        sector: job.sector,
        demand: job.demand,
        capacity: job.currentCapacity,
        gap: job.demand - job.currentCapacity
      }))
      .sort((a, b) => b.gap - a.gap)

    openModal('district-plan', { district: selectedDistrict, rows })
  }, [filteredLabourData, selectedDistrict, openModal])

  const updateCurriculum = useCallback((course) => {
    openModal('curriculum', {
      course,
      missingSkills: course.industrySkills.filter(
        (skill) => !course.currentSkills.includes(skill)
      )
    })
  }, [openModal])

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true)
        setDataError('')
        const [labour, courses, employers] = await Promise.all([
          fetchLabourData(),
          fetchCourseData(),
          fetchEmployerData()
        ])
        setLabourData(labour)
        setCourseData(courses)
        setEmployerData(employers)
      } catch (error) {
        console.error('Data loading error:', error)
        setDataError(error.message || 'Failed to load SkillIntel data.')
      } finally {
        setLoadingData(false)
      }
    }
    loadData()
  }, [])

  // Memoized derived data to prevent recalculation on every render
  const filteredLabourData = useMemo(() => {
    if (selectedSector === 'All Sectors') return labourData
    return labourData.filter((job) => job.sector.includes(selectedSector))
  }, [labourData, selectedSector])

  const { oversupplied, highGrowth, priorityJob, topSkills } = useMemo(() => {
    if (!filteredLabourData.length) return { topSkills: [] }

    const sortedByCapacity = [...filteredLabourData].sort((a, b) => 
      (b.currentCapacity - b.demand) - (a.currentCapacity - a.demand)
    )
    const sortedByGrowth = [...filteredLabourData].sort((a, b) => b.growth - a.growth)
    const sortedByGap = [...filteredLabourData].sort((a, b) => 
      (b.demand - b.currentCapacity) - (a.demand - a.currentCapacity)
    )

    const counts = filteredLabourData.flatMap((job) => job.skills || []).reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1
      return acc
    }, {})

    return {
      oversupplied: sortedByCapacity[0]?.currentCapacity > sortedByCapacity[0]?.demand ? sortedByCapacity[0] : null,
      highGrowth: sortedByGrowth[0],
      priorityJob: sortedByGap[0],
      topSkills: Object.entries(counts)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 8)
    }
  }, [filteredLabourData])

  if (loadingData) {
    return <div className="loading-state">Loading SkillIntel intelligence...</div>
  }

  if (dataError) {
    return (
      <div className="error-state">
        <h2>Unable to load SkillIntel data</h2>
        <p>{dataError}</p>
        <p>Please check your database configuration.</p>
      </div>
    )
  }

  const menuItems = [
    'Dashboard',
    'Labour Demand',
    'Skill Gaps',
    'Courses',
    'District Plans',
    'Employers',
    'Career Advisor'
  ]

  return (
    <div className="app">
      {toast && <div className="toast-notification">{toast}</div>}
      
      <aside className="sidebar">
        <div className="logo">MahaSkill<span>Intel</span></div>
        <nav>
          {menuItems.map((item) => (
            <div
              key={item}
              className={`nav-item ${page === item ? 'active' : ''}`}
              onClick={() => setPage(item)}
            >
              {item}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item borderless" onClick={() => openModal('settings')}>Settings</button>
          <button className="nav-item borderless" onClick={() => openModal('help')}>Help</button>
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <h1>{page}</h1>
            <p>Evidence-based intelligence for smarter workforce development</p>
          </div>
          <div className="profile">
            <button className="notification" onClick={() => showToast("No new notifications.")}>🔔</button>
            <div className="avatar">MH</div>
            <div>
              <strong>Admin</strong>
              <small>Govt. of Maharashtra</small>
            </div>
          </div>
        </header>

        {page === 'Dashboard' && (
          <Page>
            <div className="filters">
              <div className="filter">
                <label>District</label>
                <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
                  <option>Pune</option>
                  <option>Mumbai</option>
                  <option>Nashik</option>
                  <option>Nagpur</option>
                </select>
              </div>
              <div className="filter">
                <label>Sector</label>
                <select value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)}>
                  <option>All Sectors</option>
                  <option>Automotive</option>
                  <option>Information Technology</option>
                  <option>Renewable Energy</option>
                  <option>Manufacturing</option>
                  <option>Business Services</option>
                </select>
              </div>
              <button className="update-button" onClick={exportLabourReport}>Export Report</button>
            </div>

            <section className="stats">
              <Stat
                title="Job Openings"
                number={filteredLabourData.reduce((total, job) => total + job.demand, 0).toLocaleString()}
                change="Current market demand"
              />
              <Stat
                title="High-Demand Skills"
                number={new Set(filteredLabourData.flatMap(job => job.skills)).size}
                change="Skills requested by employers"
              />
              <Stat
                title="Courses at Risk"
                number={filteredLabourData.filter(job => job.currentCapacity > job.demand).length}
                change="Oversupply detected"
              />
              <Stat
                title="Priority Roles"
                number={filteredLabourData.filter(job => job.demand > job.currentCapacity).length}
                change="Capacity expansion needed"
              />
            </section>

            <section className="dashboard-grid">
              <div className="card">
                <div className="card-header">
                  <div>
                    <h2>Top Emerging Roles</h2>
                    <p>Current industry demand</p>
                  </div>
                  <button className="view-button" onClick={() => setPage('Labour Demand')}>View All</button>
                </div>
                <div className="role-list">
                  {!filteredLabourData.length ? (
                    <div className="empty-state">No labour data matches the filters.</div>
                  ) : (
                    filteredLabourData
                      .map((job) => ({ ...job, score: safeDemandScore(job) }))
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 5)
                      .map((job) => (
                        <Role 
                          key={job.id ?? job.role} 
                          name={job.role} 
                          sector={job.sector} 
                          value={`${job.score}%`} 
                          width={`${job.score}%`} 
                          low={job.score < 50} 
                        />
                      ))
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div>
                    <h2>Priority Alerts</h2>
                    <p>Issues requiring attention</p>
                  </div>
                </div>
                {!oversupplied && !highGrowth && !priorityJob ? (
                  <div className="empty-state">No priority signals available.</div>
                ) : (
                  <>
                    {oversupplied && <Alert type="danger" title={oversupplied.role} text="Capacity above market demand." />}
                    {highGrowth && <Alert type="success" title={highGrowth.role} text={`Highest growth: +${highGrowth.growth}%.`} />}
                    {priorityJob && priorityJob.demand > priorityJob.currentCapacity && (
                      <Alert type="warning" title={priorityJob.role} text={`Capacity gap of ${priorityJob.demand - priorityJob.currentCapacity} seats.`} />
                    )}
                  </>
                )}
              </div>
            </section>

            <section className="bottom-grid">
              <div className="card">
                <div className="card-header">
                  <div><h2>Skill Demand</h2><p>Most requested skills</p></div>
                </div>
                <div className="skill-tags">
                  {topSkills.length ? topSkills.map(([skill, count]) => (
                    <span key={skill}>{skill} · {count}</span>
                  )) : <span>No skills available</span>}
                </div>
              </div>
            </section>
          </Page>
        )}

        {page === 'Courses' && (
          <Page>
            <h2>Course Intelligence</h2>
            <p className="page-description">Compare training programmes with industry requirements.</p>
            <div className="stats">
              <Stat title="Courses Analysed" number={courseData.length} change="Industry alignment review" />
              <Stat
                title="Courses Needing Updates"
                number={courseData.filter(course => course.industrySkills.some(skill => !course.currentSkills.includes(skill))).length}
                change="Curriculum gaps detected"
              />
              <Stat
                title="Industry Alignment"
                number={courseData.length ? Math.round(courseData.reduce((total, course) => {
                  const matched = course.currentSkills.filter(skill => course.industrySkills.includes(skill)).length
                  return total + (course.industrySkills.length ? (matched / course.industrySkills.length) * 100 : 100)
                }, 0) / courseData.length) + '%' : '0%'}
                change="Average curriculum alignment"
              />
            </div>
            {/* Complete rendering course lists safely */}
            {courseData.map(course => (
               <div className="card" key={course.name}>
                  <div className="card-header">
                    <h2>{course.name}</h2>
                    <button className="primary-button" onClick={() => updateCurriculum(course)}>Analyze</button>
                  </div>
               </div>
            ))}
          </Page>
        )}
        
        {page === 'Employers' && (
          <Page>
            <h2>Employer Network</h2>
            <div className="card">
               <p>Employer mapping module coming soon.</p>
            </div>
          </Page>
        )}

        {page === 'Career Advisor' && (
          <Page>
            <h2>Career Advisor</h2>
            <div className="card">
               <p>Select your skills to discover aligned career pathways.</p>
               <button className="primary-button" onClick={() => setShowCareerResults(true)}>Find Paths</button>
               {showCareerResults && <div className="mt-4"><Alert type="success" title="Results Ready" text="Matching your profile to open demands." /></div>}
            </div>
          </Page>
        )}
      </main>
    </div>
  )
}

export default App
