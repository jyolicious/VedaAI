'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import SidebarLayout from '@/components/layout/SidebarLayout';
import QuestionPaperDisplay from '@/components/question-paper/QuestionPaperDisplay';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useJobWebSocket } from '@/hooks/useJobWebSocket';
import { api } from '@/lib/api';
import type { GeneratedPaper } from '@/types';

export default function PaperPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { activePaper, setActivePaper } = useAssignmentStore();
  const [paper, setPaper] = useState<GeneratedPaper | null>(activePaper);
  const [loading, setLoading] = useState(!activePaper);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Keep WS open for regeneration events
  useJobWebSocket(isRegenerating ? id : null);

  useEffect(() => {
    if (!activePaper) {
      api
        .getPaper(id)
        .then((p) => {
          setPaper(p);
          setActivePaper(p);
        })
        .catch(() => toast.error('Could not load paper'))
        .finally(() => setLoading(false));
    }
  }, [id, activePaper, setActivePaper]);

  // When store paper updates (e.g. after regeneration via WS), refresh
  useEffect(() => {
    if (activePaper) setPaper(activePaper);
  }, [activePaper]);

  async function handleRegenerate() {
    setIsRegenerating(true);
    setActivePaper(null);
    try {
      await api.regenerate(id);
      toast('Regenerating paper...', { icon: '🔄' });
      router.push(`/assignments/${id}/generating`);
    } catch {
      toast.error('Failed to start regeneration');
      setIsRegenerating(false);
    }
  }

  return (
    <SidebarLayout breadcrumb="AI Teacher's Toolkit">
      <div className="p-6 pb-16">
        {/* Back button */}
        <button
          onClick={() => router.push('/assignments')}
          className="btn-ghost mb-4"
        >
          <ArrowLeft size={15} />
          Back to Assignments
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 size={32} className="animate-spin text-orange-500" />
            <p className="text-sm text-gray-500">Loading question paper...</p>
          </div>
        ) : !paper ? (
          <div className="text-center py-24">
            <p className="text-gray-500">Paper not found or still generating.</p>
            <button
              onClick={() => router.push(`/assignments/${id}/generating`)}
              className="btn-primary mt-4 mx-auto"
            >
              Check generation status
            </button>
          </div>
        ) : (
          <QuestionPaperDisplay
            paper={paper}
            assignmentId={id}
            onRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
          />
        )}
      </div>
    </SidebarLayout>
  );
}