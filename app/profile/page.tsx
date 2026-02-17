'use client'

import dynamic from 'next/dynamic'

const ProfilePage = dynamic(() => import('@/components/profile-page'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background" />,
})

export default function Page() {
  return <ProfilePage />
}
