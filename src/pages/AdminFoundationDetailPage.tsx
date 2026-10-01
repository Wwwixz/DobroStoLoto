import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, FileText, Mail, Phone, User, X } from 'lucide-react'
import { type FoundationStatus } from '../lib/api'
import { getFoundationDetail, setFoundationStatus, type FoundationDoc } from '../lib/foundationApi'

const statusMap: Record<FoundationStatus, { label: string; cls: string }> = {
  pending: { label: 'На проверке', cls: 'badge-yellow' },
  approved: { label: 'Одобрено', cls: 'badge-green' },
  rejected: { label: 'Отклонено', cls: 'badge-red' },
}

export const AdminFoundationDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof getFoundationDetail>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [openDoc, setOpenDoc] = useState<FoundationDoc | null>(null)

  const load = () => {
    if (!id) return
    setLoading(true)
    setError(null)
    getFoundationDetail(Number(id))
      .then(setDetail)
      .catch((e) => setError(e instanceof Error ? e.message : 'Ошибка загрузки'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  const changeStatus = async (status: FoundationStatus) => {
    if (!id) return
    setBusy(true)
    try {
      await setFoundationStatus(Number(id), status)
      load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось изменить статус')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button className="back-link" onClick={() => navigate('/admin/foundations')}>
        <ArrowLeft size={16} /> К списку фондов
      </button>

      {loading && <div className="empty-state">Загрузка…</div>}
      {error && <div className="empty-state">{error}</div>}

      {detail && (
        <div className="admin-card">
          <div className="foundation-head">
            <span className="foundation-head-icon">
              <Building2 size={24} />
            </span>
            <div style={{ minWidth: 0 }}>
              <h1 className="page-title" style={{ marginBottom: 4 }}>
                {detail.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span className={`badge ${statusMap[detail.status].cls}`}>{statusMap[detail.status].label}</span>
                <span style={{ color: 'var(--muted)', fontSize: 13.5 }}>Заявка от {detail.createdAt}</span>
              </div>
            </div>
            {detail.status === 'pending' && (
              <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
                <button className="btn btn-success" disabled={busy} onClick={() => changeStatus('approved')}>
                  Одобрить
                </button>
                <button className="btn btn-danger" disabled={busy} onClick={() => changeStatus('rejected')}>
                  Отклонить
                </button>
              </div>
            )}
          </div>

          <div className="foundation-grid">
            <div className="foundation-block">
              <h3>Данные организации</h3>
              <div className="info-table" style={{ border: 'none' }}>
                <div className="info-row-item">
                  <span className="k">ИНН</span>
                  <span className="v">{detail.inn || '—'}</span>
                </div>
                <div className="info-row-item">
                  <span className="k">ОГРН</span>
                  <span className="v">{detail.ogrn || '—'}</span>
                </div>
                <div className="info-row-item">
                  <span className="k">Дата подачи</span>
                  <span className="v">{detail.createdAt}</span>
                </div>
              </div>

              <h3 style={{ marginTop: 22 }}>Аккаунт владельца</h3>
              <div className="info-table" style={{ border: 'none' }}>
                <div className="info-row-item">
                  <span className="k">
                    <User size={13} style={{ display: 'inline', verticalAlign: -2 }} /> Имя
                  </span>
                  <span className="v">{detail.owner.fullName}</span>
                </div>
                <div className="info-row-item">
                  <span className="k">
                    <Mail size={13} style={{ display: 'inline', verticalAlign: -2 }} /> Email
                  </span>
                  <span className="v">{detail.owner.email}</span>
                </div>
                <div className="info-row-item">
                  <span className="k">
                    <Phone size={13} style={{ display: 'inline', verticalAlign: -2 }} /> Телефон
                  </span>
                  <span className="v">{detail.owner.phone || '—'}</span>
                </div>
              </div>
            </div>

            <div className="foundation-block">
              <h3>Документы</h3>
              {detail.documents.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 4px' }}>
                  Документы не были приложены к заявке.
                </p>
              ) : (
                <div className="doc-thumbs">
                  {detail.documents.map((doc) => (
                    <button key={doc.id} className="doc-thumb" onClick={() => setOpenDoc(doc)} title={doc.name}>
                      <img src={doc.url} alt={doc.name} />
                      <span className="doc-thumb-name">
                        <FileText size={13} />
                        {doc.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {openDoc && (
        <div className="doc-modal" onClick={() => setOpenDoc(null)}>
          <div className="doc-modal-body" onClick={(e) => e.stopPropagation()}>
            <div className="doc-modal-head">
              <h3>{openDoc.name}</h3>
              <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => setOpenDoc(null)} aria-label="Закрыть">
                <X size={16} />
              </button>
            </div>
            <img src={openDoc.url} alt={openDoc.name} />
          </div>
        </div>
      )}
    </>
  )
}
