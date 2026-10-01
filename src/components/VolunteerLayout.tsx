import { type ReactNode, useEffect, useState } from 'react'
import { Sidebar, BottomNav, ROLE_LABEL } from './Sidebar'
import { Topbar } from './Topbar'
import { FundStatusBanner } from './FundStatusBanner'
import { getStoredUser, type Role } from '../lib/api'

interface AuthenticatedLayoutProps {
  children: ReactNode
  role?: Role | 'Волонтёр' | 'Администратор' | 'Фонд'
}

export const AuthenticatedLayout = ({ children, role = 'VOLUNTEER' }: AuthenticatedLayoutProps) => {
  const roleLabel =
    role === 'VOLUNTEER' ? 'Волонтёр'
      : role === 'FOUNDATION' ? 'Фонд'
      : role === 'ADMIN' ? 'Администратор'
      : role
  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar role={roleLabel} />
        <main className="content">{children}</main>
      </div>
      <BottomNav />
    </div>
  )
}

/** Для обратной совместимости — старые страницы используют его. */
export const VolunteerLayout = ({ children, role = 'Волонтёр' }: { children: ReactNode; role?: string }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar role={role} />
        <main className="content">{children}</main>
      </div>
      <BottomNav />
    </div>
  )
}

/** Layout для волонтёра. */
export const VolunteerRoleLayout = ({ children }: { children: ReactNode }) => (
  <AuthenticatedLayout role="VOLUNTEER">{children}</AuthenticatedLayout>
)

/** Layout для фонда: показывает статус-баннер организации. */
export const FundLayout = ({ children }: { children: ReactNode }) => (
  <AuthenticatedLayout role="FOUNDATION">
    <FundStatusBanner />
    {children}
  </AuthenticatedLayout>
)

/** Layout для администратора. */
export const AdminLayout = ({ children }: { children: ReactNode }) => (
  <AuthenticatedLayout role="ADMIN">{children}</AuthenticatedLayout>
)

/** Универсальный Layout — сам определяет роль пользователя по данным из стора. */
export const UniversalRoleLayout = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>('VOLUNTEER')
  useEffect(() => {
    const u = getStoredUser()
    if (u) setRole(u.role)
  }, [])
  return <AuthenticatedLayout role={role}>{children}</AuthenticatedLayout>
}

/** Layout для публичных страниц (лендинг, логин, регистрация). */
export const PublicLayout = ({ children }: { children: ReactNode }) => (
  <div className="public-app">{children}</div>
)

export { ROLE_LABEL }
