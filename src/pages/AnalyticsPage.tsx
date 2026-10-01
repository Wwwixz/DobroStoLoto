import { Calendar } from 'lucide-react'
import { VolunteerLayout } from '../components/VolunteerLayout'
import { getStoredUser, useApi, type Analytics, type AnalyticsCategory } from '../lib/api'

const categoryColors: Record<string, string> = {
  'Животные': '#FFC241',
  'Дети': '#2563EB',
  'Соц. помощь': '#16A34A',
  'Экология': '#F59E0B',
}
const fallbackColors = ['#FFC241', '#2563EB', '#16A34A', '#F59E0B', '#E11D48']

const R = 40
const C = 2 * Math.PI * R

export const AnalyticsPage = () => {
  const user = getStoredUser()
  const isAdmin = user?.role === 'ADMIN'
  // Хуки вызываем до условного возврата, чтобы порядок хуков не менялся
  const { data, loading, error } = useApi<Analytics>('/analytics')

  if (!isAdmin) {
    return (
      <VolunteerLayout>
        <h1 className="page-title">Аналитика</h1>
        <div className="empty-state">
          Аналитика платформы доступна только администраторам. Войдите под учётной записью администратора.
        </div>
      </VolunteerLayout>
    )
  }

  const bars = data?.bars ?? []
  const max = Math.max(1, ...bars.map((b) => b.value))
  const categories: AnalyticsCategory[] = data?.categories ?? []

  let offset = 0

  return (
    <VolunteerLayout>
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
            <div className="an-card">
              <div className="label">Всего волонтёров</div>
              <div className="num">{data.stats.volunteers.toLocaleString('ru-RU')}</div>
              <span className="delta">зарегистрировано на платформе</span>
            </div>
            <div className="an-card">
              <div className="label">Фондов одобрено</div>
              <div className="num">{data.stats.approvedFoundations.toLocaleString('ru-RU')}</div>
              <span className="delta">прошли проверку администратора</span>
            </div>
            <div className="an-card">
              <div className="label">Заданий создано</div>
              <div className="num">{data.stats.totalTasks.toLocaleString('ru-RU')}</div>
              <span className="delta">всего на платформе</span>
            </div>
            <div className="an-card">
              <div className="label">Выполнено заданий</div>
              <div className="num">{data.stats.completedTasks.toLocaleString('ru-RU')}</div>
              <span className="delta">участий волонтёров</span>
            </div>
            <div className="an-card">
              <div className="label">Волонтёрских часов</div>
              <div className="num">{data.stats.hours.toLocaleString('ru-RU')}</div>
              <span className="delta">суммарно за всё время</span>
            </div>
          </div>

          {data.stats.totalTasks === 0 ? (
            <div className="chart-card">
              <h3>Динамика активности</h3>
              <div className="empty-state">
                Пока нет данных: они появятся, когда фонды начнут создавать задания, а волонтёры — откликаться.
              </div>
            </div>
          ) : (
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Создано заданий по месяцам</h3>
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
          )}
        </>
      )}
    </VolunteerLayout>
  )
}
