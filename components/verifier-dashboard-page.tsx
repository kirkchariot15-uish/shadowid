'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, BarChart3, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { verifierDashboardManager, VerificationSession } from '@/lib/verifier-dashboard-manager'
import { STANDARD_ATTRIBUTES } from '@/lib/attribute-schema'

export function VerifierDashboardPage() {
  const [verifierId] = useState('verifier:demo')
  const [profile, setProfile] = useState(() => verifierDashboardManager.getOrCreateProfile('verifier:demo'))
  const [sessions, setSessions] = useState<VerificationSession[]>([])
  const [stats, setStats] = useState(() => verifierDashboardManager.getStatistics('verifier:demo'))
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'verified'>('all')

  useEffect(() => {
    const allSessions = verifierDashboardManager.getSessions(verifierId)
    setSessions(allSessions)
    setStats(verifierDashboardManager.getStatistics(verifierId))
  }, [verifierId])

  const getFilteredSessions = () => {
    switch (selectedTab) {
      case 'pending':
        return sessions.filter(s => s.status === 'pending' || s.status === 'received')
      case 'verified':
        return sessions.filter(s => s.status === 'verified')
      default:
        return sessions
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' }
      case 'pending':
        return { icon: Clock, color: 'text-warning', bg: 'bg-warning/10' }
      case 'received':
        return { icon: AlertCircle, color: 'text-info', bg: 'bg-info/10' }
      case 'failed':
        return { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' }
      default:
        return { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted' }
    }
  }

  const filteredSessions = getFilteredSessions()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Verification Dashboard</h1>
              <p className="text-muted-foreground mt-2">Track proof requests and verifications</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-accent/40 text-accent hover:bg-accent/10 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>

          {/* Verifier Info Card */}
          <Card className="border-border/40 bg-background/50 backdrop-blur-sm p-6 mb-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Verifier Name</p>
                <h3 className="text-lg font-semibold">{profile.name}</h3>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-lg font-semibold">Active</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">API Key</p>
                <code className="font-mono text-xs bg-muted px-2 py-1 rounded">{profile.apiKey.slice(0, 20)}...</code>
              </div>
            </div>
          </Card>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="border-border/40 bg-background/50 backdrop-blur-sm p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Requests</div>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
            </Card>
            <Card className="border-border/40 bg-background/50 backdrop-blur-sm p-4">
              <div className="text-sm text-muted-foreground mb-1">Pending</div>
              <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            </Card>
            <Card className="border-border/40 bg-background/50 backdrop-blur-sm p-4">
              <div className="text-sm text-muted-foreground mb-1">Received</div>
              <div className="text-2xl font-bold text-info">{stats.received}</div>
            </Card>
            <Card className="border-border/40 bg-background/50 backdrop-blur-sm p-4">
              <div className="text-sm text-muted-foreground mb-1">Verified</div>
              <div className="text-2xl font-bold text-success">{stats.verified}</div>
            </Card>
            <Card className="border-border/40 bg-background/50 backdrop-blur-sm p-4">
              <div className="text-sm text-muted-foreground mb-1">Success Rate</div>
              <div className="text-2xl font-bold">{stats.verificationRate}%</div>
            </Card>
          </div>

          {/* Verification Sessions */}
          <Card className="border-border/40 bg-background/50 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Verification Sessions</h2>
              <div className="flex gap-2 border-b border-border">
                {(['all', 'pending', 'verified'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[6px] ${
                      selectedTab === tab
                        ? 'border-accent text-accent'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {filteredSessions.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No verification sessions</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredSessions.map(session => {
                  const badge = getStatusBadge(session.status)
                  const StatusIcon = badge.icon

                  return (
                    <div
                      key={session.id}
                      className="p-4 border border-border/40 rounded-lg hover:border-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <StatusIcon className={`h-4 w-4 ${badge.color}`} />
                            <span className="text-sm font-mono text-muted-foreground">{session.id.slice(0, 12)}...</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.color}`}>
                              {session.status}
                            </span>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Request ID</p>
                              <p className="font-mono text-xs">{session.requestId.slice(0, 16)}...</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Required</p>
                              <p className="text-xs">
                                {session.requiredAttributes.length} attribute
                                {session.requiredAttributes.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Received</p>
                              <p className="text-xs">
                                {session.receivedAttributes.length} attribute
                                {session.receivedAttributes.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>

                          {session.receivedAttributes.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {session.receivedAttributes.slice(0, 3).map(attrId => {
                                const attr = STANDARD_ATTRIBUTES[attrId]
                                return (
                                  <span
                                    key={attrId}
                                    className="inline-block px-2 py-0.5 rounded bg-accent/10 text-accent text-xs"
                                  >
                                    {attr?.name || attrId}
                                  </span>
                                )
                              })}
                              {session.receivedAttributes.length > 3 && (
                                <span className="inline-block px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs">
                                  +{session.receivedAttributes.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {session.verifiedAt && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Verified: {new Date(session.verifiedAt).toLocaleString()}
                            </p>
                          )}
                        </div>

                        {session.status === 'received' && (
                          <Button
                            size="sm"
                            className="bg-success text-success-foreground hover:bg-success/90"
                          >
                            Verify
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Help Card */}
          <Card className="border-border/40 bg-background/50 backdrop-blur-sm p-6 mt-8 border-l-2 border-l-accent">
            <h3 className="font-semibold mb-2">API Integration</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Use the API endpoint below to create proof requests programmatically:
            </p>
            <code className="block bg-muted p-3 rounded text-xs font-mono mb-3 overflow-x-auto">
              POST /api/proof-requests/create
            </code>
            <p className="text-xs text-muted-foreground">
              Provide your API key in the Authorization header for secure requests.
            </p>
          </Card>
        </div>
      </main>
    </div>
  )
}
