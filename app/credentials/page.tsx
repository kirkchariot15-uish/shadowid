'use client'

import dynamic from 'next/dynamic'

const ManageCredentialsPage = dynamic(
  () => import('@/components/manage-credentials-page'),
  { ssr: false }
)

export default function Page() {
  return <ManageCredentialsPage />
}
