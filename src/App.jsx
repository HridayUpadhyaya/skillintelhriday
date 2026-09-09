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
// Bug 3 + 5: className fixed from `alert-${type}` → `${type}`,
// and DOM restructured to match CSS (.alert-icon + <strong> + <p>).
const Alert = ({ type, icon, title, text }) => (
  <div className={`alert ${type}`}>
    <div className="alert-icon">{icon || '!'}</div>
    <div>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  </div>
)
// Bug 6: Modal now uses .modal-backdrop / .modal-card / .modal-close
// CSS classes instead of inline styles.
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
