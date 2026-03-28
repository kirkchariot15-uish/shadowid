'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { AlertCircle, Flag, Shield, TrendingDown, Users, LogOut, Eye, Trash2, CheckCircle } from 'lucide-react'
import { getAdminSession, clearAdminSession, getAdminAuditLogs, logAdminAction } from '@/lib/admin-system'

interface FlaggedUser {
  id: string
  commitmentHash: string
  reason: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  flaggedAt: string
  flaggedBy: string
  status: 'pending' | 'reviewing' | 'resolved'
}

interface AdminStats {
  totalFlags: number
  pendingReview: number
  accountsSuspended: number
  miniAdminsManaged: number
}

export default function AdminPanel() {
  const router = useRouter()
  const [adminSession, setAdminSession] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState<AdminStats>({
    totalFlags: 0,
    pendingReview: 0,
    accountsSuspended: 0,
    miniAdminsManaged: 0,
  })
  const [flaggedUsers, setFlaggedUsers] = useState<FlaggedUser[]>([])
  const [newFlagReason, setNewFlagReason] = useState('')
  const [newFlagHash, setNewFlagHash] = useState('')
  const [newFlagSeverity, setNewFlagSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    setMounted(true)
    const session = getAdminSession()
    
    if (!session || session.role !== 'global_admin') {
      router.push('/account-recovery')
      return
    }

    setAdminSession(session)
    loadData()
  }, [router])

  const loadData = () => {
    // Load flagged users from localStorage
    const storedFlags = localStorage.getItem('flagged-users')
    const flags = storedFlags ? JSON.parse(storedFlags) : []
    
    setFlaggedUsers(flags)
    setStats({
      totalFlags: flags.length,
      pendingReview: flags.filter(f => f.status === 'pending').length,
      accountsSuspended: flags.filter(f => f.status === 'resolved' && f.severity === 'critical').length,
      miniAdminsManaged: parseInt(localStorage.getItem('mini-admin-count') || '0'),
    })
  }

  const handleFlagAccount = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newFlagHash.trim() || !newFlagReason.trim()) {
      alert('Please fill in all fields')
      return
    }

    const newFlag: FlaggedUser = {
      id: Math.random().toString(36).substring(7),
      commitmentHash: newFlagHash,
      reason: newFlagReason,
      severity: newFlagSeverity,
      flaggedAt: new Date().toISOString(),
      flaggedBy: (adminSession as any)?.commitmentHash || 'admin',
      status: 'pending',
    }

    const storedFlags = localStorage.getItem('flagged-users')
    const flags = storedFlags ? JSON.parse(storedFlags) : []
    flags.push(newFlag)
    localStorage.setItem('flagged-users', JSON.stringify(flags))

    // Log action
    logAdminAction(
      (adminSession as any)?.commitmentHash,
      'global_admin',
      'flag_account',
      newFlagHash,
      { reason: newFlagReason, severity: newFlagSeverity }
    )

    setNewFlagHash('')
    setNewFlagReason('')
    setNewFlagSeverity('medium')
    loadData()
  }

  const handleResolveFlaggedAccount = (flagId: string) => {
    const storedFlags = localStorage.getItem('flagged-users')
    const flags = storedFlags ? JSON.parse(storedFlags) : []
    const updatedFlags = flags.map(f => 
      f.id === flagId ? { ...f, status: 'resolved' } : f
    )
    localStorage.setItem('flagged-users', JSON.stringify(updatedFlags))
    
    logAdminAction(
      (adminSession as any)?.commitmentHash,
      'global_admin',
      'resolve_flag',
      flags.find(f => f.id === flagId)?.commitmentHash,
      { flagId }
    )
    
    loadData()
  }

  const handleLogout = () => {
    clearAdminSession()
    router.push('/dashboard')
  }

  if (!mounted || !adminSession) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Global Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Manage accounts, flags, and mini-admins</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="border border-accent/30 rounded-lg p-6 bg-card shadow-md">
            <div className="flex items-start justify-between mb-3">
              <Flag className="w-5 h-5 text-accent" />
              <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded">Total</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.totalFlags}</p>
            <p className="text-xs text-muted-foreground mt-1">Flagged Accounts</p>
          </div>

          <div className="border border-yellow-500/30 rounded-lg p-6 bg-card shadow-md">
            <div className="flex items-start justify-between mb-3">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded">Pending</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.pendingReview}</p>
            <p className="text-xs text-muted-foreground mt-1">Pending Review</p>
          </div>

          <div className="border border-red-500/30 rounded-lg p-6 bg-card shadow-md">
            <div className="flex items-start justify-between mb-3">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <span className="text-xs px-2 py-1 bg-red-500/10 text-red-500 rounded">Suspended</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.accountsSuspended}</p>
            <p className="text-xs text-muted-foreground mt-1">Suspended Accounts</p>
          </div>

          <div className="border border-accent/30 rounded-lg p-6 bg-card shadow-md">
            <div className="flex items-start justify-between mb-3">
              <Users className="w-5 h-5 text-accent" />
              <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded">Active</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.miniAdminsManaged}</p>
            <p className="text-xs text-muted-foreground mt-1">Mini-Admins</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-accent/20">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-4 font-semibold transition-colors ${
              activeTab === 'overview'
                ? 'border-b-2 border-accent text-accent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('flag')}
            className={`pb-3 px-4 font-semibold transition-colors ${
              activeTab === 'flag'
                ? 'border-b-2 border-accent text-accent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Flag Account
          </button>
          <button
            onClick={() => setActiveTab('mini-admins')}
            className={`pb-3 px-4 font-semibold transition-colors ${
              activeTab === 'mini-admins'
                ? 'border-b-2 border-accent text-accent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mini-Admins
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="border border-accent/30 rounded-lg p-6 bg-card shadow-md">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Flag className="w-5 h-5 text-accent" />
                Flagged Accounts
              </h2>
              
              {flaggedUsers.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">No flagged accounts yet</p>
              ) : (
                <div className="space-y-3">
                  {flaggedUsers.map((flag) => (
                    <div key={flag.id} className="p-4 rounded-lg bg-background border border-accent/20 hover:border-accent/40 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-mono text-sm text-accent break-all">{flag.commitmentHash.substring(0, 40)}...</p>
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              flag.severity === 'critical' ? 'bg-red-500/10 text-red-500' :
                              flag.severity === 'high' ? 'bg-orange-500/10 text-orange-500' :
                              flag.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                              'bg-blue-500/10 text-blue-500'
                            }`}>
                              {flag.severity.toUpperCase()}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              flag.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                              flag.status === 'reviewing' ? 'bg-blue-500/10 text-blue-500' :
                              'bg-green-500/10 text-green-500'
                            }`}>
                              {flag.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-foreground font-semibold">{flag.reason}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Flagged: {new Date(flag.flaggedAt).toLocaleString()}
                          </p>
                        </div>
                        {flag.status === 'pending' && (
                          <Button
                            onClick={() => handleResolveFlaggedAccount(flag.id)}
                            className="ml-4 bg-accent hover:bg-accent/90"
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Flag Account Tab */}
        {activeTab === 'flag' && (
          <div className="border border-accent/30 rounded-lg p-6 bg-card shadow-md max-w-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Flag className="w-5 h-5 text-accent" />
              Flag an Account
            </h2>
            
            <form onSubmit={handleFlagAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Commitment Hash
                </label>
                <input
                  type="text"
                  value={newFlagHash}
                  onChange={(e) => setNewFlagHash(e.target.value)}
                  placeholder="Enter the commitment hash to flag"
                  className="w-full px-4 py-2 bg-background border border-accent/20 rounded-lg text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Reason for Flagging
                </label>
                <textarea
                  value={newFlagReason}
                  onChange={(e) => setNewFlagReason(e.target.value)}
                  placeholder="Describe the reason for flagging this account"
                  className="w-full px-4 py-2 bg-background border border-accent/20 rounded-lg text-foreground"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Severity Level
                </label>
                <select
                  value={newFlagSeverity}
                  onChange={(e) => setNewFlagSeverity(e.target.value as any)}
                  className="w-full px-4 py-2 bg-background border border-accent/20 rounded-lg text-foreground"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                Flag Account
              </Button>
            </form>
          </div>
        )}

        {/* Mini-Admins Tab */}
        {activeTab === 'mini-admins' && (
          <div className="border border-accent/30 rounded-lg p-6 bg-card shadow-md">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Mini-Admin Management
            </h2>
            <p className="text-muted-foreground mb-4">
              Mini-admin management features coming soon. You can create and manage organizations and assign mini-admins through this panel.
            </p>
            <Button className="bg-accent hover:bg-accent/90" disabled>
              Create Mini-Admin
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
