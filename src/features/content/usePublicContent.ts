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
  const [error, setError] = useState<string>();

  useEffect(() => {
    let stop = () => {};
    subscribePublishedProjects((records) => {
      if (records.length > 0) setData(records);
    }, setError).then((unsub) => (stop = unsub));
    return () => stop();
  }, []);

  return { data, error };
}

export function useTeam() {
  const [data, setData] = useState<Founder[]>(localFounders);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let stop = () => {};
    subscribePublishedTeam((records) => {
      if (records.length > 0) setData(records);
    }, setError).then((unsub) => (stop = unsub));
    return () => stop();
  }, []);

  return { data, error };
}

export function useServices() {
  const [data, setData] = useState<Service[]>(localServices);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let stop = () => {};
    subscribePublishedServices((records) => {
      if (records.length > 0) setData(records);
    }, setError).then((unsub) => (stop = unsub));
    return () => stop();
  }, []);

  return { data, error };
}

export function useReviews() {
  const [data, setData] = useState<Review[]>(localReviews);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let stop = () => {};
    subscribePublishedReviews((records) => {
      setData(records);
    }, setError).then((unsub) => (stop = unsub));
    return () => stop();
  }, []);

  return { data, error };
}

export function usePageContent(pageId: string, fallback?: Partial<PageContent>) {
  const [content, setContent] = useState<Partial<PageContent>>(fallback || {});

  useEffect(() => {
    let stop = () => {};
    subscribePageContent(pageId, (remote) => {
      setContent((prev) => ({ ...prev, ...remote }));
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
    socialLinks: {
      linkedin: socialLinks.linkedin || '',
      instagram: socialLinks.instagram || '',
      youtube: socialLinks.youtube || '',
    },
  });

  useEffect(() => {
    let stop = () => {};
    subscribeSiteSettings((remote) => {
      setSettings((prev) => ({ ...prev, ...remote }));
    }).then((unsub) => (stop = unsub));
    return () => stop();
  }, []);

  return settings;
}
