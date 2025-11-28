import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button, Input } from '@components/common'
import { Mail, Lock } from 'lucide-react'
import { useAuth } from '@contexts/AuthContext'

export const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as any)?.from?.pathname || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { data, error: signInError } = await signIn(email, password)

      if (signInError) {
        setError(signInError.message || 'Failed to login. Please check your credentials.')
        setIsLoading(false)
        return
      }

      if (data) {
        // Successfully logged in
        navigate(from, { replace: true })
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <Input
        type="email"
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail size={20} />}
        required
        disabled={isLoading}
      />
      <Input
        type="password"
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        leftIcon={<Lock size={20} />}
        required
        disabled={isLoading}
      />
      <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLoading}>
        Login
      </Button>
    </form>
  )
}

