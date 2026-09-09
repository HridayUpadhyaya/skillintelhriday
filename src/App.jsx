import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { calculateDemandScore } from './data'
import {
  fetchLabourData,
  fetchCourseData,
  fetchEmployerData
} from './api'

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

  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2500)
  }

  const openModal = (type, payload = {}) => setModal({ type, ...payload })
  const closeModal = () => setModal(null)

  const downloadTextFile = (filename, content, mimeType = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const safeDemandScore = (job) => {
    const score = Number(calculateDemandScore(job))
    return Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0
  }

  // Stable, unique identifier for any job row (used consistently for React keys).
  const jobKey = (job) => job.id ?? `${job.role}-${job.sector}`

  const exportText = (filename, content) => {
    downloadTextFile(filename, content, 'text/plain;charset=utf-8')
    showToast(`${filename} downloaded.`)
  }

  const analyseCourse = (course) => {
    const missingSkills =
