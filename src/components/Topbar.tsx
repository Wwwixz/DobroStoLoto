import { Bell, ChevronDown } from 'lucide-react'

export const Topbar = ({ role = 'Волонтёр' }: { role?: string }) => (
  <header className="topbar">
    <button className="icon-btn">
      <Bell size={18} />
      <span className="dot" />
    </button>
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
