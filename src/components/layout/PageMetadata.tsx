import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { company } from '../../config/site';

interface PageSEO {
  title: string;
  description: string;
  type: string;
  schema?: Record<string, unknown>;
}

const SITE_URL = 'https://crezonices.com';

const seoConfig: Record<string, PageSEO> = {
  '/': {
    title: 'Crezonices — Next-Generation Intelligent Solutions & AI Systems',
    description:
      'Crezonices develops intelligent software products, neural architectures, IoT telemetry networks, and cybersecurity solutions for real-world impact.',
    type: 'website',
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${SITE_URL}/#organization`,
          name: company.name,
          url: SITE_URL,
          logo: `${SITE_URL}/assets/brand/crezonices-logo.png`,
          email: company.email,
          description: company.description,
          sameAs: [],
        },
        {
          '@type': 'WebSite',
          '@id': `${SITE_URL}/#website`,
          url: SITE_URL,
          name: company.name,
          publisher: { '@id': `${SITE_URL}/#organization` },
        },
      ],
    },
  },
  '/about': {
    title: 'About Crezonices — Multi-Tier Technology Ecosystem & Vision',
    description:
      'Learn about Crezonices, our engineering principles, and our unified multi-tiered technological ecosystem spanning AI, IoT, cybersecurity, and software engineering.',
    type: 'article',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About Crezonices',
      url: `${SITE_URL}/about`,
      description:
        'Crezonices is an advanced technology development company creating specialized software, artificial intelligence applications, distributed IoT networks, and cybersecurity architectures.',
      mainEntity: {
        '@type': 'Organization',
        name: 'Crezonices',
        url: SITE_URL,
      },
    },
  },
  '/projects': {
    title: 'Products & Projects — Crezonices Technology Portfolio',
    description:
      'Explore active product concepts, software architectures, IoT platforms, and digital solutions engineered by the Crezonices team.',
    type: 'website',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Crezonices Projects & Technology Demonstrations',
      url: `${SITE_URL}/projects`,
      description: 'Explore the product and application directions Crezonices is preparing to address real-world challenges.',
    },
  },
  '/services': {
    title: 'Professional Services — Custom Web Development, AI & Security',
    description:
      'Comprehensive engineering capabilities in custom web applications, AI/ML integration, IoT telemetry, cybersecurity auditing, and ongoing website maintenance.',
    type: 'service',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: 'Technology Development & Digital Engineering',
      provider: {
        '@type': 'Organization',
        name: 'Crezonices',
        url: SITE_URL,
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Core Technology Capabilities',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Custom Web Development' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AI & Machine Learning Solutions' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Internet of Things (IoT) Systems' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Cybersecurity Architecture' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Website Management & Maintenance' } },
        ],
      },
    },
  },
  '/founders': {
    title: 'Executive Leadership — Crezonices Founders & Governance',
    description:
      'Meet the leadership of Crezonices. Directed by our Executive Director and Managing Director with an emphasis on engineering integrity and practical innovation.',
    type: 'profile',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'Crezonices Leadership & Governance',
      mainEntity: [
        {
          '@type': 'Person',
          jobTitle: 'Executive Director',
          worksFor: { '@type': 'Organization', name: 'Crezonices' },
        },
        {
          '@type': 'Person',
          jobTitle: 'Managing Director',
          worksFor: { '@type': 'Organization', name: 'Crezonices' },
        },
      ],
    },
  },
  '/contact': {
    title: 'Contact Crezonices — Electronic Communications Gateway',
    description:
      'Connect with the Crezonices team for technology consultations, custom web engineering proposals, research partnerships, and inquiries.',
    type: 'website',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact Crezonices',
      url: `${SITE_URL}/contact`,
      mainEntity: {
        '@type': 'Organization',
        name: 'Crezonices',
        email: company.email,
        url: SITE_URL,
      },
    },
  },
};

export function PageMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Resolve SEO data
    const isProjectDetail = pathname.startsWith('/projects/');
    const seo = isProjectDetail
      ? {
          title: 'Project Architecture Details | Crezonices',
          description:
            'Review technical architecture, problem statement, and engineering solution details for this Crezonices project.',
          type: 'article',
        }
      : seoConfig[pathname] || {
          title: 'Crezonices — Intelligent Solutions',
          description: company.description,
          type: 'website',
        };

    // 2. Set Page Title
    document.title = seo.title;

    // Helper for meta tags
    const setMeta = (nameAttr: string, key: string, value: string) => {
      let el = document.querySelector(`meta[${nameAttr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(nameAttr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    // 3. Set Description & Open Graph
    setMeta('name', 'description', seo.description);
    setMeta('property', 'og:title', seo.title);
    setMeta('property', 'og:description', seo.description);
    setMeta('property', 'og:type', seo.type);
    setMeta('property', 'og:url', `${SITE_URL}${pathname}`);
    setMeta('property', 'og:image', `${SITE_URL}/assets/brand/crezonices-logo.png`);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', seo.title);
    setMeta('name', 'twitter:description', seo.description);

    // 4. Set Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${SITE_URL}${pathname === '/' ? '' : pathname}`);

    // 5. Inject Structured Data JSON-LD
    let scriptTag = document.getElementById('schema-jsonld') as HTMLScriptElement | null;
    if (seo.schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'schema-jsonld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(seo.schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [pathname]);

  return null;
}
