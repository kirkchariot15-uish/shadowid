'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield, Trash2, Download, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { credentialStore, type StoredCredential } from '@/lib/credential-store'
import { getAttributeSchema } from '@/lib/attribute-schema'
import { getIssuer } from '@/lib/credential-issuers'

export default function ManageCredentialsPage() {
  const [credentials, setCredentials] = useState<StoredCredential[]>([])
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadCredentials()
  }, [])

  const loadCredentials = () => {
    const all = credentialStore.getAll()
    const statistics = credentialStore.getStatistics()
    setCredentials(all)
    setStats(statistics)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this credential?')) {
      credentialStore.remove(id)
      loadCredentials()
    }
  }

  const handleExport = () => {
    const exported = credentialStore.export()
    const blob = new Blob([exported], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `shadowid-credentials-${Date.now()}.json`
    link.click()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Credentials</h1>
              <p className="text-muted-foreground mt-2">Manage your verifiable credentials</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleExport}
                variant="outline"
                className="border-accent/40 text-accent hover:bg-accent/10 gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" className="border-accent/40 text-accent hover:bg-accent/10 gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6">
                <p className="text-xs uppercase tracking-widest font-semibold text-accent mb-2">Total Credentials</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6">
                <p className="text-xs uppercase tracking-widest font-semibold text-accent mb-2">Expired</p>
                <p className="text-3xl font-bold">{stats.expired}</p>
              </div>
              <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6">
                <p className="text-xs uppercase tracking-widest font-semibold text-accent mb-2">Issuers</p>
                <p className="text-3xl font-bold">{Object.keys(stats.byIssuer).length}</p>
              </div>
            </div>
          )}

          {/* Credentials List */}
          <div className="space-y-4">
            {credentials.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <Shield className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-foreground font-semibold mb-2">No Credentials Yet</p>
                <p className="text-sm text-muted-foreground mb-6">Request attestations to start building your verified identity</p>
                <Link href="/request-attestation">
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    Request Attestation
                  </Button>
                </Link>
              </div>
            ) : (
              credentials.map(stored => {
                const cred = stored.credential
                const issuer = getIssuer(cred.issuer.id)
                const isExpired = credentialStore.isExpired(cred)

                return (
                  <div
                    key={cred.id}
                    className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-5 w-5 text-accent" />
                          <h3 className="font-semibold">Verifiable Credential</h3>
                          {isExpired && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                              Expired
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Issued by {cred.issuer.name}
                        </p>
                        {issuer && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Trust Score: <span className="text-accent font-semibold">{issuer.trustScore}/100</span>
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => handleDelete(cred.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Claims</p>
                      {Object.entries(cred.credentialSubject.claims).map(([attrId, claim]) => {
                        const schema = getAttributeSchema(attrId)
                        return (
                          <div key={attrId} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div>
                              <p className="text-sm font-semibold">{schema?.name || attrId}</p>
                              <p className="text-xs text-muted-foreground">Value: {String(claim.value)}</p>
                            </div>
                            {claim.confidence && (
                              <span className="text-xs text-accent">{Math.round(claim.confidence * 100)}% confidence</span>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border/50">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Issued: {new Date(cred.issuanceDate).toLocaleDateString()}
                      </span>
                      {cred.expirationDate && (
                        <span>
                          Expires: {new Date(cred.expirationDate).toLocaleDateString()}
                        </span>
                      )}
                      <span>Used {stored.useCount} times</span>
                      {stored.lastUsed && (
                        <span>Last used: {new Date(stored.lastUsed).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
