import dynamic from 'next/dynamic'

const LandingHero = dynamic(
  () => import('@/components/landing-hero').then((mod) => mod.LandingHero),
  { ssr: false }
)

export const metadata = {
  title: 'ShadowID - Zero-Knowledge Identity',
  description: 'Prove who you are without revealing why. Cryptographic privacy on the Aleo blockchain.',
}

export default function Page() {
  return <LandingHero />
}
