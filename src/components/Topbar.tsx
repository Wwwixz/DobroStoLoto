import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Building2,
  ChevronDown,
  Dot,
  HeartHandshake,
  History,
  LogOut,
  MessageCircle,
  ShieldCheck,
  User,
  BarChart3,
} from 'lucide-react'
import { clearNotifications, deleteNotification, getStoredUser, readAllNotifications, setStoredUser, useApi, type NotificationItem } from '../lib/api'

export const Topbar = ({ role = 'Волонтёр' }: { role?: string }) => {
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { data, reload } = useApi<NotificationItem[]>('/notifications')
  const [items, setItems] = useState<NotificationItem[]>([])
  const wrapRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

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
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [])

  const storedUser = getStoredUser()
  const appRole = storedUser?.role

  const go = (to: string) => {
    setMenuOpen(false)
    navigate(to)
  }

  const logout = () => {
    setMenuOpen(false)
    setStoredUser(null)
    navigate('/login')
  }

  const menuItems = [
    { to: '/profile', label: 'Профиль', icon: User, show: true },
    { to: '/responses', label: 'Мои отклики', icon: HeartHandshake, show: appRole !== 'ADMIN' && appRole !== 'FOUNDATION' },
    { to: '/messages', label: 'Сообщения', icon: MessageCircle, show: true },
    { to: '/history', label: 'История', icon: History, show: appRole !== 'ADMIN' && appRole !== 'FOUNDATION' },
    { to: '/fund', label: 'Кабинет фонда', icon: Building2, show: appRole === 'FOUNDATION' },
    { to: '/admin', label: 'Админ', icon: ShieldCheck, show: appRole === 'ADMIN' },
    { to: '/analytics', label: 'Аналитика', icon: BarChart3, show: appRole === 'ADMIN' },
  ].filter((item) => item.show)

  const markAllRead = async () => {
    try {
      await readAllNotifications()
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      // молча: уведомления не критичны
    }
  }

  // Переход по уведомлению: удаляем его из списка и открываем связанную страницу
  const openNotification = (n: NotificationItem) => {
    if (!n.link) return
    setItems((prev) => prev.filter((i) => i.id !== n.id))
    deleteNotification(n.id).catch(() => {
      // молча: уведомления не критичны
    })
    setOpen(false)
    navigate(n.link)
  }

  // Очистить все уведомления
  const clearAll = async () => {
    setItems([])
    try {
      await clearNotifications()
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
              <div className="notif-actions">
                {unreadCount > 0 && (
                  <button className="notif-mark" onClick={markAllRead}>
                    Прочитать все
                  </button>
                )}
                {items.length > 0 && (
                  <button className="notif-mark notif-clear" onClick={clearAll}>
                    Очистить все
                  </button>
                )}
              </div>
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
                <div
                  key={n.id}
                  className={`notif-item ${n.read ? '' : 'unread'} ${n.link ? 'clickable' : ''}`}
                  onClick={() => openNotification(n)}
                  role={n.link ? 'button' : undefined}
                >
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

      <div className="user-menu-wrap" ref={menuRef}>
        <button
          className="user-chip"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Меню пользователя"
          aria-expanded={menuOpen}
        >
          <span className="avatar">{initials}</span>
          <span>
            <span className="user-name">{userName}</span>
            <span className="user-role" style={{ display: 'block' }}>{role}</span>
          </span>
          <ChevronDown size={16} className={`chip-chevron ${menuOpen ? 'open' : ''}`} style={{ color: 'var(--muted)' }} />
        </button>

        {menuOpen && (
          <div className="user-dropdown">
            {menuItems.map((item) => (
              <button key={item.to} className="user-menu-item" onClick={() => go(item.to)}>
                <item.icon size={17} />
                {item.label}
              </button>
            ))}
            <div className="user-menu-sep" />
            <button className="user-menu-item user-menu-logout" onClick={logout}>
              <LogOut size={17} />
              Выйти
            </button>
          </div>
        )}
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
