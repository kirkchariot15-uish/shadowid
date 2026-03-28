'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getAdminStore } from '@/lib/admin-store'
import { getMiniAdminManager } from '@/lib/mini-admin-manager'
import type { AdminType, FlaggedAccount } from '@/lib/admin-system'

interface MiniAdminPanelProps {
  adminWallet: string
  adminType: AdminType
  organization?: string
}

export function MiniAdminPanel({ adminWallet, adminType, organization }: MiniAdminPanelProps) {
  const [flaggedAccounts, setFlaggedAccounts] = useState<FlaggedAccount[]>([])
  const [selectedFlag, setSelectedFlag] = useState<FlaggedAccount | null>(null)
  const [newFlagWallet, setNewFlagWallet] = useState('')
  const [flagReason, setFlagReason] = useState('')
  const [flagSeverity, setFlagSeverity] = useState<'low' | 'medium' | 'high'>('medium')
  const [flagNotes, setFlagNotes] = useState('')
  const [verifications, setVerifications] = useState<any[]>([])
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  React.useEffect(() => {
    loadMiniAdminData()
  }, [])

  const loadMiniAdminData = () => {
    const adminStore = getAdminStore()
    const miniAdminManager = getMiniAdminManager()

    // Get all flagged accounts (mini-admins can see all)
    setFlaggedAccounts(adminStore.getAllFlaggedAccounts())

    // Get verifications for this organization
    const orgs = miniAdminManager.getAllOrganizations()
    const thisOrg = orgs.find((org) => org.adminWallet === adminWallet)

    if (thisOrg) {
      const allVerifications = miniAdminManager.getVerificationsForOrganization(thisOrg.id)
      setVerifications(allVerifications.filter((v) => v.isVerified))
      setPendingVerifications(allVerifications.filter((v) => !v.isVerified))
    }

    // Get audit logs
    setAuditLogs(adminStore.getAuditLogsForAdmin(adminWallet, 50))
  }

  const handleFlagAccount = () => {
    if (!newFlagWallet.trim() || !flagReason.trim()) {
      alert('Please fill in all required fields')
      return
    }

    const adminStore = getAdminStore()
    adminStore.flagAccount(newFlagWallet, flagReason, flagSeverity, adminWallet, flagNotes)

    // Clear form and reload
    setNewFlagWallet('')
    setFlagReason('')
    setFlagSeverity('medium')
    setFlagNotes('')
    loadMiniAdminData()
  }

  const handleRemoveShadowScore = (flagId: string) => {
    const adminStore = getAdminStore()
    adminStore.removeShadowScore(flagId, adminWallet)
    loadMiniAdminData()
  }

  const handleResolveFlag = (flagId: string) => {
    const adminStore = getAdminStore()
    adminStore.resolveFlag(flagId, adminWallet)
    loadMiniAdminData()
  }

  const handleApproveVerification = (verificationId: string) => {
    const miniAdminManager = getMiniAdminManager()
    miniAdminManager.approveVerification(verificationId, adminWallet)
    loadMiniAdminData()
  }

  const handleRejectVerification = (verificationId: string) => {
    const miniAdminManager = getMiniAdminManager()
    miniAdminManager.rejectVerification(verificationId)
    loadMiniAdminData()
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Organization Admin Panel</h1>
        <p className="text-gray-600">
          Organization: <span className="font-semibold">{organization}</span>
        </p>
        <p className="text-gray-600">
          Type: <span className="font-semibold capitalize">{adminType}</span>
        </p>
      </div>

      <Tabs defaultValue="flags" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="flags">Flagged Accounts</TabsTrigger>
          <TabsTrigger value="flag-new">Flag Account</TabsTrigger>
          <TabsTrigger value="verify">Verify Users</TabsTrigger>
          <TabsTrigger value="audit">Activity</TabsTrigger>
        </TabsList>

        {/* Flagged Accounts Tab */}
        <TabsContent value="flags" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Flagged Accounts</h2>
            {flaggedAccounts.length === 0 ? (
              <p className="text-gray-600">No flagged accounts</p>
            ) : (
              <div className="space-y-3">
                {flaggedAccounts.map((flag) => (
                  <div key={flag.id} className="border rounded p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-mono font-semibold text-sm">{flag.walletAddress}</p>
                        <p className="text-sm text-gray-600">{flag.reason}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        flag.severity === 'high' ? 'bg-red-100 text-red-800' :
                        flag.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {flag.severity.toUpperCase()}
                      </span>
                    </div>

                    {flag.notes && (
                      <p className="text-xs text-gray-600 mb-2 italic">Notes: {flag.notes}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                      <p>Flagged by: {flag.flaggedBy.slice(0, 6)}...</p>
                      <p>Shadow Score Removed: {flag.shadowScoreRemoved ? 'Yes' : 'No'}</p>
                    </div>

                    {!flag.resolved && (
                      <div className="flex gap-2">
                        {!flag.shadowScoreRemoved && (
                          <Button
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700"
                            onClick={() => handleRemoveShadowScore(flag.id)}
                          >
                            Remove Shadow Score
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleResolveFlag(flag.id)}
                        >
                          Resolve
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Flag New Account Tab */}
        <TabsContent value="flag-new" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Flag Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Wallet Address</label>
                <Input
                  placeholder="0x..."
                  value={newFlagWallet}
                  onChange={(e) => setNewFlagWallet(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Why is this account being flagged?"
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Severity</label>
                <select
                  className="w-full border rounded p-2 text-sm"
                  value={flagSeverity}
                  onChange={(e) => setFlagSeverity(e.target.value as 'low' | 'medium' | 'high')}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Additional Notes (Optional)</label>
                <textarea
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Any additional context..."
                  value={flagNotes}
                  onChange={(e) => setFlagNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button className="w-full bg-red-600 hover:bg-red-700" onClick={handleFlagAccount}>
                Flag Account
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Verify Users Tab */}
        <TabsContent value="verify" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Pending Verifications</h2>
            {pendingVerifications.length === 0 ? (
              <p className="text-gray-600">No pending verifications</p>
            ) : (
              <div className="space-y-3">
                {pendingVerifications.map((verification) => (
                  <div key={verification.id} className="border rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-mono font-semibold text-sm">{verification.userWallet}</p>
                        <p className="text-sm text-gray-600">Claimed: {verification.credentialClaimed}</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                        PENDING
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApproveVerification(verification.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleRejectVerification(verification.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 className="text-lg font-bold mt-6 mb-3">Verified Users</h3>
            {verifications.length === 0 ? (
              <p className="text-gray-600">No verified users yet</p>
            ) : (
              <div className="space-y-2">
                {verifications.map((verification) => (
                  <div key={verification.id} className="border rounded p-3">
                    <p className="font-mono font-semibold text-sm">{verification.userWallet}</p>
                    <p className="text-xs text-gray-600">
                      Verified on: {new Date(verification.verifiedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Your Activity</h2>
            {auditLogs.length === 0 ? (
              <p className="text-gray-600">No activity yet</p>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="border rounded p-3 text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold">{log.action.replace(/_/g, ' ').toUpperCase()}</span>
                      <span className="text-gray-600">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-600">Target: {log.targetWallet.slice(0, 6)}...</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
