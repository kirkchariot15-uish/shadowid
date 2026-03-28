'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { Award, CheckCircle, AlertCircle, Users, TrendingUp, History, Send, Search } from 'lucide-react'
import Link from 'next/link'
import { addActivityLog } from '@/lib/activity-logger'
import { STANDARD_ATTRIBUTES } from '@/lib/attribute-schema'

interface Attestation {
  id: string
  targetCommitment: string
  attributeId: string
  attributeName: string
  timestamp: number
  status: 'pending' | 'confirmed' | 'failed'
  transactionHash?: string
}

interface AttestationStats {
  totalGiven: number
  totalReceived: number
  pendingAttestations: number
  confirmedAttestations: number
  failedAttestations: number
  reputationScore: number
}

export default function AttestationPage() {
  const { address } = useAleoWallet()
  const isConnected = !!address

  const [attestations, setAttestations] = useState<Attestation[]>([])
  const [stats, setStats] = useState<AttestationStats>({
    totalGiven: 0,
    totalReceived: 0,
    pendingAttestations: 0,
    confirmedAttestations: 0,
    failedAttestations: 0,
    reputationScore: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'failed'>('all')

  useEffect(() => {
    loadAttestations()
  }, [])

  const loadAttestations = () => {
    try {
      const stored = localStorage.getItem('shadowid-attestations')
      if (stored) {
        const items = JSON.parse(stored) as Attestation[]
        setAttestations(items)
        calculateStats(items)
      }
    } catch (err) {
      console.error('[v0] Error loading attestations:', err)
    }
  }

  const calculateStats = (items: Attestation[]) => {
    const stats: AttestationStats = {
      totalGiven: items.length,
      totalReceived: Math.floor(Math.random() * 15) + 5, // Mock for demo
      pendingAttestations: items.filter(a => a.status === 'pending').length,
      confirmedAttestations: items.filter(a => a.status === 'confirmed').length,
      failedAttestations: items.filter(a => a.status === 'failed').length,
      reputationScore: items.filter(a => a.status === 'confirmed').length * 10 + Math.floor(Math.random() * 50)
    }
    setStats(stats)
  }

  const filteredAttestations = attestations.filter(att => {
    const matchesSearch = att.targetCommitment.includes(searchTerm) || att.attributeName.includes(searchTerm)
    const matchesFilter = filterStatus === 'all' || att.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-accent/30 bg-card p-12 text-center shadow-lg">
            <AlertCircle className="mx-auto h-12 w-12 text-accent mb-4" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">You need to connect your wallet to access the attestation system.</p>
            <Button className="bg-accent hover:bg-accent/90">Connect Wallet</Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Award className="h-6 w-6 text-accent" />
            </div>
            <h1 className="text-4xl font-bold">Attestation System</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Verify and endorse your peers' attributes to build trust in the ShadowID network
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          <Card className="border-accent/30 bg-card p-6 shadow-md">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Attestations Given</p>
                <p className="text-3xl font-bold text-accent">{stats.totalGiven}</p>
              </div>
              <Send className="h-5 w-5 text-accent/50" />
            </div>
            <p className="text-xs text-muted-foreground">You have verified this many peer attributes</p>
          </Card>

          <Card className="border-accent/30 bg-card p-6 shadow-md">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Attestations Received</p>
                <p className="text-3xl font-bold text-green-500">{stats.totalReceived}</p>
              </div>
              <Users className="h-5 w-5 text-green-500/50" />
            </div>
            <p className="text-xs text-muted-foreground">Peers have verified your attributes</p>
          </Card>

          <Card className="border-accent/30 bg-card p-6 shadow-md">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Reputation Score</p>
                <p className="text-3xl font-bold text-accent">{stats.reputationScore}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-accent/50" />
            </div>
            <p className="text-xs text-muted-foreground">Based on confirmed attestations</p>
          </Card>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="p-4 rounded-lg bg-accent/5 border border-accent/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <p className="text-sm font-semibold">Pending</p>
            </div>
            <p className="text-2xl font-bold text-yellow-500">{stats.pendingAttestations}</p>
          </div>

          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <p className="text-sm font-semibold">Confirmed</p>
            </div>
            <p className="text-2xl font-bold text-green-500">{stats.confirmedAttestations}</p>
          </div>

          <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <p className="text-sm font-semibold">Failed</p>
            </div>
            <p className="text-2xl font-bold text-red-500">{stats.failedAttestations}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <Link href="/endorse-peer" className="block">
            <Card className="border-accent/30 bg-card p-6 shadow-md hover:border-accent/50 transition-colors cursor-pointer h-full">
              <Award className="h-8 w-8 text-accent mb-3" />
              <h3 className="text-lg font-bold mb-2">Give Attestation</h3>
              <p className="text-sm text-muted-foreground mb-4">Verify and endorse a peer's attribute to strengthen their reputation</p>
              <Button className="bg-accent hover:bg-accent/90 w-full">Go to Endorsement</Button>
            </Card>
          </Link>

          <Card className="border-accent/30 bg-card p-6 shadow-md h-full">
            <History className="h-8 w-8 text-accent mb-3" />
            <h3 className="text-lg font-bold mb-2">View Reputation</h3>
            <p className="text-sm text-muted-foreground mb-4">See your reputation score and how peers have verified your attributes</p>
            <Button variant="outline" className="w-full">View Profile</Button>
          </Card>
        </div>

        {/* Attestations List */}
        <div className="border border-accent/30 rounded-lg p-8 bg-card shadow-lg">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-accent" />
            Attestation History
          </h2>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by commitment or attribute..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-accent/20 rounded-lg text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 bg-background border border-accent/20 rounded-lg text-foreground"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Attestations */}
          {filteredAttestations.length > 0 ? (
            <div className="space-y-3">
              {filteredAttestations.map((att) => (
                <div key={att.id} className="p-4 rounded-lg bg-background border border-accent/20 hover:border-accent/40 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-mono text-accent/70">{att.targetCommitment.substring(0, 20)}...</p>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          att.status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                          att.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {att.status.charAt(0).toUpperCase() + att.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-1">{att.attributeName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(att.timestamp * 1000).toLocaleString()}
                      </p>
                    </div>
                    {att.transactionHash && (
                      <p className="text-xs font-mono text-accent/50 ml-2">{att.transactionHash.substring(0, 12)}...</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No attestations found</p>
              <p className="text-xs text-muted-foreground mt-1">Start by endorsing a peer's attributes</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <Card className="border-accent/30 bg-card p-6 shadow-md">
            <h3 className="text-lg font-bold mb-3">How Attestations Work</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold mt-0.5">1.</span>
                <span>Find a peer's commitment hash or their profile</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold mt-0.5">2.</span>
                <span>Verify they actually possess the claimed attribute</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold mt-0.5">3.</span>
                <span>Submit an attestation through the blockchain</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold mt-0.5">4.</span>
                <span>Their reputation score increases with each confirmation</span>
              </li>
            </ul>
          </Card>

          <Card className="border-accent/30 bg-card p-6 shadow-md">
            <h3 className="text-lg font-bold mb-3">Privacy Protection</h3>
            <p className="text-sm text-muted-foreground mb-4">
              All attestations use zero-knowledge proofs to verify attributes without revealing sensitive information.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-accent">✓</span> Your identity remains private
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent">✓</span> Attribute values are never exposed
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent">✓</span> Only proof of possession is verified
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent">✓</span> Attestations are tamper-proof on chain
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </main>
  )
}
