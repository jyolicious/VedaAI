'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Brain, Zap, FileText, CheckCircle } from 'lucide-react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useJobWebSocket } from '@/hooks/useJobWebSocket';
import clsx from 'clsx';

const steps = [
  { icon: Brain, label: 'Analyzing requirements', threshold: 15 },
  { icon: Zap, label: 'Generating questions with AI', threshold: 50 },
  { icon: FileText, label: 'Structuring question paper', threshold: 80 },
  { icon: CheckCircle, label: 'Finalizing and saving', threshold: 95 },
];

export default function GeneratingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { activeJobProgress, activePaper } = useAssignmentStore();
  useJobWebSocket(id);

  // Redirect to paper view if already completed
  useEffect(() => {
    if (activePaper) {
      router.push(`/assignments/${id}/paper`);
    }
  }, [activePaper, id, router]);

  const progress = activeJobProgress?.progress ?? 0;
  const message = activeJobProgress?.message ?? 'Starting...';
  const status = activeJobProgress?.status ?? 'queued';

  return (
    <SidebarLayout breadcrumb="Assignment">
      <div className="flex items-center justify-center min-h-full p-6">
        <div className="max-w-md w-full text-center">
          {/* Animated brain/logo */}
          <div className="relative mx-auto w-24 h-24 mb-8">
            <div className="absolute inset-0 bg-orange-100 rounded-full pulse-ring" />
            <div className="relative w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center">
              <Brain size={40} className="text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'failed' ? 'Generation Failed' : 'Generating Your Paper'}
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            {status === 'failed'
              ? 'Something went wrong. Please try again.'
              : 'Our AI is crafting exam-quality questions based on your requirements.'}
          </p>

          {/* Progress bar */}
          {status !== 'failed' && (
            <>
              <div className="progress-bar mb-3 mx-auto max-w-xs">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-8">{progress}% — {message}</p>

              {/* Step indicators */}
              <div className="space-y-3 text-left max-w-xs mx-auto">
                {steps.map((step) => {
                  const done = progress >= step.threshold;
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.label}
                      className={clsx(
                        'flex items-center gap-3 text-sm transition-all duration-300',
                        done ? 'text-gray-900' : 'text-gray-400'
                      )}
                    >
                      <div
                        className={clsx(
                          'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
                          done ? 'bg-green-100' : 'bg-gray-100'
                        )}
                      >
                        <Icon size={14} className={done ? 'text-green-600' : 'text-gray-400'} />
                      </div>
                      {step.label}
                      {done && (
                        <span className="ml-auto text-green-500">
                          <CheckCircle size={14} />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {status === 'failed' && (
            <button
              onClick={() => router.push('/assignments/create')}
              className="btn-primary mx-auto"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}