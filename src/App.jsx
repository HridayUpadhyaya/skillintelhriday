import { useState } from 'react'
import './App.css'
import {
  labourData,
  courseData,
  employerData,
  calculateDemandScore
} from './data'

function App() {
  const [selectedDistrict, setSelectedDistrict] = useState('Pune')
  const [selectedSector, setSelectedSector] = useState('All Sectors')
  const [page, setPage] = useState('Dashboard')
  const [careerInterest, setCareerInterest] = useState('All Sectors')
  const [candidateSkills, setCandidateSkills] = useState([])
  const [showCareerResults, setShowCareerResults] = useState(false)

    const filteredLabourData = labourData.filter((job) => {

    if (selectedSector === 'All Sectors') {
      return true
    }

    return job.sector.includes(selectedSector)
  })

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

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="logo">
          Skill<span>Intel</span>
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
          <div className="nav-item">Settings</div>
          <div className="nav-item">Help</div>
        </div>

      </aside>

      {/* MAIN */}
      <main className="main">

        {/* HEADER */}
        <header className="header">

          <div>
            <h1>{page}</h1>

            <p>
              Evidence-based intelligence for smarter workforce development
            </p>
          </div>

          <div className="profile">
            <div className="notification">🔔</div>

            <div className="avatar">A</div>

            <div>
              <strong>Admin</strong>
              <small>Skill Authority</small>
            </div>
          </div>

        </header>


        {/* DASHBOARD */}
        {page === 'Dashboard' && (

          <>
            {/* FILTERS */}
            <div className="filters">

              <div className="filter">
                <label>District</label>

                <select
  value={selectedDistrict}
  onChange={(e) => setSelectedDistrict(e.target.value)}
>
  <option>Pune</option>
  <option>Mumbai</option>
  <option>Nashik</option>
  <option>Nagpur</option>
</select>
              </div>

              <div className="filter">
                <label>Sector</label>

                <select
  value={selectedSector}
  onChange={(e) => setSelectedSector(e.target.value)}
>
  <option>All Sectors</option>
  <option>Automotive</option>
  <option>Information Technology</option>
  <option>Renewable Energy</option>
  <option>Manufacturing</option>
  <option>Business Services</option>
</select>
              </div>

              <button className="update-button">
                Update Analysis
              </button>

              </div>

              {/* EXECUTIVE INSIGHT */}
<div className="card executive-insight">

  <div className="executive-icon">✦</div>

  <div className="executive-content">
    <div className="recommendation-label">
      EXECUTIVE MARKET INSIGHT
    </div>

    <h2>
      Training capacity should follow emerging industry demand
    </h2>

    <p>
      SkillIntel identifies where employer demand is growing faster
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


            {/* STATISTICS */}
<section className="stats">

  <Stat
    title="Job Openings"
    number={filteredLabourData
      .reduce((total, job) => total + job.demand, 0)
      .toLocaleString()}
    change="Current market demand"
  />

  <Stat
    title="High-Demand Skills"
    number={
      new Set(
        filteredLabourData.flatMap(job => job.skills)
      ).size
    }
    change="Skills requested by employers"
  />

  <Stat
    title="Courses at Risk"
    number={
      filteredLabourData.filter(
        job => job.currentCapacity > job.demand
      ).length
    }
    change="Oversupply detected"
  />

  <Stat
    title="Priority Roles"
    number={
      filteredLabourData.filter(
        job => job.demand > job.currentCapacity
      ).length
    }
    change="Capacity expansion needed"
  />

</section>


            {/* MAIN GRID */}
            <section className="dashboard-grid">

              {/* EMERGING ROLES */}
              <div className="card">

                <div className="card-header">

                  <div>
                    <h2>Top Emerging Roles</h2>
                    <p>Current industry demand</p>
                  </div>

                  <button className="view-button">
                    View All
                  </button>

                </div>


                <div className="role-list">

                  {filteredLabourData.map((job) => {

  const score = calculateDemandScore(job)

  return (
    <div className="role" key={job.role}>

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

                </div>

              </div>


              {/* ALERTS */}
              <div className="card">

                <div className="card-header">

                  <div>
                    <h2>Priority Alerts</h2>
                    <p>Issues requiring attention</p>
                  </div>

                </div>

                <Alert
                  type="danger"
                  title="Data Entry Operator"
                  text="Course appears oversupplied"
                />

                <Alert
                  type="warning"
                  title="EV Technician"
                  text="4 critical curriculum gaps detected"
                />

                <Alert
                  type="success"
                  title="Solar Technician"
                  text="Strong demand growth detected"
                />

              </div>

            </section>


            {/* BOTTOM */}
            <section className="bottom-grid">

              <div className="card">

                <div className="card-header">

                  <div>
                    <h2>Skill Demand</h2>
                    <p>Most requested skills by employers</p>
                  </div>

                </div>

                <div className="skill-tags">
                  <span>Battery Diagnostics</span>
                  <span>AI / ML</span>
                  <span>Data Analytics</span>
                  <span>BMS</span>
                  <span>EV Charging</span>
                  <span>Solar Installation</span>
                </div>

              </div>


              <div className="card recommendation">

                <div className="recommendation-label">
                  AI RECOMMENDATION
                </div>

                <h2>Increase EV training capacity</h2>

                <p>
                  Industry demand is growing rapidly while current
                  training capacity remains below projected requirements.
                </p>

                <button className="primary-button">
                  View Recommendation →
                </button>

              </div>

            </section>

          </>
        )}


        {/* LABOUR DEMAND */}
        {page === 'Labour Demand' && (
          <Page>

            <h2>Labour Market Intelligence</h2>

            <p className="page-description">
              Identify growing occupations, industry demand and emerging
              employment opportunities.
            </p>

            <div className="stats">

              <Stat
  title="Job Openings"
  number={filteredLabourData
    .reduce((total, job) => total + job.demand, 0)
    .toLocaleString()}
  change={`${selectedSector === 'All Sectors' ? '+18.4%' : 'Filtered'} market demand`}
/>

<Stat
  title="High-Demand Skills"
  number={
    new Set(
      filteredLabourData.flatMap(job => job.skills)
    ).size
  }
  change="Skills requested by employers"
/>

<Stat
  title="Courses at Risk"
  number={
    filteredLabourData.filter(job =>
      job.currentCapacity > job.demand
    ).length
  }
  change="Oversupply detected"
/>

<Stat
  title="Roles Analysed"
  number={filteredLabourData.length}
  change="Based on selected sector"
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
      key={job.role}
      name={job.role}
      sector={job.sector}
      value={`${score}/100`}
      width={`${score}%`}
      low={score < 50}
    />
  )
})}

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

    return (
      <div className="intelligence-row" key={job.role}>

        <div className="intelligence-role">
          <strong>{job.role}</strong>
          <span>{job.sector}</span>
        </div>

        <div>
          <small>Growth</small>
          <strong>
            {job.growth > 0 ? '+' : ''}
            {job.growth}%
          </strong>
        </div>

        <div>
          <small>Employer Validation</small>
          <strong>{job.employerValidation}%</strong>
        </div>

        <div>
          <small>Placement</small>
          <strong>{job.placementRate}%</strong>
        </div>

        <div>
          <small>Demand Score</small>
          <strong
            className={
              score >= 70
                ? 'positive-text'
                : 'negative-text'
            }
          >
            {score}/100
          </strong>
        </div>

      </div>
    )
  })}

