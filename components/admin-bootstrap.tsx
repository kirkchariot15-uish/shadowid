'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { getAdminStore } from '@/lib/admin-store'
import type { AdminType } from '@/lib/admin-system'

interface BootstrapProps {
  walletAddress: string
}

export function AdminBootstrap({ walletAddress }: BootstrapProps) {
  const [step, setStep] = useState<'confirm' | 'success'>('confirm')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleInitializeGlobalAdmin = async () => {
    setIsProcessing(true)
    try {
      const adminStore = getAdminStore()
      
      // Make this wallet a global admin
      adminStore.addAdmin(walletAddress, 'global')
      
      setStep('success')
    } catch (error) {
      console.error('[v0] Error initializing global admin:', error)
      alert('Failed to initialize global admin')
    } finally {
      setIsProcessing(false)
    }
  }

  if (step === 'success') {
    return (
      <Card className="max-w-md mx-auto p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-bold text-green-600">Admin Initialized</h2>
        </div>
        <p className="text-gray-700 mb-4">
          You have been set as a Global Admin. You can now:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 mb-6">
          <li>Flag suspicious accounts</li>
          <li>Remove shadow scores</li>
          <li>Assign mini-admin roles (University, Government, DAO)</li>
          <li>Create universal admins for judges</li>
          <li>View all audit logs</li>
        </ul>
        <p className="text-sm text-gray-600 mb-6">
          Refresh the page to access the Admin Panel, or navigate to <code className="bg-gray-100 px-2 py-1 rounded text-xs">/admin</code>
        </p>
        <Button 
          onClick={() => window.location.href = '/admin'} 
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Go to Admin Panel
        </Button>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertCircle className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-bold">Initialize Global Admin</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Wallet Address</p>
          <p className="font-mono text-sm bg-gray-100 p-3 rounded break-all">
            {walletAddress}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-sm text-blue-900">
            This action will make you a Global Admin with full control over the system. You can:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-blue-800 space-y-1">
            <li>Flag and manage accounts</li>
            <li>Assign mini-admin roles</li>
            <li>View complete audit logs</li>
            <li>Create universal admins</li>
          </ul>
        </div>

        <Button
          onClick={handleInitializeGlobalAdmin}
          disabled={isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isProcessing ? 'Initializing...' : 'Initialize Global Admin'}
        </Button>
      </div>
    </Card>
  )
}
