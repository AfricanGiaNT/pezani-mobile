import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Button, Input } from '@components/common'
import { Mail, Lock, User, Phone } from 'lucide-react'
import { useAuth } from '@contexts/AuthContext'
import { signUpSchema } from '@utils/validation'

export const SignUpForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'tenant' as 'tenant' | 'landlord' | 'agent'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setErrors({})
    setIsLoading(true)

    try {
      // Validate form data
      const validationResult = signUpSchema.safeParse({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        phone: formData.phone,
        role: formData.role
      })

      if (!validationResult.success) {
        const fieldErrors: Record<string, string> = {}
        validationResult.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as string] = issue.message
          }
        })
        setErrors(fieldErrors)
        setIsLoading(false)
        return
      }

      // Sign up user
      const { data, error: signUpError } = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.phone,
        formData.role
      )

      if (signUpError) {
        setError(signUpError.message || 'Failed to create account. Please try again.')
        setIsLoading(false)
        return
      }

      if (data) {
        // Successfully signed up
        if (formData.role === 'agent') {
          toast.success('Your agent application is under review. You will be notified once approved.')
        } else {
          toast.success('Registration successful! Please check your email to verify your account.')
        }
        navigate('/login')
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
        type="text"
        label="Full Name"
        placeholder="Enter your full name"
        value={formData.fullName}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        leftIcon={<User size={20} />}
        error={errors.full_name}
        required
        disabled={isLoading}
      />
      <Input
        type="email"
        label="Email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        leftIcon={<Mail size={20} />}
        error={errors.email}
        required
        disabled={isLoading}
      />
      <Input
        type="tel"
        label="Phone"
        placeholder="+265 9XXXXXXXX"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        leftIcon={<Phone size={20} />}
        error={errors.phone}
        required
        disabled={isLoading}
      />
      <div>
        <label className="block text-sm font-medium text-text mb-2">Role</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="role"
              value="tenant"
              checked={formData.role === 'tenant'}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="mr-2"
              disabled={isLoading}
            />
            Tenant
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="role"
              value="landlord"
              checked={formData.role === 'landlord'}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="mr-2"
              disabled={isLoading}
            />
            Landlord
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="role"
              value="agent"
              checked={formData.role === 'agent'}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="mr-2"
              disabled={isLoading}
            />
            Agent
          </label>
        </div>
        {errors.role && <p className="mt-1 text-sm text-error">{errors.role}</p>}
      </div>
      <Input
        type="password"
        label="Password"
        placeholder="Enter your password (min 8 characters)"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        leftIcon={<Lock size={20} />}
        error={errors.password}
        required
        disabled={isLoading}
      />
      <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLoading}>
        Sign Up
      </Button>
    </form>
  )
}

