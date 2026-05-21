import { Search } from 'lucide-react';
import { ChangeEvent, KeyboardEvent, memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { searchableServices } from '@/constants/data';

export const ServiceSearch = memo(function ServiceSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return searchableServices
      .filter((service) => `${service.title} ${service.desc}`.toLowerCase().includes(normalized))
      .slice(0, 7);
  }, [query]);

  const navigateTo = (route: string) => {
    setQuery('');
    setOpen(false);
    navigate(route);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setOpen(Boolean(event.target.value.trim()));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && matches[0]) {
      event.preventDefault();
      navigateTo(matches[0].route);
    }
    if (event.key === 'Escape') setOpen(false);
  };

  return (
    <div className="global-search" role="search">
      <Search className="search-icon" aria-hidden="true" />
      <input
        aria-label="Search services"
        autoComplete="off"
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onChange={handleChange}
        onFocus={() => setOpen(Boolean(query.trim()))}
        onKeyDown={handleKeyDown}
        placeholder={t('header.search')}
        type="search"
        value={query}
      />
      <div className={`search-suggestions ${open ? 'is-open' : ''}`} role="listbox">
        {open && matches.length === 0 ? <div className="suggestion-empty">No matching services found</div> : null}
        {open
          ? matches.map((service) => {
              const Icon = service.icon;
              return (
                <button
                  className="suggestion-item"
                  key={service.route}
                  onClick={() => navigateTo(service.route)}
                  role="option"
                  type="button"
                >
                  <Icon className="small-icon" aria-hidden="true" />
                  <span>
                    <strong>{service.title}</strong>
                    <small>{service.desc}</small>
                  </span>
                </button>
              );
            })
          : null}
      </div>
    </div>
  );
});
