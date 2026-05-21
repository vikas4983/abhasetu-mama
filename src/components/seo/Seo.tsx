import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  canonical?: string;
}

const setMeta = (name: string, content: string, property = false) => {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(property ? 'property' : 'name', name);
    document.head.appendChild(element);
  }
  element.content = content;
};

export function Seo({ title, description, canonical }: SeoProps) {
  useEffect(() => {
    document.title = `${title} | ABHA SETU`;
    setMeta('description', description);
    setMeta('og:title', `${title} | ABHA SETU`, true);
    setMeta('og:description', description, true);
    setMeta('og:type', 'website', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', `${title} | ABHA SETU`);
    setMeta('twitter:description', description);

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical ?? window.location.href;

    let schema = document.head.querySelector<HTMLScriptElement>('script[data-schema="abha-setu"]');
    if (!schema) {
      schema = document.createElement('script');
      schema.type = 'application/ld+json';
      schema.dataset.schema = 'abha-setu';
      document.head.appendChild(schema);
    }
    schema.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'MedicalOrganization',
      name: 'ABHA SETU',
      description,
      url: window.location.origin,
      areaServed: 'IN',
    });
  }, [canonical, description, title]);

  return null;
}
