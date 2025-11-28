import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import {
  Users,
  Home,
  Calendar,
  DollarSign,
  AlertTriangle,
  UserCheck,
  FileText,
  CreditCard,
  Loader2,
} from 'lucide-react'
import { Button } from '@components/common'
import { supabase } from '@lib/supabase'
import { useAuth } from '@contexts/AuthContext'
import { formatPrice } from '@utils/formatting'

interface PlatformStats {
  totalUsers: number
  totalProperties: number
  totalViewingRequests: number
  totalTransactionVolume: number
  userBreakdown: {
    tenants: number
    landlords: number
    agents: number
    admins: number
  }
  pendingActions: {
    pendingAgents: number
    pendingReports: number
    pendingPayouts: number
  }
}

const AdminDashboard = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalProperties: 0,
    totalViewingRequests: 0,
    totalTransactionVolume: 0,
    userBreakdown: {
      tenants: 0,
      landlords: 0,
      agents: 0,
      admins: 0,
    },
    pendingActions: {
      pendingAgents: 0,
      pendingReports: 0,
      pendingPayouts: 0,
    },
  })

  // Check if user is admin
  useEffect(() => {
    if (profile) {
      if (profile.role !== 'admin') {
        toast.error('Access denied. Admin only.')
        navigate('/dashboard')
      }
    }
  }, [profile, navigate])

  // Fetch stats
  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchStats()
    }
  }, [user, profile])

  const fetchStats = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Total users by role
      const { data: usersData } = await supabase
        .from('profiles')
        .select('role')
        .neq('status', 'banned')

      const userBreakdown = {
        tenants: usersData?.filter((u) => u.role === 'tenant').length || 0,
        landlords: usersData?.filter((u) => u.role === 'landlord').length || 0,
        agents: usersData?.filter((u) => u.role === 'agent').length || 0,
        admins: usersData?.filter((u) => u.role === 'admin').length || 0,
      }

      const totalUsers = usersData?.length || 0

      // Total properties
      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })

      // Total viewing requests
      const { count: totalViewingRequests } = await supabase
        .from('viewing_requests')
        .select('*', { count: 'exact', head: true })

      // Total transaction volume
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('payment_status', 'successful')

      const totalTransactionVolume =
        transactionsData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0

      // Pending actions
      const { count: pendingAgents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'agent')
        .eq('status', 'pending')

      const { count: pendingReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      const { count: pendingPayouts } = await supabase
        .from('payouts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      setStats({
        totalUsers,
        totalProperties: totalProperties || 0,
        totalViewingRequests: totalViewingRequests || 0,
        totalTransactionVolume,
        userBreakdown,
        pendingActions: {
          pendingAgents: pendingAgents || 0,
          pendingReports: pendingReports || 0,
          pendingPayouts: pendingPayouts || 0,
        },
      })
    } catch (error: any) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  const totalActiveUsers =
    stats.userBreakdown.tenants +
    stats.userBreakdown.landlords +
    stats.userBreakdown.agents +
    stats.userBreakdown.admins

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-2">Admin Dashboard</h1>
        <p className="text-text-light">Platform overview and management</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Platform Overview Stats */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-text mb-4">Platform Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface rounded-lg shadow-md p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-light text-sm mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-text">{stats.totalUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users size={24} className="text-primary" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-surface rounded-lg shadow-md p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-light text-sm mb-1">Total Properties</p>
                    <p className="text-3xl font-bold text-text">{stats.totalProperties}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <Home size={24} className="text-accent" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-surface rounded-lg shadow-md p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-light text-sm mb-1">Viewing Requests</p>
                    <p className="text-3xl font-bold text-text">{stats.totalViewingRequests}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar size={24} className="text-blue-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-surface rounded-lg shadow-md p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-light text-sm mb-1">Transaction Volume</p>
                    <p className="text-2xl font-bold text-text">
                      {formatPrice(stats.totalTransactionVolume)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign size={24} className="text-green-600" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* User Breakdown */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-text mb-4">User Breakdown</h2>
            <div className="bg-surface rounded-lg shadow-md p-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-text-light text-sm mb-1">Tenants</p>
                  <p className="text-2xl font-bold text-text">
                    {stats.userBreakdown.tenants}
                    {totalActiveUsers > 0 && (
                      <span className="text-base font-normal text-text-light ml-2">
                        ({Math.round((stats.userBreakdown.tenants / totalActiveUsers) * 100)}%)
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-text-light text-sm mb-1">Landlords</p>
                  <p className="text-2xl font-bold text-text">
                    {stats.userBreakdown.landlords}
                    {totalActiveUsers > 0 && (
                      <span className="text-base font-normal text-text-light ml-2">
                        ({Math.round((stats.userBreakdown.landlords / totalActiveUsers) * 100)}%)
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-text-light text-sm mb-1">Agents</p>
                  <p className="text-2xl font-bold text-text">
                    {stats.userBreakdown.agents}
                    {totalActiveUsers > 0 && (
                      <span className="text-base font-normal text-text-light ml-2">
                        ({Math.round((stats.userBreakdown.agents / totalActiveUsers) * 100)}%)
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-text-light text-sm mb-1">Admins</p>
                  <p className="text-2xl font-bold text-text">{stats.userBreakdown.admins}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-text mb-4">Pending Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-800 text-sm mb-1">Agent Applications</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {stats.pendingActions.pendingAgents}
                    </p>
                  </div>
                  <AlertTriangle size={24} className="text-yellow-600" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-800 text-sm mb-1">Reports to Review</p>
                    <p className="text-2xl font-bold text-red-900">
                      {stats.pendingActions.pendingReports}
                    </p>
                  </div>
                  <FileText size={24} className="text-red-600" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-800 text-sm mb-1">Payouts to Process</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {stats.pendingActions.pendingPayouts}
                    </p>
                  </div>
                  <CreditCard size={24} className="text-blue-600" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold text-text mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/agent-approval')}
                leftIcon={<UserCheck size={18} />}
                fullWidth
              >
                Approve Agents
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/reports')}
                leftIcon={<FileText size={18} />}
                fullWidth
              >
                Review Reports
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/payouts')}
                leftIcon={<CreditCard size={18} />}
                fullWidth
              >
                Process Payouts
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/users')}
                leftIcon={<Users size={18} />}
                fullWidth
              >
                Manage Users
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminDashboard

