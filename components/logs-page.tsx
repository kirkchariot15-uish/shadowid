'use client'

import { useEffect, useState } from 'react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { WalletMultiButton } from '@/components/wallet-button'
import { Button } from '@/components/ui/button'
import { Lock, ArrowLeft, Trash2, Filter, Download, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { getActivityLogs, clearActivityLogs, type ActivityLog } from '@/lib/activity-logger'

export default function LogsPage() {
  const { address } = useAleoWallet()
  const isConnected = !!address
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  useEffect(() => {
    setLogs(getActivityLogs())
  }, [])

  useEffect(() => {
    let filtered = logs

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(log => log.category === selectedCategory)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(log => log.status === selectedStatus)
    }

    setFilteredLogs(filtered)
  }, [logs, selectedCategory, selectedStatus])

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to delete all activity logs? This action cannot be undone.')) {
      clearActivityLogs()
      setLogs([])
      setFilteredLogs([])
    }
  }

  const handleExportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `shadowid-logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <Lock className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <p className="text-foreground font-semibold">Connect Wallet Required</p>
          <WalletMultiButton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-20 pb-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
              <p className="text-muted-foreground mt-1">All ShadowID activities and events</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-blue-500/40 text-blue-600 hover:bg-blue-500/10 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="text-xs uppercase tracking-wide font-semibold text-muted-foreground block mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Categories</option>
              <option value="identity">Identity</option>
              <option value="wallet">Wallet</option>
              <option value="qrcode">QR Code</option>
              <option value="security">Security</option>
              <option value="settings">Settings</option>
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide font-semibold text-muted-foreground block mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <Button
              onClick={handleExportLogs}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="flex items-end gap-2">
            <Button
              onClick={handleClearLogs}
              variant="outline"
              size="sm"
              className="w-full border-red-500/30 text-red-600 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No activity logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-6 py-3 text-left font-semibold text-muted-foreground">Timestamp</th>
                    <th className="px-6 py-3 text-left font-semibold text-muted-foreground">Action</th>
                    <th className="px-6 py-3 text-left font-semibold text-muted-foreground">Category</th>
                    <th className="px-6 py-3 text-left font-semibold text-muted-foreground">Details</th>
                    <th className="px-6 py-3 text-left font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-3">
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-medium">{log.action}</td>
                      <td className="px-6 py-3">
                        <span className="inline-block px-2 py-1 rounded text-xs bg-accent/10 text-accent">
                          {log.category}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground max-w-xs truncate">
                        {log.details}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          log.status === 'success' ? 'bg-green-500/10 text-green-600' :
                          log.status === 'error' ? 'bg-red-500/10 text-red-600' :
                          'bg-yellow-500/10 text-yellow-600'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Logs</p>
            <p className="text-2xl font-bold text-accent">{logs.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Success</p>
            <p className="text-2xl font-bold text-green-600">{logs.filter(l => l.status === 'success').length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Errors</p>
            <p className="text-2xl font-bold text-red-600">{logs.filter(l => l.status === 'error').length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Today</p>
            <p className="text-2xl font-bold">{logs.filter(l => {
              const logDate = new Date(l.timestamp).toDateString()
              const today = new Date().toDateString()
              return logDate === today
            }).length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
