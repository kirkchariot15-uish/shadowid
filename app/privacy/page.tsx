'use client'

import dynamic from 'next/dynamic'

const PrivacyDashboard = dynamic(() => import('@/components/privacy-dashboard'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background" />,
})

export default function PrivacyDashboardPage() {
  return <PrivacyDashboard />
}
