'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ResearchProgress {
  id: string;
  workerType: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  message: string | null;
  resultsCount: number;
  error: string | null;
}

interface Idea {
  id: string;
  title: string;
  content: string;
  contentText: string;
  status: string;
  updatedAt: string;
  lastResearchedAt: string | null;
  _count: {
    researchResults: number;
    aiInsights: number;
  };
}

export default function IdeaEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [researching, setResearching] = useState(false);
  const [researchProgress, setResearchProgress] = useState<ResearchProgress[]>([]);

  useEffect(() => {
    fetchIdea();
  }, [resolvedParams.id]);

  // Auto-save debounce
  useEffect(() => {
    if (!idea) return;

    const timeoutId = setTimeout(() => {
      if (title !== idea.title || content !== idea.contentText) {
        saveIdea();
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [title, content]);

  // Poll for research progress when researching
  useEffect(() => {
    if (!researching) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/ideas/${resolvedParams.id}/research`);
        if (response.ok) {
          const data = await response.json();
          setResearchProgress(data.progress);

          // Check if all research is complete
          const allComplete = data.progress.every(
            (p: ResearchProgress) => p.status === 'COMPLETED' || p.status === 'FAILED'
          );

          if (allComplete && data.progress.length > 0) {
            setResearching(false);
            fetchIdea(); // Refresh idea data to get new results count
          }
        }
      } catch (error) {
        console.error('Error fetching research progress:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [researching, resolvedParams.id]);

  const fetchIdea = async () => {
    try {
      const response = await fetch(`/api/ideas/${resolvedParams.id}`);
      if (!response.ok) throw new Error('Failed to fetch idea');

      const data = await response.json();
      setIdea(data);
      setTitle(data.title);
      setContent(data.contentText);

      // Check if research is in progress
      if (data.status === 'RESEARCHING') {
        setResearching(true);
      }
    } catch (error) {
      console.error('Error fetching idea:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveIdea = async () => {
    if (!idea) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/ideas/${idea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          contentText: content,
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Error saving idea:', error);
    } finally {
      setSaving(false);
    }
  };

  const startResearch = async () => {
    if (!idea || researching) return;

    // Save first if there are unsaved changes
    if (title !== idea.title || content !== idea.contentText) {
      await saveIdea();
    }

    setResearching(true);
    setResearchProgress([]);

    try {
      const response = await fetch(`/api/ideas/${idea.id}/research`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to start research');
        setResearching(false);
        return;
      }
    } catch (error) {
      console.error('Error starting research:', error);
      alert('Failed to start research');
      setResearching(false);
    }
  };

  const deleteIdea = async () => {
    if (!idea) return;
    if (!confirm('Are you sure you want to delete this idea?')) return;

    try {
      await fetch(`/api/ideas/${idea.id}`, {
        method: 'DELETE',
      });
      router.push('/ideas');
    } catch (error) {
      console.error('Error deleting idea:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
      case 'RUNNING':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'COMPLETED':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'FAILED':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      default:
        return null;
    }
  };

  const getWorkerLabel = (workerType: string) => {
    switch (workerType) {
      case 'ai-analysis':
        return 'AI Analysis';
      case 'web-search':
        return 'Web Search';
      case 'product-hunt':
        return 'Product Hunt';
      case 'github':
        return 'GitHub';
      case 'reddit':
        return 'Reddit';
      default:
        return workerType;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Idea not found</h2>
          <Link href="/ideas" className="text-blue-600 hover:underline">
            Back to ideas
          </Link>
        </div>
      </div>
    );
  }

  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/ideas"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft size={20} />
              Back to ideas
            </Link>
            <div className="flex items-center gap-4">
              {lastSaved && (
                <span className="text-sm text-gray-500">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              {saving && (
                <span className="text-sm text-blue-600">Saving...</span>
              )}
              <button
                onClick={saveIdea}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
              >
                <Save size={18} />
                Save
              </button>
              <button
                onClick={startResearch}
                disabled={researching || wordCount < 5}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title={wordCount < 5 ? 'Add at least 5 words to start research' : ''}
              >
                {researching ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Sparkles size={18} />
                )}
                {researching ? 'Researching...' : 'Research'}
              </button>
              <button
                onClick={deleteIdea}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Idea title..."
            className="w-full text-3xl font-bold border-none focus:outline-none mb-6"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe your idea... Jot down your thoughts, questions, and anything that comes to mind. Click 'Research' when you're ready to discover what's out there."
            className="w-full min-h-[400px] text-lg border-none focus:outline-none resize-none"
          />

          <div className="mt-4 text-sm text-gray-500">
            {wordCount} words
            {idea.lastResearchedAt && (
              <span className="ml-4">
                Last researched: {new Date(idea.lastResearchedAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Research Progress */}
        {researching && researchProgress.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              Research in Progress
            </h3>
            <div className="space-y-3">
              {researchProgress.map((progress) => (
                <div
                  key={progress.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {getStatusIcon(progress.status)}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {getWorkerLabel(progress.workerType)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {progress.message || 'Waiting...'}
                      {progress.resultsCount > 0 && (
                        <span className="ml-2 text-blue-600">
                          ({progress.resultsCount} results)
                        </span>
                      )}
                    </div>
                    {progress.error && (
                      <div className="text-sm text-red-600 mt-1">
                        Error: {progress.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Research Results */}
        {!researching && idea._count.researchResults > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-semibold mb-4">Research Results</h3>
            <p className="text-gray-600">
              {idea._count.researchResults} research results and{' '}
              {idea._count.aiInsights} AI insights found.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Full results display coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
