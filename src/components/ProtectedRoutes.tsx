import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('adminToken')

  
  // Check if user is authenticated
  const isAuthenticated = token 
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/admin/login" replace />
  }
  
  return <>{children}</>
}