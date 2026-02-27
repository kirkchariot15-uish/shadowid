'use client'

export function LoadingSpinner({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <style>{`
        @keyframes spin-ring {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .gradient-ring {
          animation: spin-ring 1.5s linear infinite;
          background: conic-gradient(from 0deg, var(--color-accent), transparent 70%);
        }
      `}</style>
      <div className={`gradient-ring relative ${sizeClasses[size]} rounded-full`}>
        <div className="absolute inset-2 rounded-full bg-background"></div>
      </div>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}
