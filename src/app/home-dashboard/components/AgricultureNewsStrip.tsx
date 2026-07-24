import React from 'react';
import { ExternalLink, ChevronRight } from 'lucide-react';

const NEWS = [
  {
    id: 'news-001',
    category: 'Disease Alert',
    categoryColor: 'bg-severity-high-bg text-severity-high',
    headline: 'IMD warns of extended monsoon — blight risk 40% higher in Gujarat this season',
    source: 'Krishi Jagran',
    time: '3 hrs ago',
    readTime: '2 min read',
    emoji: '🌧️',
  },
  {
    id: 'news-002',
    category: 'Research',
    categoryColor: 'bg-accent text-primary',
    headline:
      'New biocontrol agent shows 87% efficacy against Phytophthora infestans in field trials',
    source: 'ICAR Bulletin',
    time: '1 day ago',
    readTime: '4 min read',
    emoji: '🔬',
  },
  {
    id: 'news-003',
    category: 'Market',
    categoryColor: 'bg-severity-medium-bg text-severity-medium',
    headline: 'Tomato prices drop 22% as late blight reduces supply in Maharashtra and Gujarat',
    source: 'AgriMarket India',
    time: '2 days ago',
    readTime: '3 min read',
    emoji: '📈',
  },
];

export default function AgricultureNewsStrip() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Agriculture News</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Localized for Gujarat · Updated hourly
          </p>
        </div>
        <button className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
          View All <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
        {NEWS?.map((article) => (
          <div
            key={article?.id}
            className="card-base flex flex-col gap-3 group hover:card-shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${article?.categoryColor}`}
              >
                {article?.category}
              </span>
              <span className="text-xs text-muted-foreground flex-shrink-0">{article?.time}</span>
            </div>

            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl flex-shrink-0">
                {article?.emoji}
              </div>
              <p className="text-sm font-semibold text-foreground leading-snug line-clamp-3">
                {article?.headline}
              </p>
            </div>

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{article?.source}</p>
                <p className="text-xs text-muted-foreground/70">{article?.readTime}</p>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
