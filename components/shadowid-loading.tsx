'use client'

import { useEffect, useState } from 'react'

export interface ShadowIDLoadingProps {
  isVisible: boolean
}

export function ShadowIDLoading({ isVisible }: ShadowIDLoadingProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isVisible || !mounted) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <style>{`
        @keyframes glow-sweep {
          0% {
            background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%);
            background-position: -200% center;
          }
          100% {
            background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%);
            background-position: 200% center;
          }
        }
        
        .glow-text {
          animation: glow-sweep 2s ease-in-out infinite;
          background-size: 200% 100%;
        }
      `}</style>
      
      <div className="text-center space-y-8">
        {/* Glowing Circle */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
          <div className="absolute inset-4 rounded-full bg-blue-500/10 blur-lg animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/30"></div>
          
          {/* Glowing dot in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-blue-400 shadow-lg shadow-blue-500/50 animate-pulse"></div>
          </div>
        </div>

        {/* Text with glowing animation */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white glow-text">Creating your ShadowID</h2>
          <p className="text-sm text-blue-300/70">Confirming transaction on blockchain...</p>
        </div>

        {/* Animated dots */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  )
}
