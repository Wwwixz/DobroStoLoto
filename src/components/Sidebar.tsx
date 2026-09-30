import { NavLink } from 'react-router-dom'
import {
  Home,
  ClipboardList,
  HeartHandshake,
  MessageCircle,
  History,
  BarChart3,
  User,
  ShieldCheck,
} from 'lucide-react'
import { Logo } from './Logo'

const items = [
  { to: '/dashboard', label: 'Главная', icon: Home },
  { to: '/tasks', label: 'Задания', icon: ClipboardList },
  { to: '/responses', label: 'Мои отклики', icon: HeartHandshake },
  { to: '/messages', label: 'Сообщения', icon: MessageCircle },
  { to: '/history', label: 'История', icon: History },
  { to: '/analytics', label: 'Аналитика', icon: BarChart3 },
  { to: '/profile', label: 'Профиль', icon: User },
]

export const Sidebar = () => (
  <aside className="sidebar">
    <Logo />
    <nav className="side-nav">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
          <Icon size={19} />
          {label}
        </NavLink>
      ))}
    </nav>
    <div style={{ marginTop: 'auto', padding: '0 10px' }}>
      <NavLink to="/admin" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
        <ShieldCheck size={19} />
        Админ
      </NavLink>
    </div>
  </aside>
)

export const BottomNav = () => {
  const navItems = [
    { to: '/dashboard', label: 'Главная', icon: Home },
    { to: '/tasks', label: 'Задания', icon: ClipboardList },
    { to: '/messages', label: 'Сообщения', icon: MessageCircle },
    { to: '/profile', label: 'Профиль', icon: User },
  ]
  return (
    <nav className="bottom-nav">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
