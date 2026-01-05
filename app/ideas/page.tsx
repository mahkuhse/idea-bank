'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';

interface Idea {
  id: string;
  title: string;
  contentText: string;
  status: string;
  updatedAt: string;
  _count: {
    researchResults: number;
    aiInsights: number;
  };
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIdeas();
  }, [search]);

  const fetchIdeas = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);

      const response = await fetch(`/api/ideas?${params}`);
      const data = await response.json();
      setIdeas(data);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewIdea = async () => {
    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Idea',
          content: '',
          contentText: '',
          userId: 'temp-user-id', // TODO: Replace with actual user ID from auth
        }),
      });

      const newIdea = await response.json();
      window.location.href = `/ideas/${newIdea.id}`;
    } catch (error) {
      console.error('Error creating idea:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Idea Bank</h1>
            <p className="text-gray-600 mt-2">
              Intelligent research for your business ideas
            </p>
          </div>
          <button
            onClick={createNewIdea}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            New Idea
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search ideas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Ideas List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading ideas...</div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No ideas yet. Create your first one!</p>
            <button
              onClick={createNewIdea}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              Create Idea
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {ideas.map((idea) => (
              <Link
                key={idea.id}
                href={`/ideas/${idea.id}`}
                className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {idea.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-2">
                      {idea.contentText || 'No content yet...'}
                    </p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                      <span>
                        Updated {new Date(idea.updatedAt).toLocaleDateString()}
                      </span>
                      {idea._count.researchResults > 0 && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {idea._count.researchResults} research results
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      idea.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      idea.status === 'RESEARCHING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {idea.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
