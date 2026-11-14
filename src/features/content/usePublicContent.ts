import { useEffect, useState } from 'react';
import type { Founder, PageContent, Project, Review, Service, SiteSettings } from '../../types/models';
import {
  founders as localFounders,
  projects as localProjects,
  reviews as localReviews,
  services as localServices,
} from '../../data/content';
import { company, socialLinks } from '../../config/site';
import {
  subscribePageContent,
  subscribePublishedProjects,
  subscribePublishedReviews,
  subscribePublishedServices,
  subscribePublishedTeam,
  subscribeSiteSettings,
} from './contentStore';

export function useProjects() {
  const [data, setData] = useState<Project[]>(localProjects);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let stop = () => {};
    subscribePublishedProjects(
      (records) => {
        // Successfully received Firestore collection response (even if empty)
        setData(records);
        setLoading(false);
        setIsLive(true);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    ).then((unsub) => (stop = unsub));
    return () => stop();
  }, []);

  return { data, loading, error, isLive };
}

export function useTeam() {
  const [data, setData] = useState<Founder[]>(localFounders);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let stop = () => {};
    subscribePublishedTeam(
      (records) => {
        setData(records);
        setLoading(false);
        setIsLive(true);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    ).then((unsub) => (stop = unsub));
    return () => stop();
  }, []);

  return { data, loading, error, isLive };
}

export function useServices() {
  const [data, setData] = useState<Service[]>(localServices);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let stop = () => {};
    subscribePublishedServices(
      (records) => {
        setData(records);
        setLoading(false);
        setIsLive(true);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    ).then((unsub) => (stop = unsub));
    return () => stop();
  }, []);

  return { data, loading, error, isLive };
}

export function useReviews() {
  const [data, setData] = useState<Review[]>(localReviews);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let stop = () => {};
    subscribePublishedReviews(
      (records) => {
        setData(records);
        setLoading(false);
        setIsLive(true);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    ).then((unsub) => (stop = unsub));
    return () => stop();
  }, []);

  return { data, loading, error, isLive };
}

export function usePageContent(pageId: string, fallback?: Partial<PageContent>) {
  const [content, setContent] = useState<Partial<PageContent>>(fallback || {});

  useEffect(() => {
    let stop = () => {};
    subscribePageContent(pageId, (remote) => {
      if (remote) {
        setContent((prev) => ({ ...prev, ...remote }));
      }
    }).then((unsub) => (stop = unsub));
    return () => stop();
  }, [pageId]);

  return content;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({
    companyName: company.name,
    email: company.email,
    logoUrl: company.logo,
    phone: '',
    whatsapp: '',
    address: 'Global Technology Operations, Distributed Engineering Laboratories',
    officeHours: 'Monday – Friday, 08:00 – 18:00 UTC',
    responseTime: 'Within 24 business hours',
    mapUrl: '',
    contactHeading: '',
    contactDescription: '',
    supportingContactText: '',
    socialLinks: {
      linkedin: socialLinks.linkedin || '',
      github: '',
      twitter: '',
      instagram: socialLinks.instagram || '',
      youtube: socialLinks.youtube || '',
    },
    footerCopyright: `© ${new Date().getFullYear()} Crezonices. All rights reserved. Architected for progress.`,
  });

  useEffect(() => {
    let stop = () => {};
    subscribeSiteSettings((remote) => {
      setSettings((prev) => ({
        ...prev,
        ...remote,
        socialLinks: {
          ...prev.socialLinks,
          ...(remote.socialLinks || {}),
        },
      }));
    }).then((unsub) => (stop = unsub));
    return () => stop();
  }, []);

  return settings;
}
