'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getAdminStore } from '@/lib/admin-store'
import { getAdminSystemStore } from '@/lib/admin-system'
import { getMiniAdminManager } from '@/lib/mini-admin-manager'
import type { AdminType, FlaggedAccount } from '@/lib/admin-system'

interface AdminPanelProps {
  adminWallet: string
  adminType: AdminType
}

export function AdminPanel({ adminWallet, adminType }: AdminPanelProps) {
  const [flaggedAccounts, setFlaggedAccounts] = useState<FlaggedAccount[]>([])
  const [selectedFlag, setSelectedFlag] = useState<FlaggedAccount | null>(null)
  const [newFlagWallet, setNewFlagWallet] = useState('')
  const [flagReason, setFlagReason] = useState('')
  const [flagSeverity, setFlagSeverity] = useState<'low' | 'medium' | 'high'>('medium')
  const [flagNotes, setFlagNotes] = useState('')
  const [allAdmins, setAllAdmins] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [newMiniAdminWallet, setNewMiniAdminWallet] = useState('')
  const [newMiniAdminType, setNewMiniAdminType] = useState<'university' | 'government' | 'dao' | 'universal'>('university')
  const [miniAdminOrganization, setMiniAdminOrganization] = useState('')

  React.useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = () => {
    const adminStore = getAdminStore()
    setFlaggedAccounts(adminStore.getAllFlaggedAccounts())
    setAllAdmins(adminStore.getAllAdmins())
    setAuditLogs(adminStore.getAuditLogs(50))
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
    loadAdminData()
  }

  const handleRemoveShadowScore = (flagId: string) => {
    const adminStore = getAdminStore()
    adminStore.removeShadowScore(flagId, adminWallet)
    loadAdminData()
  }

  const handleResolveFlag = (flagId: string) => {
    const adminStore = getAdminStore()
    adminStore.resolveFlag(flagId, adminWallet)
    loadAdminData()
  }

  const handleAddMiniAdmin = (walletAddress: string, adminType: AdminType, organization?: string) => {
    const adminStore = getAdminStore()
    adminStore.addAdmin(walletAddress, adminType, organization)
    loadAdminData()
  }

  const handleRemoveMiniAdmin = (walletAddress: string) => {
    const adminStore = getAdminStore()
    adminStore.removeAdmin(walletAddress)
    loadAdminData()
  }

  const handleAssignMiniAdmin = () => {
    if (!newMiniAdminWallet.trim()) {
      alert('Please enter a wallet address')
      return
    }

    if (newMiniAdminType !== 'universal' && !miniAdminOrganization.trim()) {
      alert('Please enter organization name for this mini-admin type')
      return
    }

    const adminStore = getAdminStore()
    adminStore.addAdmin(
      newMiniAdminWallet,
      newMiniAdminType,
      newMiniAdminType === 'universal' ? undefined : miniAdminOrganization
    )

    // Clear form and reload
    setNewMiniAdminWallet('')
    setMiniAdminOrganization('')
    setNewMiniAdminType('university')
    loadAdminData()
    alert('Mini-admin assigned successfully!')
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin Control Panel</h1>
        <p className="text-gray-600">
          Logged in as: <span className="font-mono font-semibold">{adminWallet.slice(0, 8)}...{adminWallet.slice(-6)}</span>
        </p>
        <p className="text-gray-600">Admin Type: <span className="font-semibold capitalize">{adminType}</span></p>
      </div>

      <Tabs defaultValue="flags" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="flags">Flagged Accounts</TabsTrigger>
          <TabsTrigger value="flag-new">Flag Account</TabsTrigger>
          <TabsTrigger value="assign-admin">Assign Mini-Admin</TabsTrigger>
          <TabsTrigger value="admins">Manage Admins</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
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
                      <p>Flagged: {new Date(flag.flaggedAt).toLocaleDateString()}</p>
                      <p>Status: {flag.resolved ? 'Resolved' : 'Active'}</p>
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

        {/* Assign Mini-Admin Tab */}
        <TabsContent value="assign-admin" className="space-y-4">
          {(adminType === 'global' || adminType === 'universal') ? (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Assign Mini-Admin Role</h2>
              <p className="text-gray-600 mb-6 text-sm">
                Assign mini-admin roles to users. Choose the type of mini-admin and optionally specify the organization.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Wallet Address</label>
                  <Input
                    placeholder="0x..."
                    value={newMiniAdminWallet}
                    onChange={(e) => setNewMiniAdminWallet(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Mini-Admin Type</label>
                  <select
                    className="w-full border rounded p-2 text-sm"
                    value={newMiniAdminType}
                    onChange={(e) => setNewMiniAdminType(e.target.value as 'university' | 'government' | 'dao' | 'universal')}
                  >
                    <option value="university">University Admin</option>
                    <option value="government">Government Admin</option>
                    <option value="dao">DAO Admin</option>
                    <option value="universal">Universal Admin (Full Access)</option>
                  </select>
                </div>

                {newMiniAdminType !== 'universal' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Organization Name</label>
                    <Input
                      placeholder="e.g., Harvard University, Ministry of Education, etc."
                      value={miniAdminOrganization}
                      onChange={(e) => setMiniAdminOrganization(e.target.value)}
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Required for {newMiniAdminType} admins to identify the organization they manage
                    </p>
                  </div>
                )}

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                  onClick={handleAssignMiniAdmin}
                >
                  Assign Mini-Admin
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 border-orange-200 bg-orange-50">
              <p className="text-orange-800">
                Only Global and Universal admins can assign mini-admin roles.
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Flag New Account Tab */}
        <TabsContent value="flag-new" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Flag New Account</h2>
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

        {/* Manage Admins Tab */}
        <TabsContent value="admins" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Current Admins</h2>
            {allAdmins.length === 0 ? (
              <p className="text-gray-600">No admins</p>
            ) : (
              <div className="space-y-2">
                {allAdmins.map((admin) => (
                  <div key={admin.walletAddress} className="flex justify-between items-center border rounded p-3">
                    <div>
                      <p className="font-mono font-semibold text-sm">{admin.walletAddress}</p>
                      <p className="text-xs text-gray-600">
                        Type: <span className="capitalize">{admin.adminType}</span>
                        {admin.organization && ` • ${admin.organization}`}
                      </p>
                    </div>
                    {adminType === 'global' || adminType === 'universal' ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveMiniAdmin(admin.walletAddress)}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Audit Log (Last 50 Actions)</h2>
            {auditLogs.length === 0 ? (
              <p className="text-gray-600">No audit logs</p>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="border rounded p-3 text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold">{log.action.replace(/_/g, ' ').toUpperCase()}</span>
                      <span className="text-gray-600">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-600">
                      Admin: {log.adminWallet.slice(0, 6)}... | Target: {log.targetWallet.slice(0, 6)}...
                    </p>
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
