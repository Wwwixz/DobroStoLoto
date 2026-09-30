import { Calendar } from 'lucide-react'
import { VolunteerLayout } from '../components/VolunteerLayout'

const bars = [
  { month: 'Янв', value: 640 },
  { month: 'Фев', value: 820 },
  { month: 'Мар', value: 980 },
  { month: 'Апр', value: 1150 },
  { month: 'Май', value: 1380 },
]

const donutSegments = [
  { label: 'Животные', value: 32, color: '#FFC241' },
  { label: 'Дети', value: 25, color: '#2563EB' },
  { label: 'Соц. помощь', value: 18, color: '#16A34A' },
  { label: 'Экология', value: 15, color: '#F59E0B' },
  { label: 'Другие', value: 10, color: '#E11D48' },
]

const R = 40
const C = 2 * Math.PI * R

export const AnalyticsPage = () => {
  const max = Math.max(...bars.map((b) => b.value))
  let offset = 0

  return (
    <VolunteerLayout>
      <div className="analytics-top">
        <div>
          <h1 className="page-title">Аналитика</h1>
        </div>
        <span className="date-chip">
          <Calendar size={15} />
          01.04.2025 — 30.04.2025
        </span>
      </div>

      <div className="an-stats">
        <div className="an-card">
          <div className="label">Всего волонтёров</div>
          <div className="num">1 248</div>
          <span className="delta">+12%</span>
        </div>
        <div className="an-card">
          <div className="label">Выполнено заданий</div>
          <div className="num">892</div>
          <span className="delta">+15%</span>
        </div>
        <div className="an-card">
          <div className="label">Волонтёрских часов</div>
          <div className="num">7 360</div>
          <span className="delta">+20%</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Динамика активности</h3>
          <div className="bar-chart">
            {bars.map((b) => (
              <div className="bar-col" key={b.month}>
                <div className="bar" style={{ height: `${(b.value / max) * 100}%` }}>
                  <span className="val">{b.value}</span>
                </div>
                <span className="month">{b.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Категории заданий</h3>
          <div className="donut-wrap">
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
              {donutSegments.map((s) => {
                const len = (s.value / 100) * C
                const el = (
                  <circle
                    key={s.label}
                    r={R}
                    cx="60"
                    cy="60"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="22"
                    strokeDasharray={`${len} ${C - len}`}
                    strokeDashoffset={-offset}
                    transform="rotate(-90 60 60)"
                  />
                )
                offset += len
                return el
              })}
              <circle r="24" cx="60" cy="60" fill="#fff" />
            </svg>
            <div className="donut-legend">
              {donutSegments.map((s) => (
                <div className="legend-row" key={s.label}>
                  <span className="legend-dot" style={{ background: s.color }} />
                  {s.label}
                  <span className="pct">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </VolunteerLayout>
  )
}
