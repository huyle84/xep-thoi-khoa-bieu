'use client';

import React from 'react';
import { Check } from 'lucide-react';

export interface StepInfo {
  id: number;
  label: string;
  color: string;
}

interface StepperHeaderProps {
  currentStep: number;
  steps: StepInfo[];
}

export default function StepperHeader({ currentStep, steps }: StepperHeaderProps) {
  return (
    <div className="w-full py-6 px-4 border-b border-gray-100 bg-gray-50/50">
      {/* Mobile view */}
      <div className="md:hidden flex items-center justify-center">
        <div className="text-lg font-medium text-gray-900">
          Bước {currentStep}: {steps.find((s) => s.id === currentStep)?.label}
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden md:flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 z-0 transition-all duration-300"
          style={{ 
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            background: 'linear-gradient(to right, #6366f1, #3b82f6)' 
          }}
        ></div>

        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isFuture = step.id > currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-all duration-300
                  ${isCompleted ? 'bg-indigo-600 text-white shadow-indigo-200' : ''}
                  ${isCurrent ? `bg-${step.color}-600 text-white ring-4 ring-${step.color}-100 shadow-md transform scale-110` : ''}
                  ${isFuture ? 'bg-white border-2 border-gray-300 text-gray-400' : ''}
                `}
                style={isCurrent ? { backgroundColor: step.color } : undefined}
              >
                {isCompleted ? <Check className="w-6 h-6" /> : step.id}
              </div>
              <div className={`mt-3 text-sm font-medium transition-colors duration-300
                ${isCompleted ? 'text-gray-800' : ''}
                ${isCurrent ? 'text-gray-900 font-bold' : ''}
                ${isFuture ? 'text-gray-400' : ''}
              `}>
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
