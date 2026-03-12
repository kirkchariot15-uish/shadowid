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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <style>{`
        @keyframes glow-shine {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2);
          }
          50% {
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 80px rgba(59, 130, 246, 0.4);
          }
        }

        .glow-shine-text {
          background: linear-gradient(
            90deg,
            #ffffff 0%,
            #e0f2fe 25%,
            #0ea5e9 50%,
            #e0f2fe 75%,
            #ffffff 100%
          );
          background-size: 1000px 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: glow-shine 3s linear infinite;
        }

        .glow-circle {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
      
      <div className="flex flex-col items-center gap-12">
        {/* Glowing animated circle */}
        <div className="relative w-40 h-40">
          {/* Outer rotating ring */}
          <div 
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-500"
            style={{ animation: 'spin 3s linear infinite' }}
          />
          
          {/* Middle pulsing ring */}
          <div className="absolute inset-6 rounded-full border border-blue-400/50 animate-pulse" />
          
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-blue-500/20 to-blue-500/5 blur-xl glow-circle" />
          
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-300 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
            style={{
              boxShadow: '0 0 30px rgba(59, 130, 246, 1), 0 0 60px rgba(59, 130, 246, 0.5)'
            }}
          />
        </div>

        {/* Text with glowing shine effect */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold glow-shine-text tracking-tight">
            Creating your ShadowID
          </h1>
          <p className="text-sm text-blue-300/70">
            Confirming transaction on blockchain...
          </p>
        </div>

        {/* Loading indicator bars */}
        <div className="flex items-end justify-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-full"
              style={{
                height: `${20 + i * 10}px`,
                animation: `${i % 2 === 0 ? 'animate-pulse' : ''} 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
