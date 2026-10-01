import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, roleDefaultPath } from './components/ProtectedRoute'
import { PublicLayout, VolunteerRoleLayout, FundLayout, AdminLayout, UniversalRoleLayout } from './components/VolunteerLayout'
import { getStoredUser } from './lib/api'

// Публичные страницы
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegistrationPage } from './pages/RegistrationPage'
import { RegisterFormPage } from './pages/RegisterFormPage'

// Волонтёр
import { DashboardPage } from './pages/DashboardPage'
import { TasksPage } from './pages/TasksPage'
import { TaskDetailPage } from './pages/TaskDetailPage'
import { MyResponsesPage } from './pages/MyResponsesPage'
import { MessagesPage } from './pages/MessagesPage'
import { HistoryPage } from './pages/HistoryPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { ProfilePage } from './pages/ProfilePage'

// Фонд
import { FundDashboardPage } from './pages/FundDashboardPage'
import { FundTasksPage } from './pages/FundTasksPage'
import { FundTaskFormPage } from './pages/FundTaskFormPage'
import { FundTaskDetailPage } from './pages/FundTaskDetailPage'
import { FundResponsesPage } from './pages/FundResponsesPage'

// Админ (старую AdminPage оставляем для обратной совместимости)
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminTasksPage } from './pages/AdminTasksPage'
import { AdminFoundationsPage } from './pages/AdminFoundationsPage'
import { AdminVolunteersPage } from './pages/AdminVolunteersPage'
import { AdminPage } from './pages/AdminPage'

/**
 * Перенаправление с корня / для авторизованных пользователей —
 * на дефолтный маршрут их роли. Для гостей — на лендинг.
 */
const RootRedirect = () => {
  const user = getStoredUser()
  if (user) return <Navigate to={roleDefaultPath(user.role)} replace />
  return <Navigate to="/home" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== ПУБЛИЧНЫЕ МАРШРУТЫ ===== */}
        <Route
          element={
            <PublicLayout>
              <LandingPage />
            </PublicLayout>
          }
          path="/home"
        />
        {/* Старая ссылка / на лендинг — доступна и гостям, и авторизованным. */}
        <Route path="/" element={<RootRedirect />} />

        <Route
          path="/login"
          element={
            <PublicLayout>
              <LoginPage />
            </PublicLayout>
          }
        />
        <Route
          path="/registration"
          element={
            <PublicLayout>
              <RegistrationPage />
            </PublicLayout>
          }
        />
        <Route
          path="/registration/:role"
          element={
            <PublicLayout>
              <RegisterFormPage />
            </PublicLayout>
          }
        />

        {/* ===== ВОЛОНТЁР ===== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['VOLUNTEER']}>
              <VolunteerRoleLayout>
                <Outlet />
              </VolunteerRoleLayout>
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/responses" element={<MyResponsesPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>

        {/* ===== ФОНД ===== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['FOUNDATION']}>
              <FundLayout>
                <Outlet />
              </FundLayout>
            </ProtectedRoute>
          }
        >
          <Route path="/fund" element={<FundDashboardPage />} />
          <Route path="/fund/tasks" element={<FundTasksPage />} />
          <Route path="/fund/tasks/new" element={<FundTaskFormPage />} />
          <Route path="/fund/tasks/:id" element={<FundTaskDetailPage />} />
          <Route path="/fund/tasks/:id/edit" element={<FundTaskFormPage />} />
          <Route path="/fund/responses" element={<FundResponsesPage />} />
        </Route>

        {/* ===== АДМИНИСТРАТОР ===== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout>
                <Outlet />
              </AdminLayout>
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/tasks" element={<AdminTasksPage />} />
          <Route path="/admin/foundations" element={<AdminFoundationsPage />} />
          <Route path="/admin/volunteers" element={<AdminVolunteersPage />} />
        </Route>

        {/* Старая AdminPage — пусть остаётся доступной и под новым URL для обратной совместимости */}
        <Route
          path="/admin/legacy"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout>
                <AdminPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Общие маршруты — доступны всем авторизованным */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <UniversalRoleLayout>
                <MessagesPage />
              </UniversalRoleLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <UniversalRoleLayout>
                <AnalyticsPage />
              </UniversalRoleLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UniversalRoleLayout>
                <ProfilePage />
              </UniversalRoleLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <UniversalRoleLayout>
                <TasksPage />
              </UniversalRoleLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <ProtectedRoute>
              <UniversalRoleLayout>
                <TaskDetailPage />
              </UniversalRoleLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}

/**
 * Placeholder для вложенных роутов. React Router сам подставляет
 * сюда элемент child-роута, когда path совпадает.
 * Экспортируем, чтобы TypeScript не ругался на неиспользуемые импорты,
 * и чтобы при желании можно было заменить на настоящий Outlet.
 */
import { Outlet } from 'react-router-dom'
export { Outlet }

export default App
