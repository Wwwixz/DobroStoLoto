import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { getStoredUser, roleDefaultPath, type Role } from '../lib/api'

export { logout, roleDefaultPath, ROLE_DEFAULT_PATH } from '../lib/api'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: Role[]
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation()
  const user = getStoredUser()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleDefaultPath(user.role)} replace />
  }

  return <>{children}</>
}
