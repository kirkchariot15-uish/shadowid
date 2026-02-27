'use client'

import { ReactNode } from 'react'
import { CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface Step {
  id: string
  label: string
  status: 'completed' | 'in-progress' | 'pending'
}

export function ProgressIndicator({ steps }: { steps: Step[] }) {
  const completedCount = steps.filter(s => s.status === 'completed').length
  const progressPercent = (completedCount / steps.length) * 100

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Progress</p>
          <p className="text-xs text-muted-foreground">{completedCount} of {steps.length}</p>
        </div>
        <div className="w-full h-2 rounded-full bg-border overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-4">
            <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 flex-shrink-0" style={{
              borderColor: step.status === 'completed' ? 'var(--color-accent)' : 
                          step.status === 'in-progress' ? 'var(--color-accent)' : 'var(--color-border)',
              backgroundColor: step.status === 'completed' ? 'var(--color-accent)' :
                             step.status === 'in-progress' ? 'var(--color-accent)/10' : 'transparent'
            }}>
              {step.status === 'completed' && <CheckCircle className="w-4 h-4 text-accent-foreground" />}
              {step.status === 'in-progress' && <Clock className="w-4 h-4 text-accent" />}
              {step.status === 'pending' && <div className="w-2 h-2 rounded-full bg-border" />}
            </div>
            <p className={`text-sm font-medium ${
              step.status === 'completed' ? 'text-foreground line-through opacity-50' :
              step.status === 'in-progress' ? 'text-foreground font-semibold' :
              'text-muted-foreground'
            }`}>
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
