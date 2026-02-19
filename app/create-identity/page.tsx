'use client'

import { useState, useEffect } from 'react'
import { CreateIdentityClient } from '@/components/create-identity-client'

export default function CreateIdentityPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <CreateIdentityClient />
}
