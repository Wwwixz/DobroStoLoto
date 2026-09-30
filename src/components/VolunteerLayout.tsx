import type { ReactNode } from 'react'
import { Sidebar, BottomNav } from './Sidebar'
import { Topbar } from './Topbar'

export const VolunteerLayout = ({ children, role = 'Волонтёр' }: { children: ReactNode; role?: string }) => (
  <div className="layout">
    <Sidebar />
    <div className="main">
      <Topbar role={role} />
      <main className="content">{children}</main>
    </div>
    <BottomNav />
  </div>
)
