'use client'

import dynamic from 'next/dynamic'

const LandingHero = dynamic(
  () => import('@/components/landing-hero').then((mod) => mod.LandingHero),
  { ssr: false }
)

export default function Page() {
  return <LandingHero />
}
