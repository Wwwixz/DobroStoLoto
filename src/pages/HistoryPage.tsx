import { TaskPhoto } from '../lib/taskVisuals'
import { useApi, type HistoryEntry } from '../lib/api'

export const HistoryPage = () => {
  const { data, loading, error } = useApi<HistoryEntry[]>('/history')

  return (
    <>
      <h1 className="page-title">История</h1>
      <p className="page-sub">Выполненные вами задания</p>

      <div className="response-list" style={{ marginTop: 22 }}>
        {loading && <div className="empty-state">Загрузка истории…</div>}
        {error && <div className="empty-state">Не удалось загрузить историю: {error}</div>}
        {data?.map((h) => (
          <div className="response-card" key={`${h.taskId}-${h.date}`}>
            <TaskPhoto taskId={h.taskId} gradient={h.gradient} size={22} className="response-emoji" />
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
        {!loading && !error && data?.length === 0 && (
          <div className="empty-state">Пока нет выполненных заданий.</div>
        )}
      </div>
    </>
  )
}
