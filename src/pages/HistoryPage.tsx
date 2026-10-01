import { VolunteerLayout } from '../components/VolunteerLayout'
import { TaskPhoto } from '../lib/taskVisuals'

const history = [
  { taskId: 2, bg: 'linear-gradient(135deg, #E3ECFF 0%, #B8CCF5 100%)', title: 'Сбор гуманитарной помощи', foundation: 'Фонд «Весть»', date: '04.05.2025', hours: 6 },
  { taskId: 3, bg: 'linear-gradient(135deg, #DFF7E7 0%, #B5EAC4 100%)', title: 'Онлайн-консультации для детей', foundation: 'Дельта с друзьями', date: '02.05.2025', hours: 4 },
  { taskId: 4, bg: 'linear-gradient(135deg, #E5F7E0 0%, #C4E9B5 100%)', title: 'Экологическая акция «Чистый парк»', foundation: 'Зелёный мир', date: '25.04.2025', hours: 3 },
]

export const HistoryPage = () => (
  <VolunteerLayout>
    <h1 className="page-title">История</h1>
    <p className="page-sub">Выполненные вами задания</p>

    <div className="response-list" style={{ marginTop: 22 }}>
      {history.map((h) => (
        <div className="response-card" key={h.title}>
          <TaskPhoto taskId={h.taskId} gradient={h.bg} size={22} className="response-emoji" />
          <div>
            <h3>{h.title}</h3>
            <div className="f">{h.foundation}</div>
          </div>
          <div className="side">
            <span className="badge badge-green">Выполнено</span>
            <span className="date">{h.date} • {h.hours} ч</span>
          </div>
        </div>
      ))}
    </div>
  </VolunteerLayout>
)
