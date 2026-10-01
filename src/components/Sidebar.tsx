import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  ClipboardList,
  HeartHandshake,
  MessageCircle,
  History,
  BarChart3,
  User,
  ShieldCheck,
  PlusSquare,
  LogOut,
  FileText,
  LayoutDashboard,
  Users2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Logo } from './Logo'
import { getStoredUser, logout, type Role } from '../lib/api'
import { useEffect, useState } from 'react'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  match?: string
}

const VOLUNTEER_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Главная', icon: Home },
  { to: '/tasks', label: 'Задания', icon: ClipboardList },
  { to: '/responses', label: 'Мои отклики', icon: HeartHandshake },
  { to: '/messages', label: 'Сообщения', icon: MessageCircle },
  { to: '/history', label: 'История', icon: History },
  { to: '/analytics', label: 'Аналитика', icon: BarChart3 },
  { to: '/profile', label: 'Профиль', icon: User },
]

const FUND_NAV: NavItem[] = [
  { to: '/fund', label: 'Панель фонда', icon: LayoutDashboard },
  { to: '/fund/tasks', label: 'Мои задания', icon: FileText },
  { to: '/fund/tasks/new', label: 'Новое задание', icon: PlusSquare },
  { to: '/fund/responses', label: 'Отклики волонтёров', icon: HeartHandshake },
  { to: '/messages', label: 'Сообщения', icon: MessageCircle },
  { to: '/analytics', label: 'Аналитика', icon: BarChart3 },
  { to: '/profile', label: 'Профиль фонда', icon: User },
]

const ADMIN_NAV: NavItem[] = [
  { to: '/admin', label: 'Модерация', icon: ShieldCheck },
  { to: '/admin/tasks', label: 'Задания', icon: ClipboardList },
  { to: '/admin/foundations', label: 'Фонды', icon: Users2 },
  { to: '/admin/volunteers', label: 'Волонтёры', icon: User },
  { to: '/analytics', label: 'Аналитика', icon: BarChart3 },
  { to: '/profile', label: 'Профиль', icon: User },
]

const BOTTOM_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Главная', icon: Home },
  { to: '/tasks', label: 'Задания', icon: ClipboardList },
  { to: '/messages', label: 'Сообщения', icon: MessageCircle },
  { to: '/profile', label: 'Профиль', icon: User },
]

const ROLE_LABEL: Record<Role, string> = {
  VOLUNTEER: 'Волонтёр',
  FOUNDATION: 'Фонд',
  ADMIN: 'Администратор',
}

function useCurrentRole(): Role {
  const [role, setRole] = useState<Role>('VOLUNTEER')
  useEffect(() => {
    const u = getStoredUser()
    if (u) setRole(u.role)
  }, [])
  return role
}

function getNavItems(role: Role): NavItem[] {
  if (role === 'FOUNDATION') return FUND_NAV
  if (role === 'ADMIN') return ADMIN_NAV
  return VOLUNTEER_NAV
}

export const Sidebar = () => {
  const role = useCurrentRole()
  const items = getNavItems(role)
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="sidebar">
      <Logo />
      <nav className="side-nav">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', padding: '0 10px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          className="side-link"
          onClick={onLogout}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', width: '100%', textAlign: 'left' }}
        >
          <LogOut size={19} />
          Выйти
        </button>
      </div>
    </aside>
  )
}

export const BottomNav = () => {
  const role = useCurrentRole()

  const navItems = role === 'VOLUNTEER'
    ? BOTTOM_NAV
    : [
        { to: role === 'FOUNDATION' ? '/fund' : '/admin', label: 'Главная', icon: Home as LucideIcon },
        { to: role === 'FOUNDATION' ? '/fund/tasks' : '/admin/tasks', label: 'Задания', icon: ClipboardList as LucideIcon },
        { to: '/messages', label: 'Сообщения', icon: MessageCircle as LucideIcon },
        { to: '/profile', label: 'Профиль', icon: User as LucideIcon },
      ]

  return (
    <nav className="bottom-nav">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export { ROLE_LABEL }
