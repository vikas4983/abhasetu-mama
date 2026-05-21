import { useMemo, useState } from 'react';
import { PageHeader } from '@components/ui/PageHeader';
import { Seo } from '@components/seo/Seo';
import { insightArticles, insightCategories } from '@/constants/enterpriseData';

export default function HealthInsightsPage() {
  const [category, setCategory] = useState<(typeof insightCategories)[number]>('All');
  const articles = useMemo(
    () => insightArticles.filter((article) => category === 'All' || article.category === category),
    [category],
  );

  return (
    <>
      <Seo title="Health Insights & Education" description="ABHA SETU health education, skin care, and preventive healthcare insights." />
      <PageHeader title="Health Insights & Education" subtitle="Clinically-minded health learning, preventive care, and skin care guidance in one premium knowledge space." />
      <section className="filter-bar" aria-label="Insight categories">
        {insightCategories.map((item) => (
          <button className={item === category ? 'filter-chip active' : 'filter-chip'} key={item} onClick={() => setCategory(item)} type="button">
            {item}
          </button>
        ))}
      </section>
      <section className="insight-grid">
        {articles.map((article) => {
          const Icon = article.icon;
          return (
            <article className={`knowledge-card motion-card accent-${article.accent}`} key={article.id}>
              <div className="knowledge-top">
                <span>{article.category}</span>
                <Icon className="route-icon" aria-hidden="true" />
              </div>
              <h3>{article.title}</h3>
              <p>{article.summary}</p>
              <small>{article.readTime} read</small>
            </article>
          );
        })}
      </section>
    </>
  );
}
