import { Calendar } from 'lucide-react'
import { getStoredUser, useApi, type Analytics, type AnalyticsCategory, type Role } from '../lib/api'

const categoryColors: Record<string, string> = {
  'Животные': '#FFC241',
  'Дети': '#2563EB',
  'Соц. помощь': '#16A34A',
  'Экология': '#F59E0B',
}
const fallbackColors = ['#FFC241', '#2563EB', '#16A34A', '#F59E0B', '#E11D48']

const R = 40
const C = 2 * Math.PI * R

interface StatCard {
  label: string
  num: number | string
  delta: string
  accent: string
}

function buildStatsCards(role: Role, stats: Analytics['stats']): StatCard[] {
  const cards: StatCard[] = []

  if (role === 'VOLUNTEER') {
    cards.push({
      label: 'Выполнено заданий',
      num: stats.completedTasks,
      delta: 'ваших участий',
      accent: 'linear-gradient(135deg,#2563EB,#06B6D4)',
    })
    cards.push({
      label: 'Волонтёрских часов',
      num: stats.hours,
      delta: 'за всё время',
      accent: 'linear-gradient(135deg,#F59E0B,#F97316)',
    })
    return cards
  }

  if (role === 'FOUNDATION') {
    cards.push({
      label: 'Опубликовано заданий',
      num: stats.publishedTasks ?? 0,
      delta: 'ваших заданий',
      accent: 'linear-gradient(135deg,#2563EB,#06B6D4)',
    })
    cards.push({
      label: 'Откликов волонтёров',
      num: stats.totalResponses ?? 0,
      delta: 'всего откликов',
      accent: 'linear-gradient(135deg,#16A34A,#84CC16)',
    })
    cards.push({
      label: 'Выполнено заданий',
      num: stats.completedTasks,
      delta: 'закрытых заданий',
      accent: 'linear-gradient(135deg,#8B5CF6,#EC4899)',
    })
    cards.push({
      label: 'Волонтёрских часов',
      num: stats.hours,
      delta: 'сделано у вас',
      accent: 'linear-gradient(135deg,#F59E0B,#F97316)',
    })
    return cards
  }

  cards.push({
    label: 'Всего волонтёров',
    num: stats.volunteers ?? 0,
    delta: 'волонтёров на платформе',
    accent: 'linear-gradient(135deg,#16A34A,#84CC16)',
  })
  cards.push({
    label: 'Всего фондов',
    num: stats.foundations ?? 0,
    delta: 'фондов зарегистрировано',
    accent: 'linear-gradient(135deg,#2563EB,#06B6D4)',
  })
  cards.push({
    label: 'Опубликовано заданий',
    num: stats.publishedTasks ?? 0,
    delta: 'активно на платформе',
    accent: 'linear-gradient(135deg,#8B5CF6,#EC4899)',
  })
  cards.push({
    label: 'Выполнено заданий',
    num: stats.completedTasks,
    delta: 'всего участий',
    accent: 'linear-gradient(135deg,#F59E0B,#F97316)',
  })
  cards.push({
    label: 'Волонтёрских часов',
    num: stats.hours,
    delta: 'суммарно за всё время',
    accent: 'linear-gradient(135deg,#EF4444,#F97316)',
  })
  return cards
}

export const AnalyticsPage = () => {
  const { data, loading, error } = useApi<Analytics>('/analytics')
  const user = getStoredUser()
  const role: Role = user?.role ?? 'VOLUNTEER'

  const bars = data?.bars ?? []
  const max = Math.max(1, ...bars.map((b) => b.value))
  const categories: AnalyticsCategory[] = data?.categories ?? []

  let offset = 0

  return (
    <>
      <div className="analytics-top">
        <div>
          <h1 className="page-title">Аналитика</h1>
        </div>
        <span className="date-chip">
          <Calendar size={15} />
          последние 5 месяцев
        </span>
      </div>

      {loading && <p style={{ color: 'var(--muted)' }}>Загрузка аналитики…</p>}
      {error && <div className="empty-state">Не удалось загрузить аналитику: {error}</div>}

      {data && (
        <>
          <div className="an-stats">
            {buildStatsCards(role, data.stats).map((c) => (
              <div key={c.label} className="an-card">
                <span className="label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: 8, background: c.accent, color: '#fff',
                    }}
                  >
                    <span style={{ fontSize: 14 }}>📊</span>
                  </span>
                  {c.label}
                </span>
                <div className="num">{typeof c.num === 'number' ? c.num.toLocaleString('ru-RU') : c.num}</div>
                <span className="delta">{c.delta}</span>
              </div>
            ))}
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
                  {categories.map((s, i) => {
                    const len = (s.value / 100) * C
                    const el = (
                      <circle
                        key={s.label}
                        r={R}
                        cx="60"
                        cy="60"
                        fill="none"
                        stroke={categoryColors[s.label] ?? fallbackColors[i % fallbackColors.length]}
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
                  {categories.map((s, i) => (
                    <div className="legend-row" key={s.label}>
                      <span
                        className="legend-dot"
                        style={{ background: categoryColors[s.label] ?? fallbackColors[i % fallbackColors.length] }}
                      />
                      {s.label}
                      <span className="pct">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
