'use client'

import React from 'react'

// 1. Rotating Dots
export function RotatingDotsLoader() {
  return (
    <div className="flex items-center justify-center">
      <style>{`
        @keyframes rotate-dots {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .rotating-dots {
          animation: rotate-dots 2s linear infinite;
        }
      `}</style>
      <div className="rotating-dots flex gap-2">
        <div className="h-3 w-3 rounded-full bg-accent"></div>
        <div className="h-3 w-3 rounded-full bg-accent/60"></div>
        <div className="h-3 w-3 rounded-full bg-accent/30"></div>
      </div>
    </div>
  )
}

// 2. Pulse Wave
export function PulseWaveLoader() {
  return (
    <div className="flex items-center justify-center gap-2">
      <style>{`
        @keyframes pulse-wave {
          0%, 100% { height: 8px; }
          50% { height: 24px; }
        }
        .pulse-bar {
          animation: pulse-wave 1s ease-in-out infinite;
        }
        .pulse-bar-1 { animation-delay: 0s; }
        .pulse-bar-2 { animation-delay: 0.2s; }
        .pulse-bar-3 { animation-delay: 0.4s; }
      `}</style>
      <div className="pulse-bar-1 pulse-bar h-2 w-1 bg-accent rounded-full"></div>
      <div className="pulse-bar-2 pulse-bar h-2 w-1 bg-accent rounded-full"></div>
      <div className="pulse-bar-3 pulse-bar h-2 w-1 bg-accent rounded-full"></div>
    </div>
  )
}

// 3. Orbit Loader
export function OrbitLoader() {
  return (
    <div className="flex items-center justify-center">
      <style>{`
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(20px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
        }
        .orbit-particle {
          animation: orbit 2s linear infinite;
        }
      `}</style>
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-accent/20"></div>
        <div className="orbit-particle absolute inset-0">
          <div className="absolute top-0 left-1/2 h-2 w-2 bg-accent rounded-full transform -translate-x-1/2"></div>
        </div>
      </div>
    </div>
  )
}

// 4. Shimmer Skeleton
export function ShimmerLoader() {
  return (
    <div className="space-y-3">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, var(--color-card) 25%, var(--color-accent-light) 50%, var(--color-card) 75%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
      <div className="shimmer h-4 w-3/4 rounded"></div>
      <div className="shimmer h-4 w-1/2 rounded"></div>
      <div className="shimmer h-4 w-5/6 rounded"></div>
    </div>
  )
}

// 5. Bouncing Circles
export function BouncingCirclesLoader() {
  return (
    <div className="flex items-center justify-center gap-2">
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .bounce-circle {
          animation: bounce 0.8s ease-in-out infinite;
        }
        .bounce-1 { animation-delay: 0s; }
        .bounce-2 { animation-delay: 0.2s; }
        .bounce-3 { animation-delay: 0.4s; }
      `}</style>
      <div className="bounce-circle bounce-1 h-3 w-3 bg-accent rounded-full"></div>
      <div className="bounce-circle bounce-2 h-3 w-3 bg-accent rounded-full"></div>
      <div className="bounce-circle bounce-3 h-3 w-3 bg-accent rounded-full"></div>
    </div>
  )
}

// 6. Gradient Ring
export function GradientRingLoader() {
  return (
    <div className="flex items-center justify-center">
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
      <div className="gradient-ring relative h-10 w-10 rounded-full">
        <div className="absolute inset-2 rounded-full bg-background"></div>
      </div>
    </div>
  )
}

// 7. Double Ring
export function DoubleRingLoader() {
  return (
    <div className="flex items-center justify-center">
      <style>{`
        @keyframes spin-fast {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        .ring-fast { animation: spin-fast 1s linear infinite; }
        .ring-slow { animation: spin-slow 2s linear infinite; }
      `}</style>
      <div className="relative h-12 w-12">
        <div className="ring-fast absolute inset-0 rounded-full border-2 border-transparent border-t-accent border-r-accent"></div>
        <div className="ring-slow absolute inset-2 rounded-full border-2 border-transparent border-b-accent border-l-accent"></div>
      </div>
    </div>
  )
}

// 8. Text Skeleton
export function TextSkeletonLoader() {
  return (
    <div className="space-y-4">
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .skeleton-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      <div className="skeleton-pulse h-8 w-2/3 bg-muted rounded"></div>
      <div className="space-y-2">
        <div className="skeleton-pulse h-4 w-full bg-muted rounded"></div>
        <div className="skeleton-pulse h-4 w-5/6 bg-muted rounded"></div>
      </div>
    </div>
  )
}

// 9. Expanding Ring
export function ExpandingRingLoader() {
  return (
    <div className="flex items-center justify-center">
      <style>{`
        @keyframes expand {
          0% {
            width: 16px;
            height: 16px;
            opacity: 1;
          }
          100% {
            width: 40px;
            height: 40px;
            opacity: 0;
          }
        }
        .expanding-ring {
          animation: expand 1.5s ease-out infinite;
        }
      `}</style>
      <div className="relative h-12 w-12 flex items-center justify-center">
        <div className="expanding-ring-1 absolute h-4 w-4 rounded-full border-2 border-accent"></div>
        <div className="expanding-ring-2 absolute h-4 w-4 rounded-full border-2 border-accent" style={{ animation: 'expand 1.5s ease-out 0.5s infinite' }}></div>
        <div className="h-2 w-2 rounded-full bg-accent"></div>
      </div>
    </div>
  )
}

// 10. Morphing Blob
export function MorphingBlobLoader() {
  return (
    <div className="flex items-center justify-center">
      <style>{`
        @keyframes morph {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 40% 60% 30% 70%; }
        }
        .morph-blob {
          animation: morph 3s ease-in-out infinite;
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-foreground));
          opacity: 0.8;
        }
      `}</style>
      <div className="morph-blob h-10 w-10"></div>
    </div>
  )
}

// Loading Animation Showcase
export function LoadingAnimationsShowcase() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Loading Animations</h2>
        <p className="text-muted-foreground">Choose your favorite animation to use throughout the app</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: 'Rotating Dots', component: RotatingDotsLoader },
          { name: 'Pulse Wave', component: PulseWaveLoader },
          { name: 'Orbit', component: OrbitLoader },
          { name: 'Shimmer', component: ShimmerLoader },
          { name: 'Bouncing Circles', component: BouncingCirclesLoader },
          { name: 'Gradient Ring', component: GradientRingLoader },
          { name: 'Double Ring', component: DoubleRingLoader },
          { name: 'Text Skeleton', component: TextSkeletonLoader },
          { name: 'Expanding Ring', component: ExpandingRingLoader },
          { name: 'Morphing Blob', component: MorphingBlobLoader },
        ].map(({ name, component: Component }) => (
          <div key={name} className="rounded-lg border border-border bg-card p-6 flex flex-col items-center justify-center gap-4">
            <div className="h-24 flex items-center justify-center">
              <Component />
            </div>
            <p className="text-sm font-medium text-foreground">{name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