</div>

          </Page>
        )}


        {/* SKILL GAPS */}

{page === 'Skill Gaps' && (
  <Page>

    <h2>Skill Gap Intelligence</h2>

    <p className="page-description">
      Identify the difference between industry-required skills and
      skills currently covered by training programmes.
    </p>

    <div className="stats">

      <Stat
        title="Courses Analysed"
        number={courseData.length}
        change="Current curriculum"
      />

      <Stat
        title="Total Skill Gaps"
        number={
          courseData.reduce((total, course) =>
            total +
            course.industrySkills.filter(
              skill => !course.currentSkills.includes(skill)
            ).length
          , 0)
        }
        change="Industry requirements missing"
      />

      <Stat
        title="Critical Gaps"
        number={
          courseData.filter(course =>
            course.industrySkills.filter(
              skill => !course.currentSkills.includes(skill)
            ).length >= 2
          ).length
        }
        change="Immediate attention"
      />

      <Stat
        title="Skills Covered"
        number={
          new Set(
            courseData.flatMap(course => course.currentSkills)
          ).size
        }
        change="Existing curriculum"
      />

    </div>


    {courseData.map(course => {

      const missingSkills =
        course.industrySkills.filter(
          skill => !course.currentSkills.includes(skill)
        )

      const alignedSkills =
        course.industrySkills.filter(
          skill => course.currentSkills.includes(skill)
        )

      const alignment = Math.round(
        (alignedSkills.length /
          course.industrySkills.length) * 100
      )

      return (

        <div className="card skill-analysis-card" key={course.name}>

          <div className="card-header">

            <div>
              <h2>{course.name}</h2>
              <p>
                Industry alignment: {alignment}%
              </p>
            </div>

            <div className={
              alignment < 60
                ? 'gap-badge critical'
                : alignment < 80
                  ? 'gap-badge warning'
                  : 'gap-badge good'
            }>
              {alignment < 60
                ? 'Critical'
                : alignment < 80
                  ? 'Needs Update'
                  : 'Aligned'}
            </div>

          </div>


          <div className="skill-columns">

            <div>

              <h3 className="skill-heading required">
                Industry Required
              </h3>

              {course.industrySkills.map(skill => (

                <div className="skill-item" key={skill}>

                  {course.currentSkills.includes(skill)
                    ? <span className="skill-check">✓</span>
                    : <span className="skill-cross">!</span>
                  }

                  <span>{skill}</span>

                </div>

              ))}

            </div>


            <div>

              <h3 className="skill-heading missing">
                Skills To Add
              </h3>

              {missingSkills.length === 0 ? (

                <div className="no-gap">
                  ✓ Curriculum fully aligned
                </div>

              ) : (

                missingSkills.map(skill => (

                  <div className="missing-skill" key={skill}>
                    + {skill}
                  </div>

                ))

              )}

            </div>

          </div>


          {missingSkills.length > 0 && (

            <div className="gap-action">

              <div>
                <strong>Recommended Action</strong>

                <p>
                  Add {missingSkills.length} missing skill
                  {missingSkills.length > 1 ? 's' : ''} to the
                  {` ${course.name}`} curriculum.
                </p>
              </div>

              <button className="primary-button">
                Update Curriculum →
              </button>

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

    <p className="page-description">
      Convert local labour demand into recommended training capacity.
    </p>


    <div className="filters">

      <div className="filter">

        <label>District</label>

        <select
          value={selectedDistrict}
          onChange={(e) =>
            setSelectedDistrict(e.target.value)
          }
        >
          <option>Pune</option>
          <option>Mumbai</option>
          <option>Nashik</option>
          <option>Nagpur</option>
        </select>

      </div>

      <button className="update-button">
        Generate Training Plan
      </button>

    </div>


    <div className="stats">

      <Stat
        title="Projected Demand"
        number={
          labourData
            .reduce((total, job) => total + job.demand, 0)
            .toLocaleString()
        }
        change="Annual requirement"
      />

      <Stat
        title="Current Capacity"
        number={
          labourData
            .reduce(
              (total, job) => total + job.currentCapacity,
              0
            )
            .toLocaleString()
        }
        change="Existing training seats"
      />

      <Stat
        title="Capacity Gap"
        number={
          labourData
            .reduce(
              (total, job) =>
                total +
                Math.max(
                  job.demand - job.currentCapacity,
                  0
                ),
              0
            )
            .toLocaleString()
        }
        change="Additional seats required"
      />

      <Stat
        title="Priority Roles"
        number={
          labourData.filter(
            job => job.demand > job.currentCapacity
          ).length
        }
        change="Capacity expansion needed"
      />

    </div>


    <div className="card">

      <div className="card-header">

        <div>
          <h2>{selectedDistrict} Training Recommendations</h2>

          <p>
            Demand compared with current training capacity
          </p>
        </div>

      </div>


      {labourData.map(job => {

        const gap =
          job.demand - job.currentCapacity

        const percentage = Math.round(
          (job.currentCapacity / job.demand) * 100
        )

        return (

          <div className="district-plan-row" key={job.role}>

            <div className="district-role">

              <strong>{job.role}</strong>

              <span>{job.sector}</span>

            </div>


            <div className="district-numbers">

              <div>
                <small>Demand</small>
                <strong>{job.demand}</strong>
              </div>

              <div>
                <small>Capacity</small>
                <strong>{job.currentCapacity}</strong>
              </div>

            </div>


            <div className="capacity-area">

              <div className="capacity-label">

                <span>Capacity coverage</span>

                <strong>
                  {Math.min(percentage, 100)}%
                </strong>

              </div>

              <div className="capacity-bar">

                <div
                  style={{
                    width: `${Math.min(percentage, 100)}%`
                  }}
                />

              </div>

            </div>


            <div className={
              gap > 0
                ? 'plan-recommendation increase'
                : 'plan-recommendation reduce'
            }>

              <strong>
                {gap > 0
                  ? `+${gap} seats`
                  : `${gap} seats`}
              </strong>

              <span>
                {gap > 0
                  ? 'Increase capacity'
                  : 'Reduce capacity'}
              </span>

            </div>

          </div>

        )

      })}

    </div>


    <div className="card recommendation">

      <div className="recommendation-label">
        PLANNING RECOMMENDATION
      </div>

      <h2>
        Prioritise capacity expansion for emerging roles
      </h2>

      <p>
        Training capacity should be increased where projected
        industry demand exceeds available seats. Oversupplied
        programmes should be reviewed before adding new capacity.
      </p>

      <button className="primary-button">
        Generate District Action Plan →
      </button>

    </div>

  </Page>
)}


        {/* COURSES */}

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
          courseData.filter(course =>
            course.industrySkills.length > course.currentSkills.length
          ).length
        }
        change="Curriculum gaps detected"
      />

      <Stat
        title="Critical Skill Gaps"
        number={
          courseData.reduce((total, course) => {
            return total +
              course.industrySkills.filter(
                skill => !course.currentSkills.includes(skill)
              ).length
          }, 0)
        }
        change="Skills missing from curricula"
      />

      <Stat
        title="Industry Alignment"
        number={
          Math.round(
            courseData.reduce((total, course) => {
              const matched = course.currentSkills.filter(
                skill => course.industrySkills.includes(skill)
              ).length

              return total +
                (matched / course.industrySkills.length) * 100
            }, 0) / courseData.length
          ) + '%'
        }
        change="Average curriculum alignment"
      />

    </div>


    <div className="card">

      <div className="card-header">

        <div>
          <h2>Curriculum Alignment</h2>

          <p>
            Existing course content compared with employer-required skills
          </p>
        </div>

      </div>


      {courseData.map((course) => {

        const missingSkills =
          course.industrySkills.filter(
            skill => !course.currentSkills.includes(skill)
          )

        const alignment =
          Math.round(
            (course.currentSkills.filter(
              skill => course.industrySkills.includes(skill)
            ).length /
              course.industrySkills.length) * 100
          )

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

          <div className="course-row" key={course.name}>

            <div className="course-main">

              <strong>{course.name}</strong>

              <span>
                Target role: {course.role}
              </span>

            </div>


            <div className="course-alignment">

              <div className="alignment-label">
                <span>Industry Alignment</span>

                <strong>{alignment}%</strong>
              </div>

              <div className="alignment-bar">

                <div
                  className="alignment-fill"
                  style={{ width: `${alignment}%` }}
                />

              </div>

            </div>


            <div className={`course-status ${statusClass}`}>
              {status}
            </div>


            <div className="course-gaps">

              <strong>
                {missingSkills.length} skill gap
                {missingSkills.length !== 1 ? 's' : ''}
              </strong>

              <div>

                {missingSkills.length === 0 ? (

                  <span className="skill-match">
                    ✓ Fully aligned
                  </span>

                ) : (

                  missingSkills.map(skill => (
                    <span
                      className="skill-gap"
                      key={skill}
                    >
                      + {skill}
                    </span>
                  ))

                )}

              </div>

            </div>

          </div>

        )

      })}

    </div>


    <div className="card recommendation">

      <div className="recommendation-label">
        AI RECOMMENDATION
      </div>

      <h2>Prioritise EV Technician curriculum revision</h2>

      <p>
        Industry requirements currently exceed the skills covered
        by the existing EV Technician curriculum. Add high-voltage
        safety, EV electrical systems and CAN Bus diagnostics to
        improve job readiness.
      </p>

      <button className="primary-button">
        Create Curriculum Update →
      </button>

    </div>

  </Page>
)}


        {/* DISTRICT PLANS */}
        {page === 'District Plans' && (
          <Page>

            <h2>District Training Plan</h2>

            <p className="page-description">
              Recommended training capacity based on local labour demand.
            </p>

            <div className="filters">

              <div className="filter">
                <label>District</label>

                <select>
                  <option>Pune</option>
                  <option>Mumbai</option>
                  <option>Nashik</option>
                  <option>Nagpur</option>
                </select>
              </div>

              <button className="update-button">
                Generate Plan
              </button>

            </div>

            <div className="card">

              <div className="card-header">
                <div>
                  <h2>Pune — Recommended Training Capacity</h2>
                  <p>Based on projected labour demand</p>
                </div>
              </div>

              {labourData.map((job) => {
  const gap = job.demand - job.currentCapacity

  return (
    <PlanRow
      key={job.role}
      role={job.role}
      demand={job.demand.toLocaleString()}
      current={job.currentCapacity.toLocaleString()}
      recommendation={
        gap > 0
          ? `+${gap.toLocaleString()} seats`
          : `${gap.toLocaleString()} seats`
      }
    />
  )
})}

            </div>

          </Page>
        )}


        {/* EMPLOYERS */}

{page === 'Employers' && (
  <Page>

    <h2>Employer Validation</h2>

    <p className="page-description">
      Industry feedback validating current hiring demand,
      workforce readiness and required skills.
    </p>

    <div className="stats">

      <Stat
        title="Employers Surveyed"
        number={employerData.length}
        change="Industry validation data"
      />

      <Stat
        title="Hiring Demand"
        number={
          Math.round(
            employerData.reduce(
              (total, employer) => total + employer.hiring,
              0
            ) / employerData.length
          ) + '%'
        }
        change="Average hiring demand"
      />

      <Stat
        title="Employer Satisfaction"
        number={
          Math.round(
            employerData.reduce(
              (total, employer) => total + employer.satisfaction,
              0
            ) / employerData.length
          ) + '%'
        }
        change="Average satisfaction"
      />

      <Stat
        title="Skills Validated"
        number={
          new Set(
            employerData.flatMap(
              employer => employer.skills
            )
          ).size
        }
        change="Industry-requested skills"
      />

    </div>


    <div className="card">

      <div className="card-header">

        <div>
          <h2>Employer Feedback</h2>

          <p>
            Current industry expectations from surveyed employers
          </p>
        </div>

      </div>


      {employerData.map((employer) => (

        <div
          className="employer-row"
          key={employer.company}
        >

          <div className="employer-company">

            <strong>{employer.company}</strong>

            <span>
              {employer.sector} · {employer.district}
            </span>

          </div>


          <div className="employer-metric">

            <small>Hiring Demand</small>

            <div className="metric-bar">

              <div
                style={{
                  width: `${employer.hiring}%`
                }}
              />

            </div>

            <strong>{employer.hiring}%</strong>

          </div>


          <div className="employer-metric">

            <small>Satisfaction</small>

            <strong>
              {employer.satisfaction}%
            </strong>

          </div>


          <div className="employer-skills">

            <small>Required Skills</small>

            <div>

              {employer.skills.map(skill => (

                <span
                  className="employer-skill"
                  key={skill}
                >
                  {skill}
                </span>

              ))}

            </div>

          </div>

        </div>

      ))}

    </div>


    <div className="card recommendation">

      <div className="recommendation-label">
        INDUSTRY SIGNAL
      </div>

      <h2>
        Employers are prioritising emerging technical skills
      </h2>

      <p>
        Employer feedback indicates strong demand for battery
        diagnostics, EV electrical systems, BMS and high-voltage
        safety. These requirements should be reflected in
        technical training curricula.
      </p>

      <button className="primary-button">
        View Skill Requirements →
      </button>

    </div>

  </Page>
)}


        {/* CAREER ADVISOR */}
{page === 'Career Advisor' && (
  <Page>
    <h2>AI Career Advisor</h2>
    <p className="page-description">
      Discover suitable career paths based on your interests, skills and
      current labour-market demand.
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
            <option>All Sectors</option>
            <option>Automotive</option>
            <option>Information Technology</option>
            <option>Renewable Energy</option>
            <option>Manufacturing</option>
            <option>Business Services</option>
          </select>
        </div>
      </div>

      <div className="career-skill-section">
        <h3>Select Your Skills</h3>

        <div className="career-skills">
          {[...new Set(labourData.flatMap(job => job.skills))].map(skill => (
            <button
              key={skill}
              className={
                candidateSkills.includes(skill)
                  ? 'career-skill selected'
                  : 'career-skill'
              }
              onClick={() => {
                setCandidateSkills(prev =>
                  prev.includes(skill)
                    ? prev.filter(item => item !== skill)
                    : [...prev, skill]
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
            <p>
              Recommendations are based on skill match and current industry
              demand.
            </p>
          </div>
        </div>

        {labourData
          .filter(job =>
            careerInterest === 'All Sectors'
              ? true
              : job.sector.includes(careerInterest)
          )
          .map(job => {
            const matchedSkills = job.skills.filter(skill =>
              candidateSkills.includes(skill)
            )

            const skillMatch = job.skills.length
              ? Math.round((matchedSkills.length / job.skills.length) * 100)
              : 0

            const demandScore = calculateDemandScore(job)

            const finalScore = Math.round(
              skillMatch * 0.6 + demandScore * 0.4
            )

            return {
              ...job,
              matchedSkills,
              skillMatch,
              finalScore
            }
          })
          .sort((a, b) => b.finalScore - a.finalScore)
          .slice(0, 5)
          .map(job => (
            <div className="career-result" key={job.role}>
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
                  <strong>{calculateDemandScore}%</strong>
                </div>

                <div>
                  <small>Openings</small>
                  <strong>{job.demand}</strong>
                </div>
              </div>

              <div className="career-matched">
                <small>Matching Skills</small>

                {job.matchedSkills.length === 0 ? (
                  <span className="career-gap">
                    No matching skills yet
                  </span>
                ) : (
                  job.matchedSkills.map(skill => (
                    <span key={skill} className="career-match">
                      ✓ {skill}
                    </span>
                  ))
                )}
              </div>

              <button className="secondary-button">
                View Learning Path →
              </button>
            </div>
          ))}
      </div>
    )}

    <div className="card recommendation">
      <div className="recommendation-label">AI CAREER INSIGHT</div>
      <h2>Build skills around high-demand emerging roles</h2>
      <p>
        SkillIntel compares your existing skills with labour-market demand
        to identify career paths where additional training can improve
        your job readiness.
      </p>
    </div>
  </Page>
)}

      </main>
    </div>
  )
}


/* ---------- COMPONENTS ---------- */

function Page({ children }) {
  return (
    <div className="page-content">
      {children}
    </div>
  )
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
        <div
          className={`bar ${low ? 'low' : ''}`}
          style={{ width }}
        ></div>
      </div>

      <strong>{value}</strong>

    </div>
  )
}


function Alert({ type, title, text }) {
  return (
    <div className={`alert ${type}`}>

      <div className="alert-icon">
        {type === 'success' ? '✓' : '!'}
      </div>

      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>

    </div>
  )
}


function Skill({ name, status }) {
  const className =
    status === 'Critical Gap'
      ? 'danger'
      : status === 'Needs Update'
        ? 'warning'
        : 'success'

  return (
    <div className="skill-row">

      <strong>{name}</strong>

      <span className={`status ${className}`}>
        {status}
      </span>

    </div>
  )
}


function Course({ name, status, level }) {
  return (
    <div className="card course-card">

      <div className="course-icon">▣</div>

      <h2>{name}</h2>

      <p>{status}</p>

      <div className="course-status">
        {level}
      </div>

      <button className="view-button">
        Analyse Course →
      </button>

    </div>
  )
}


function PlanRow({ role, demand, current, recommendation }) {
  const isPositive = recommendation.startsWith('+')

  return (
    <div className="plan-row">

      <div>
        <strong>{role}</strong>
      </div>

      <div>
        <span>Demand</span>
        <strong>{demand}</strong>
      </div>

      <div>
        <span>Current</span>
        <strong>{current}</strong>
      </div>

      <div>
        <span>Recommendation</span>
        <strong className={isPositive ? 'positive-text' : 'negative-text'}>
          {recommendation}
        </strong>
      </div>

    </div>
  )
}

export default App