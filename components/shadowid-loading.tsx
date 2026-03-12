'use client'

export interface ShadowIDLoadingProps {
  isVisible: boolean
}

export function ShadowIDLoading({ isVisible }: ShadowIDLoadingProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center">
      <style>{`
        @keyframes glow-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.5));
          }
          50% {
            filter: drop-shadow(0 0 30px rgba(59, 130, 246, 0.9)) drop-shadow(0 0 50px rgba(59, 130, 246, 0.5));
          }
        }

        @keyframes spin-ring {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        .glow-ring {
          animation: spin-ring 3s linear infinite;
        }

        .glow-pulse-ring {
          animation: glow-pulse 2s ease-in-out infinite;
        }

        .shimmer-text {
          background: linear-gradient(90deg, #ffffff 0%, #3b82f6 50%, #ffffff 100%);
          background-size: 1000px 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      <div className="flex flex-col items-center justify-center gap-10">
        {/* Main animated ring */}
        <div className="relative w-40 h-40">
          {/* Outer spinning border */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500/50 glow-ring" />
          
          {/* Middle animated ring */}
          <div className="absolute inset-8 rounded-full border-2 border-blue-500/30 glow-pulse-ring" />
          
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-transparent blur-2xl glow-pulse-ring" />
          
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-blue-400 rounded-full glow-pulse-ring" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold shimmer-text">
            Creating your ShadowID
          </h2>
          <p className="text-sm text-blue-300/70">
            Generating your identity commitment...
          </p>
        </div>
      </div>
    </div>
  )
}
