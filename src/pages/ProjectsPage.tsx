import { useMemo, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { PageHero } from '../components/common/PageHero';
import { ProjectCard } from '../components/common/ProjectCard';
import { useProjects } from '../features/content/usePublicContent';
import type { ProjectCategory } from '../types/models';

const categories: ['All' | ProjectCategory, ...ProjectCategory[]] = [
  'All',
  'IoT',
  'Cybersecurity',
  'AI/ML',
  'Web Development',
  'Other',
];

export function ProjectsPage() {
  const [category, setCategory] = useState<(typeof categories)[number]>('All');
  const [query, setQuery] = useState('');
  const { data: projects, error } = useProjects();

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (category === 'All' || p.category === category) &&
          `${p.title} ${p.shortDescription} ${p.technologies?.join(' ') || ''}`
            .toLowerCase()
            .includes(query.toLowerCase())
      ),
    [projects, category, query]
  );

  return (
    <main>
      <PageHero
        kind="projects"
        eyebrow="Projects & Engineering Portfolio"
        title="Intelligent systems, applications, and technology in development."
        copy="Explore the projects, technological concepts, and digital solutions engineered by the Crezonices team to address real-world challenges."
        badge="Live Portfolio"
      />

      <section className="section project-browser">
        {/* FILTER & SEARCH BAR */}
        <div className="filter-row glass-panel">
          <div className="filter-pills" role="tablist" aria-label="Project category filter">
            {categories.map((x) => (
              <button
                key={x}
                role="tab"
                aria-selected={category === x}
                className={`filter-btn ${category === x ? 'selected' : ''}`}
                onClick={() => setCategory(x)}
              >
                {x}
              </button>
            ))}
          </div>

          <label className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search concepts or technologies…"
              aria-label="Search projects by keyword"
            />
          </label>
        </div>

        {error && (
          <div className="concept-note-box">
            <Sparkles size={16} />
            <span>{error} Rendering available system records.</span>
          </div>
        )}

        {/* RESULTS GRID */}
        {filtered.length ? (
          <div className="project-grid">
            {filtered.map((p) => (
              <ProjectCard project={p} key={p.id} />
            ))}
          </div>
        ) : (
          <div className="empty-state glass-panel">
            <h2>No matching projects found</h2>
            <p>
              We couldn't find any concepts matching your filter criteria. Try selecting "All" or
              adjusting your search keyword.
            </p>
            <button className="button" onClick={() => { setCategory('All'); setQuery(''); }}>
              Clear all filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
