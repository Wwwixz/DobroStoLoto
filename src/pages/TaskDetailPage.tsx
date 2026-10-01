import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, CheckCircle2 } from 'lucide-react'
import { VolunteerLayout } from '../components/VolunteerLayout'
import { tasks } from '../data'
import { TaskPhoto } from '../lib/taskVisuals'

export const TaskDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const task = tasks.find((t) => t.id === Number(id)) ?? tasks[0]
  const [responded, setResponded] = useState(false)

  return (
    <VolunteerLayout>
      <button className="back-link" onClick={() => navigate('/tasks')}>
        <ArrowLeft size={16} />
        Назад к списку
      </button>

      <div className="detail-grid">
        <div className="detail-card">
          <h1>{task.title}</h1>
          <div className="badges-row" style={{ marginBottom: 20 }}>
            <span className={`badge ${task.format === 'online' ? 'badge-blue' : 'badge-gray'}`}>
              {task.format === 'online' ? 'Онлайн' : 'Офлайн'}
            </span>
            <span className={`badge ${task.duration === 'one' ? 'badge-yellow' : 'badge-blue'}`}>
              {task.duration === 'one' ? 'Разовое' : 'Регулярное'}
            </span>
            <span className="badge badge-gray">
              <MapPin size={13} />
              {task.location}
            </span>
          </div>

          <p className="detail-desc">{task.description}</p>

          <h3>Что нужно сделать</h3>
          <ul className="duty-list">
            {task.duties.map((d) => (
              <li key={d}>
                <CheckCircle2 size={17} />
                {d}
              </li>
            ))}
          </ul>

          <div className="info-block">
            <div className="info-row">
              <span className="k">Даты и время</span>
              <span className="v">{task.dateFrom} — {task.dateTo}, с 10:00 до 16:00</span>
            </div>
            <div className="info-row">
              <span className="k">Организатор</span>
              <span className="v">{task.organizer}</span>
            </div>
            <div className="info-row">
              <span className="k">Требования</span>
              <span className="v">Возраст от 18 лет, желание помогать</span>
            </div>
          </div>
        </div>

        <aside className="detail-aside">
          <TaskPhoto taskId={task.id} gradient={task.gradient} size={56} className="detail-photo" />
          <div className="detail-aside-body">
            <div className="slots-line">{task.slots} волонтёров</div>
            <div className="slots-sub">уже откликнулись</div>
            <button
              className={`btn ${responded ? 'btn-success' : 'btn-primary'}`}
              onClick={() => setResponded((v) => !v)}
            >
              {responded ? 'Отменить отклик' : 'Откликнуться'}
            </button>
          </div>
        </aside>
      </div>
    </VolunteerLayout>
  )
}
