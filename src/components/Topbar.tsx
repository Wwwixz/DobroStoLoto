import { useEffect, useRef, useState } from 'react'
import { Bell, ChevronDown, Dot } from 'lucide-react'
import { notifications as initialNotifications } from '../data/notifications'

export const Topbar = ({ role = 'Волонтёр' }: { role?: string }) => {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState(initialNotifications)
  const wrapRef = useRef<HTMLDivElement>(null)

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

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })))

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
        <span className="avatar">АИ</span>
        <span>
          <span className="user-name">Алексей Иванов</span>
          <span className="user-role" style={{ display: 'block' }}>{role}</span>
        </span>
        <ChevronDown size={16} style={{ color: 'var(--muted)' }} />
      </div>
    </header>
  )
}
