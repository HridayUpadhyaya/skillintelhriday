import { useEffect, useState, useMemo } from 'react'
import './App.css'
import {
  fetchLabourData,
  fetchCourseData,
  fetchEmployerData,
  fetchDistricts,
  calculateDemandScore,
  getJobForDistrict,
  exportIntelligenceReport,
  exportDistrictActionPlan,
  labourData as mockLabourData,
  courseData as mockCourseData,
  employerData as mockEmployerData,
  PROFICIENCY_LEVELS,
  getSkillNames,
  getSkillsByLevel,
  fuzzySkillMatch,
  findMatchingSkills,
  calculateForecast,
  getTrendDirection
} from './api'

const DEFAULT_DISTRICTS = ['All Districts', 'Pune', 'Mumbai', 'Nashik', 'Nagpur']

function App() {
  const [labourData, setLabourData] = useState([])
  const [courseData, setCourseData] = useState([])
  const [employerData, setEmployerData] = useState([])
  const [districts, setDistricts] = useState(DEFAULT_DISTRICTS)

  const [loadingData, setLoadingData] = useState(true)
  const [isUsingFallback, setIsUsingFallback] = useState(false)
  const [fallbackReason, setFallbackReason] = useState('')

  const [selectedDistrict, setSelectedDistrict] = useState('Pune')
  const [selectedSector, setSelectedSector] = useState('All Sectors')
  const [employerSector, setEmployerSector] = useState('All Sectors')
  const [employerDistrict, setEmployerDistrict] = useState('All Districts')
  const [page, setPage] = useState('Dashboard')
  
  // Skill Gaps Filters
  const [skillGapsProficiency, setSkillGapsProficiency] = useState('All Levels')

  // Career Advisor State
  const [careerInterest, setCareerInterest] = useState('All Sectors')
  const [candidateSkills, setCandidateSkills] = useState([])
  const [showCareerResults, setShowCareerResults] = useState(false)
  const [educationLevel, setEducationLevel] = useState('10th Pass')
  const [experienceLevel, setExperienceLevel] = useState('Fresher')

  // Notification Toast & Modal states
  const [toast, setToast] = useState(null)
  const [activeModal, setActiveModal] = useState(null)

  // Curriculum Update Wizard state
  const [wizard, setWizard] = useState(null)

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev))
    }, 3200)
  }

  function openCurriculumWizard(course, missingSkills) {
    setWizard({
      course,
      missingSkills,
      selected: missingSkills,
      step: 1
    })
  }

  function toggleWizardSkill(skill) {
    setWizard((prev) => {
      if (!prev) return prev
      const alreadySelected = prev.selected.includes(skill)
      return {
        ...prev,
        selected: alreadySelected
          ? prev.selected.filter((s) => s !== skill)
          : [...prev.selected, skill]
      }
    })
  }

  function applyCurriculumUpdate() {
    setWizard((prev) => {
      if (!prev) return prev

      setCourseData((courses) =>
        courses.map((c) => {
          const isMatch = prev.course.id ? c.id === prev.course.id : c.name === prev.course.name
          if (!isMatch) return c
          // Map string selection back to skill objects if needed, but the current structure expects strings for currentSkills. 
          // We will store just the names since that's what the original code did.
          const currentStrings = getSkillNames(c.currentSkills || [])
          const mergedSkills = [...new Set([...currentStrings, ...prev.selected])].map(name => ({name, level: 'Beginner'}))
          return { ...c, currentSkills: mergedSkills }
        })
      )

      return { ...prev, step: 3 }
    })
  }

  function closeWizard() {
    setWizard(null)
  }

  async function handleRetry() {
    setLoadingData(true)
    try {
      const [labour, courses, employers, fetchedDistricts] = await Promise.all([
        fetchLabourData(),
        fetchCourseData(),
        fetchEmployerData(),
        fetchDistricts()
      ])

      setLabourData(labour)
      setCourseData(courses)
      setEmployerData(employers)
      setDistricts([...new Set([...DEFAULT_DISTRICTS, ...(fetchedDistricts || [])])])
      setIsUsingFallback(false)
      setFallbackReason('')
      showToast('Connected to Supabase live database!', 'success')
    } catch (error) {
      console.warn('Supabase retry failed:', error)
      setIsUsingFallback(true)
      setFallbackReason(error.message || 'Supabase unavailable')
      showToast('Database still unreachable. Continuing in offline mode.', 'info')
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    let ignore = false

    async function initLoad() {
      try {
        const [labour, courses, employers, fetchedDistricts] = await Promise.all([
          fetchLabourData(),
          fetchCourseData(),
          fetchEmployerData(),
          fetchDistricts()
        ])

        if (!ignore) {
          setLabourData(labour)
          setCourseData(courses)
          setEmployerData(employers)
          setDistricts([...new Set([...DEFAULT_DISTRICTS, ...(fetchedDistricts || [])])])
          setIsUsingFallback(false)
          setFallbackReason('')
          setLoadingData(false)
        }
      } catch (error) {
        if (!ignore) {
          console.warn('Supabase fetch failed; seamlessly using local dataset:', error)
          setLabourData(mockLabourData)
          setCourseData(mockCourseData)
          setEmployerData(mockEmployerData)
          setIsUsingFallback(true)
          setFallbackReason(error.message || 'Supabase unavailable')
          setLoadingData(false)
        }
      }
    }

    initLoad()
    return () => {
      ignore = true
    }
  }, [])


  const allSectors = useMemo(() => {
    const sectors = new Set(['All Sectors'])
    labourData.forEach((job) => {
      if (job.sector) {
        sectors.add(job.sector)
      }
    })
    return Array.from(sectors)
  }, [labourData])

  const filteredLabourData = useMemo(() => {
    return labourData
      .filter((job) => {
        if (selectedSector === 'All Sectors') return true
        return (job.sector || '').includes(selectedSector)
      })
      .map((job) => getJobForDistrict(job, selectedDistrict))
  }, [labourData, selectedSector, selectedDistrict])

  const topDemandSkills = useMemo(() => {
    const countMap = {}
    filteredLabourData.forEach((job) => {
      getSkillNames(job.skills || []).forEach((skill) => {
        countMap[skill] = (countMap[skill] || 0) + 1
      })
    })
    const sorted = Object.keys(countMap).sort((a, b) => countMap[b] - countMap[a])
    return sorted.slice(0, 6)
  }, [filteredLabourData])

  const dynamicAlerts = useMemo(() => {
    const alerts = []
    const oversupplied = filteredLabourData.find((job) => (job.currentCapacity || 0) > (job.demand || 0))
    if (oversupplied) {
      alerts.push({
        type: 'danger',
        title: oversupplied.role,
        text: `Training capacity (${oversupplied.currentCapacity}) exceeds demand (${oversupplied.demand}). Review program seats.`
      })
    } else {
      alerts.push({
        type: 'danger',
        title: 'Data Entry Operator',
        text: 'Course appears oversupplied relative to market demands.'
      })
    }

    const gapCourse = courseData.find((course) => {
      const industry = getSkillNames(course.industrySkills || [])
      const current = getSkillNames(course.currentSkills || [])
      const missing = industry.filter((s) => !current.includes(s))
      return missing.length >= 2
    })
    if (gapCourse) {
      const industry = getSkillNames(gapCourse.industrySkills || [])
      const current = getSkillNames(gapCourse.currentSkills || [])
      const missingCount = industry.filter((s) => !current.includes(s)).length
      alerts.push({
        type: 'warning',
        title: gapCourse.name,
        text: `${missingCount} critical industry skill gap${missingCount > 1 ? 's' : ''} detected in curriculum.`
      })
    } else {
      alerts.push({
        type: 'warning',
        title: 'Curriculum Review',
        text: 'Regular audit recommended to maintain industry alignment.'
      })
    }

    const highGrowth = [...filteredLabourData].sort((a, b) => (b.growth || 0) - (a.growth || 0))[0]
    if (highGrowth && highGrowth.growth > 0) {
      alerts.push({
        type: 'success',
        title: highGrowth.role,
        text: `Strong growth of +${highGrowth.growth}% detected with high employer validation.`
      })
    } else {
      alerts.push({
        type: 'success',
        title: 'Market Signal',
        text: 'Technical sectors demonstrate steady hiring interest.'
      })
    }

    return alerts
  }, [filteredLabourData, courseData])

  // Dashboard AI Recommendation
  const dashboardRecommendation = useMemo(() => {
    if (filteredLabourData.length === 0) return null
    const undersupplied = [...filteredLabourData].sort((a, b) => 
      ((b.demand || 0) - (b.currentCapacity || 0)) - ((a.demand || 0) - (a.currentCapacity || 0))
    )[0]
    if (!undersupplied || (undersupplied.demand || 0) <= (undersupplied.currentCapacity || 0)) return null
    return {
      title: `Increase ${undersupplied.role} training capacity`,
      text: `Industry demand for ${undersupplied.role} in ${undersupplied.sector} is growing while current training capacity remains below projected requirements.`
    }
  }, [filteredLabourData])

  // Courses AI Recommendation
  const courseRecommendation = useMemo(() => {
    if (courseData.length === 0) return null
    const coursesWithAlignment = courseData.map(course => {
      const industry = getSkillNames(course.industrySkills || [])
      const current = getSkillNames(course.currentSkills || [])
      const missingSkills = industry.filter(skill => !current.includes(skill))
      const alignment = industry.length > 0 ? Math.round(((industry.length - missingSkills.length) / industry.length) * 100) : 100
      return { course, alignment, missingSkills }
    }).sort((a, b) => a.alignment - b.alignment)
    
    const lowest = coursesWithAlignment[0]
    if (lowest.alignment === 100 || lowest.missingSkills.length === 0) return null
    return {
      course: lowest.course,
      missingSkills: lowest.missingSkills,
      title: `Prioritise ${lowest.course.name} curriculum revision`,
      text: `Industry requirements currently exceed the skills covered by the existing ${lowest.course.name} curriculum. Add ${lowest.missingSkills.slice(0, 3).join(', ')} to improve job readiness.`
    }
  }, [courseData])

  // Employers AI Recommendation
  const employerRecommendation = useMemo(() => {
    if (employerData.length === 0) return null
    const filteredEmps = employerData.filter((emp) => {
      const matchDistrict = employerDistrict === 'All Districts' || emp.district === employerDistrict
      const matchSector = employerSector === 'All Sectors' || (emp.sector || '').includes(employerSector)
      return matchDistrict && matchSector
    })
    if (filteredEmps.length === 0) return null
    
    const skillCounts = {}
    filteredEmps.forEach(emp => {
      getSkillNames(emp.skills || []).forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1
      })
    })
    const topSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(e => e[0])
    if (topSkills.length === 0) return null
    return {
      title: 'Employers are prioritising emerging technical skills',
      text: `Employer feedback indicates strong demand for ${topSkills.join(', ')}. These requirements should be reflected in technical training curricula.`
    }
  }, [employerData, employerDistrict, employerSector])

  const filteredEmployers = useMemo(() => {
    return employerData.filter((emp) => {
      const matchDistrict = employerDistrict === 'All Districts' || emp.district === employerDistrict
      const matchSector = employerSector === 'All Sectors' || (emp.sector || '').includes(employerSector)
      return matchDistrict && matchSector
    })
  }, [employerData, employerDistrict, employerSector])

  const districtLabourData = useMemo(() => {
    return labourData.map((job) => getJobForDistrict(job, selectedDistrict))
  }, [labourData, selectedDistrict])

  // District Plans Recommendation
  const districtRecommendation = useMemo(() => {
    if (districtLabourData.length === 0) return null
    const undersupplied = [...districtLabourData].sort((a, b) => 
      ((b.demand || 0) - (b.currentCapacity || 0)) - ((a.demand || 0) - (a.currentCapacity || 0))
    )[0]
    if (!undersupplied || (undersupplied.demand || 0) <= (undersupplied.currentCapacity || 0)) return null
    return {
      title: `Prioritise capacity expansion for ${undersupplied.role}`,
      text: `Training capacity for ${undersupplied.role} should be increased where projected industry demand exceeds available seats. Oversupplied programmes should be reviewed before adding new capacity.`
    }
  }, [districtLabourData])

  if (loadingData) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, Arial, sans-serif',
          fontSize: '18px',
          color: '#172033'
        }}
      >
        Loading SkillIntel intelligence...
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
      <aside className="sidebar">
        <div className="logo" onClick={() => setPage('Dashboard')} style={{ cursor: 'pointer' }}>
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
          <div className="nav-item" onClick={() => setActiveModal('settings')}>
            Settings
          </div>
          <div className="nav-item" onClick={() => setActiveModal('help')}>
            Help
          </div>
        </div>
      </aside>

      <main className="main">
        {isUsingFallback && (
          <div className="data-mode-banner">
            <div>
              <strong>Offline / Demo Mode:</strong> Using local SkillIntel dataset ({fallbackReason || 'Database offline'}).
            </div>
            <button onClick={handleRetry}>
              Retry Connection
            </button>
          </div>
        )}

        <header className="header">
          <div>
            <h1>{page}</h1>
            <p>Evidence-based intelligence for smarter workforce development</p>
          </div>

          <div className="profile">
            <div
              className="notification"
              onClick={() => showToast('All data and intelligence feeds are up to date.', 'info')}
              style={{ cursor: 'pointer' }}
              title="Notifications"
            >
              🔔
            </div>
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
                  {districts.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="filter">
                <label>Sector</label>
                <select value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)}>
                  {allSectors.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <button
                className="update-button"
                onClick={() => {
                  const filename = exportIntelligenceReport({
                    district: selectedDistrict,
                    sector: selectedSector,
                    labourData: filteredLabourData
                  })
                  showToast(`Exported report: ${filename} saved to Downloads!`, 'success')
                }}
              >
                Export Report
              </button>
            </div>

            <div className="card executive-insight">
              <div className="executive-icon">✦</div>
              <div className="executive-content">
                <div className="recommendation-label">EXECUTIVE MARKET INSIGHT</div>
                <h2>Training capacity should follow emerging industry demand</h2>
                <p>
                  MahaSkillIntel identifies where employer demand is growing faster
                  than existing training capacity. Priority should be given to
                  emerging technical roles while reviewing programmes with
                  persistent oversupply.
                </p>
                <div className="insight-points">
                  <div>
                    <strong>01</strong>
                    <span>Identify high-growth occupations</span>
                  </div>
                  <div>
                    <strong>02</strong>
                    <span>Close critical curriculum gaps</span>
                  </div>
                  <div>
                    <strong>03</strong>
                    <span>Align district training capacity</span>
                  </div>
                </div>
              </div>
            </div>

            <section className="stats">
              <Stat
                title="Job Openings"
                number={filteredLabourData.reduce((total, job) => total + (job.demand || 0), 0).toLocaleString()}
                change={selectedDistrict === 'All Districts' ? 'Total across all districts' : `${selectedDistrict} market demand`}
              />
              <Stat
                title="High-Demand Skills"
                number={new Set(filteredLabourData.flatMap((job) => getSkillNames(job.skills || []))).size}
                change="Skills requested by employers"
              />
              <Stat
                title="Courses at Risk"
                number={filteredLabourData.filter((job) => (job.currentCapacity || 0) > (job.demand || 0)).length}
                change="Oversupply detected"
              />
              <Stat
                title="Priority Roles"
                number={filteredLabourData.filter((job) => (job.demand || 0) > (job.currentCapacity || 0)).length}
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
                  {filteredLabourData.map((job) => {
                    const score = calculateDemandScore(job)
                    return (
                      <div className="role" key={job.id || job.role}>
                        <div className="role-info">
                          <strong>{job.role}</strong>
                          <span>{job.sector}</span>
                        </div>
                        <div className="bar-container">
                          <div
                            className={`bar ${score < 50 ? 'low' : ''}`}
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                        <strong>{score}%</strong>
                      </div>
                    )
                  })}
                  {filteredLabourData.length === 0 && (
                    <div className="empty-state">
                      No roles found for sector &ldquo;{selectedSector}&rdquo;.
                    </div>
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
                {dynamicAlerts.map((alert, idx) => (
                  <Alert
                    key={idx}
                    type={alert.type}
                    title={alert.title}
                    text={alert.text}
                  />
                ))}
              </div>
            </section>

            <section className="bottom-grid">
              <div className="card">
                <div className="card-header">
                  <div>
                    <h2>Skill Demand</h2>
                    <p>Most requested skills by employers</p>
                  </div>
                </div>
                <div className="skill-tags">
                  {topDemandSkills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                  {topDemandSkills.length === 0 && (
                    <span style={{ color: '#8992a2' }}>No skills recorded</span>
                  )}
                </div>
              </div>

              <div className="card recommendation">
                <div className="recommendation-label">AI RECOMMENDATION</div>
                <h2>{dashboardRecommendation ? dashboardRecommendation.title : 'Market Balanced'}</h2>
                <p>
                  {dashboardRecommendation ? dashboardRecommendation.text : 'Supply and demand are currently well-balanced across training programmes in the selected sector and district.'}
                </p>
                {dashboardRecommendation && (
                  <button className="primary-button" onClick={() => setPage('District Plans')}>
                    View Recommendation →
                  </button>
                )}
              </div>
            </section>
          </Page>
        )}

        {page === 'Labour Demand' && (
          <Page>
            <h2>Labour Market Intelligence</h2>
            <p className="page-description" style={{ marginBottom: '20px' }}>
              Identify growing occupations, industry demand and emerging employment opportunities.
            </p>

            <div className="filters" style={{ marginBottom: '22px' }}>
              <div className="filter">
                <label>District</label>
                <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
                  {districts.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="filter">
                <label>Sector</label>
                <select value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)}>
                  {allSectors.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="stats">
              <Stat
                title="Job Openings"
                number={filteredLabourData.reduce((total, job) => total + (job.demand || 0), 0).toLocaleString()}
                change={selectedDistrict === 'All Districts' ? 'Total across all districts' : `${selectedDistrict} market demand`}
              />
              <Stat
                title="High-Demand Skills"
                number={new Set(filteredLabourData.flatMap((job) => getSkillNames(job.skills || []))).size}
                change="Skills requested by employers"
              />
              <Stat
                title="Courses at Risk"
                number={filteredLabourData.filter((job) => (job.currentCapacity || 0) > (job.demand || 0)).length}
                change="Oversupply detected"
              />
              <Stat
                title="Roles Analysed"
                number={filteredLabourData.length}
                change={selectedSector === 'All Sectors' ? 'All active industry sectors' : `Sector: ${selectedSector}`}
              />
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <h2>Demand by Occupation</h2>
                  <p>Current market demand score</p>
                </div>
              </div>
              {filteredLabourData.map((job) => {
                const score = calculateDemandScore(job)
                return (
                  <Role
                    key={job.id || job.role}
                    name={job.role}
                    sector={job.sector}
                    value={`${score}/100`}
                    width={`${score}%`}
                    low={score < 50}
                  />
                )
              })}
              {filteredLabourData.length === 0 && (
                <div className="empty-state">
                  No roles match the selected sector filter.
                </div>
              )}
            </div>

            <div className="card intelligence-card">
              <div className="card-header">
                <div>
                  <h2>Intelligence Signals</h2>
                  <p>Evidence contributing to labour-demand decisions</p>
                </div>
              </div>
              {filteredLabourData.map((job) => {
                const score = calculateDemandScore(job)
                const growth = Number(job.growth) || 0
                return (
                  <div className="intelligence-row" key={job.id || job.role}>
                    <div className="intelligence-role">
                      <strong>{job.role}</strong>
                      <span>{job.sector}</span>
                    </div>
                    <div>
                      <small>Trend Forecast</small>
                      <div className="trend-chart" style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '40px', marginTop: '4px' }}>
                        {Object.entries(job.trendData || {}).map(([year, value]) => {
                          const maxVal = Math.max(...Object.values(job.trendData || {}))
                          const height = maxVal > 0 ? (value / maxVal) * 40 : 0
                          const isProjected = year.includes('projected')
                          return (
                            <div 
                              key={year} 
                              className={`trend-bar ${isProjected ? 'projected' : ''}`} 
                              style={{ height: `${height}px`, width: '8px', background: isProjected ? '#2f6feb' : '#8992a2' }} 
                              title={`${year}: ${value}`} 
                            />
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <small>Direction</small>
                      <div>
                        <span className={`trend-badge trend-${(getTrendDirection(job.trendData) || 'stable').toLowerCase()}`}>
                          {getTrendDirection(job.trendData) === 'Rising' ? '↑' : getTrendDirection(job.trendData) === 'Declining' ? '↓' : '→'} {getTrendDirection(job.trendData) || 'Stable'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <small>Growth</small>
                      <strong>{growth > 0 ? '+' : ''}{growth}%</strong>
                    </div>
                    <div>
                      <small>Employer Validation</small>
                      <strong>{job.employerValidation || 0}%</strong>
                    </div>
                    <div>
                      <small>Demand Score</small>
                      <strong className={score >= 70 ? 'positive-text' : 'negative-text'}>
                        {score}/100
                      </strong>
                    </div>
                  </div>
                )
              })}
            </div>
          </Page>
        )}

        {page === 'Skill Gaps' && (
          <Page>
            <h2>Skill Gap Intelligence</h2>
            <p className="page-description">
              Identify the difference between industry-required skills and
              skills currently covered by training programmes.
            </p>
            
            <div className="filters" style={{ marginBottom: '22px' }}>
              <div className="filter">
                <label>Proficiency Filter</label>
                <select value={skillGapsProficiency} onChange={(e) => setSkillGapsProficiency(e.target.value)}>
                  <option value="All Levels">All Levels</option>
                  {PROFICIENCY_LEVELS.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="stats">
              <Stat title="Courses Analysed" number={courseData.length} change="Current curriculum" />
              <Stat
                title="Total Skill Gaps"
                number={courseData.reduce((total, course) => {
                  const industry = getSkillNames(course.industrySkills || [])
                  const current = getSkillNames(course.currentSkills || [])
                  const missing = industry.filter((s) => !current.includes(s))
                  return total + missing.length
                }, 0)}
                change="Industry requirements missing"
              />
              <Stat
                title="Critical Gaps"
                number={courseData.filter((course) => {
                  const industry = getSkillNames(course.industrySkills || [])
                  const current = getSkillNames(course.currentSkills || [])
                  const missing = industry.filter((s) => !current.includes(s))
                  return missing.length >= 2
                }).length}
                change="Immediate attention"
              />
              <Stat
                title="Skills Covered"
                number={new Set(courseData.flatMap((course) => getSkillNames(course.currentSkills || []))).size}
                change="Existing curriculum"
              />
            </div>

            {courseData.map((course) => {
              const allIndustrySkillsObj = course.industrySkills || []
              const filteredIndustrySkillsObj = skillGapsProficiency === 'All Levels' 
                ? allIndustrySkillsObj 
                : getSkillsByLevel(allIndustrySkillsObj, skillGapsProficiency)
              
              const industry = getSkillNames(filteredIndustrySkillsObj)
              const current = getSkillNames(course.currentSkills || [])
              const missingSkills = industry.filter((skill) => !current.includes(skill))
              const alignedSkills = industry.filter((skill) => current.includes(skill))
              
              // Only consider skills in current filter for alignment
              const alignment = industry.length > 0 ? Math.round((alignedSkills.length / industry.length) * 100) : 100

              if (industry.length === 0 && skillGapsProficiency !== 'All Levels') {
                return null;
              }

              return (
                <div className="card skill-analysis-card" key={course.id || course.name}>
                  <div className="card-header">
                    <div>
                      <h2>{course.name}</h2>
                      <p>Industry alignment: {alignment}%</p>
                    </div>
                    <div className={alignment < 60 ? 'gap-badge critical' : alignment < 80 ? 'gap-badge warning' : 'gap-badge good'}>
                      {alignment < 60 ? 'Critical' : alignment < 80 ? 'Needs Update' : 'Aligned'}
                    </div>
                  </div>

                  <div className="skill-columns">
                    <div>
                      <h3 className="skill-heading required">Industry Required</h3>
                      {filteredIndustrySkillsObj.map((skillObj) => {
                        const name = typeof skillObj === 'string' ? skillObj : skillObj.name
                        const level = typeof skillObj === 'string' ? 'Beginner' : (skillObj.level || 'Beginner')
                        return (
                          <div className="skill-item" key={name}>
                            {current.includes(name) ? <span className="skill-check">✓</span> : <span className="skill-cross">!</span>}
                            <span>{name}</span>
                            <span className={`proficiency-badge proficiency-${level.toLowerCase()}`}>{level}</span>
                          </div>
                        )
                      })}
                      {filteredIndustrySkillsObj.length === 0 && (
                        <p style={{ color: '#8992a2', fontSize: '13px' }}>No requirements recorded</p>
                      )}
                    </div>
                    <div>
                      <h3 className="skill-heading missing">Skills To Add</h3>
                      {missingSkills.length === 0 ? (
                        <div className="no-gap">✓ Curriculum fully aligned</div>
                      ) : (
                        missingSkills.map((skill) => (
                          <div className="missing-skill" key={skill}>+ {skill}</div>
                        ))
                      )}
                    </div>
                  </div>

                  {missingSkills.length > 0 && (
                    <div className="gap-action">
                      <div>
                        <strong>Recommended Action</strong>
                        <p>
                          Add {missingSkills.length} missing skill{missingSkills.length > 1 ? 's' : ''} to the {course.name} curriculum.
                        </p>
                      </div>
                      <button
                        className="primary-button"
                        onClick={() => openCurriculumWizard(course, missingSkills)}
                      >
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
              Convert local labour demand into recommended training capacity.
            </p>

            <div className="filters">
              <div className="filter">
                <label>District</label>
                <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
                  {districts.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
              <button
                className="update-button"
                onClick={() => {
                  const filename = exportDistrictActionPlan({
                    district: selectedDistrict,
                    districtLabourData
                  })
                  showToast(`Generated action plan: ${filename} saved to Downloads!`, 'success')
                }}
              >
                Generate Training Plan
              </button>
            </div>

            <div className="stats">
              <Stat
                title="Projected Demand"
                number={districtLabourData.reduce((total, job) => total + (job.demand || 0), 0).toLocaleString()}
                change="Annual requirement"
              />
              <Stat
                title="Current Capacity"
                number={districtLabourData.reduce((total, job) => total + (job.currentCapacity || 0), 0).toLocaleString()}
                change="Existing training seats"
              />
              <Stat
                title="Capacity Gap"
                number={districtLabourData.reduce((total, job) => total + Math.max((job.demand || 0) - (job.currentCapacity || 0), 0), 0).toLocaleString()}
                change="Additional seats required"
              />
              <Stat
                title="Priority Roles"
                number={districtLabourData.filter((job) => (job.demand || 0) > (job.currentCapacity || 0)).length}
                change="Capacity expansion needed"
              />
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <h2>{selectedDistrict === 'All Districts' ? 'Statewide' : selectedDistrict} Training Recommendations</h2>
                  <p>Demand compared with current training capacity</p>
                </div>
              </div>

              {districtLabourData.map((job) => {
                const demand = Number(job.demand) || 0
                const currentCapacity = Number(job.currentCapacity) || 0
                const gap = demand - currentCapacity
                const percentage = demand > 0 ? Math.round((currentCapacity / demand) * 100) : 0
                const projected2027 = calculateForecast(job.trendData)

                let recommendationClass = 'plan-recommendation balanced'
                let recommendationText = 'Optimal capacity'
                let seatCount = '0 seats'

                if (gap > 0) {
                  recommendationClass = 'plan-recommendation increase'
                  recommendationText = 'Increase capacity'
                  seatCount = `+${gap} seats`
                } else if (gap < 0) {
                  recommendationClass = 'plan-recommendation reduce'
                  recommendationText = 'Reduce capacity'
                  seatCount = `${gap} seats`
                }

                return (
                  <div key={job.id || job.role}>
                    <div className="district-plan-row">
                      <div className="district-role">
                        <strong>{job.role}</strong>
                        <span>{job.sector}</span>
                      </div>
                      <div className="district-numbers">
                        <div>
                          <small>Demand</small>
                          <strong>{demand}</strong>
                        </div>
                        <div>
                          <small>Projected 2027</small>
                          <strong>{projected2027}</strong>
                        </div>
                        <div>
                          <small>Capacity</small>
                          <strong>{currentCapacity}</strong>
                        </div>
                      </div>
                      <div className="capacity-area">
                        <div className="capacity-label">
                          <span>Capacity coverage</span>
                          <strong>{Math.min(percentage, 100)}%</strong>
                        </div>
                        <div className="capacity-bar">
                          <div style={{ width: `${Math.min(percentage, 100)}%` }} />
                        </div>
                      </div>
                      <div className={recommendationClass}>
                        <strong>{seatCount}</strong>
                        <span>{recommendationText}</span>
                      </div>
                    </div>
                    {job.trainerRequirements && (
                      <div className="resource-section">
                        <div className="resource-grid">
                          <div className="resource-card">
                            <h4>Trainer Requirements</h4>
                            <p>Current: {job.trainerRequirements.current} | Needed: {job.trainerRequirements.needed}</p>
                            <p>Gap: +{Math.max(job.trainerRequirements.needed - job.trainerRequirements.current, 0)} trainers</p>
                            <small>Qualification: {job.trainerRequirements.qualification}</small>
                          </div>
                          <div className="resource-card">
                            <h4>Equipment Required</h4>
                            <div className="equipment-list">
                              {(job.equipmentRequirements || []).map(eq => <span key={eq} className="equipment-tag">{eq}</span>)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="card recommendation">
              <div className="recommendation-label">PLANNING RECOMMENDATION</div>
              <h2>{districtRecommendation ? districtRecommendation.title : 'Market Balanced'}</h2>
              <p>
                {districtRecommendation 
                  ? districtRecommendation.text 
                  : 'Training capacity across the district currently meets projected industry demand. Focus on quality improvements.'}
              </p>
              {districtRecommendation && (
                <button
                  className="primary-button"
                  onClick={() => {
                    const filename = exportDistrictActionPlan({
                      district: selectedDistrict,
                      districtLabourData
                    })
                    showToast(`Action plan: ${filename} saved to Downloads!`, 'success')
                  }}
                >
                  Generate District Action Plan →
                </button>
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
              <Stat title="Courses Analysed" number={courseData.length} change="Industry alignment review" />
              <Stat
                title="Courses Needing Updates"
                number={courseData.filter((course) => getSkillNames(course.industrySkills || []).length > getSkillNames(course.currentSkills || []).length).length}
                change="Curriculum gaps detected"
              />
              <Stat
                title="Critical Skill Gaps"
                number={courseData.reduce((total, course) => {
                  const industry = getSkillNames(course.industrySkills || [])
                  const current = getSkillNames(course.currentSkills || [])
                  const missing = industry.filter((s) => !current.includes(s))
                  return total + missing.length
                }, 0)}
                change="Skills missing from curricula"
              />
              <Stat
                title="Industry Alignment"
                number={
                  courseData.length > 0
                    ? Math.round(
                        courseData.reduce((total, course) => {
                          const industry = getSkillNames(course.industrySkills || [])
                          const current = getSkillNames(course.currentSkills || [])
                          const matched = current.filter((skill) => industry.includes(skill)).length
                          const rate = industry.length > 0 ? (matched / industry.length) * 100 : 100
                          return total + rate
                        }, 0) / courseData.length
                      ) + '%'
                    : '100%'
                }
                change="Average curriculum alignment"
              />
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <h2>Curriculum Alignment</h2>
                  <p>Existing course content compared with employer-required skills</p>
                </div>
              </div>

              {courseData.map((course) => {
                const industry = getSkillNames(course.industrySkills || [])
                const current = getSkillNames(course.currentSkills || [])
                const missingSkills = industry.filter((skill) => !current.includes(skill))
                const matchedCount = current.filter((skill) => industry.includes(skill)).length
                const alignment = industry.length > 0 ? Math.round((matchedCount / industry.length) * 100) : 100

                let status = 'Aligned'
                let statusClass = 'status-good'
                if (alignment < 60) {
                  status = 'Critical Update'
                  statusClass = 'status-danger'
                } else if (alignment < 80) {
                  status = 'Needs Update'
                  statusClass = 'status-warning'
                }

                return (
                  <div className="course-row" key={course.id || course.name}>
                    <div className="course-main">
                      <strong>{course.name}</strong>
                      <span>Target role: {course.role}</span>
                    </div>
                    <div className="course-alignment">
                      <div className="alignment-label">
                        <span>Industry Alignment</span>
                        <strong>{alignment}%</strong>
                      </div>
                      <div className="alignment-bar">
                        <div className="alignment-fill" style={{ width: `${alignment}%` }} />
                      </div>
                    </div>
                    <div className={`course-status ${statusClass}`}>{status}</div>
                    <div className="course-gaps">
                      <strong>{missingSkills.length} skill gap{missingSkills.length !== 1 ? 's' : ''}</strong>
                      <div>
                        {missingSkills.length === 0 ? (
                          <span className="skill-match">✓ Fully aligned</span>
                        ) : (
                          missingSkills.map((skill) => (
                            <span className="skill-gap" key={skill}>+ {skill}</span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="card recommendation">
              <div className="recommendation-label">AI RECOMMENDATION</div>
              <h2>{courseRecommendation ? courseRecommendation.title : 'Curricula Aligned'}</h2>
              <p>
                {courseRecommendation ? courseRecommendation.text : 'All reviewed course curricula align with current industry skills requirements.'}
              </p>
              {courseRecommendation && (
                <button
                  className="primary-button"
                  onClick={() => openCurriculumWizard(courseRecommendation.course, courseRecommendation.missingSkills)}
                >
                  Create Curriculum Update →
                </button>
              )}
            </div>
          </Page>
        )}

        {page === 'Employers' && (
          <Page>
            <h2>Employer Validation</h2>
            <p className="page-description">
              Industry feedback validating current hiring demand, workforce readiness and required skills.
            </p>

            <div className="filters" style={{ marginBottom: '22px' }}>
              <div className="filter">
                <label>District</label>
                <select
                  value={employerDistrict}
                  onChange={(e) => setEmployerDistrict(e.target.value)}
                >
                  {districts.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="filter">
                <label>Sector</label>
                <select
                  value={employerSector}
                  onChange={(e) => setEmployerSector(e.target.value)}
                >
                  {allSectors.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="stats">
              <Stat title="Employers Surveyed" number={filteredEmployers.length} change="Industry validation data" />
              <Stat
                title="Hiring Demand"
                number={
                  filteredEmployers.length > 0
                    ? Math.round(
                        filteredEmployers.reduce((total, emp) => total + (emp.hiring || 0), 0) /
                          filteredEmployers.length
                      ) + '%'
                    : '0%'
                }
                change="Average hiring demand"
              />
              <Stat
                title="Employer Satisfaction"
                number={
                  filteredEmployers.length > 0
                    ? Math.round(
                        filteredEmployers.reduce((total, emp) => total + (emp.satisfaction || 0), 0) /
                          filteredEmployers.length
                      ) + '%'
                    : '0%'
                }
                change="Average satisfaction"
              />
              <Stat
                title="Skills Validated"
                number={new Set(filteredEmployers.flatMap((emp) => getSkillNames(emp.skills || []))).size}
                change="Industry-requested skills"
              />
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <h2>Employer Feedback</h2>
                  <p>Current industry expectations from surveyed employers</p>
                </div>
              </div>

              {filteredEmployers.map((employer) => (
                <div className="employer-row" key={employer.id || employer.company}>
                  <div className="employer-company">
                    <strong>{employer.company}</strong>
                    <span>{employer.sector} · {employer.district}</span>
                  </div>
                  <div className="employer-metric">
                    <small>Hiring Demand</small>
                    <div className="metric-bar">
                      <div style={{ width: `${Math.min(employer.hiring || 0, 100)}%` }} />
                    </div>
                    <strong>{employer.hiring}%</strong>
                  </div>
                  <div className="employer-metric">
                    <small>Satisfaction</small>
                    <strong>{employer.satisfaction}%</strong>
                  </div>
                  <div className="employer-skills">
                    <small>Required Skills</small>
                    <div>
                      {(employer.skills || []).map((skillObj) => {
                        const name = typeof skillObj === 'string' ? skillObj : skillObj.name
                        const level = typeof skillObj === 'string' ? 'Beginner' : (skillObj.level || 'Beginner')
                        return (
                          <span className="employer-skill" key={name}>
                            {name}
                            <span className={`proficiency-badge proficiency-${level.toLowerCase()}`}>{level}</span>
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {filteredEmployers.length === 0 && (
                <div className="empty-state">
                  No employers found matching the selected district and sector.
                </div>
              )}
            </div>

            <div className="card recommendation">
              <div className="recommendation-label">INDUSTRY SIGNAL</div>
              <h2>{employerRecommendation ? employerRecommendation.title : 'Consistent Employer Demand'}</h2>
              <p>
                {employerRecommendation ? employerRecommendation.text : 'Employer feedback demonstrates steady baseline skill requirements without critical emerging outliers.'}
              </p>
              {employerRecommendation && (
                <button
                  className="primary-button"
                  onClick={() => setPage('Skill Gaps')}
                >
                  View Skill Requirements →
                </button>
              )}
            </div>
          </Page>
        )}

        {page === 'Career Advisor' && (
          <Page>
            <h2>AI Career Advisor</h2>
            <p className="page-description">
              Discover suitable career paths based on your interests, skills and current labour-market demand.
            </p>
            <div className="card career-input-card">
              <div className="card-header">
                <div>
                  <h2>Build Your Career Profile</h2>
                  <p>Select your preferred sector and the skills you already have.</p>
                </div>
              </div>
              <div className="career-controls">
                <div className="filter">
                  <label>Preferred Sector</label>
                  <select
                    value={careerInterest}
                    onChange={(e) => setCareerInterest(e.target.value)}
                  >
                    {allSectors.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="filter">
                  <label>Education Level</label>
                  <select value={educationLevel} onChange={e => setEducationLevel(e.target.value)}>
                    {['10th Pass', '12th Pass', 'ITI', 'Diploma', 'B.Tech', 'M.Tech'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="filter">
                  <label>Experience</label>
                  <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)}>
                    {['Fresher', '1-2 years', '3-5 years', '5+ years'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div className="career-skill-section">
                <h3>Select Your Skills</h3>
                <div className="career-skills">
                  {[...new Set(labourData.flatMap((job) => getSkillNames(job.skills || [])))].map((skill) => (
                    <button
                      key={skill}
                      className={candidateSkills.includes(skill) ? 'career-skill selected' : 'career-skill'}
                      onClick={() => {
                        setCandidateSkills((prev) =>
                          prev.includes(skill) ? prev.filter((item) => item !== skill) : [...prev, skill]
                        )
                      }}
                    >
                      {candidateSkills.includes(skill) ? '✓ ' : '+ '}
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
              <button
                className="primary-button"
                onClick={() => setShowCareerResults(true)}
              >
                Find My Career Path →
              </button>
            </div>

            {showCareerResults && (
              <div className="card career-results">
                <div className="card-header">
                  <div>
                    <h2>Recommended Career Paths</h2>
                    <p>Recommendations are based on skill match and current industry demand.</p>
                  </div>
                </div>

                {(() => {
                  const matches = labourData
                    .filter((job) => (careerInterest === 'All Sectors' ? true : (job.sector || '').includes(careerInterest)))
                    .map((job) => {
                      const requiredSkills = getSkillNames(job.skills || [])
                      const matchedSkills = findMatchingSkills(candidateSkills, requiredSkills)
                      const skillMatch = requiredSkills.length ? Math.round((matchedSkills.length / requiredSkills.length) * 100) : 0
                      const demandScore = calculateDemandScore(job)

                      const eduBonus = {'10th Pass':0, '12th Pass':5, 'ITI':10, 'Diploma':15, 'B.Tech':20, 'M.Tech':25}[educationLevel] || 0
                      const expBonus = {'Fresher':0, '1-2 years':5, '3-5 years':10, '5+ years':15}[experienceLevel] || 0
                      const educationFit = Math.min(eduBonus * 4, 100)
                      const experienceFit = Math.min(expBonus * 6.67, 100)
                      
                      const finalScore = Math.round(skillMatch * 0.4 + demandScore * 0.3 + educationFit * 0.15 + experienceFit * 0.15)

                      return { ...job, matchedSkills, skillMatch, finalScore, demandScore }
                    })
                    .sort((a, b) => b.finalScore - a.finalScore)
                    .slice(0, 5)

                  if (matches.length === 0) {
                    return (
                      <div className="empty-state">
                        No career paths found matching the sector &ldquo;{careerInterest}&rdquo;. Try selecting another sector.
                      </div>
                    )
                  }

                  return matches.map((job) => {
                    const salaryRange = `₹${Math.round(job.demandScore * 400 + 15000).toLocaleString('en-IN')} - ₹${Math.round(job.demandScore * 800 + 20000).toLocaleString('en-IN')}/month`
                    const trainingDuration = job.demandScore > 700 ? '6-12 months' : job.demandScore > 400 ? '3-6 months' : '1-3 months'

                    return (
                      <div className="career-result" key={job.id || job.role}>
                        <div className="career-result-main">
                          <div>
                            <h3>{job.role}</h3>
                            <span>{job.sector}</span>
                          </div>
                          <div className="career-score">
                            <strong>{job.finalScore}%</strong>
                            <small>Match</small>
                          </div>
                        </div>
                        <div className="career-metrics">
                          <div>
                            <small>Skill Match</small>
                            <strong>{job.skillMatch}%</strong>
                          </div>
                          <div>
                            <small>Market Demand</small>
                            <strong>{job.demandScore}%</strong>
                          </div>
                          <div>
                            <small>Salary Est.</small>
                            <strong>{salaryRange}</strong>
                          </div>
                          <div>
                            <small>Training</small>
                            <strong>{trainingDuration}</strong>
                          </div>
                        </div>
                        <div className="career-matched">
                          <small>Matching Skills</small>
                          {job.matchedSkills.length === 0 ? (
                            <span className="career-gap">No matching skills yet</span>
                          ) : (
                            job.matchedSkills.map((skill) => (
                              <span key={skill} className="career-match">✓ {skill}</span>
                            ))
                          )}
                        </div>
                        <button
                          className="secondary-button"
                          onClick={() => setPage('Courses')}
                        >
                          View Learning Path →
                        </button>
                      </div>
                    )
                  })
                })()}
              </div>
            )}

            <div className="card recommendation">
              <div className="recommendation-label">AI CAREER INSIGHT</div>
              <h2>Build skills around high-demand emerging roles</h2>
              <p>
                MahaSkillIntel compares your existing skills with labour-market demand
                to identify career paths where additional training can improve
                your job readiness.
              </p>
            </div>
          </Page>
        )}
      </main>

      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <span>{toast.type === 'success' ? '✓' : 'ℹ'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {activeModal && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            {activeModal === 'settings' && (
              <>
                <h2>System Settings</h2>
                <p>
                  Configure data synchronization frequency, Supabase API endpoints,
                  and automated intelligence reporting parameters.
                </p>
                <div style={{ marginBottom: '18px', fontSize: '13px', color: '#596476' }}>
                  <div><strong>Data Source:</strong> {isUsingFallback ? 'Local Fallback' : 'Supabase Live'}</div>
                  <div style={{ marginTop: '8px' }}><strong>Environment:</strong> Production (Vite + React 19)</div>
                  <div style={{ marginTop: '8px' }}><strong>Auto-Refresh:</strong> Enabled (Real-time)</div>
                </div>
                <div className="modal-actions">
                  <button className="secondary-button" onClick={() => setActiveModal(null)}>
                    Close
                  </button>
                  <button
                    className="primary-button"
                    onClick={() => {
                      showToast('Settings saved successfully!')
                      setActiveModal(null)
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </>
            )}

            {activeModal === 'help' && (
              <>
                <h2>MahaSkillIntel Guide & Help</h2>
                <p>
                  MahaSkillIntel provides evidence-based intelligence for workforce
                  planning, identifying employer demand signals, and closing critical curriculum gaps.
                </p>
                <div style={{ marginBottom: '18px', fontSize: '13px', color: '#596476', lineHeight: 1.6 }}>
                  <div><strong>Labour Demand:</strong> Identifies emerging occupations and high-growth sectors.</div>
                  <div style={{ marginTop: '6px' }}><strong>Skill Gaps:</strong> Audits course curricula against employer-requested technical skills.</div>
                  <div style={{ marginTop: '6px' }}><strong>District Planner:</strong> Balances local training capacity against district hiring needs.</div>
                </div>
                <div className="modal-actions">
                  <button className="primary-button" onClick={() => setActiveModal(null)}>
                    Got it
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {wizard && (
        <div className="modal-backdrop" onClick={closeWizard}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  style={{
                    flex: 1,
                    height: '4px',
                    borderRadius: '2px',
                    background: wizard.step >= step ? '#2f6feb' : '#e3e7ee'
                  }}
                />
              ))}
            </div>

            {wizard.step === 1 && (
              <>
                <h2>Update Curriculum: {wizard.course.name}</h2>
                <p>
                  {wizard.missingSkills.length === 0
                    ? 'This curriculum already covers every industry-required skill.'
                    : `Select which of the ${wizard.missingSkills.length} missing skill${wizard.missingSkills.length > 1 ? 's' : ''} to add to this curriculum.`}
                </p>
                <div style={{ marginBottom: '18px' }}>
                  {wizard.missingSkills.length === 0 ? (
                    <div className="no-gap">✓ Curriculum fully aligned</div>
                  ) : (
                    wizard.missingSkills.map((skill) => (
                      <label
                        key={skill}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          border: '1px solid #e3e7ee',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={wizard.selected.includes(skill)}
                          onChange={() => toggleWizardSkill(skill)}
                        />
                        <span>{skill}</span>
                      </label>
                    ))
                  )}
                </div>
                <div className="modal-actions">
                  <button className="secondary-button" onClick={closeWizard}>
                    Cancel
                  </button>
                  <button
                    className="primary-button"
                    disabled={wizard.missingSkills.length > 0 && wizard.selected.length === 0}
                    onClick={() => setWizard((prev) => ({ ...prev, step: 2 }))}
                  >
                    Next →
                  </button>
                </div>
              </>
            )}

            {wizard.step === 2 && (
              <>
                <h2>Confirm Update</h2>
                <p>
                  The following skill{wizard.selected.length !== 1 ? 's' : ''} will be added to{' '}
                  <strong>{wizard.course.name}</strong>
                  {wizard.course.role ? ` (target role: ${wizard.course.role})` : ''}:
                </p>
                <div style={{ marginBottom: '18px' }}>
                  {wizard.selected.length === 0 ? (
                    <p style={{ color: '#8992a2', fontSize: '13px' }}>No skills selected — no changes will be made.</p>
                  ) : (
                    wizard.selected.map((skill) => (
                      <div className="missing-skill" key={skill}>+ {skill}</div>
                    ))
                  )}
                </div>
                <div className="modal-actions">
                  <button className="secondary-button" onClick={() => setWizard((prev) => ({ ...prev, step: 1 }))}>
                    ← Back
                  </button>
                  <button className="primary-button" onClick={applyCurriculumUpdate}>
                    Apply Update
                  </button>
                </div>
              </>
            )}

            {wizard.step === 3 && (
              <>
                <h2>✓ Curriculum Updated</h2>
                <p>
                  {wizard.selected.length > 0
                    ? `${wizard.selected.length} skill${wizard.selected.length > 1 ? 's have' : ' has'} been added to ${wizard.course.name}. Industry alignment for this course has improved.`
                    : `No changes were made to ${wizard.course.name}.`}
                </p>
                <div className="modal-actions">
                  <button
                    className="primary-button"
                    onClick={() => {
                      closeWizard()
                      showToast(`Curriculum updated for ${wizard.course.name}!`, 'success')
                    }}
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Page({ children }) {
  return <div className="page-content">{children}</div>
}

function Stat({ title, number, change }) {
  return (
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-number">{number}</div>
      <div className="stat-change positive">{change}</div>
    </div>
  )
}

function Role({ name, sector, value, width, low }) {
  return (
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
}

function Alert({ type, title, text }) {
  return (
    <div className={`alert ${type}`}>
      <div className="alert-icon">{type === 'success' ? '✓' : '!'}</div>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  )
}

export default App
