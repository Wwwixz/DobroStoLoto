import { Link } from 'react-router-dom'
import { FileText, Users2, Clock, PlusSquare, Star, Lock } from 'lucide-react'
import { useApi } from '../lib/api'
import { useMyFoundation, useMyProfile } from '../lib/foundationApi'
import type { Task } from '../data'

export const FundDashboardPage = () => {
  const { data: profile } = useMyProfile()
  const { data: tasks } = useApi<Task[]>('/tasks')
  const { data: foundation } = useMyFoundation()
  const approved = foundation?.status === 'approved'

  const NewTaskButton = ({ small = false }: { small?: boolean }) =>
    approved ? (
      <Link
        to="/fund/tasks/new"
        className={`btn btn-primary ${small ? 'btn-sm' : ''}`}
        style={{ textDecoration: 'none' }}
      >
        <PlusSquare size={small ? 15 : 16} /> Создать задание
      </Link>
    ) : (
      <button className={`btn btn-outline ${small ? 'btn-sm' : ''}`} disabled title="Станет доступно после одобрения организации">
        <Lock size={15} /> После одобрения
      </button>
    )

  const myTasks = tasks ?? []
  const totalResponses = myTasks.reduce((s, t) => s + (t.responses ?? 0), 0)

  const stats = [
    { icon: FileText, label: 'Всего заданий', value: String(myTasks.length), accent: 'linear-gradient(135deg,#2563EB,#06B6D4)' },
    { icon: Users2, label: 'Откликов волонтёров', value: String(totalResponses), accent: 'linear-gradient(135deg,#16A34A,#84CC16)' },
    { icon: Clock, label: 'Опубликованных часов', value: profile?.hours ? String(profile.hours) : '0', accent: 'linear-gradient(135deg,#F59E0B,#F97316)' },
    { icon: Star, label: 'Рейтинг фонда', value: '4.8', accent: 'linear-gradient(135deg,#8B5CF6,#EC4899)' },
  ]

  return (
    <>
      <div className="welcome">
        <h1>Панель фонда 👋</h1>
        <p>Здесь вы можете управлять своими заданиями и откликами</p>
      </div>

      <div className="an-stats">
        {stats.map(({ icon: Icon, label, value, accent }) => (
          <div key={label} className="an-card">
            <span className="label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: accent, color: '#fff' }}>
                <Icon size={15} />
              </span>
              {label}
            </span>
            <div className="num">{value}</div>
          </div>
        ))}
      </div>

      <div className="section-head" style={{ marginTop: 24 }}>
        <h2>Мои последние задания</h2>
        <NewTaskButton small />
      </div>

      <div className="popular-grid">
        {myTasks.slice(0, 3).length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            Заданий пока нет — создайте своё первое!
          </div>
        )}
        {myTasks.slice(0, 3).map((t) => (
          <Link key={t.id} to={`/fund/tasks/${t.id}`} className="pop-card" style={{ color: 'inherit' }}>
            <div className="pop-photo" style={{
              width: 50, height: 50, borderRadius: 12, background: t.gradient ?? 'linear-gradient(135deg,#FFC241,#F97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              flexShrink: 0, fontSize: 20,
            }}>
              🎯
            </div>
            <div className="pop-body">
              <h3>{t.title}</h3>
              <p>{t.location} • {t.responses} откликов</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="section-head" style={{ marginTop: 24 }}>
        <h2>Быстрые действия</h2>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <NewTaskButton />
        <Link to="/fund/tasks" className="btn" style={{ textDecoration: 'none' }}>
          Все задания
        </Link>
        <Link to="/fund/responses" className="btn" style={{ textDecoration: 'none' }}>
          Отклики волонтёров
        </Link>
      </div>
    </>
  )
}
