import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import './App.css'
import { calculateDemandScore } from './data'
import { fetchLabourData, fetchCourseData, fetchEmployerData } from './api'

// Sub-components to resolve ReferenceErrors and encapsulate UI
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

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: '#fff', padding: '24px', borderRadius: '8px', minWidth: '400px', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '24px', lineHeight: 1 }}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function App() {
  const [labourData, setLabourData] = useState([])
  const [courseData, setCourseData] = useState([])
  const [employerData, setEmployerData] = useState([])

  const [loadingData, setLoadingData] = useState(true)
  const [dataError, setDataError] = useState('')

  const [selectedDistrict, setSelectedDistrict] = useState('Pune')
  const [selectedSector, setSelectedSector] = useState('All Sectors')
  const [page, setPage] = useState('Dashboard')
  
  const [careerInterest, setCareerInterest] = useState('All Sectors')
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
        headers.map((header) => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(',')
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

  const updateCurriculum = useCallback((course) => {
    const industrySkills = course.industrySkills || []
    const currentSkills = course.currentSkills || []
    openModal('curriculum', {
      course,
      missingSkills: industrySkills.filter((skill) => !currentSkills.includes(skill))
    })
  }, [openModal])

  const analyseCourse = useCallback((course) => {
    const industrySkills = course.industrySkills || []
    const currentSkills = course.currentSkills || []
    const missingSkills = industrySkills.filter((skill) => !currentSkills.includes(skill))
    const alignedSkills = industrySkills.filter((skill) => currentSkills.includes(skill))
    const alignment = industrySkills.length
      ? Math.round((alignedSkills.length / industrySkills.length) * 100)
      : 100
    openModal('course-analysis', { course, missingSkills, alignedSkills, alignment })
  }, [openModal])

  const viewEmployerSkills = useCallback(() => {
    const skills = [...new Set(employerData.flatMap((employer) => employer.skills || []))]
      .sort((a, b) => a.localeCompare(b))
    openModal('skills', { skills })
  }, [employerData, openModal])

  useEffect(() => {
    let isMounted = true
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
        console.error('Data loading error:', error)
        if (isMounted) setDataError(error.message || 'Failed to load SkillIntel data.')
      } finally {
        if (isMounted) setLoadingData(false)
      }
    }
    loadData()
    return () => { isMounted = false }
  }, [])

  // Memoized derived data to prevent recalculation on every render
  const filteredLabourData = useMemo(() => {
    if (selectedSector === 'All Sectors') return labourData
    return labourData.filter((job) => job.sector.includes(selectedSector))
  }, [labourData, selectedSector])

  const { oversupplied, highGrowth, priorityJob, topSkills } = useMemo(() => {
    if (!filteredLabourData.length) return { topSkills: [] }

    const sortedByCapacity = [...filteredLabourData].sort((a, b) => 
      ((b.currentCapacity || 0) - (b.demand || 0)) - ((a.currentCapacity || 0) - (a.demand || 0))
    )
    const sortedByGrowth = [...filteredLabourData].sort((a, b) => (b.growth || 0) - (a.growth || 0))
    const sortedByGap = [...filteredLabourData].sort((a, b) => 
      ((b.demand || 0) - (b.currentCapacity || 0)) - ((a.demand || 0) - (a.currentCapacity || 0))
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
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading SkillIntel intelligence...</div>
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

  const menuItems = ['Dashboard', 'Labour Demand', 'Skill Gaps', 'Courses', 'District Plans', 'Employers', 'Career Advisor']

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
          <button type="button" className="nav-item" style={{ width: '100%', border: 0, background: 'transparent', textAlign: 'left', cursor: 'pointer' }} onClick={() => openModal('settings')}>Settings</button>
          <button type="button" className="nav-item" style={{ width: '100%', border: 0, background: 'transparent', textAlign: 'left', cursor: 'pointer' }} onClick={() => openModal('help')}>Help</button>
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

        {/* DASHBOARD */}
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
              <Stat title="Job Openings" number={filteredLabourData.reduce((acc, job) => acc + (job.demand || 0), 0).toLocaleString()} change="Current market demand" />
              <Stat title="High-Demand Skills" number={new Set(filteredLabourData.flatMap(job => job.skills || [])).size} change="Skills requested by employers" />
              <Stat title="Courses at Risk" number={filteredLabourData.filter(job => job.currentCapacity > job.demand).length} change="Oversupply detected" />
              <Stat title="Priority Roles" number={filteredLabourData.filter(job => job.demand > job.currentCapacity).length} change="Capacity expansion needed" />
            </section>

            <section className="dashboard-grid">
              <div className="card">
                <div className="card-header">
                  <div><h2>Top Emerging Roles</h2><p>Current industry demand</p></div>
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
                        <Role key={job.id ?? job.role} name={job.role} sector={job.sector} value={`${job.score}%`} width={`${job.score}%`} low={job.score < 50} />
                      ))
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div><h2>Priority Alerts</h2><p>Issues requiring attention</p></div>
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
          </Page>
        )}

        {/* LABOUR DEMAND */}
        {page === 'Labour Demand' && (
          <Page>
            <h2>Labour Market Intelligence</h2>
            <div className="card">
              {filteredLabourData.map((job) => {
                const score = safeDemandScore(job)
                return <Role key={job.id ?? job.role} name={job.role} sector={job.sector} value={`${score}/100`} width={`${score}%`} low={score < 50} />
              })}
            </div>
          </Page>
        )}

        {/* SKILL GAPS */}
        {page === 'Skill Gaps' && (
          <Page>
            <h2>Skill Gap Intelligence</h2>
            {courseData.map(course => {
              const industrySkills = course.industrySkills || []
              const currentSkills = course.currentSkills || []
              const missingSkills = industrySkills.filter(skill => !currentSkills.includes(skill))
              const alignedSkills = industrySkills.filter(skill => currentSkills.includes(skill))
              const alignment = industrySkills.length ? Math.round((alignedSkills.length / industrySkills.length) * 100) : 100

              return (
                <div className="card skill-analysis-card" key={course.id ?? course.name}>
                  <div className="card-header">
                    <div>
                      <h2>{course.name}</h2>
                      <p>Industry alignment: {alignment}%</p>
                    </div>
                  </div>
                  {missingSkills.length > 0 && (
                    <div className="gap-action">
                      <p>Add {missingSkills.length} missing skill(s) to curriculum.</p>
                      <button className="primary-button" onClick={() => updateCurriculum(course)}>Update Curriculum →</button>
                    </div>
                  )}
                </div>
              )
            })}
          </Page>
        )}

        {/* DISTRICT PLANS */}
        {page === 'District Plans' && (
          <Page>
            <h2>District Training Planner</h2>
            <div className="filters">
              <div className="filter">
                <label>District</label>
                <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
                  <option>Pune</option><option>Mumbai</option><option>Nashik</option><option>Nagpur</option>
                </select>
              </div>
              <button className="update-button" onClick={generateDistrictPlan}>Generate Plan</button>
            </div>
            <div className="card">
              {filteredLabourData.map(job => {
                const gap = (job.demand || 0) - (job.currentCapacity || 0)
                const percentage = job.demand ? Math.round(((job.currentCapacity || 0) / job.demand) * 100) : 100
                return (
                  <div className="district-plan-row" key={job.id ?? job.role} style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                    <div className="district-role"><strong>{job.role}</strong><br/><span>{job.sector}</span></div>
                    <div style={{ marginTop: '8px' }}>
                      <small>Demand: {job.demand || 0} | Capacity: {job.currentCapacity || 0}</small>
                      <br/>
                      <strong style={{ color: gap > 0 ? 'red' : 'green' }}>{gap > 0 ? `+${gap} seats needed` : `${Math.abs(gap)} seat surplus`}</strong>
                    </div>
                  </div>
                )
              })}
            </div>
          </Page>
        )}

        {/* COURSES (Fully Restored) */}
        {page === 'Courses' && (
          <Page>
            <h2>Course Intelligence</h2>
            <p className="page-description">Compare existing training programmes with current industry requirements.</p>
            <div className="stats">
              <Stat title="Courses Analysed" number={courseData.length} change="Industry alignment review" />
              <Stat
                title="Courses Needing Updates"
                number={courseData.filter(c => (c.industrySkills || []).some(skill => !(c.currentSkills || []).includes(skill))).length}
                change="Curriculum gaps detected"
              />
              <Stat
                title="Industry Alignment"
                number={courseData.length ? Math.round(courseData.reduce((total, course) => {
                  const matched = (course.currentSkills || []).filter(skill => (course.industrySkills || []).includes(skill)).length
                  return total + (course.industrySkills?.length ? (matched / course.industrySkills.length) * 100 : 100)
                }, 0) / courseData.length) + '%' : '0%'}
                change="Average curriculum alignment"
              />
            </div>
            {courseData.map(course => (
               <div className="card" key={course.id ?? course.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2>{course.name}</h2>
                    <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Duration: {course.duration || 'N/A'}</p>
                  </div>
                  <button className="primary-button" onClick={() => analyseCourse(course)}>Analyze Alignment</button>
               </div>
            ))}
          </Page>
        )}

        {/* EMPLOYERS */}
        {page === 'Employers' && (
          <Page>
            <h2>Employer Network</h2>
            <div className="card">
               <p>Access the aggregate skill requirements from industry partners.</p>
               <button className="primary-button" onClick={viewEmployerSkills}>View Consolidated Skills</button>
            </div>
          </Page>
        )}

        {/* CAREER ADVISOR */}
        {page === 'Career Advisor' && (
          <Page>
            <h2>Career Advisor</h2>
            <div className="card">
               <p>Select your skills to discover aligned career pathways.</p>
               <div style={{ marginBottom: '16px' }}>
                 <input 
                   type="text" 
                   placeholder="e.g. React, Python, Management (Comma separated)" 
                   style={{ padding: '8px', width: '100%', maxWidth: '400px', borderRadius: '4px', border: '1px solid #ccc' }}
                   onChange={(e) => setCandidateSkills(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                 />
               </div>
               <button 
                 className="primary-button" 
                 onClick={() => {
                   if (!candidateSkills.length) return showToast('Please enter at least one skill.')
                   setShowCareerResults(true)
                 }}
               >
                 Find Paths
               </button>
               {showCareerResults && (
                 <div style={{ marginTop: '20px' }}>
                   <Alert type="success" title="Results Ready" text={`Matching [${candidateSkills.join(', ')}] against active demands.`} />
                 </div>
               )}
            </div>
          </Page>
        )}
      </main>

      {/* MODAL RENDERER */}
      <Modal 
        isOpen={modal !== null} 
        onClose={closeModal} 
        title={modal?.type === 'settings' ? 'Application Settings' : 
               modal?.type === 'help' ? 'Help & Documentation' : 
               modal?.type === 'district-plan' ? `Action Plan: ${modal?.district}` :
               modal?.type === 'curriculum' || modal?.type === 'course-analysis' ? `Analysis: ${modal?.course?.name}` :
               modal?.type === 'skills' ? 'Consolidated Employer Skills' : 'Information'}
      >
        {modal?.type === 'settings' && <p>Settings module integration pending backend API configuration.</p>}
        {modal?.type === 'help' && <p>For SIH 26134 documentation, please refer to the main repository README.</p>}
        
        {modal?.type === 'district-plan' && modal.rows && (
          <div>
            <p>Priority roles requiring capacity intervention:</p>
            <ul>
              {modal.rows.slice(0, 5).map((row, idx) => (
                <li key={idx}><strong>{row.role}</strong>: Gap of {row.gap} seats</li>
              ))}
            </ul>
          </div>
        )}

        {(modal?.type === 'curriculum' || modal?.type === 'course-analysis') && (
          <div>
            <p><strong>Alignment Score:</strong> {modal.alignment ?? 'N/A'}%</p>
            <p><strong>Missing Industry Skills:</strong></p>
            {modal.missingSkills?.length ? (
              <ul style={{ color: '#d32f2f' }}>
                {modal.missingSkills.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            ) : <p>Fully Aligned.</p>}
          </div>
        )}

        {modal?.type === 'skills' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {modal.skills?.map((skill, idx) => (
              <span key={idx} style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', fontSize: '14px' }}>{skill}</span>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default App
