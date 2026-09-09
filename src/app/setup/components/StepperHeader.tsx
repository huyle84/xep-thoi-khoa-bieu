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
  onStepClick?: (stepId: number) => void;
}

const COLOR_MAP: Record<string, string> = {
  blue:   '#3b82f6',
  orange: '#f97316',
  green:  '#22c55e',
  red:    '#ef4444',
  purple: '#a855f7',
  teal:   '#14b8a6',
  indigo: '#6366f1',
  pink:   '#ec4899',
  violet: '#8b5cf6',
};

export default function StepperHeader({ currentStep, steps, onStepClick }: StepperHeaderProps) {
  return (
    <div className="w-full py-5 px-4 border-b border-gray-100 bg-gray-50/50">
      {/* Mobile */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">
            Bước {currentStep}/{steps.length}
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {steps.find(s => s.id === currentStep)?.label}
          </span>
        </div>
        {/* Mobile step dots */}
        <div className="flex gap-1.5">
          {steps.map(step => (
            <button
              key={step.id}
              onClick={() => onStepClick?.(step.id)}
              className="flex-1 h-1.5 rounded-full transition-colors"
              style={{
                backgroundColor: step.id <= currentStep
                  ? COLOR_MAP[step.color] || '#6366f1'
                  : '#e5e7eb'
              }}
              title={`Bước ${step.id}: ${step.label}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-start justify-between relative">
        {/* Background line */}
        <div className="absolute left-0 top-5 -translate-y-1/2 w-full h-0.5 bg-gray-200 z-0" />
        {/* Progress line */}
        <div
          className="absolute left-0 top-5 -translate-y-1/2 h-0.5 z-0 transition-all duration-500"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
          }}
        />

        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent   = step.id === currentStep;
          const isFuture    = step.id > currentStep;
          const color       = COLOR_MAP[step.color] || '#6366f1';
          const isClickable = true; // Cho phép click tự do bất kỳ bước nào

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center"
              style={{ minWidth: 60 }}
            >
              <button
                onClick={() => isClickable && onStepClick?.(step.id)}
                title={`Bước ${step.id}: ${step.label}`}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  font-bold text-sm shadow-sm transition-all duration-300
                  ${isClickable ? 'cursor-pointer hover:scale-110 hover:shadow-md' : 'cursor-default'}
                  ${isCompleted ? 'text-white' : ''}
                  ${isCurrent  ? 'text-white ring-4 ring-offset-1 shadow-lg scale-110' : ''}
                  ${isFuture   ? 'bg-white border-2 border-gray-300 text-gray-400 hover:border-gray-400' : ''}
                `}
                style={{
                  backgroundColor: isCompleted ? color : isCurrent ? color : undefined,
                  outline: isCurrent ? `3px solid ${color}40` : undefined,
                  outlineOffset: isCurrent ? '2px' : undefined,
                }}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.id}
              </button>

              <span className={`
                mt-2 text-xs font-medium text-center transition-colors duration-300 leading-tight
                ${isCompleted ? 'text-gray-600' : ''}
                ${isCurrent   ? 'text-gray-900 font-bold' : ''}
                ${isFuture    ? 'text-gray-400' : ''}
              `}
                style={{ maxWidth: 64 }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
