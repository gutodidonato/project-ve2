import type { Profile } from '../types';

export const profile: Profile = {
  name: 'Luis Didonato',
  fullName: 'Luis Augusto de Petta Didonato',
  title: 'Software Engineer · Backend, AI & Cloud',
  headline: 'CTO / Tech Lead at EVIG',
  summary:
    'Software engineer with experience in backend, architecture and AI products. Background in technical leadership, integrations and cloud, focused on operational efficiency and scalability.',
  location: 'São Paulo, Brazil',
  links: {
    email: 'gutodidonato@gmail.com',
    linkedin: 'https://www.linkedin.com/in/luis-didonato-66746a250/',
    github: 'https://github.com/gutodidonato',
    calcom: null,
    cv: { pt: '/cv/luis-didonato-pt.pdf', en: null },
  },
  metrics: [
    {
      value: '−80%',
      label: 'operating cost in the GCP → AWS migration',
      context: 'EVIG',
    },
    {
      value: '2 s → 0.5 s',
      label: 'average load time on selected projects',
      context: 'RedBit',
    },
    {
      value: '85.4%',
      label: 'mAP@50 on the model',
      context: 'Oceans-20',
    },
    {
      value: 'Tech Provider',
      label: 'WhatsApp Tech Provider approval',
      context: 'EVIG',
    },
  ],
  experience: [
    {
      company: 'EVIG',
      role: 'CTO / Tech Lead',
      start: '2026-01',
      end: null,
      bullets: [
        'Cut operating costs by 80%, even while taking on new projects, by migrating from GCP to AWS, combining Lambda with always-on services that scale independently, and optimizing containers.',
        'Planned the approval as a WhatsApp Tech Provider and led the review of apps, permissions, onboarding and WABA structuring.',
        'Designed an LLM-first architecture with agents, routing, conversational memory and decoupled services.',
        'Planned capacity and load tests to meet SLAs and prioritized the team’s deliverables.',
        'Planned and implemented RBAC and AWS SSM (configuration and secrets); planned JWKS.',
      ],
    },
    {
      company: 'Colmeia',
      role: 'Senior Integration Analyst',
      start: '2025-11',
      end: '2026-01',
      bullets: [
        'Planned integrations with partner companies and helped define flows and technical requirements.',
        'Implemented and validated integrations with partner and Google APIs, including Google Calendar.',
        'Planned improvements to Jira workflows to organize demands and track team deliverables.',
      ],
    },
    {
      company: 'ValiantGroup',
      role: 'Full Stack Developer',
      start: '2025-03',
      end: '2025-11',
      bullets: [
        'Built web and Android TV applications for the streaming platforms of the Hospital Sírio-Libanês, Housi and Fiesta Americana projects.',
        'Supported e-Saúde (Band) and the company’s AI chatbot, with Conversational Agents, a vector database and planning on Vertex AI.',
      ],
    },
    {
      company: 'RedBit',
      role: 'Front-end Developer',
      start: '2023-03',
      end: '2024-11',
      bullets: [
        'Built and optimized websites with a focus on responsiveness and SEO, cutting average load time from roughly 2 s to 0.5 s on selected projects.',
        'Set up tags, events and conversions with Google Tag Manager and Google Ads.',
      ],
    },
  ],
  cases: [
    {
      slug: 'arquitetura-llm-first',
      title: 'LLM-first architecture',
      summary:
        'EVIG: agents, routing, conversational memory and decoupled services.',
      stack: ['LLMs', 'Agents', 'Routing', 'Conversational memory'],
    },
    {
      slug: 'migracao-gcp-aws',
      title: 'GCP → AWS migration',
      summary:
        'EVIG: −80% operating cost by combining Lambda with always-on services that scale independently.',
      stack: ['AWS', 'GCP', 'Lambda', 'Docker'],
    },
    {
      slug: 'whatsapp-tech-provider',
      title: 'WhatsApp Tech Provider',
      summary:
        'EVIG: review of apps, permissions, onboarding and WABA structuring.',
      stack: ['WhatsApp Business', 'WABA', 'Onboarding', 'Permissions'],
    },
    {
      slug: 'oceans-20',
      title: 'Oceans-20',
      summary:
        'Backend, frontend and mobile built end to end to route waste records to collection partners; model with 85.4% mAP@50.',
      stack: ['React Native', 'FastAPI', 'Firebase'],
    },
    {
      slug: 'vistoria-porto-seguro',
      title: 'Bicycle inspection (Porto Seguro)',
      summary:
        'Project built end to end, including an image-recognition microservice using YOLO.',
      stack: ['Java', 'JPA', 'React', 'Oracle SQL', 'YOLO'],
    },
  ],
  skills: [
    {
      name: 'Backend & Data',
      items: [
        'Python',
        'Go',
        'Java',
        'C#',
        'FastAPI',
        'Django',
        'NestJS',
        'PostgreSQL',
        'SQL/NoSQL',
      ],
    },
    {
      name: 'Frontend & Mobile',
      items: ['React', 'Next.js', 'TypeScript', 'React Native'],
    },
    {
      name: 'Cloud & Architecture',
      items: [
        'AWS',
        'GCP',
        'Docker',
        'CI/CD',
        'Distributed systems',
        'Kafka',
        'RabbitMQ',
      ],
    },
    {
      name: 'AI',
      items: [
        'LLMs',
        'RAG',
        'Embeddings',
        'Vector databases',
        'Multi-agent systems',
      ],
    },
    {
      name: 'Tools',
      items: ['Claude Code', 'OpenAI Codex', 'Jira'],
    },
  ],
  services: [
    {
      title: 'LLM products',
      description:
        'Agent architecture, RAG and memory, from prototype to production.',
    },
    {
      title: 'Cloud & cost',
      description:
        'Migration, per-service independent scaling and load testing for SLAs.',
    },
    {
      title: 'Integrations',
      description: 'WhatsApp Business, partner APIs, Google Workspace.',
    },
  ],
  education: [
    {
      institution: 'FIAP',
      course: 'Postgraduate degree in Software Architecture',
      period: 'In progress · expected completion in 2026',
    },
    {
      institution: 'FIAP',
      course: 'Systems Analysis and Development',
      period: '2023 – 2024',
    },
  ],
  languages: ['English: advanced / C1 (EF SET)', 'Spanish: intermediate'],
};
