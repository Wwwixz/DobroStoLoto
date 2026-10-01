import { useApi, type MyResponse } from '../lib/api'

const statusMap: Record<MyResponse['status'], { label: string; cls: string }> = {
  pending: { label: 'На рассмотрении', cls: 'badge-yellow' },
  approved: { label: 'Одобрено', cls: 'badge-green' },
  rejected: { label: 'Отклонено', cls: 'badge-red' },
}

export const FundResponsesPage = () => {
  const { data, loading, error } = useApi<MyResponse[]>('/responses')

  return (
    <>
      <h1 className="page-title">Отклики волонтёров</h1>
      <p className="page-sub">Все отклики на задания вашего фонда</p>

      <div className="response-list" style={{ marginTop: 22 }}>
        {loading && <div className="empty-state">Загрузка…</div>}
        {error && <div className="empty-state">Ошибка: {error}</div>}
        {data?.map((r, i) => {
          const status = statusMap[r.status]
          return (
            <div key={`${r.taskId}-${r.date}-${i}`} className="response-card">
              <div className="response-emoji" style={{
                width: 44, height: 44, borderRadius: 10,
                background: 'linear-gradient(135deg,#2563EB,#06B6D4)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                fontSize: 18,
              }}>
                🧑‍🤝‍🧑
              </div>
              <div style={{ minWidth: 0 }}>
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
        {!loading && !error && data?.length === 0 && (
          <div className="empty-state">Пока откликов нет — опубликуйте задание!</div>
        )}
      </div>
    </>
  )
}
