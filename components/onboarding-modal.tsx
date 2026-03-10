'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, Zap, Lock, Share2, Award, ArrowRight, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: 'Welcome to ShadowID',
    description: 'Privacy-first identity with peer-verified credibility',
    icon: Zap,
    details: 'Create a zero-knowledge identity, get peer endorsements, and build cryptographic proof of your credibility—all without revealing personal data.'
  },
  {
    id: 2,
    title: 'Create Your Identity',
    description: 'Start with your private ShadowID',
    icon: Lock,
    details: 'Select attributes (name, age, location, job) and generate a cryptographic commitment stored on the Aleo blockchain. Only you control your data.',
    action: '/create-identity'
  },
  {
    id: 3,
    title: 'Peer Endorsements',
    description: 'Build credibility through community trust',
    icon: Award,
    details: 'Ask peers to endorse your attributes. Each endorsement increases your Shadow Score (0-100). Prevents sybil attacks with blockchain-backed verification.',
    action: '/endorse-peer'
  },
  {
    id: 4,
    title: 'Shadow Score',
    description: 'Your credibility metric',
    icon: TrendingUp,
    details: 'Your score starts at 50 (neutral) and increases +5 per peer endorsement (max 100). Higher scores = more trustworthy identity.'
  },
  {
    id: 5,
    title: 'Selective Disclosure',
    description: 'Share what matters, keep the rest private',
    icon: Share2,
    details: 'Generate QR codes proving specific attributes without revealing everything. Perfect for age verification, employment checks, or membership proofs.',
    action: '/selective-disclosure'
  },
  {
    id: 6,
    title: "You're Ready!",
    description: 'Start your zero-knowledge identity journey',
    icon: CheckCircle,
    details: 'Explore your dashboard, request peer endorsements, verify other users, and build real credibility on the blockchain.'
  }
]

export function OnboardingModal({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const step = ONBOARDING_STEPS[currentStep]
  const Icon = step.icon

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      localStorage.setItem('shadowid-onboarding-done', 'true')
      onComplete()
    }
  }

  const handleSkip = () => {
    localStorage.setItem('shadowid-onboarding-done', 'true')
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-2xl border border-accent/20 p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 hover:bg-accent/10 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= currentStep ? 'bg-accent' : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-accent/10 border border-accent/20">
              <Icon className="h-8 w-8 text-accent" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">{step.title}</h2>
          <p className="text-sm text-muted-foreground">{step.description}</p>
          <p className="text-xs text-muted-foreground/80 leading-relaxed">{step.details}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleSkip}
            variant="outline"
            className="flex-1 border-border text-muted-foreground hover:bg-accent/5"
          >
            Skip
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Step Counter */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          Step {currentStep + 1} of {ONBOARDING_STEPS.length}
        </p>
      </div>
    </div>
  )
}
