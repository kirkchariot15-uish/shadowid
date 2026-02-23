'use client'

import { useState } from 'react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle, Clock, Send, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { requestDAOAttestation, approveDAOAttestation, rejectDAOAttestation, verifyDAOAttestation } from '@/lib/aleo-sdk-integration'
import { addActivityLog } from '@/lib/activity-logger'
import { encryptOffChainData } from '@/lib/encrypted-storage'

interface DAOInfo {
  id: string
  name: string
  description: string
}

interface AttestationRequest {
  id: string
  daoId: string
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: number
  approvedAt?: number
}

export default function RequestAttestationPage() {
  const { address } = useAleoWallet()
  const isConnected = !!address

  const [step, setStep] = useState<'daos' | 'request' | 'result'>('daos')
  const [selectedDAO, setSelectedDAO] = useState<DAOInfo | null>(null)
  const [isRequesting, setIsRequesting] = useState(false)
  const [requestResult, setRequestResult] = useState<any>(null)
  const [pendingRequests, setPendingRequests] = useState<AttestationRequest[]>([])

  // Mock DAOs (in real implementation, fetch from contract)
  const daos: DAOInfo[] = [
    {
      id: '0x1',
      name: 'Developer DAO',
      description: 'Community of builders and developers'
    },
    {
      id: '0x2',
      name: 'Creator DAO',
      description: 'Community for creators and artists'
    },
    {
      id: '0x3',
      name: 'Investor DAO',
      description: 'Community of investors and founders'
    }
  ]

  const handleRequestDAO = async () => {
    if (!selectedDAO || !address) return

    setIsRequesting(true)
    try {
      // Create request ID
      const encoder = new TextEncoder()
      const data = `${selectedDAO.id}-${address}-${Date.now()}`
      const hash = await window.crypto.subtle.digest('SHA-256', encoder.encode(data))
      const requestId = Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 64)

      // Request on-chain
      const result = await requestDAOAttestation(selectedDAO.id, address, address)

      if (result.success) {
        const request: AttestationRequest = {
          id: requestId,
          daoId: selectedDAO.id,
          status: 'pending',
          requestedAt: Date.now()
        }

        // Store locally encrypted
        try {
          await encryptOffChainData(request, address)
        } catch (e) {
          console.error('[v0] Failed to encrypt locally:', e)
        }

        setPendingRequests([...pendingRequests, request])
        addActivityLog('Request DAO Attestation', 'attestation', `Requested ${selectedDAO.name} attestation`, 'success')

        setRequestResult({
          success: true,
          daoName: selectedDAO.name,
          requestId: requestId.slice(0, 16),
          txId: result.transactionId
        })
        setStep('result')
      }
    } catch (err) {
      console.error('[v0] Attestation request error:', err)
      setRequestResult({
        success: false,
        error: err instanceof Error ? err.message : 'Request failed'
      })
      setStep('result')
    } finally {
      setIsRequesting(false)
    }
  }

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-8 text-center">
              <AlertCircle className="h-12 w-12 text-accent mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Wallet Not Connected</h2>
              <p className="text-muted-foreground">Connect your wallet to request DAO attestations</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Request DAO Attestation</h1>
              <p className="text-muted-foreground mt-2">Get verified membership from DAOs</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-accent/40 text-accent hover:bg-accent/10 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>

          {step === 'daos' && !requestResult && (
            <div className="space-y-6">
              <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6">
                <h2 className="text-lg font-semibold mb-4">Available DAOs</h2>
                <div className="space-y-3">
                  {daos.map(dao => (
                    <button
                      key={dao.id}
                      onClick={() => {
                        setSelectedDAO(dao)
                        setStep('request')
                      }}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedDAO?.id === dao.id
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <p className="font-semibold">{dao.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{dao.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'request' && selectedDAO && !requestResult && (
            <div className="space-y-6">
              <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6">
                <h2 className="text-lg font-semibold mb-4">Confirm Request</h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                    <p className="text-sm text-muted-foreground">DAO</p>
                    <p className="text-lg font-semibold mt-1">{selectedDAO.name}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                    <p className="text-sm text-muted-foreground">Your Wallet</p>
                    <p className="text-lg font-semibold mt-1 font-mono text-xs">
                      {address.slice(0, 8)}...{address.slice(-6)}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4" />
                      Processing
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your request will be submitted to the {selectedDAO.name} leader for review. You'll receive a notification once it's approved or rejected.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setStep('daos')
                    setSelectedDAO(null)
                  }}
                  variant="outline"
                  className="flex-1 border-accent/40"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRequestDAO}
                  disabled={isRequesting}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isRequesting ? 'Requesting...' : 'Submit Request'}
                </Button>
              </div>
            </div>
          )}

          {step === 'result' && requestResult && (
            <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-8 text-center">
              {requestResult.success ? (
                <>
                  <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Request Submitted</h2>
                  <p className="text-muted-foreground mb-6">
                    Your attestation request for {requestResult.daoName} has been submitted
                  </p>
                  <div className="bg-muted/30 rounded-lg p-4 mb-6 space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Request ID</p>
                      <p className="text-sm font-mono font-semibold mt-1">{requestResult.requestId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Transaction</p>
                      <p className="text-xs font-mono text-accent mt-1">{requestResult.txId}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setRequestResult(null)
                      setStep('daos')
                      setSelectedDAO(null)
                    }}
                    className="bg-accent hover:bg-accent/90"
                  >
                    Make Another Request
                  </Button>
                </>
              ) : (
                <>
                  <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Request Failed</h2>
                  <p className="text-muted-foreground mb-6">{requestResult.error}</p>
                  <Button
                    onClick={() => {
                      setRequestResult(null)
                      setStep('daos')
                      setSelectedDAO(null)
                    }}
                    variant="outline"
                    className="border-accent/40"
                  >
                    Try Again
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
