import { Suspense } from 'react'
import PublicIdentityProfile from '@/components/public-identity-profile'

interface PageProps {
  searchParams: Promise<{
    commitment?: string
  }>
}

export const metadata = {
  title: 'Identity Verification | ShadowID',
  description: 'Verify a ShadowID identity credential',
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PublicIdentityProfile commitment={params.commitment} />
    </Suspense>
  )
}
