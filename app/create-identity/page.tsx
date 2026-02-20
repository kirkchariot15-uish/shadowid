'use client'

import dynamic from 'next/dynamic'

const CreateIdentityClient = dynamic(() => import('@/components/create-identity-client'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  ),
})

export default function CreateIdentityPage() {
  return <CreateIdentityClient />
}
