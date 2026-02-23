'use client'

import { useState, useEffect } from 'react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, Shield, Send } from 'lucide-react'
import { approveDAOAttestation, rejectDAOAttestation } from '@/lib/aleo-sdk-integration'
import { addActivityLog } from '@/lib/activity-logger'

interface AttestationRequest {
  id: string
  userId: string
  daoId: string
  requestedAt: number
  status: 'pending' | 'approved' | 'rejected'
}

export default function DAOLeaderDashboard() {
  const { address } = useAleoWallet()
  const [pendingRequests, setPendingRequests] = useState<AttestationRequest[]>([])
  const [approvedRequests, setApprovedRequests] = useState<AttestationRequest[]>([])
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')

  // Mock pending requests (in real implementation, fetch from contract)
  useEffect(() => {
    setPendingRequests([
      {
        id: '0x123abc',
        userId: 'aleo1user1qyqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
        daoId: '0x1',
        requestedAt: Date.now() - 3600000,
        status: 'pending'
      },
      {
        id: '0x456def',
        userId: 'aleo1user2qyqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
        daoId: '0x1',
        requestedAt: Date.now() - 7200000,
        status: 'pending'
      }
    ])
  }, [])

  const handleApprove = async (request: AttestationRequest) => {
    if (!address) return
    
    setIsProcessing(request.id)
    try {
      // Generate signature for the attestation
      const encoder = new TextEncoder()
      const data = `${request.userId}${request.daoId}${Date.now()}`
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoder.encode(data))
      const signatureArray = Array.from(new Uint8Array(hashBuffer))
      const signature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('')

      // Approve on-chain (1 year expiration = ~5256000 blocks)
      const result = await approveDAOAttestation(
        request.id,
        signature,
        (BigInt(Date.now()) / BigInt(1000) + BigInt(31536000n)).toString(),
        address
      )

      if (result.success) {
        setPendingRequests(pendingRequests.filter(r => r.id !== request.id))
        setApprovedRequests([...approvedRequests, { ...request, status: 'approved' }])
        addActivityLog('Approve Attestation', 'attestation', `Approved ${request.id}`, 'success')
      }
    } catch (err) {
      console.error('[v0] Approval error:', err)
      alert(`Failed to approve: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(null)
    }
  }

  const handleReject = async (request: AttestationRequest) => {
    if (!address) return
    
    setIsProcessing(request.id)
    try {
      const result = await rejectDAOAttestation(request.id, address)
      
      if (result.success) {
        setPendingRequests(pendingRequests.filter(r => r.id !== request.id))
        addActivityLog('Reject Attestation', 'attestation', `Rejected ${request.id}`, 'info')
      }
    } catch (err) {
      console.error('[v0] Rejection error:', err)
      alert(`Failed to reject: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(null)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 12)}...${addr.slice(-4)}`
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <h1 className="text-3xl font-bold tracking-tight">DAO Leader Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage attestation requests from community members</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-lg border border-border bg-card/30 p-4">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent" />
                Pending
              </p>
              <p className="text-3xl font-bold mt-2">{pendingRequests.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-card/30 p-4">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Approved
              </p>
              <p className="text-3xl font-bold mt-2">{approvedRequests.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-card/30 p-4">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                Total
              </p>
              <p className="text-3xl font-bold mt-2">{pendingRequests.length + approvedRequests.length}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-border">
            {(['pending', 'approved', 'rejected'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="capitalize">{tab}</span>
                {tab === 'pending' && <span className="ml-2 text-sm">({pendingRequests.length})</span>}
                {tab === 'approved' && <span className="ml-2 text-sm">({approvedRequests.length})</span>}
              </button>
            ))}
          </div>

          {/* Pending Requests */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {pendingRequests.length > 0 ? (
                pendingRequests.map(request => (
                  <div key={request.id} className="rounded-lg border border-border bg-card/50 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Request ID</p>
                        <p className="font-mono text-sm font-semibold mt-1">{request.id}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg bg-muted/20">
                      <div>
                        <p className="text-xs text-muted-foreground">User Address</p>
                        <p className="text-sm font-mono mt-1">{formatAddress(request.userId)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Requested</p>
                        <p className="text-sm mt-1">{formatDate(request.requestedAt)}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApprove(request)}
                        disabled={isProcessing === request.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {isProcessing === request.id ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        onClick={() => handleReject(request)}
                        disabled={isProcessing === request.id}
                        variant="outline"
                        className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-border bg-card/30 p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-accent mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No pending requests</p>
                </div>
              )}
            </div>
          )}

          {/* Approved Requests */}
          {activeTab === 'approved' && (
            <div className="space-y-4">
              {approvedRequests.length > 0 ? (
                approvedRequests.map(request => (
                  <div key={request.id} className="rounded-lg border border-border bg-card/50 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Request ID</p>
                        <p className="font-mono text-sm font-semibold mt-1">{request.id}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Approved
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 p-4 rounded-lg bg-muted/20">
                      <div>
                        <p className="text-xs text-muted-foreground">User Address</p>
                        <p className="text-sm font-mono mt-1">{formatAddress(request.userId)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Approved</p>
                        <p className="text-sm mt-1">{formatDate(request.requestedAt)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-border bg-card/30 p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                  <p className="text-muted-foreground">No approved attestations yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
