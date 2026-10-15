export type Locale = 'pt' | 'en';

export type CaseSlug =
  | 'arquitetura-llm-first'
  | 'migracao-gcp-aws'
  | 'whatsapp-tech-provider'
  | 'oceans-20'
  | 'vistoria-porto-seguro';

export interface Metric {
  value: string;
  label: string;
  context: string;
}

/** `start` / `end` are 'YYYY-MM'; `end === null` means current. Newest first. */
export interface Experience {
  company: string;
  role: string;
  start: string;
  end: string | null;
  bullets: string[];
}

export interface CaseSummary {
  slug: CaseSlug;
  title: string;
  summary: string;
  stack: string[];
}

export interface SkillGroup {
  name: string;
  items: string[];
}

export interface Service {
  title: string;
  description: string;
}

export interface Education {
  institution: string;
  course: string;
  period: string;
}

export interface Profile {
  name: string;
  fullName: string;
  title: string;
  headline: string;
  summary: string;
  location: string;
  links: {
    email: string;
    linkedin: string;
    github: string;
    calcom: string | null;
    cv: { pt: string; en: string | null };
  };
  metrics: Metric[];
  experience: Experience[];
  cases: CaseSummary[];
  skills: SkillGroup[];
  services: Service[];
  education: Education[];
  languages: string[];
}
