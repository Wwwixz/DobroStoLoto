import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { type FoundationStatus } from '../lib/api'
import { getAdminFoundations, setFoundationStatus } from '../lib/foundationApi'

interface FoundationListRow {
  id: number
  name: string
  inn: string
  status: FoundationStatus
}

const statusMap: Record<FoundationStatus, { label: string; cls: string }> = {
  pending: { label: 'На проверке', cls: 'badge-yellow' },
  approved: { label: 'Одобрено', cls: 'badge-green' },
  rejected: { label: 'Отклонено', cls: 'badge-red' },
}

export const AdminFoundationsPage = () => {
  const [foundations, setFoundations] = useState<FoundationListRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getAdminFoundations()
      .then(setFoundations)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const setFoundationStatusSafe = async (id: number, status: FoundationStatus) => {
    try {
      await setFoundationStatus(id, status)
      load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось изменить статус')
    }
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
                    <div className="row-actions">
                      <Link
                        to={`/admin/foundations/${f.id}`}
                        className="mini-btn btn-primary"
                        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                      >
                        <Eye size={13} /> Смотреть
                      </Link>
                      {f.status === 'pending' && (
                        <>
                          <button className="mini-btn btn-success" onClick={() => setFoundationStatusSafe(f.id, 'approved')}>
                            Одобрить
                          </button>
                          <button className="mini-btn btn-danger" onClick={() => setFoundationStatusSafe(f.id, 'rejected')}>
                            Отклонить
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>
                    Загрузка…
                  </td>
                </tr>
              )}
              {!loading && foundations.length === 0 && (
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
