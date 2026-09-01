'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import StepperHeader from './components/StepperHeader';
import Step1Khoi from './components/Step1Khoi';
import Step2Lop from './components/Step2Lop';
import Step3Tiet from './components/Step3Tiet';
import Step4Mon from './components/Step4Mon';
import Step5GiaoVien from './components/Step5GiaoVien';
import Step6GVCN from './components/Step6GVCN';
import Step7PhanCong from './components/Step7PhanCong';
import Step8SoTiet from './components/Step8SoTiet';

const STEPS = [
  { id: 1, label: 'Khối', color: 'blue' },
  { id: 2, label: 'Lớp', color: 'orange' },
  { id: 3, label: 'Tiết', color: 'green' },
  { id: 4, label: 'Môn', color: 'red' },
  { id: 5, label: 'Giáo viên', color: 'purple' },
  { id: 6, label: 'GVCN', color: 'teal' },
  { id: 7, label: 'Phân công', color: 'indigo' },
  { id: 8, label: 'Set số tiết', color: 'pink' }
];

export default function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < 8) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleFinish = async () => {
    try {
      await fetch('/api/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setupCompleted: true })
      });
      router.push('/');
    } catch (e) {
      console.error(e);
      // Fallback redirect
      router.push('/');
    }
  };

  return (
    <div className="flex flex-col min-h-[80vh]">
      <StepperHeader currentStep={currentStep} steps={STEPS} />
      
      <div className="flex-1 bg-white">
        {currentStep === 1 && <Step1Khoi />}
        {currentStep === 2 && <Step2Lop />}
        {currentStep === 3 && <Step3Tiet />}
        {currentStep === 4 && <Step4Mon />}
        {currentStep === 5 && <Step5GiaoVien />}
        {currentStep === 6 && <Step6GVCN />}
        {currentStep === 7 && <Step7PhanCong />}
        {currentStep === 8 && <Step8SoTiet />}
      </div>

      <div className="border-t border-gray-100 p-6 bg-gray-50 flex justify-between items-center rounded-b-xl">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
            currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
          }`}
        >
          Quay lại
        </button>

        {currentStep < 8 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
          >
            Tiếp tục
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="px-8 py-2.5 rounded-lg font-bold bg-gradient-to-r from-pink-500 to-indigo-600 text-white hover:opacity-90 shadow-md transition-all transform hover:scale-105"
          >
            Hoàn tất thiết lập
          </button>
        )}
      </div>
    </div>
  );
}
