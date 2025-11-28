import { Link, Navigate } from 'react-router-dom'
import { LoginForm } from '@components/auth'
import { useAuth } from '@contexts/AuthContext'

export const LoginPage = () => {
  const { user, loading } = useAuth()

  // Redirect if already logged in
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-surface rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-3xl font-bold text-text mb-6 text-center">Login</h1>
          <LoginForm />
          <p className="mt-4 text-center text-text-light">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

