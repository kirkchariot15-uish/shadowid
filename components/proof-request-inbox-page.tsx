'use client'

import { useState, useEffect } from 'react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Mail, AlertCircle, CheckCircle, Clock, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import { proofRequestManager, ReceivedProofRequest, formatRequestDisplay } from '@/lib/proof-request-manager'
import { addActivityLog } from '@/lib/activity-logger'

type FilterType = 'all' | 'pending' | 'approved' | 'expired'

export function ProofRequestInboxPage() {
  const { address, isConnected } = useAleoWallet()
  const [requests, setRequests] = useState<ReceivedProofRequest[]>([])
  const [filter, setFilter] = useState<FilterType>('pending')
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<ReceivedProofRequest | null>(null)

  // Load proof requests from storage
  useEffect(() => {
    if (!isConnected) return

    try {
      const inbox = proofRequestManager.getInbox()
      setRequests(inbox)
      console.log('[v0] Loaded', inbox.length, 'proof requests')
    } catch (error) {
      console.error('[v0] Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }, [isConnected])

  // Filter requests based on active filter
  const getFilteredRequests = () => {
    const now = new Date()
    return requests.filter(r => {
      if (r.dismissed) return false

      switch (filter) {
        case 'pending':
          return (
            r.status === 'pending' &&
            new Date(r.expiresAt) > now &&
            r.responses.length === 0
          )
        case 'approved':
          return r.status === 'approved' && r.responses.length > 0
        case 'expired':
          return new Date(r.expiresAt) < now
        case 'all':
        default:
          return true
      }
    })
  }

  const handleDismiss = (requestId: string) => {
    proofRequestManager.dismissRequest(requestId)
    setRequests(requests.map(r =>
      r.id === requestId ? { ...r, dismissed: true } : r
    ))
    addActivityLog(
      'Dismiss Proof Request',
      'identity',
      `Dismissed proof request: ${requestId}`,
      'success'
    )
  }

  const handleViewRequest = (request: ReceivedProofRequest) => {
    setSelectedRequest(request)
    proofRequestManager.markAsViewed(request.id)
    addActivityLog(
      'View Proof Request',
      'identity',
      `Viewed request from ${request.requesterName}`,
      'success'
    )
  }

  const filteredRequests = getFilteredRequests()
  const stats = proofRequestManager.getStatistics()

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-muted-foreground">Please connect your wallet to view proof requests.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Proof Requests</h1>
              <p className="text-muted-foreground mt-2">Services requesting verification of your attributes</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-accent/40 text-accent hover:bg-accent/10 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-border/40 bg-background/50 backdrop-blur-sm p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Requests</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </Card>
            <Card className="border-border/40 bg-background/50 backdrop-blur-sm p-4">
              <div className="text-sm text-muted-foreground mb-1">Pending</div>
              <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            </Card>
            <Card className="border-border/40 bg-background/50 backdrop-blur-sm p-4">
              <div className="text-sm text-muted-foreground mb-1">Approved</div>
              <div className="text-2xl font-bold text-success">{stats.approved}</div>
            </Card>
            <Card className="border-border/40 bg-background/50 backdrop-blur-sm p-4">
              <div className="text-sm text-muted-foreground mb-1">Responses</div>
              <div className="text-2xl font-bold">{stats.totalResponses}</div>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-8 border-b border-border/40">
            {(['all', 'pending', 'approved', 'expired'] as FilterType[]).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[2px] ${
                  filter === tab
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Requests List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading proof requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <Card className="border-border/40 bg-background/50 backdrop-blur-sm p-12 text-center">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {filter === 'pending'
                  ? 'No pending proof requests'
                  : filter === 'approved'
                  ? 'No approved requests'
                  : filter === 'expired'
                  ? 'No expired requests'
                  : 'No proof requests yet'}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map(request => {
                const display = formatRequestDisplay(request)
                const isExpired = new Date(request.expiresAt) < new Date()
                const hasResponded = request.responses.length > 0

                return (
                  <Card
                    key={request.id}
                    className="border-border/40 bg-background/50 backdrop-blur-sm hover:border-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleViewRequest(request)}
                  >
                    <div className="p-4 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Status Badge */}
                          <div className="flex items-center gap-2 mb-2">
                            {isExpired ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                                <Clock className="h-3 w-3" />
                                Expired
                              </span>
                            ) : hasResponded ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                                <CheckCircle className="h-3 w-3" />
                                Approved
                              </span>
                            ) : (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                display.urgency === 'high'
                                  ? 'bg-destructive/10 text-destructive'
                                  : display.urgency === 'medium'
                                  ? 'bg-warning/10 text-warning'
                                  : 'bg-accent/10 text-accent'
                              }`}>
                                <AlertCircle className="h-3 w-3" />
                                {display.urgency === 'high' ? 'Urgent' : display.urgency === 'medium' ? 'Soon' : 'Pending'}
                              </span>
                            )}
                          </div>

                          {/* Request Title and Requester */}
                          <h3 className="font-semibold truncate">{display.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            from <span className="text-foreground font-medium">{request.requesterName}</span>
                          </p>

                          {/* Attributes Required */}
                          <div className="mt-3 flex flex-wrap gap-1">
                            {request.requiredAttributes.slice(0, 3).map(attr => (
                              <span
                                key={attr.attributeId}
                                className="inline-block px-2 py-1 rounded bg-accent/10 text-accent text-xs"
                              >
                                {attr.attributeName}
                              </span>
                            ))}
                            {request.requiredAttributes.length > 3 && (
                              <span className="inline-block px-2 py-1 rounded bg-muted text-muted-foreground text-xs">
                                +{request.requiredAttributes.length - 3} more
                              </span>
                            )}
                          </div>

                          {/* Metadata */}
                          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Purpose: {request.purpose}</span>
                            {!isExpired && (
                              <span className={display.urgency === 'high' ? 'text-destructive' : ''}>
                                {display.daysRemaining} day{display.daysRemaining !== 1 ? 's' : ''} remaining
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              handleViewRequest(request)
                            }}
                            className="p-2 hover:bg-accent/10 rounded transition-colors"
                            title="View details"
                          >
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </button>
                          {!hasResponded && (
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                handleDismiss(request.id)
                              }}
                              className="p-2 hover:bg-destructive/10 rounded transition-colors"
                              title="Dismiss"
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {requests.length === 0 && !loading && (
            <Card className="border-border/40 bg-background/50 backdrop-blur-sm p-12 text-center">
              <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold mb-2">No Proof Requests Yet</h3>
              <p className="text-muted-foreground mb-6">
                Services and verifiers will send you proof requests when they need to verify your attributes.
              </p>
              <Link href="/selective-disclosure">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Generate a Proof Manually
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </main>

      {/* Request Detail Modal - Simple version for now */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-background border-border max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Proof Request Details</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-semibold">{selectedRequest.requesterName}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p>{selectedRequest.description}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Purpose</p>
                  <p>{selectedRequest.purpose}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Required Attributes</p>
                  <div className="space-y-1">
                    {selectedRequest.requiredAttributes.map(attr => (
                      <div key={attr.attributeId} className="text-sm">
                        <span className="font-medium">{attr.attributeName}</span>
                        <span className="text-muted-foreground"> - {attr.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex gap-2">
                  <Link href={`/proof-request/${selectedRequest.id}`} className="flex-1">
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      Respond to Request
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleDismiss(selectedRequest.id)
                      setSelectedRequest(null)
                    }}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
