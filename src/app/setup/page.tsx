'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import StepperHeader from './components/StepperHeader';
import Step1Khoi     from './components/Step1Khoi';
import Step2Lop      from './components/Step2Lop';
import Step3Tiet     from './components/Step3Tiet';
import Step4Mon      from './components/Step4Mon';
import Step5GiaoVien from './components/Step5GiaoVien';
import Step6GVCN     from './components/Step6GVCN';
import Step7PhanCong from './components/Step7PhanCong';
import Step8SoTiet   from './components/Step8SoTiet';
import Step9XepTKB   from './components/Step9XepTKB';

const STEPS = [
  { id: 1, label: 'Khối',       color: 'blue'   },
  { id: 2, label: 'Lớp',        color: 'orange' },
  { id: 3, label: 'Tiết',       color: 'green'  },
  { id: 4, label: 'Môn',        color: 'red'    },
  { id: 5, label: 'Giáo viên',  color: 'purple' },
  { id: 6, label: 'GVCN',       color: 'teal'   },
  { id: 7, label: 'Phân công',  color: 'indigo' },
  { id: 8, label: 'Số tiết',    color: 'pink'   },
  { id: 9, label: 'Xếp TKB',   color: 'violet' },
];

const STEP_LABELS: Record<number, string> = {
  1: 'Thiết lập Khối học',
  2: 'Thiết lập Lớp học',
  3: 'Cấu hình Tiết học',
  4: 'Danh sách Môn học',
  5: 'Danh sách Giáo viên',
  6: 'Phân công GVCN',
  7: 'Phân công giảng dạy',
  8: 'Thiết lập số tiết/tuần',
  9: 'Xếp Thời Khóa Biểu',
};

function SetupWizardContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const urlStep      = parseInt(searchParams.get('step') || '1', 10);

  const [currentStep, setCurrentStep] = useState<number>(
    urlStep >= 1 && urlStep <= 9 ? urlStep : 1
  );
  const [isFinishing, setIsFinishing] = useState(false);

  // Đồng bộ URL khi đổi bước
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('step', String(currentStep));
    window.history.replaceState({}, '', url.toString());
  }, [currentStep]);

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 9) setCurrentStep(step);
  };

  const handleNext = () => goToStep(currentStep + 1);
  const handleBack = () => goToStep(currentStep - 1);

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      await fetch('/api/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setupCompleted: true }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      window.location.href = '/';
    }
  };

  const stepContent: Record<number, React.ReactNode> = {
    1: <Step1Khoi />,
    2: <Step2Lop />,
    3: <Step3Tiet />,
    4: <Step4Mon />,
    5: <Step5GiaoVien />,
    6: <Step6GVCN />,
    7: <Step7PhanCong />,
    8: <Step8SoTiet />,
    9: <Step9XepTKB />,
  };

  const isLastStep   = currentStep === 9;
  const isFirstStep  = currentStep === 1;

  return (
    <div className="flex flex-col min-h-[80vh]">
      {/* Stepper */}
      <StepperHeader
        currentStep={currentStep}
        steps={STEPS}
        onStepClick={goToStep}
      />

      {/* Step title */}
      <div className="px-6 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex-shrink-0">
            {currentStep}
          </span>
          <h2 className="text-base font-semibold text-gray-800">
            {STEP_LABELS[currentStep]}
          </h2>
          <span className="ml-auto text-xs text-gray-400">
            {currentStep}/9
          </span>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 bg-white overflow-auto">
        {stepContent[currentStep]}
      </div>

      {/* Footer navigation */}
      <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex items-center justify-between gap-3 rounded-b-xl sticky bottom-0">
        {/* Back button */}
        <button
          onClick={handleBack}
          disabled={isFirstStep}
          className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            isFirstStep
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
          }`}
        >
          ← Quay lại
        </button>

        {/* Step indicator dots (clickable) */}
        <div className="hidden sm:flex gap-1.5 items-center">
          {STEPS.map(s => (
            <button
              key={s.id}
              onClick={() => goToStep(s.id)}
              title={`Bước ${s.id}: ${s.label}`}
              className={`transition-all rounded-full ${
                s.id === currentStep
                  ? 'w-5 h-2 bg-indigo-600'
                  : s.id < currentStep
                    ? 'w-2 h-2 bg-indigo-300 hover:bg-indigo-500'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Right buttons */}
        <div className="flex gap-2">
          {/* Skip (chỉ hiện ở bước không bắt buộc: GVCN=6) */}
          {currentStep === 6 && (
            <button
              onClick={handleNext}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Bỏ qua
            </button>
          )}

          {isLastStep ? (
            <button
              onClick={handleFinish}
              disabled={isFinishing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 shadow-md transition-all disabled:opacity-70"
            >
              {isFinishing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</>
              ) : (
                '✅ Hoàn tất & về Dashboard'
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
            >
              Tiếp tục →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SetupWizardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
      </div>
    }>
      <SetupWizardContent />
    </Suspense>
  );
}
