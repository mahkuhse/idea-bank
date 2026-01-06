'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Sparkles,
  Archive,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Loader2,
} from 'lucide-react';

interface Idea {
  id: string;
  title: string;
  contentText: string;
  status: string;
  rank: number | null;
  isShelved: boolean;
  updatedAt: string;
  lastResearchedAt: string | null;
  _count: {
    researchResults: number;
    aiInsights: number;
  };
}

export default function IdeasPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showShelved, setShowShelved] = useState(false);

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
          userId: 'temp-user-id',
        }),
      });

      const newIdea = await response.json();
      router.push(`/ideas/${newIdea.id}`);
    } catch (error) {
      console.error('Error creating idea:', error);
    }
  };

  const updateIdea = async (id: string, updates: Partial<Idea>) => {
    try {
      await fetch(`/api/ideas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      fetchIdeas();
    } catch (error) {
      console.error('Error updating idea:', error);
    }
  };

  const shelveIdea = (id: string) => {
    updateIdea(id, { isShelved: true, rank: null });
  };

  const unshelveIdea = (id: string) => {
    updateIdea(id, { isShelved: false });
  };

  const setIdeaRank = (id: string, rank: number | null) => {
    // If assigning a rank, remove that rank from any other idea first
    if (rank !== null) {
      const existingWithRank = ideas.find(i => i.rank === rank && i.id !== id);
      if (existingWithRank) {
        updateIdea(existingWithRank.id, { rank: null });
      }
    }
    updateIdea(id, { rank, isShelved: false });
  };

  // Separate active and shelved ideas
  const activeIdeas = ideas.filter((idea) => !idea.isShelved);
  const shelvedIdeas = ideas.filter((idea) => idea.isShelved);

  // Separate ranked and unranked active ideas
  const rankedIdeas = activeIdeas
    .filter((idea) => idea.rank !== null)
    .sort((a, b) => (a.rank || 0) - (b.rank || 0));
  const unrankedIdeas = activeIdeas.filter((idea) => idea.rank === null);

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const IdeaCard = ({ idea }: { idea: Idea }) => {
    const [showMenu, setShowMenu] = useState(false);
    const wordCount = getWordCount(idea.contentText);

    return (
      <div
        className={`group relative bg-white rounded-xl border-2 transition-all hover:shadow-lg cursor-pointer ${
          idea.rank !== null
            ? 'border-blue-300 hover:border-blue-400'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => router.push(`/ideas/${idea.id}`)}
      >
        {/* Rank Badge */}
        {idea.rank !== null && (
          <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
            {idea.rank}
          </div>
        )}

        {/* Menu Button */}
        <div
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreVertical size={16} className="text-gray-500" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
              {!idea.isShelved && (
                <>
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIdeaRank(idea.id, 1);
                      setShowMenu(false);
                    }}
                  >
                    Set as #1
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIdeaRank(idea.id, 2);
                      setShowMenu(false);
                    }}
                  >
                    Set as #2
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIdeaRank(idea.id, 3);
                      setShowMenu(false);
                    }}
                  >
                    Set as #3
                  </button>
                  {idea.rank !== null && (
                    <button
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIdeaRank(idea.id, null);
                        setShowMenu(false);
                      }}
                    >
                      Remove rank
                    </button>
                  )}
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      shelveIdea(idea.id);
                      setShowMenu(false);
                    }}
                  >
                    <Archive size={14} />
                    Shelve idea
                  </button>
                </>
              )}
              {idea.isShelved && (
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    unshelveIdea(idea.id);
                    setShowMenu(false);
                  }}
                >
                  Restore idea
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-8 line-clamp-1">
            {idea.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
            {idea.contentText || 'No content yet...'}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span>{wordCount} words</span>
              {idea._count.researchResults > 0 && (
                <span className="flex items-center gap-1 text-blue-600">
                  <Sparkles size={12} />
                  {idea._count.researchResults} results
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {idea.status === 'RESEARCHING' && (
                <span className="flex items-center gap-1 text-yellow-600">
                  <Loader2 size={12} className="animate-spin" />
                  Researching
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Idea Bank</h1>
            <p className="text-gray-600 mt-2">
              Research-powered idea validation
            </p>
          </div>
          <button
            onClick={createNewIdea}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus size={20} />
            New Idea
          </button>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search ideas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading ideas...</div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No ideas yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first idea and start researching
            </p>
            <button
              onClick={createNewIdea}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Plus size={20} />
              Create Idea
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Top Ranked Ideas */}
            {rankedIdeas.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                    {rankedIdeas.length}
                  </span>
                  Top Ideas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rankedIdeas.map((idea) => (
                    <IdeaCard key={idea.id} idea={idea} />
                  ))}
                </div>
              </section>
            )}

            {/* All Other Ideas */}
            {unrankedIdeas.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {rankedIdeas.length > 0 ? 'Other Ideas' : 'All Ideas'}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({unrankedIdeas.length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {unrankedIdeas.map((idea) => (
                    <IdeaCard key={idea.id} idea={idea} />
                  ))}
                </div>
              </section>
            )}

            {/* Shelved Ideas */}
            {shelvedIdeas.length > 0 && (
              <section>
                <button
                  onClick={() => setShowShelved(!showShelved)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-4"
                >
                  {showShelved ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                  <Archive size={18} />
                  <span className="font-medium">Shelved</span>
                  <span className="text-sm text-gray-500">
                    ({shelvedIdeas.length})
                  </span>
                </button>

                {showShelved && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-75">
                    {shelvedIdeas.map((idea) => (
                      <IdeaCard key={idea.id} idea={idea} />
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
