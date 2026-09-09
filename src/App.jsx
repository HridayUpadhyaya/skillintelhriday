import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import './App.css'
import { calculateDemandScore } from './data'
import { fetchLabourData, fetchCourseData, fetchEmployerData } from './api'

// ── Sub-components ──────────────────────────────────────────────────

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

const Alert = ({ type, icon, title, text }) => (
  <div className={`alert ${type}`}>
    <div className="alert-icon">{icon || '!'}</div>
    <div>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  </div>
)

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h3 style={{ marginBottom: '20px' }}>{title}</h3>
        {children}
      </div>
    </div>
  )
}

// ── App ─────────────────────────────────────────────────────────────

function App() {
  const [labourData, setLabourData] = useState([])
  const [courseData, setCourseData] = useState([])
  const [employerData, setEmployerData] = useState([])

  const [loadingData, setLoadingData] = useState(true)
  const [dataError, setDataError] = useState('')

  const [selectedDistrict, setSelectedDistrict] = useState('All Districts')
  const [selectedSector, setSelectedSector] = useState('All Sectors')
  const [page, setPage] = useState('Dashboard')

  const [candidateSkillsInput, setCandidateSkillsInput] = useState('')
  const [candidateSkills, setCandidateSkills] = useState([])
  const [showCareerResults, setShowCareerResults] = useState(false)

  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')
  const toastTimeout = useRef(null)

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

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    async function loadData() {
      try {
        setLoadingData(true)
        setDataError('')
        const [labour, courses, employers] = await Promise.all([
          fetchLabourData(),
          fetchCourseData(),
          fetchEmployerData()
        ])
        if (isMounted) {
          setLabourData(labour || [])
          setCourseData(courses || [])
          setEmployerData(employers || [])
        }
      } catch (error) {
        if (controller.signal.aborted) return
        console.error('Data loading error:', error)
        if (isMounted) setDataError(error.message || 'Failed to load SkillIntel data.')
      } finally {
        if (isMounted) setLoadingData(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  // filteredLabourData MUST be above useCallbacks that depend on it
  const filteredLabourData = useMemo(() => {
    let data = labourData
    if (selectedDistrict !== 'All Districts') {
      data = data.filter((job) => (job.district || '').includes(selectedDistrict))
    }
    if (selectedSector !== 'All Sectors') {
      data = data.filter((job) => job.sector.includes(selectedSector))
    }
    return data
  }, [labourData, selectedDistrict, selectedSector])

  const { oversupplied, highGrowth, priorityJob, topSkills } = useMemo(() => {
    if (!filteredLabourData.length) {
      return { oversupplied: null, highGrowth: null, priorityJob: null, topSkills: [] }
    }

    const sortedByCapacity = [...filteredLabourData].sort(
      (a, b) =>
        ((b.currentCapacity || 0) - (b.demand || 0)) -
        ((a.currentCapacity || 0) - (a.demand || 0))
    )
    const sortedByGrowth = [...filteredLabourData].sort(
      (a, b) => (b.growth || 0) - (a.growth || 0)
    )
    const sortedByGap = [...filteredLabourData].sort(
      (a, b) =>
        ((b.demand || 0) - (b.currentCapacity || 0)) -
        ((a.demand || 0) - (a.currentCapacity || 0))
    )

    const counts = filteredLabourData
      .flatMap((job) => job.skills || [])
      .reduce((acc, skill) => {
        acc[skill] = (acc[skill] || 0) + 1
        return acc
      }, {})

    return {
      oversupplied:
        sortedByCapacity[0]?.currentCapacity > sortedByCapacity[0]?.demand
          ? sortedByCapacity[0]
          : null,
      highGrowth: sortedByGrowth[0],
      priorityJob: sortedByGap[0],
      topSkills: Object.entries(counts)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 8)
    }
  }, [filteredLabourData])

  const careerResults = useMemo(() => {
    if (!showCareerResults || !candidateSkills.length) return []
    return labourData
      .map((job) => {
        const jobSkills = (job.skills || []).map((s) => s.toLowerCase())
        const matched = candidateSkills.filter((s) =>
          jobSkills.includes(s.toLowerCase())
        )
        const gaps = (job.skills || []).filter(
          (s) => !candidateSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
        )
        const matchScore = jobSkills.length
          ? Math.round((matched.length / jobSkills.length) * 100)
          : 0
        return { ...job, matched, gaps, matchScore }
      })
      .filter((job) => job.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
  }, [labourData, candidateSkills, showCareerResults])

  const exportLabourReport = useCallback(() => {
    if (!filteredLabourData.length) {
      showToast('No data available to export.')
      return
    }
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

    const headers = Object.keys(rows[0])
    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((header) => `"${String(row[header] ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
    ].join('\n')

    downloadTextFile(
      `mahasSkillIntel-${selectedDistrict}-${selectedSector.replace(/\s+/g, '-')}.csv`,
      csv,
      'text/csv;charset=utf-8'
    )
    showToast('Report exported successfully.')
  }, [filteredLabourData, selectedDistrict, selectedSector, downloadTextFile, showToast, safeDemandScore])

  const generateDistrictPlan = useCallback(() => {
    const rows = filteredLabourData
      .map((job) => ({
        role: job.role,
        sector: job.sector,
        demand: job.demand || 0,
        capacity: job.currentCapacity || 0,
        gap: (job.demand || 0) - (job.currentCapacity || 0)
      }))
      .sort((a, b) => b.gap - a.gap)

    openModal('district-plan', { district: selectedDistrict, rows })
  }, [filteredLabourData, selectedDistrict, openModal])

  const updateCurriculum = useCallback(
    (course) => {
      const industrySkills = course.industrySkills || []
      const currentSkills = course.currentSkills || []
      const missingSkills = industrySkills.filter((skill) => !currentSkills.includes(skill))
      const alignedSkills = industrySkills.filter((skill) => currentSkills.includes(skill))
      const alignment = industrySkills.length
        ? Math.round((alignedSkills.length / industrySkills.length) * 100)
        : 100
      openModal('curriculum', { course, missingSkills, alignedSkills, alignment })
    },
    [openModal]
  )

  const analyseCourse = useCallback(
    (course) => {
      const industrySkills = course.industrySkills || []
      const currentSkills = course.currentSkills || []
      const missingSkills = industrySkills.filter((skill) => !currentSkills.includes(skill))
      const alignedSkills = industrySkills.filter((skill) => currentSkills.includes(skill))
      const alignment = industrySkills.length
        ? Math.round((alignedSkills.length / industrySkills.length) * 100)
        : 100
      openModal('course-analysis', { course, missingSkills, alignedSkills, alignment })
    },
    [openModal]
  )

  const viewEmployerSkills = useCallback(() => {
    const skills = [...new Set(employerData.flatMap((employer) => employer.skills || []))].sort(
      (a, b) => a.localeCompare(b)
    )
    openModal('skills', { skills })
  }, [employerData, openModal])

  if (loadingData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading SkillIntel intelligence…
      </div>
    )
  }

  if (dataError) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div>
          <h2>Unable to load SkillIntel data</h2>
          <p>{dataError}</p>
        </div>
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

  const districtOptions = ['All Districts', 'Pune', 'Mumbai', 'Nashik', 'Nagpur']

  return (
    <div className="app">
      {toast && <div className="toast">{toast}</div>}

      <aside className="sidebar">
        <div className="logo">
          MahaSkill<span>Intel</span>
        </div>
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
          <button
            type="button"
            className="nav-item"
            style={{ width: '100%', border: 0, background: 'transparent', textAlign: 'left' }}
            onClick={() => openModal('settings')}
          >
            ⚙️ Settings
          </button>
          <button
            type="button"
            className="nav-item"
            style={{ width: '100%', border: 0, background: 'transparent', textAlign: 'left' }}
            onClick={() => openModal('help')}
          >
            ❓ Help
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <h1>{page}</h1>
            <p>Evidence-based intelligence for smarter workforce development</p>
          </div>
          <div className="profile">
            <button
              className="notification"
              aria-label="Notifications"
              onClick={() => showToast('No new notifications.')}
            >
              🔔
            </button>
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
                  {districtOptions.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
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
              <button className="update-button" onClick={exportLabourReport}>
                Export Report
              </button>
            </div>

            <section className="stats">
              <Stat
                title="Job Openings"
                number={filteredLabourData
                  .reduce((acc, job) => acc + (job.demand || 0), 0)
                  .toLocaleString()}
                change="Current market demand"
              />
              <Stat
                title="High-Demand Skills"
                number={new Set(filteredLabourData.flatMap((job) => job.skills || [])).size}
                change="Skills requested by employers"
              />
              <Stat
                title="Courses at Risk"
                number={filteredLabourData.filter((job) => job.currentCapacity > job.demand).length}
                change="Oversupply detected"
              />
              <Stat
                title="Priority Roles"
                number={filteredLabourData.filter((job) => job.demand > job.currentCapacity).length}
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
                  <button className="view-button" onClick={() => setPage('Labour Demand')}>
                    View All
                  </button>
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
                          key={job.id}
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
                    {oversupplied && (
                      <Alert
                        type="danger"
                        icon="⚠"
                        title={oversupplied.role}
                        text="Capacity above market demand."
                      />
                    )}
                    {highGrowth && (
                      <Alert
                        type="success"
                        icon="↑"
                        title={highGrowth.role}
                        text={`Highest growth: +${highGrowth.growth}%.`}
                      />
                    )}
                    {priorityJob && priorityJob.demand > priorityJob.currentCapacity && (
                      <Alert
                        type="warning"
                        icon="!"
                        title={priorityJob.role}
                        text={`Capacity gap of ${priorityJob.demand - priorityJob.currentCapacity} seats.`}
                      />
                    )}
                  </>
                )}
              </div>
            </section>

            <section className="bottom-grid">
              <div className="card">
                <div className="card-header">
                  <div>
                    <h2>Top In-Demand Skills</h2>
                    <p>Most requested across filtered roles</p>
                  </div>
                </div>
                <div className="skill-tags">
                  {topSkills.map(([skill, count]) => (
                    <span key={skill}>
                      {skill} ({count})
                    </span>
                  ))}
                </div>
              </div>

              <div className="card recommendation">
                <div className="recommendation-label">AI RECOMMENDATION</div>
                <h2>Focus on EV &amp; Renewable Energy</h2>
                <p>
                  Analysis indicates the highest demand-supply gaps are in green energy sectors.
                  Prioritising these training programmes will yield the best placement outcomes
                  across Maharashtra districts.
                </p>
                <button className="primary-button" onClick={() => setPage('Skill Gaps')}>
                  View Skill Gaps →
                </button>
              </div>
            </section>
          </Page>
        )}

        {page === 'Labour Demand' && (
          <Page>
            <h2>Labour Market Intelligence</h2>
            <p className="page-description">
              Demand scores aggregated from employer validation, growth, and placement data.
            </p>
            <div className="card">
              <div className="role-list">
                {filteredLabourData.map((job) => {
                  const score = safeDemandScore(job)
                  return (
                    <Role
                      key={job.id}
                      name={job.role}
                      sector={job.sector}
                      value={`${score}/100`}
                      width={`${score}%`}
                      low={score < 50}
                    />
                  )
                })}
              </div>
            </div>
          </Page>
        )}

        {page === 'Skill Gaps' && (
          <Page>
            <h2>Skill Gap Intelligence</h2>
            <p className="page-description">
              Compare existing curricula against current industry requirements.
            </p>
            {courseData.map((course) => {
              const industrySkills = course.industrySkills || []
              const currentSkills = course.currentSkills || []
              const missingSkills = industrySkills.filter(
                (skill) => !currentSkills.includes(skill)
              )
              const alignedSkills = industrySkills.filter((skill) =>
                currentSkills.includes(skill)
              )
              const alignment = industrySkills.length
                ? Math.round((alignedSkills.length / industrySkills.length) * 100)
                : 100

              return (
                <div className="card skill-analysis-card" key={course.id}>
                  <div className="card-header">
                    <div>
                      <h2>{course.name}</h2>
                      <p>Industry alignment: {alignment}%</p>
                    </div>
                    <span
                      className={`gap-badge ${
                        alignment >= 80 ? 'good' : alignment >= 50 ? 'warning' : 'critical'
                      }`}
                    >
                      {alignment >= 80
                        ? 'Well Aligned'
                        : alignment >= 50
                        ? 'Needs Review'
                        : 'Critical Gaps'}
                    </span>
                  </div>

                  <div className="skill-columns">
                    <div>
                      <div className="skill-heading required">Required Skills</div>
                      {industrySkills.map((skill) => (
                        <div className="skill-item" key={skill}>
                          {currentSkills.includes(skill) ? (
                            <span className="skill-check">✓</span>
                          ) : (
                            <span className="skill-cross">✗</span>
                          )}
                          {skill}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="skill-heading missing">Missing Skills</div>
                      {missingSkills.length > 0 ? (
                        missingSkills.map((skill) => (
                          <div className="missing-skill" key={skill}>
                            {skill}
                          </div>
                        ))
                      ) : (
                        <div className="no-gap">Fully aligned — no gaps detected.</div>
                      )}
                    </div>
                  </div>

                  {missingSkills.length > 0 && (
                    <div className="gap-action">
                      <div>
                        <strong>Action Required</strong>
                        <p>Add {missingSkills.length} missing skill(s) to curriculum.</p>
                      </div>
                      <button className="primary-button" onClick={() => updateCurriculum(course)}>
                        Update Curriculum →
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </Page>
        )}

        {page === 'District Plans' && (
          <Page>
            <h2>District Training Planner</h2>
            <p className="page-description">
              Plan training capacity allocation based on market demand signals.
            </p>
            <div className="filters">
              <div className="filter">
                <label>District</label>
                <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
                  {districtOptions.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
              <button className="update-button" onClick={generateDistrictPlan}>
                Generate Plan
              </button>
            </div>
            <div className="card">
              {filteredLabourData.length === 0 ? (
                <div className="empty-state">No roles match the selected district.</div>
              ) : (
                filteredLabourData.map((job) => {
                  const gap = (job.demand || 0) - (job.currentCapacity || 0)
                  const percentage = job.demand
                    ? Math.round(((job.currentCapacity || 0) / job.demand) * 100)
                    : 100
                  return (
                    <div className="district-plan-row" key={job.id}>
                      <div className="district-role">
                        <strong>{job.role}</strong>
                        <span>{job.sector}</span>
                      </div>
                      <div className="district-numbers">
                        <div>
                          <small>Demand</small>
                          <strong>{job.demand || 0}</strong>
                        </div>
                        <div>
                          <small>Capacity</small>
                          <strong>{job.currentCapacity || 0}</strong>
                        </div>
                      </div>
                      <div>
                        <div className="capacity-label">
                          <span>Capacity</span>
                          <strong>{percentage}%</strong>
                        </div>
                        <div className="capacity-bar">
                          <div style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                        </div>
                      </div>
                      <div className={`plan-recommendation ${gap > 0 ? 'increase' : 'reduce'}`}>
                        <strong>
                          {gap > 0 ? `+${gap} seats needed` : `${Math.abs(gap)} seat surplus`}
                        </strong>
                        <span>
                          {gap > 0 ? 'Increase training capacity' : 'Consider reducing intake'}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Page>
        )}

        {page === 'Courses' && (
          <Page>
            <h2>Course Intelligence</h2>
            <p className="page-description">
              Compare existing training programmes with current industry requirements.
            </p>
            <div className="stats">
              <Stat
                title="Courses Analysed"
                number={courseData.length}
                change="Industry alignment review"
              />
              <Stat
                title="Courses Needing Updates"
                number={
                  courseData.filter((c) =>
                    (c.industrySkills || []).some(
                      (skill) => !(c.currentSkills || []).includes(skill)
                    )
                  ).length
                }
                change="Curriculum gaps detected"
              />
              <Stat
                title="Industry Alignment"
                number={
                  courseData.length
                    ? Math.round(
                        courseData.reduce((total, course) => {
                          const matched = (course.currentSkills || []).filter((skill) =>
                            (course.industrySkills || []).includes(skill)
                          ).length
                          return (
                            total +
                            (course.industrySkills?.length
                              ? (matched / course.industrySkills.length) * 100
                              : 100)
                          )
                        }, 0) / courseData.length
                      ) + '%'
                    : '0%'
                }
                change="Average curriculum alignment"
              />
              <Stat
                title="Skills Tracked"
                number={
                  new Set(
                    courseData.flatMap((c) => [
                      ...(c.industrySkills || []),
                      ...(c.currentSkills || [])
                    ])
                  ).size
                }
                change="Across all programmes"
              />
            </div>

            <div className="card">
              {courseData.map((course) => {
                const industrySkills = course.industrySkills || []
                const currentSkills = course.currentSkills || []
                const alignedSkills = industrySkills.filter((skill) =>
                  currentSkills.includes(skill)
                )
                const alignment = industrySkills.length
                  ? Math.round((alignedSkills.length / industrySkills.length) * 100)
                  : 100

                return (
                  <div className="course-row" key={course.id}>
                    <div className="course-main">
                      <strong>{course.name}</strong>
                      <span>Duration: {course.duration || 'N/A'}</span>
                    </div>
                    <div>
                      <div className="alignment-label">
                        <span>Alignment</span>
                        <strong>{alignment}%</strong>
                      </div>
                      <div className="alignment-bar">
                        <div
                          className="alignment-fill"
                          style={{ width: `${alignment}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`course-status ${
                          alignment >= 80
                            ? 'status-good'
                            : alignment >= 50
                            ? 'status-warning'
                            : 'status-danger'
                        }`}
                      >
                        {alignment >= 80
                          ? 'Aligned'
                          : alignment >= 50
                          ? 'Needs Review'
                          : 'Critical'}
                      </span>
                    </div>
                    <div className="course-gaps">
                      <strong>Skill Coverage</strong>
                      {industrySkills.map((skill) => (
                        <span
                          key={skill}
                          className={
                            currentSkills.includes(skill) ? 'skill-match' : 'skill-gap'
                          }
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Page>
        )}

        {page === 'Employers' && (
          <Page>
            <h2>Employer Network</h2>
            <p className="page-description">
              Industry partner validation and hiring intelligence.
            </p>
            <div className="stats">
              <Stat
                title="Partner Companies"
                number={employerData.length}
                change="Active employer network"
              />
              <Stat
                title="Avg. Satisfaction"
                number={
                  employerData.length
                    ? Math.round(
                        employerData.reduce((a, e) => a + (e.satisfaction || 0), 0) /
                          employerData.length
                      ) + '%'
                    : '0%'
                }
                change="Graduate quality rating"
              />
              <Stat
                title="Total Hiring"
                number={employerData.reduce((a, e) => a + (e.hiring || 0), 0)}
                change="Open positions"
              />
              <Stat
                title="Unique Skills"
                number={new Set(employerData.flatMap((e) => e.skills || [])).size}
                change="Industry requirements"
              />
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <h2>Employer Validation Data</h2>
                  <p>Hiring activity and skill requirements by company</p>
                </div>
                <button className="view-button" onClick={viewEmployerSkills}>
                  View All Skills
                </button>
              </div>
              {employerData.map((employer) => (
                <div className="employer-row" key={employer.id}>
                  <div className="employer-company">
                    <strong>{employer.company}</strong>
                    <span>
                      {employer.sector} · {employer.district}
                    </span>
                  </div>
                  <div className="employer-metric">
                    <small>Satisfaction</small>
                    <div className="metric-bar">
                      <div style={{ width: `${employer.satisfaction || 0}%` }}></div>
                    </div>
                    <strong>{employer.satisfaction}%</strong>
                  </div>
                  <div className="employer-metric">
                    <small>Hiring</small>
                    <strong>{employer.hiring} positions</strong>
                  </div>
                  <div className="employer-skills">
                    <small>Required Skills</small>
                    {(employer.skills || []).map((skill) => (
                      <span className="employer-skill" key={skill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Page>
        )}

        {page === 'Career Advisor' && (
          <Page>
            <h2>Career Advisor</h2>
            <p className="page-description">
              Discover aligned career pathways based on your current skill set.
            </p>

            <div className="card career-input-card">
              <div className="card-header">
                <div>
                  <h2>Your Skills</h2>
                  <p>Select or type your current skills</p>
                </div>
              </div>

              <div className="career-skill-section">
                <h3>Popular Skills (click to toggle)</h3>
                <div className="career-skills">
                  {[
                    'Python',
                    'SQL',
                    'Data Analytics',
                    'Battery Diagnostics',
                    'CNC Programming',
                    'Solar Installation',
                    'Automation',
                    'Robotics',
                    'EV Electrical Systems',
                    'BMS'
                  ].map((skill) => (
                    <button
                      key={skill}
                      className={`career-skill ${
                        candidateSkills.includes(skill) ? 'selected' : ''
                      }`}
                      onClick={() => {
                        setCandidateSkills((prev) =>
                          prev.includes(skill)
                            ? prev.filter((s) => s !== skill)
                            : [...prev, skill]
                        )
                        setShowCareerResults(false)
                      }}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Or type: React, Python, Management (comma separated, press Enter)"
                  value={candidateSkillsInput}
                  onChange={(e) => setCandidateSkillsInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const typed = candidateSkillsInput
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                      setCandidateSkills((prev) => [...new Set([...prev, ...typed])])
                      setCandidateSkillsInput('')
                      setShowCareerResults(false)
                    }
                  }}
                  style={{
                    padding: '10px 12px',
                    width: '100%',
                    maxWidth: '400px',
                    borderRadius: '7px',
                    border: '1px solid #dce2ea',
                    fontSize: '13px'
                  }}
                />
              </div>

              {candidateSkills.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <small style={{ color: '#697386' }}>Selected: </small>
                  {candidateSkills.map((skill) => (
                    <span
                      key={skill}
                      className="career-match"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setCandidateSkills((prev) => prev.filter((s) => s !== skill))
                        setShowCareerResults(false)
                      }}
                    >
                      {skill} ✕
                    </span>
                  ))}
                </div>
              )}

              <button
                className="primary-button"
                onClick={() => {
                  if (!candidateSkills.length) return showToast('Please select at least one skill.')
                  setShowCareerResults(true)
                }}
              >
                Find Career Paths
              </button>
            </div>

            {showCareerResults && (
              <div className="card career-results">
                <div className="card-header">
                  <div>
                    <h2>Recommended Career Paths</h2>
                    <p>Ranked by skill match percentage</p>
                  </div>
                </div>
                {careerResults.length === 0 ? (
                  <div className="empty-state">
                    No matching career paths found. Try adding more skills.
                  </div>
                ) : (
                  careerResults.map((job) => (
                    <div className="career-result" key={job.id}>
                      <div className="career-result-main">
                        <div>
                          <h3>{job.role}</h3>
                          <span>{job.sector}</span>
                        </div>
                        <div className="career-score">
                          <strong>{job.matchScore}%</strong>
                          <small>match score</small>
                        </div>
                      </div>
                      <div className="career-metrics">
                        <div>
                          <small>Demand</small>
                          <strong>{job.demand}</strong>
                        </div>
                        <div>
                          <small>Growth</small>
                          <strong
                            className={job.growth >= 0 ? 'positive-text' : 'negative-text'}
                          >
                            {job.growth > 0 ? '+' : ''}
                            {job.growth}%
                          </strong>
                        </div>
                        <div>
                          <small>Placement Rate</small>
                          <strong>{job.placementRate}%</strong>
                        </div>
                        <div>
                          <small>Employer Validation</small>
                          <strong>{job.employerValidation}%</strong>
                        </div>
                      </div>
                      <div className="career-matched">
                        <small>Matched Skills</small>
                        {job.matched.map((s) => (
                          <span key={s} className="career-match">
                            {s}
                          </span>
                        ))}
                      </div>
                      {job.gaps.length > 0 && (
                        <div className="career-matched">
                          <small>Skills to Develop</small>
                          {job.gaps.map((s) => (
                            <span key={s} className="career-gap">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </Page>
        )}
      </main>

      <Modal
        isOpen={modal !== null}
        onClose={closeModal}
        title={
          modal?.type === 'settings'
            ? 'Application Settings'
            : modal?.type === 'help'
            ? 'Help & Documentation'
            : modal?.type === 'district-plan'
            ? `Action Plan: ${modal?.district}`
            : modal?.type === 'curriculum'
            ? `Curriculum Update: ${modal?.course?.name}`
            : modal?.type === 'course-analysis'
            ? `Analysis: ${modal?.course?.name}`
            : modal?.type === 'skills'
            ? 'Consolidated Employer Skills'
            : 'Information'
        }
      >
        {modal?.type === 'settings' && (
          <div className="modal-list">
            <div className="modal-section">
              <strong>Theme</strong>
              <span>Light</span>
            </div>
            <div className="modal-section">
              <strong>Language</strong>
              <span>English</span>
            </div>
            <div className="modal-section">
              <strong>Data Source</strong>
              <span>Maharashtra LMIS</span>
            </div>
            <p style={{ marginTop: '16px', color: '#697386' }}>
              Advanced settings require backend API configuration.
            </p>
          </div>
        )}

        {modal?.type === 'help' && (
          <div className="modal-list">
            <p>
              MahaSkillIntel provides evidence-based intelligence for smarter workforce
              development across Maharashtra.
            </p>
            <p>
              <strong>Dashboard</strong> — Overview of market signals, alerts, and top skills.
            </p>
            <p>
              <strong>Labour Demand</strong> — Demand scores computed from employer validation,
              growth rate, and supply gaps.
            </p>
            <p>
              <strong>Skill Gaps</strong> — Curriculum vs. industry skill alignment analysis.
            </p>
            <p>
              <strong>Courses</strong> — Training programme intelligence with alignment scores.
            </p>
            <p>
              <strong>District Plans</strong> — Capacity planning recommendations per district.
            </p>
            <p>
              <strong>Employers</strong> — Partner company hiring data and skill requirements.
            </p>
            <p>
              <strong>Career Advisor</strong> — Personalised career path matching based on your
              skills.
            </p>
          </div>
        )}

        {modal?.type === 'district-plan' && modal.rows && (
          <div className="modal-list">
            <p>
              <strong>Priority roles requiring capacity intervention:</strong>
            </p>
            {modal.rows
              .filter((r) => r.gap > 0)
              .slice(0, 5)
              .map((row, idx) => (
                <div className="modal-section" key={idx}>
                  <strong>{row.role}</strong>
                  <span className="negative-text">Gap: {row.gap} seats</span>
                </div>
              ))}
            {modal.rows.filter((r) => r.gap <= 0).length > 0 && (
              <>
                <p style={{ marginTop: '16px' }}>
                  <strong>Surplus roles (consider reducing):</strong>
                </p>
                {modal.rows
                  .filter((r) => r.gap <= 0)
                  .map((row, idx) => (
                    <div className="modal-section" key={`s-${idx}`}>
                      <strong>{row.role}</strong>
                      <span className="positive-text">
                        Surplus: {Math.abs(row.gap)} seats
                      </span>
                    </div>
                  ))}
              </>
            )}
          </div>
        )}

        {(modal?.type === 'curriculum' || modal?.type === 'course-analysis') && (
          <div className="modal-list">
            <div className="modal-section">
              <strong>Alignment Score</strong>
              <span>{modal.alignment ?? 'N/A'}%</span>
            </div>
            <div className="modal-section">
              <strong>Aligned Skills</strong>
              <span>{modal.alignedSkills?.length || 0}</span>
            </div>
            <div className="modal-section">
              <strong>Missing Skills</strong>
              <span className={modal.missingSkills?.length ? 'negative-text' : ''}>
                {modal.missingSkills?.length || 0}
              </span>
            </div>
            {modal.missingSkills?.length > 0 && (
              <>
                <p style={{ marginTop: '16px' }}>
                  <strong>Skills to add to curriculum:</strong>
                </p>
                {modal.missingSkills.map((s, i) => (
                  <div className="missing-skill" key={i}>
                    {s}
                  </div>
                ))}
              </>
            )}
            {!modal.missingSkills?.length && (
              <div className="no-gap" style={{ marginTop: '16px' }}>
                Fully Aligned — no curriculum changes needed.
              </div>
            )}
          </div>
        )}

        {modal?.type === 'skills' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {modal.skills?.map((skill, idx) => (
              <span className="employer-skill" key={idx}>
                {skill}
              </span>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default App
