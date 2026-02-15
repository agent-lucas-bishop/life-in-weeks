import { useState, useMemo } from 'react'
import './App.css'

const WEEKS_PER_YEAR = 52
const AVG_LIFESPAN = 80

interface LifeEvent {
  week: number
  label: string
  color: string
}

const defaultEvents: { age: number; label: string; color: string }[] = [
  { age: 0, label: 'Born', color: '#f472b6' },
  { age: 5, label: 'Started school', color: '#60a5fa' },
  { age: 18, label: 'Turned 18', color: '#34d399' },
  { age: 22, label: 'College grad', color: '#a78bfa' },
  { age: 30, label: 'Turned 30', color: '#fbbf24' },
  { age: 40, label: 'Turned 40', color: '#f97316' },
  { age: 50, label: 'Turned 50', color: '#ef4444' },
  { age: 65, label: 'Retirement age', color: '#8b5cf6' },
]

function weeksBetween(d1: Date, d2: Date): number {
  return Math.floor((d2.getTime() - d1.getTime()) / (7 * 24 * 60 * 60 * 1000))
}

export default function App() {
  const [birthday, setBirthday] = useState<string>('')
  const [started, setStarted] = useState(false)
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  const totalWeeks = AVG_LIFESPAN * WEEKS_PER_YEAR

  const { weeksLived, events } = useMemo(() => {
    if (!birthday) return { weeksLived: 0, events: [] as LifeEvent[] }
    const bd = new Date(birthday)
    const now = new Date()
    const lived = weeksBetween(bd, now)
    const evts = defaultEvents
      .map(e => ({ week: e.age * WEEKS_PER_YEAR, label: e.label, color: e.color }))
      .filter(e => e.week < totalWeeks)
    return { weeksLived: Math.max(0, lived), events: evts }
  }, [birthday, totalWeeks])

  const getWeekInfo = (week: number) => {
    const years = Math.floor(week / WEEKS_PER_YEAR)
    const remainingWeeks = week % WEEKS_PER_YEAR
    return `Age ${years}, week ${remainingWeeks + 1}`
  }

  const getEventAt = (week: number) => {
    return events.find(e => Math.abs(e.week - week) < 2)
  }

  const share = () => {
    const pct = ((weeksLived / totalWeeks) * 100).toFixed(1)
    const filled = Math.round(weeksLived / totalWeeks * 20)
    const bar = '⬛'.repeat(filled) + '⬜'.repeat(20 - filled)
    const text = `⏳ Life in Weeks\n\n${bar}\n\n${weeksLived.toLocaleString()} of ~${totalWeeks.toLocaleString()} weeks lived (${pct}%)\n\nlife-in-weeks.app`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!started) {
    return (
      <div className="app intro">
        <div className="intro-content">
          <h1>LIFE IN WEEKS</h1>
          <p className="intro-desc">
            The average human lives about <strong>4,160 weeks</strong>.<br />
            How many have you used?
          </p>
          <div className="birthday-input">
            <label>When were you born?</label>
            <input
              type="date"
              value={birthday}
              onChange={e => setBirthday(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <button
            className="start-btn"
            onClick={() => birthday && setStarted(true)}
            disabled={!birthday}
          >
            Show my life
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header>
        <h1>LIFE IN WEEKS</h1>
        <div className="stats-row">
          <div className="stat">
            <span className="stat-num">{weeksLived.toLocaleString()}</span>
            <span className="stat-label">weeks lived</span>
          </div>
          <div className="stat">
            <span className="stat-num">{(totalWeeks - weeksLived).toLocaleString()}</span>
            <span className="stat-label">weeks remaining</span>
          </div>
          <div className="stat">
            <span className="stat-num">{((weeksLived / totalWeeks) * 100).toFixed(1)}%</span>
            <span className="stat-label">complete</span>
          </div>
        </div>
      </header>

      <div className="grid-container">
        <div className="age-labels">
          {Array.from({ length: AVG_LIFESPAN }, (_, i) => (
            i % 10 === 0 ? <div key={i} className="age-label" style={{ top: `${(i / AVG_LIFESPAN) * 100}%` }}>{i}</div> : null
          ))}
        </div>
        <div className="week-grid">
          {Array.from({ length: totalWeeks }, (_, i) => {
            const event = getEventAt(i)
            const isLived = i < weeksLived
            return (
              <div
                key={i}
                className={`week-dot ${isLived ? 'lived' : 'future'} ${event ? 'event' : ''}`}
                style={event ? { backgroundColor: event.color } : undefined}
                onMouseEnter={() => setHoveredWeek(i)}
                onMouseLeave={() => setHoveredWeek(null)}
              />
            )
          })}
        </div>
      </div>

      {hoveredWeek !== null && (
        <div className="tooltip">
          {getWeekInfo(hoveredWeek)}
          {getEventAt(hoveredWeek) && ` — ${getEventAt(hoveredWeek)!.label}`}
        </div>
      )}

      <div className="legend">
        <span className="legend-item"><span className="dot lived" /> Lived</span>
        <span className="legend-item"><span className="dot future" /> Remaining</span>
        {events.map(e => (
          <span key={e.label} className="legend-item">
            <span className="dot" style={{ backgroundColor: e.color }} /> {e.label}
          </span>
        ))}
      </div>

      <button className="share-btn" onClick={share}>
        {copied ? '✓ Copied!' : '📋 Share'}
      </button>

      <button className="reset-btn" onClick={() => setStarted(false)}>
        ← Change birthday
      </button>
    </div>
  )
}
