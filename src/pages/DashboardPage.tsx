import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'
import TenantDashboard from './TenantDashboard'
import LandlordDashboard from './LandlordDashboard'
import AdminDashboard from './admin/AdminDashboard'

const DashboardPage = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  // Redirect pending agents to pending page
  useEffect(() => {
    if (profile?.role === 'agent' && profile?.status === 'pending') {
      navigate('/agent-pending')
    }
  }, [profile, navigate])

  // Route to role-specific dashboards
  if (profile?.role === 'tenant') {
    return <TenantDashboard />
  }

  if (profile?.role === 'landlord' || profile?.role === 'agent') {
    return <LandlordDashboard />
  }

  if (profile?.role === 'admin') {
    return <AdminDashboard />
  }

  // Generic dashboard for other roles (landlord/agent/admin dashboards will be added later)
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-text mb-6">Dashboard</h1>
      {user && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Email:</span> {user.email}
            </p>
            {profile && (
              <>
                {profile.full_name && (
                  <p>
                    <span className="font-medium">Name:</span> {profile.full_name}
                  </p>
                )}
                {profile.phone && (
                  <p>
                    <span className="font-medium">Phone:</span> {profile.phone}
                  </p>
                )}
                <p>
                  <span className="font-medium">Role:</span>{' '}
                  <span className="capitalize">{profile.role}</span>
                </p>
                {profile.status === 'pending' && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                    Your account is pending approval. You'll be notified once approved.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {/* TODO: Add dashboard content based on user role */}
    </div>
  )
}

export default DashboardPage

