'use client'

import { useState, useEffect } from 'react'
import { CreateIDContent } from '@/components/create-id-content'

export default function CreateIDPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <CreateIDContent />
}
