'use client'

import { useState, useEffect } from 'react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield, Eye, Lock, RotateCcw, Trash2, Download, BarChart3, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import {
  getRevocationList,
  revokeAllCredentials,
  isCredentialRevoked
} from '@/lib/credential-revocation'
import {
  getExpirationConfig,
  setDefaultExpirationHours,
  getActiveDisclosures,
  getExpiredDisclosures,
  formatTimeRemaining
} from '@/lib/disclosure-expiration'
import {
  getAuditTrail,
  getDisclosureStats,
  generateAuditReport,
  exportAuditTrail,
  clearAuditTrail,
  getMostDisclosedAttributes
} from '@/lib/enhanced-audit-trail'
import {
  getCurrentSession,
  getSessionSummary,
  setInactivityTimeout,
  forceLogout
} from '@/lib/session-management'
import {
  getRateLimitStats,
  checkRateLimit
} from '@/lib/rate-limiting'

export default function PrivacyDashboard() {
  const { address } = useAleoWallet()
  const isConnected = !!address
  const [activeTab, setActiveTab] = useState<'overview' | 'credentials' | 'disclosures' | 'audit' | 'session' | 'settings'>('overview')
  const [stats, setStats] = useState<any>(null)
  const [revocationList, setRevocationList] = useState<any>(null)
  const [auditData, setAuditData] = useState<any>(null)
  const [sessionData, setSessionData] = useState<any>(null)
  const [rateLimitStats, setRateLimitStats] = useState<any>(null)

  useEffect(() => {
    if (!isConnected) return

    // Load all data
    const stats = getDisclosureStats()
    const revocation = getRevocationList()
    const audit = getAuditTrail()
    const session = getCurrentSession()
    const rateLimits = getRateLimitStats()

    setStats(stats)
    setRevocationList(revocation)
    setAuditData(audit)
    setSessionData(session)
    setRateLimitStats(rateLimits)
  }, [isConnected])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <p className="text-foreground font-semibold">Wallet Connection Required</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Shield className="h-8 w-8 text-accent" />
                Privacy Control Center
              </h1>
              <p className="text-muted-foreground mt-2">Complete visibility and control over your identity and data</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-accent/40 text-accent hover:bg-accent/10 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {['overview', 'credentials', 'disclosures', 'audit', 'session', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg font-semibold uppercase tracking-widest text-xs whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-card text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {tab === 'overview' && '📊 Overview'}
                {tab === 'credentials' && '🔑 Credentials'}
                {tab === 'disclosures' && '👁️ Disclosures'}
                {tab === 'audit' && '📋 Audit Trail'}
                {tab === 'session' && '⏱️ Session'}
                {tab === 'settings' && '⚙️ Settings'}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6">
                  <p className="text-xs uppercase tracking-widest font-semibold text-accent mb-2">Total Disclosures</p>
                  <p className="text-3xl font-bold">{stats?.totalDisclosures || 0}</p>
                  <p className="text-xs text-muted-foreground mt-2">Lifetime</p>
                </div>

                <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6">
                  <p className="text-xs uppercase tracking-widest font-semibold text-accent mb-2">Active Credentials</p>
                  <p className="text-3xl font-bold">{revocationList?.revokedCredentials?.length === 0 ? '1' : '0'}</p>
                  <p className="text-xs text-muted-foreground mt-2">Not revoked</p>
                </div>

                <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6">
                  <p className="text-xs uppercase tracking-widest font-semibold text-accent mb-2">Attributes Shared</p>
                  <p className="text-3xl font-bold">{stats?.totalAttributesDisclosed || 0}</p>
                  <p className="text-xs text-muted-foreground mt-2">Total</p>
                </div>

                <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6">
                  <p className="text-xs uppercase tracking-widest font-semibold text-accent mb-2">Privacy Score</p>
                  <p className="text-3xl font-bold">A+</p>
                  <p className="text-xs text-muted-foreground mt-2">Excellent</p>
                </div>
              </div>

              {/* Top Attributes */}
              <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-8">
                <h3 className="text-lg font-semibold mb-4">Most Frequently Disclosed</h3>
                <div className="space-y-3">
                  {getMostDisclosedAttributes().slice(0, 5).map((attr, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/30">
                      <span className="text-sm">{attr.label}</span>
                      <span className="text-xs bg-accent/20 text-accent px-3 py-1 rounded-full font-semibold">{attr.count} times</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CREDENTIALS TAB */}
          {activeTab === 'credentials' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Active Credential</h3>
                    <p className="text-sm text-muted-foreground">Your current ShadowID identity</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-semibold text-green-500">Active</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-background/60 border border-border/30 mb-6">
                  <p className="font-mono text-sm text-accent break-all">{localStorage.getItem('shadowid-commitment')?.substring(0, 64)}...</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-semibold">{new Date(localStorage.getItem('shadowid-created-at') || '').toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-semibold">
                      {isCredentialRevoked(localStorage.getItem('shadowid-commitment') || '') ? 'Revoked' : 'Active'}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    if (confirm('Are you sure? This will revoke your credential and clear all identity data.')) {
                      revokeAllCredentials('User initiated revocation from Privacy Dashboard')
                      window.location.href = '/dashboard'
                    }
                  }}
                  className="w-full bg-red-600/80 hover:bg-red-700 text-white gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Revoke Credential
                </Button>
              </div>

              {/* Revocation History */}
              {revocationList?.revokedCredentials?.length > 0 && (
                <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-8">
                  <h3 className="text-lg font-semibold mb-4">Revocation History</h3>
                  <div className="space-y-3">
                    {revocationList.revokedCredentials.map((r: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg border border-border/30 bg-background/30">
                        <p className="text-xs font-mono text-muted-foreground mb-2">{r.commitmentHash.substring(0, 32)}...</p>
                        <p className="text-sm mb-1">
                          <strong>Reason:</strong> {r.reason}
                        </p>
                        <p className="text-xs text-muted-foreground">Revoked: {new Date(r.revokedAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DISCLOSURES TAB */}
          {activeTab === 'disclosures' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6">
                  <p className="text-xs uppercase tracking-widest font-semibold text-accent mb-2">Active QR Codes</p>
                  <p className="text-3xl font-bold">{getActiveDisclosures().length}</p>
                  <p className="text-xs text-muted-foreground mt-2">Unexpired</p>
                </div>

                <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6">
                  <p className="text-xs uppercase tracking-widest font-semibold text-accent mb-2">Expired QR Codes</p>
                  <p className="text-3xl font-bold">{getExpiredDisclosures().length}</p>
                  <p className="text-xs text-muted-foreground mt-2">No longer valid</p>
                </div>
              </div>

              {/* Active Disclosures */}
              {getActiveDisclosures().length > 0 && (
                <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-8">
                  <h3 className="text-lg font-semibold mb-4">Active Disclosures</h3>
                  <div className="space-y-3">
                    {getActiveDisclosures().map((d: any, i: number) => {
                      const remainingMinutes = Math.max(0, Math.floor((new Date(d.expiresAt).getTime() - new Date().getTime()) / 60000))
                      return (
                        <div key={i} className="p-4 rounded-lg border border-accent/20 bg-background/30">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold">{d.attributes.length} attributes</p>
                            <span className="flex items-center gap-1 text-xs text-accent">
                              <Clock className="h-3 w-3" />
                              {formatTimeRemaining(remainingMinutes)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{d.disclosureId.substring(0, 24)}...</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AUDIT TAB */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Audit Trail</h3>
                  <Button
                    onClick={() => {
                      const data = exportAuditTrail()
                      const link = document.createElement('a')
                      link.href = `data:application/json;charset=utf-8,${encodeURIComponent(data)}`
                      link.download = `shadowid-audit-${new Date().getTime()}.json`
                      link.click()
                    }}
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Disclosures</p>
                    <p className="text-2xl font-bold">{stats?.totalDisclosures || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Per Disclosure</p>
                    <p className="text-2xl font-bold">{stats?.averageAttributesPerDisclosure || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Attributes</p>
                    <p className="text-2xl font-bold">{stats?.totalAttributesDisclosed || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Activity</p>
                    <p className="text-sm font-bold">{stats?.lastDisclosure ? new Date(stats.lastDisclosure).toLocaleDateString() : 'Never'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-border/30 bg-background/60">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your audit trail contains a complete record of all identity disclosures. This data is stored encrypted on your device only and never transmitted.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SESSION TAB */}
          {activeTab === 'session' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-8">
                <h3 className="text-lg font-semibold mb-6">Session Management</h3>

                {sessionData && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-border/30 bg-background/30">
                      <div className="flex justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Session ID</span>
                        <span className="text-sm font-mono">{sessionData.sessionId.substring(0, 16)}...</span>
                      </div>
                      <div className="flex justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <span className="text-sm font-semibold flex items-center gap-1">
                          {sessionData.isActive ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Active
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                              Inactive
                            </>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Duration</span>
                        <span className="text-sm font-semibold">
                          {Math.floor((new Date().getTime() - new Date(sessionData.createdAt).getTime()) / 60000)} minutes
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        forceLogout('User initiated logout from Privacy Dashboard')
                        window.location.href = '/dashboard'
                      }}
                      className="w-full bg-accent hover:bg-accent/90 gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      End Session
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-8">
                <h3 className="text-lg font-semibold mb-6">Privacy Settings</h3>

                <div className="space-y-6">
                  {/* Disclosure Expiration */}
                  <div>
                    <label className="block text-sm font-semibold mb-3">Default QR Code Expiration</label>
                    <select
                      defaultValue={getExpirationConfig().defaultExpirationHours}
                      onChange={(e) => setDefaultExpirationHours(parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg border border-accent/20 bg-background text-foreground focus:outline-none focus:border-accent"
                    >
                      <option value={1}>1 hour</option>
                      <option value={6}>6 hours</option>
                      <option value={24}>24 hours</option>
                      <option value={72}>72 hours (3 days)</option>
                      <option value={168}>1 week</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-2">All generated QR codes will automatically expire after this duration.</p>
                  </div>

                  {/* Inactivity Timeout */}
                  <div>
                    <label className="block text-sm font-semibold mb-3">Session Inactivity Timeout</label>
                    <select
                      defaultValue="30"
                      onChange={(e) => setInactivityTimeout(parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg border border-accent/20 bg-background text-foreground focus:outline-none focus:border-accent"
                    >
                      <option value={5}>5 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={480}>8 hours</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-2">You'll be logged out automatically after this period of inactivity.</p>
                  </div>

                  {/* Rate Limits Info */}
                  <div className="p-4 rounded-lg border border-accent/20 bg-accent/5">
                    <p className="text-sm font-semibold mb-2">Rate Limits</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {rateLimitStats && Object.entries(rateLimitStats).map(([key, value]: any) => (
                        <div key={key} className="p-2 rounded bg-background/50">
                          <p className="font-semibold">{value.used}/{value.limit}</p>
                          <p className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                    <p className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Danger Zone
                    </p>
                    <Button
                      onClick={() => {
                        if (confirm('This will permanently delete all audit records. This cannot be undone.')) {
                          clearAuditTrail()
                        }
                      }}
                      className="w-full bg-red-600/80 hover:bg-red-700 text-white gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear Audit Trail
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
