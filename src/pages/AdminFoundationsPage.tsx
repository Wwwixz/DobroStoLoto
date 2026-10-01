import {
  api,
  useApi,
  type FoundationRow,
  type FoundationStatus,
} from '../lib/api'

const statusMap: Record<FoundationStatus, { label: string; cls: string }> = {
  pending: { label: 'На проверке', cls: 'badge-yellow' },
  approved: { label: 'Одобрено', cls: 'badge-green' },
  rejected: { label: 'Отклонено', cls: 'badge-red' },
}

export const AdminFoundationsPage = () => {
  const { data: foundationsData, reload: reloadFoundations } = useApi<FoundationRow[]>('/admin/foundations')
  const foundations = foundationsData ?? []

  const setFoundationStatus = async (id: number, status: FoundationStatus) => {
    await api<FoundationRow>(`/admin/foundations/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    })
    reloadFoundations()
  }

  return (
    <>
      <h1 className="page-title">Модерация фондов</h1>

      <div className="admin-card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Фонд</th>
                <th>ИНН</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {foundations.map((f) => (
                <tr key={f.id}>
                  <td className="id">#{f.id}</td>
                  <td className="title-cell">{f.name}</td>
                  <td>{f.inn}</td>
                  <td>
                    <span className={`badge ${statusMap[f.status].cls}`}>
                      {statusMap[f.status].label}
                    </span>
                  </td>
                  <td>
                    {f.status === 'pending' && (
                      <div className="row-actions">
                        <button className="mini-btn btn-success" onClick={() => setFoundationStatus(f.id, 'approved')}>
                          Одобрить
                        </button>
                        <button className="mini-btn btn-danger" onClick={() => setFoundationStatus(f.id, 'rejected')}>
                          Отклонить
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {foundations.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>
                    Фондов на проверке нет
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
