import Link from 'next/link';
import { ArrowRight, Lightbulb, Search, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="max-w-6xl mx-auto px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Idea Bank
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Intelligent research for your business ideas. Get comprehensive, neutral analysis
            automatically as you write.
          </p>
          <Link
            href="/ideas"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            Get Started
            <ArrowRight size={20} />
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Lightbulb className="text-blue-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Capture Ideas Freely</h3>
            <p className="text-gray-600">
              Notes-app feel with rich text. Auto-save keeps your thoughts safe.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Search className="text-purple-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Passive Research</h3>
            <p className="text-gray-600">
              Automatic research triggers find existing solutions, competitors, and market insights.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Neutral Analysis</h3>
            <p className="text-gray-600">
              No false encouragement. Comprehensive facts to make informed decisions.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-2xl font-bold mb-2">Ready to research your ideas?</h2>
          <p className="text-gray-600 mb-4">
            Start capturing your ideas and get automatic research insights.
          </p>
          <Link
            href="/ideas"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Open Idea Bank
            <ArrowRight size={20} />
          </Link>
        </div>
      </main>
    </div>
  );
}
