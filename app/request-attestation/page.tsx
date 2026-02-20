'use client'

import dynamic from 'next/dynamic'

const RequestAttestationPage = dynamic(() => import('@/components/request-attestation-page'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background" />,
})

export default function Page() {
  return <RequestAttestationPage />
}
