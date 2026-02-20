'use client'

import dynamic from 'next/dynamic'

const ManageCredentialsPage = dynamic(() => import('@/components/manage-credentials-page'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background" />,
})

export default function Page() {
  return <ManageCredentialsPage />
}
