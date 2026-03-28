'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, Building2, LogOut, Clock } from 'lucide-react'
import { getAdminSession, clearAdminSession, logAdminAction, MiniAdminType } from '@/lib/admin-system'

interface CredentialVerification {
  id: string
  userCommitment: string
  credentialType: string
  status: 'pending' | 'verified' | 'rejected'
  submittedAt: string
  verifiedAt?: string
}

interface MiniAdminInfo {
  organizationName: string
  organizationType: MiniAdminType
  credentialsManaged: string[]
  verifiedUsers: number
  pendingVerifications: number
}

export default function MiniAdminPanel() {
  const router = useRouter()
  const [adminSession, setAdminSession] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [miniAdminInfo, setMiniAdminInfo] = useState<MiniAdminInfo | null>(null)
  const [pendingVerifications, setPendingVerifications] = useState<CredentialVerification[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    setMounted(true)
    const session = getAdminSession()
    
    if (!session || session.role !== 'mini_admin') {
      router.push('/account-recovery')
      return
    }

    setAdminSession(session)
    loadMiniAdminData(session)
  }, [router])

  const loadMiniAdminData = (session: any) => {
    // Load mini-admin data from localStorage
    const storedMiniAdmin = localStorage.getItem(`mini-admin-${session.commitmentHash}`)
    
    if (storedMiniAdmin) {
      const miniAdminData = JSON.parse(storedMiniAdmin)
      setMiniAdminInfo({
        organizationName: miniAdminData.organizationName,
        organizationType: miniAdminData.type,
        credentialsManaged: miniAdminData.credentials || [],
        verifiedUsers: miniAdminData.verifiedCount || 0,
        pendingVerifications: miniAdminData.pendingCount || 0,
      })
    }

    // Load pending verifications
    const storedPending = localStorage.getItem(`pending-verifications-${session.commitmentHash}`)
    if (storedPending) {
      setPendingVerifications(JSON.parse(storedPending))
    }
  }

  const handleVerifyCredential = (verificationId: string, approved: boolean) => {
    const updated = pendingVerifications.map(v =>
      v.id === verificationId
        ? {
            ...v,
            status: approved ? 'verified' : 'rejected',
            verifiedAt: new Date().toISOString(),
          }
        : v
    )

    setPendingVerifications(updated)
    
    const session = getAdminSession() as any
    localStorage.setItem(`pending-verifications-${session.commitmentHash}`, JSON.stringify(updated))

    // Log action
    logAdminAction(
      session.commitmentHash,
      `mini_admin_${miniAdminInfo?.organizationType}`,
      approved ? 'verify_credential' : 'reject_credential',
      updated.find(v => v.id === verificationId)?.userCommitment,
      { verificationId, approved }
    )

    // Update stats
    const verification = pendingVerifications.find(v => v.id === verificationId)
    if (verification && approved && miniAdminInfo) {
      setMiniAdminInfo({
        ...miniAdminInfo,
        verifiedUsers: miniAdminInfo.verifiedUsers + 1,
        pendingVerifications: Math.max(0, miniAdminInfo.pendingVerifications - 1),
      })
    }
  }

  const handleLogout = () => {
    clearAdminSession()
    router.push('/dashboard')
  }

  if (!mounted || !adminSession || !miniAdminInfo) {
    return null
  }

  const typeLabels: Record<MiniAdminType, string> = {
    university: 'University',
    governmental: 'Governmental',
    dao: 'DAO',
    universal: 'Universal',
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{miniAdminInfo.organizationName}</h1>
              <p className="text-sm text-muted-foreground">
                {typeLabels[miniAdminInfo.organizationType]} Admin Portal - Credential Verification
              </p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="border border-accent/30 rounded-lg p-6 bg-card shadow-md">
            <div className="flex items-start justify-between mb-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded">Verified</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{miniAdminInfo.verifiedUsers}</p>
            <p className="text-xs text-muted-foreground mt-1">Users Verified</p>
          </div>

          <div className="border border-yellow-500/30 rounded-lg p-6 bg-card shadow-md">
            <div className="flex items-start justify-between mb-3">
              <Clock className="w-5 h-5 text-yellow-500" />
              <span className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded">Pending</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{miniAdminInfo.pendingVerifications}</p>
            <p className="text-xs text-muted-foreground mt-1">Pending Verifications</p>
          </div>

          <div className="border border-accent/30 rounded-lg p-6 bg-card shadow-md">
            <div className="flex items-start justify-between mb-3">
              <AlertCircle className="w-5 h-5 text-accent" />
              <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded">Managed</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{miniAdminInfo.credentialsManaged.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Credential Types</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-accent/20">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 px-4 font-semibold transition-colors ${
              activeTab === 'pending'
                ? 'border-b-2 border-accent text-accent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending Verifications ({miniAdminInfo.pendingVerifications})
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`pb-3 px-4 font-semibold transition-colors ${
              activeTab === 'credentials'
                ? 'border-b-2 border-accent text-accent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Managed Credentials
          </button>
        </div>

        {/* Pending Verifications Tab */}
        {activeTab === 'pending' && (
          <div className="border border-accent/30 rounded-lg p-6 bg-card shadow-md">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Pending Verifications
            </h2>

            {pendingVerifications.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No pending verifications</p>
            ) : (
              <div className="space-y-3">
                {pendingVerifications
                  .filter(v => v.status === 'pending')
                  .map((verification) => (
                    <div key={verification.id} className="p-4 rounded-lg bg-background border border-accent/20 hover:border-accent/40 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-mono text-sm text-accent break-all">
                              {verification.userCommitment.substring(0, 40)}...
                            </p>
                            <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full font-semibold">
                              {verification.credentialType}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Submitted: {new Date(verification.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            onClick={() => handleVerifyCredential(verification.id, true)}
                            className="bg-green-500 hover:bg-green-600"
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleVerifyCredential(verification.id, false)}
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Credentials Tab */}
        {activeTab === 'credentials' && (
          <div className="border border-accent/30 rounded-lg p-6 bg-card shadow-md">
            <h2 className="text-xl font-bold mb-4">Managed Credential Types</h2>

            {miniAdminInfo.credentialsManaged.length === 0 ? (
              <p className="text-muted-foreground py-8">No credentials assigned to this organization yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {miniAdminInfo.credentialsManaged.map((credential) => (
                  <div key={credential} className="p-4 rounded-lg bg-background border border-accent/20">
                    <p className="font-semibold text-foreground">{credential}</p>
                    <p className="text-xs text-muted-foreground mt-1">Credential Type</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
