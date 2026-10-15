import type { Profile } from '../types';

export const profile: Profile = {
  name: 'Luis Didonato',
  fullName: 'Luis Augusto de Petta Didonato',
  title: 'Engenheiro de Software · Backend, IA e Cloud',
  headline: 'CTO / Tech Lead na EVIG',
  summary:
    'Engenheiro de software com experiência em backend, arquitetura e produtos com IA. Atuação em liderança técnica, integrações e cloud, com foco em eficiência operacional e escalabilidade.',
  location: 'São Paulo, SP',
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
      label: 'custo operacional na migração GCP → AWS',
      context: 'EVIG',
    },
    {
      value: '2 s → 0,5 s',
      label: 'tempo médio de carregamento em projetos selecionados',
      context: 'RedBit',
    },
    {
      value: '85,4%',
      label: 'mAP@50 no modelo',
      context: 'Oceans-20',
    },
    {
      value: 'Tech Provider',
      label: 'aprovação como WhatsApp Tech Provider',
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
        'Reduzi custos operacionais em 80%, mesmo com novos projetos, ao migrar do GCP para AWS, combinar Lambda e serviços contínuos com escala independente e otimizar containers.',
        'Planejei a aprovação como WhatsApp Tech Provider e conduzi revisão de apps, permissões, onboarding e estruturação de WABAs.',
        'Projetei arquitetura LLM-first com agentes, roteamento, memória conversacional e serviços desacoplados.',
        'Planejei capacidade e testes de carga para atender SLAs e priorizei entregas da equipe.',
        'Planejei e implementei RBAC e AWS SSM (configurações e segredos); planejei JWKS.',
      ],
    },
    {
      company: 'Colmeia',
      role: 'Analista de Integração Sênior',
      start: '2025-11',
      end: '2026-01',
      bullets: [
        'Planejei integrações com empresas parceiras e apoiei a definição de fluxos e requisitos técnicos.',
        'Implementei e validei integrações com APIs de parceiros e do Google, incluindo Google Calendar.',
        'Planejei melhorias nos fluxos do Jira para organizar demandas e acompanhar entregas das equipes.',
      ],
    },
    {
      company: 'ValiantGroup',
      role: 'Desenvolvedor Full Stack',
      start: '2025-03',
      end: '2025-11',
      bullets: [
        'Construí aplicações web e para Android TV em plataformas de streaming dos projetos Hospital Sírio-Libanês, Housi e Fiesta Americana.',
        'Apoiei o e-Saúde (Band) e o chatbot de IA da empresa, com Conversational Agents, banco vetorial e planejamento no Vertex AI.',
      ],
    },
    {
      company: 'RedBit',
      role: 'Desenvolvedor Front-end',
      start: '2023-03',
      end: '2024-11',
      bullets: [
        'Criei e otimizei sites com foco em responsividade e SEO, reduzindo o carregamento médio de aproximadamente 2 s para 0,5 s em projetos selecionados.',
        'Configurei tags, eventos e conversões com Google Tag Manager e Google Ads.',
      ],
    },
  ],
  cases: [
    {
      slug: 'arquitetura-llm-first',
      title: 'Arquitetura LLM-first',
      summary:
        'EVIG: agentes, roteamento, memória conversacional e serviços desacoplados.',
      stack: ['LLMs', 'Agentes', 'Roteamento', 'Memória conversacional'],
    },
    {
      slug: 'migracao-gcp-aws',
      title: 'Migração GCP → AWS',
      summary:
        'EVIG: −80% de custo operacional combinando Lambda e serviços contínuos com escala independente.',
      stack: ['AWS', 'GCP', 'Lambda', 'Docker'],
    },
    {
      slug: 'whatsapp-tech-provider',
      title: 'WhatsApp Tech Provider',
      summary:
        'EVIG: revisão de apps, permissões, onboarding e estruturação de WABAs.',
      stack: ['WhatsApp Business', 'WABA', 'Onboarding', 'Permissões'],
    },
    {
      slug: 'oceans-20',
      title: 'Oceans-20',
      summary:
        'Backend, frontend e mobile desenvolvidos integralmente para encaminhar registros de resíduos a parceiros de coleta; modelo com 85,4% de mAP@50.',
      stack: ['React Native', 'FastAPI', 'Firebase'],
    },
    {
      slug: 'vistoria-porto-seguro',
      title: 'Vistoria de bicicletas (Porto Seguro)',
      summary:
        'Projeto desenvolvido integralmente, incluindo microserviço de reconhecimento de imagens com YOLO.',
      stack: ['Java', 'JPA', 'React', 'Oracle SQL', 'YOLO'],
    },
  ],
  skills: [
    {
      name: 'Backend e Dados',
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
      name: 'Frontend e Mobile',
      items: ['React', 'Next.js', 'TypeScript', 'React Native'],
    },
    {
      name: 'Cloud e Arquitetura',
      items: [
        'AWS',
        'GCP',
        'Docker',
        'CI/CD',
        'Sistemas distribuídos',
        'Kafka',
        'RabbitMQ',
      ],
    },
    {
      name: 'IA',
      items: [
        'LLMs',
        'RAG',
        'Embeddings',
        'Bancos vetoriais',
        'Sistemas multiagentes',
      ],
    },
    {
      name: 'Ferramentas',
      items: ['Claude Code', 'OpenAI Codex', 'Jira'],
    },
  ],
  services: [
    {
      title: 'Produtos com LLM',
      description:
        'Arquitetura de agentes, RAG e memória, do protótipo à produção.',
    },
    {
      title: 'Cloud e custo',
      description:
        'Migração, escala independente por serviço e testes de carga para SLA.',
    },
    {
      title: 'Integrações',
      description: 'WhatsApp Business, APIs de parceiros, Google Workspace.',
    },
  ],
  education: [
    {
      institution: 'FIAP',
      course: 'Pós-graduação em Arquitetura de Software',
      period: 'Em andamento · conclusão prevista em 2026',
    },
    {
      institution: 'FIAP',
      course: 'Análise e Desenvolvimento de Sistemas',
      period: '2023 – 2024',
    },
  ],
  languages: ['Inglês: avançado / C1 (EF SET)', 'Espanhol: intermediário'],
};
