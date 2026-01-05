'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Idea {
  id: string;
  title: string;
  content: string;
  contentText: string;
  status: string;
  updatedAt: string;
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

  const fetchIdea = async () => {
    try {
      const response = await fetch(`/api/ideas/${resolvedParams.id}`);
      if (!response.ok) throw new Error('Failed to fetch idea');

      const data = await response.json();
      setIdea(data);
      setTitle(data.title);
      setContent(data.contentText);
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <Save size={18} />
                Save
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
            placeholder="Describe your idea... Research will start automatically as you write."
            className="w-full min-h-[400px] text-lg border-none focus:outline-none resize-none"
          />

          {content.split(/\s+/).length > 50 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ✨ Research will trigger automatically when you've added significant content or made title changes.
              </p>
            </div>
          )}
        </div>

        {/* Research Results Placeholder */}
        {idea._count.researchResults > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-semibold mb-4">Research Results</h3>
            <p className="text-gray-600">
              {idea._count.researchResults} research results found.
              Research panel will be implemented in Phase 3.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
