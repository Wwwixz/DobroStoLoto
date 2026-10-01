import { useEffect, useRef, useState } from 'react'
import { Bell, ChevronDown, Dot } from 'lucide-react'
import { readAllNotifications, useApi, type NotificationItem } from '../lib/api'

export const Topbar = ({ role = 'Волонтёр' }: { role?: string }) => {
  const [open, setOpen] = useState(false)
  const { data, reload } = useApi<NotificationItem[]>('/notifications')
  const [items, setItems] = useState<NotificationItem[]>([])
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setItems(data ?? [])
  }, [data])

  // Обновляем список, когда пользователь открывает панель уведомлений
  useEffect(() => {
    if (open) reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const user = getStoredUserName()
  const userName = user ?? 'Алексей Иванов'
  const initials = userName
    .split(' ')
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const unreadCount = items.filter((n) => !n.read).length

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [])

  const markAllRead = async () => {
    try {
      await readAllNotifications()
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      // молча: уведомления не критичны
    }
  }

  return (
    <header className="topbar">
      <div className="notif-wrap" ref={wrapRef}>
        <button className="icon-btn" onClick={() => setOpen((v) => !v)} aria-label="Уведомления">
          <Bell size={18} />
          {unreadCount > 0 && <span className="dot" />}
        </button>

        {open && (
          <div className="notif-dropdown">
            <div className="notif-head">
              <h3>Уведомления</h3>
              {unreadCount > 0 && (
                <button className="notif-mark" onClick={markAllRead}>
                  Прочитать все
                </button>
              )}
            </div>
            <div className="notif-list">
              {items.length === 0 && (
                <div className="notif-item">
                  <div>
                    <div className="notif-title">Пока пусто</div>
                    <p className="notif-text">Уведомления появятся по мере событий: отклики, модерация, сообщения.</p>
                  </div>
                </div>
              )}
              {items.map((n) => (
                <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`}>
                  {!n.read && <Dot className="notif-dot" size={28} strokeWidth={0} fill="currentColor" />}
                  <div>
                    <div className="notif-title">{n.title}</div>
                    <p className="notif-text">{n.text}</p>
                    <span className="notif-time">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="user-chip">
        <span className="avatar">{initials}</span>
        <span>
          <span className="user-name">{userName}</span>
          <span className="user-role" style={{ display: 'block' }}>{role}</span>
        </span>
        <ChevronDown size={16} style={{ color: 'var(--muted)' }} />
      </div>
    </header>
  )
}

function getStoredUserName(): string | null {
  try {
    const raw = localStorage.getItem('ds_user')
    if (!raw) return null
    return (JSON.parse(raw) as { fullName?: string }).fullName ?? null
  } catch {
    return null
  }
}
