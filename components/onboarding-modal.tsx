'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, Zap, Lock, Share2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: 'Welcome to ShadowID',
    description: 'A privacy-first identity system powered by zero-knowledge proofs on Aleo blockchain',
    icon: Zap,
    details: 'Keep your identity data encrypted locally while proving claims about yourself without revealing the actual data.'
  },
  {
    id: 2,
    title: 'Create Your Identity',
    description: 'Start by connecting your wallet and creating a ShadowID',
    icon: Lock,
    details: 'Select attributes you want to claim (name, age, location, etc.) and generate a cryptographic commitment stored on blockchain.',
    action: '/create-identity'
  },
  {
    id: 3,
    title: 'Selective Disclosure',
    description: 'Share only what you want to share',
    icon: Share2,
    details: 'Create QR codes that prove specific attributes without revealing your full identity. Perfect for age verification, employment checks, or membership proofs.',
    action: '/selective-disclosure'
  },
  {
    id: 4,
    title: "You're Ready!",
    description: 'Start using ShadowID to verify yourself on your terms',
    icon: CheckCircle,
    details: 'Explore the dashboard, request DAO attestations, and verify credentials shared by others.'
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
