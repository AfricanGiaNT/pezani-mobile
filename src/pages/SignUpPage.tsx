import { Link, Navigate } from 'react-router-dom'
import { SignUpForm } from '@components/auth'
import { useAuth } from '@contexts/AuthContext'

export const SignUpPage = () => {
  const { user, loading } = useAuth()

  // Redirect if already logged in
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-surface rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-3xl font-bold text-text mb-6 text-center">Sign Up</h1>
          <SignUpForm />
          <p className="mt-4 text-center text-text-light">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

