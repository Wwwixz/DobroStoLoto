import { VolunteerLayout } from '../components/VolunteerLayout'
import { myResponses, tasks } from '../data'
import { TaskPhoto } from '../lib/taskVisuals'

const statusMap = {
  pending: { label: 'На рассмотрении', cls: 'badge-yellow' },
  approved: { label: 'Одобрено', cls: 'badge-green' },
  rejected: { label: 'Отклонено', cls: 'badge-red' },
}

export const MyResponsesPage = () => (
  <VolunteerLayout>
    <h1 className="page-title">Мои отклики</h1>
    <p className="page-sub">Статусы ваших текущих откликов на задания</p>

    <div className="response-list" style={{ marginTop: 22 }}>
      {myResponses.map((r) => {
        const task = tasks.find((t) => t.id === r.taskId)
        const status = statusMap[r.status]
        return (
          <div className="response-card" key={r.taskId}>
            <TaskPhoto taskId={r.taskId} gradient={task?.gradient ?? '#FFE9B8'} size={22} className="response-emoji" />
            <div>
              <h3>{r.taskTitle}</h3>
              <div className="f">{r.foundation}</div>
            </div>
            <div className="side">
              <span className={`badge ${status.cls}`}>{status.label}</span>
              <span className="date">{r.date}</span>
            </div>
          </div>
        )
      })}
    </div>
  </VolunteerLayout>
)
