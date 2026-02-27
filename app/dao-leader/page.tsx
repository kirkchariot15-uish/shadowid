'use client'

import dynamic from 'next/dynamic'

const DAOLeaderDashboardComponent = dynamic(() => import('@/components/dao-leader-dashboard'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  ),
})

export default function DAOLeaderPage() {
  return <DAOLeaderDashboardComponent />
}
