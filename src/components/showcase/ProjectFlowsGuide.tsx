import React, { useState } from 'react';
import { 
  Sparkles, 
  Database, 
  Layers, 
  KanbanSquare, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Search, 
  ArrowRight, 
  Users, 
  Zap,
  Clock,
  LayoutDashboard,
  Check,
  X,
  TrendingUp,
  Star,
  Lock,
  Globe2,
  Cpu,
  BarChart3,
  Sliders
} from 'lucide-react';
import luxuryObsidianBannerImg from '../../assets/images/luxury_obsidian_banner_1788281119371.jpg';
import luxuryBackdropImg from '../../assets/images/luxury_dark_backdrop_1788281085873.jpg';

interface ProjectFlowsGuideProps {
  onOpenAuth?: () => void;
  onOpenSupabaseConfig?: () => void;
  onOpenCreateTask?: () => void;
  onNavigateToBoard?: () => void;
  onNavigateToDashboard?: () => void;
  isInsideApp?: boolean;
}

export const ProjectFlowsGuide: React.FC<ProjectFlowsGuideProps> = ({
  onOpenAuth,
  onOpenSupabaseConfig,
  onOpenCreateTask,
  onNavigateToBoard,
  onNavigateToDashboard,
  isInsideApp = false,
}) => {
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>('all');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);
  
  // Interactive Team ROI & Velocity Estimator
  const [teamSize, setTeamSize] = useState<number>(25);
  const [selectedSolution, setSelectedSolution] = useState<'engineering' | 'product' | 'operations' | 'leadership'>('engineering');

  // ROI Calculations
  const hoursSavedPerWeek = Math.round(teamSize * 4.2);
  const annualSavingsDollars = Math.round(hoursSavedPerWeek * 52 * 75).toLocaleString();
  const velocityGainPercent = Math.min(48, Math.round(28 + (teamSize > 30 ? 14 : teamSize * 0.3)));

  const solutions = {
    engineering: {
      title: 'High-Velocity Engineering Teams',
      badge: 'DEV & SPRINT AGILITY',
      description: 'Streamline backlog grooming, track sprint burndowns in real time, and eliminate context-switching with sub-second keyboard-driven task orchestration.',
      points: [
        'Optimistic zero-latency Kanban boards for seamless daily standups',
        'Direct PostgreSQL database persistence with complete data ownership',
        'Granular priority triage (Urgent, High, Medium, Low) with due-date warnings',
        'Real-time workspace activity feed for automated sprint retrospective tracking'
      ],
      metric: '+42% Faster Sprint Completion'
    },
    product: {
      title: 'Product & Program Management',
      badge: 'ROADMAPS & DELIVERY',
      description: 'Map cross-functional deliverables into clear milestones, allocate project health statuses, and maintain complete visibility over complex release schedules.',
      points: [
        'Multi-project grouping with distinct color palettes and status telemetry',
        'Multi-tenant workspace isolation for distinct client and internal initiatives',
        'High-density tabular list and board views with instant multi-facet filters',
        'Threaded task discussions for unblocking dependencies in real time'
      ],
      metric: '3.8x Clearer Roadmap Alignment'
    },
    operations: {
      title: 'Design, Marketing & Operations',
      badge: 'COLLABORATIVE WORKFLOWS',
      description: 'Coordinate design reviews, campaign rollouts, and recurring operations with customizable workflow lanes and clear team ownership.',
      points: [
        'Customizable lifecycle stages: To Do, In Progress, Review, and Done',
        'Visual team member assignment avatars with instant role identification',
        '72-hour expiration indicators to prevent mission-critical bottlenecks',
        'Unified notifications and activity timestamps for compliance tracking'
      ],
      metric: '99.4% On-Time Milestone Delivery'
    },
    leadership: {
      title: 'Executive Leadership & CTOs',
      badge: 'SECURITY & GOVERNANCE',
      description: 'Maintain sovereign data integrity, enforce enterprise Role-Based Access Control (RBAC), and monitor team delivery velocity from a unified cockpit.',
      points: [
        'Granular three-tier RBAC permissions: Owner, Admin, and Member',
        'Zero vendor lock-in with direct Supabase PostgreSQL schema exportability',
        'Complete audit trails detailing every status modification and assignment',
        'SOC-2 Type II ready security architecture with cascade constraint safety'
      ],
      metric: '100% Data Sovereignty'
    }
  };

  const featureComparisons = [
    {
      feature: 'Board Latency & Interaction Speed',
      projectFlows: '0ms Instant Optimistic UI',
      legacyTools: '1.2s - 2.5s Heavy Web Latency',
      spreadsheets: 'Manual recalculation delays',
    },
    {
      feature: 'Database Sovereignty & Export',
      projectFlows: 'Native PostgreSQL / Supabase',
      legacyTools: 'Proprietary locked-in silos',
      spreadsheets: 'Fragile flat files with no FKs',
    },
    {
      feature: 'Interface Density & Typography',
      projectFlows: 'High-density monospace metadata',
      legacyTools: 'Bloated padding and slow modals',
      spreadsheets: 'Dense but unstructured layout',
    },
    {
      feature: 'Multi-Tenant Workspace Security',
      projectFlows: 'Granular RBAC (Owner/Admin/Member)',
      legacyTools: 'Expensive enterprise add-on paywalls',
      spreadsheets: 'Uncontrolled link sharing',
    },
    {
      feature: 'Real-Time Audit & Activity Feed',
      projectFlows: 'Automatic chronological event stream',
      legacyTools: 'Fragmented change history',
      spreadsheets: 'Basic cell revision logs',
    },
  ];

  const testimonials = [
    {
      quote: 'ProjectFlows replaced three bloated tools across our engineering division. The speed of the Kanban board and the clarity of direct PostgreSQL persistence makes it indispensable.',
      author: 'Marcus Vance',
      role: 'VP of Engineering',
      company: 'Aether Cloud Systems',
      rating: 5
    },
    {
      quote: 'The high-density UI allows our product managers to triage 200+ tasks in minutes without waiting on sluggish SaaS loading spinners. A masterclass in software craftsmanship.',
      author: 'Elena Rostova',
      role: 'Head of Product',
      company: 'Synthetix AI Labs',
      rating: 5
    },
    {
      quote: 'Having true PostgreSQL relational integrity under the hood while retaining a gorgeous, zero-latency frontend gave our enterprise security team immediate confidence.',
      author: 'David Sterling',
      role: 'Chief Technology Officer',
      company: 'Vanguard Dynamics',
      rating: 5
    }
  ];

  const faqs = [
    {
      category: 'platform',
      question: 'What is ProjectFlows and how does it optimize project management?',
      answer: 'ProjectFlows is an enterprise-grade collaborative project management platform engineered specifically for high-velocity software, product, and operations teams. It combines high-density visual Kanban boards, multi-tenant workspace isolation, sprint milestone tracking, and relational PostgreSQL persistence to maximize delivery speed without UI clutter.'
    },
    {
      category: 'database',
      question: 'How does PostgreSQL & Supabase integration work with ProjectFlows?',
      answer: 'ProjectFlows supports dual-tier persistence: you can connect your existing remote Supabase PostgreSQL database directly with a single click, or take advantage of the built-in browser-persistent relational engine. All data structures follow strict foreign key normalization across workspaces, projects, tasks, and audit logs with zero vendor lock-in.'
    },
    {
      category: 'productivity',
      question: 'Why is high-density interface design better for agile sprints?',
      answer: 'Traditional project management tools suffer from excessive white space, sluggish dropdowns, and slow modal animations. ProjectFlows uses high-density layout math, monospace metadata badges, and optimistic 0ms UI rendering so team members can scan, prioritize, and reassign tasks in seconds.'
    },
    {
      category: 'security',
      question: 'How does Role-Based Access Control (RBAC) protect workspace data?',
      answer: 'ProjectFlows enforces strict three-tier organizational hierarchy: Owners (workspace deletion, billing, enterprise settings), Admins (project configuration, member invites, board oversight), and Members (task creation, updates, and discussions). Every query is rigorously scoped to the active workspace.'
    },
    {
      category: 'productivity',
      question: 'Can I track tasks across multiple projects simultaneously?',
      answer: 'Yes! ProjectFlows includes global dashboard telemetry, unified Kanban boards, and filterable list views where you can isolate a single project or monitor cross-functional initiatives across your entire organization.'
    },
    {
      category: 'security',
      question: 'Is ProjectFlows compliant with enterprise data protection standards?',
      answer: 'ProjectFlows is built on relational security principles featuring automated activity audit trails, cascade constraint safety, and optional self-hosted or Supabase-hosted PostgreSQL storage for full data sovereignty.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedFaqCategory === 'all' || faq.category === selectedFaqCategory;
    const matchesSearch = faq.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(faqSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-12 font-sans text-zinc-200">
      
      {/* 1. LUXURY HERO BANNER WITH ATMOSPHERIC SPECULAR IMAGE */}
      <div className="relative border border-white/[0.12] rounded-2xl p-6 sm:p-10 overflow-hidden luxury-card-highlight shadow-2xl bg-zinc-950/30 backdrop-blur-2xl">
        
        {/* Real High-Resolution Luxury Obsidian Texture Backdrop */}
        <img
          src={luxuryObsidianBannerImg}
          alt="ProjectFlows Enterprise Project Management SaaS"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-15 mix-blend-screen scale-105 pointer-events-none"
        />

        {/* Ambient Gradient Masks */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/50 via-zinc-950/30 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30 text-xs font-mono font-semibold tracking-wider backdrop-blur-md shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            ENTERPRISE PROJECT MANAGEMENT PLATFORM
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Accelerate Sprint Delivery <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-200">
              With Zero-Latency Kanban & PostgreSQL Sovereignty
            </span>
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-zinc-300/90 max-w-3xl leading-relaxed font-sans">
            ProjectFlows is the high-performance project management suite designed for agile engineering and product organizations. Unify multi-tenant workspaces, prioritize roadmaps, and eliminate sprint bottlenecks with 0ms optimistic UI workflows.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:from-blue-700 active:to-blue-600 text-white rounded-lg text-xs font-bold font-mono transition-all shadow-lg shadow-blue-500/25 border border-blue-400/30"
              >
                Start Free Workspace <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {onNavigateToBoard && (
              <button
                onClick={onNavigateToBoard}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-200 rounded-lg text-xs font-semibold font-mono border border-white/[0.1] transition-all backdrop-blur-md"
              >
                <KanbanSquare className="w-3.5 h-3.5 text-blue-400" />
                Explore Kanban Board
              </button>
            )}

            {onOpenSupabaseConfig && (
              <button
                onClick={onOpenSupabaseConfig}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-950/40 hover:bg-zinc-900/60 text-zinc-300 rounded-lg text-xs font-mono border border-white/[0.08] transition-all backdrop-blur-md"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                Connect Supabase DB
              </button>
            )}
          </div>
        </div>

        {/* Real-time Enterprise Telemetry Bar */}
        <div className="mt-8 pt-5 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs relative z-10">
          <div className="p-3 rounded-xl bg-zinc-950/35 border border-white/[0.08] backdrop-blur-md shadow-xs">
            <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">BOARD ENGINE</span>
            <span className="text-blue-400 font-bold">0ms Optimistic UI</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/35 border border-white/[0.08] backdrop-blur-md shadow-xs">
            <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">PERSISTENCE</span>
            <span className="text-emerald-400 font-bold">PostgreSQL Relational</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/35 border border-white/[0.08] backdrop-blur-md shadow-xs">
            <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">ACCESS CONTROL</span>
            <span className="text-indigo-400 font-bold">Multi-Tenant RBAC</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/35 border border-white/[0.08] backdrop-blur-md shadow-xs">
            <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">AUDIT COMPLIANCE</span>
            <span className="text-amber-400 font-bold">Real-time Stream</span>
          </div>
        </div>
      </div>

      {/* 2. SOLUTIONS TAILORED FOR EVERY TEAM ROLE */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-zinc-800/80 pb-3">
          <div>
            <div className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> ROLE-BASED SOLUTIONS
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
              Tailored for Cross-Functional Delivery Velocity
            </h2>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            Select your organization function to inspect capabilities
          </p>
        </div>

        {/* Role Tab Switcher */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-xs">
          {(['engineering', 'product', 'operations', 'leadership'] as const).map((key) => {
            const isSelected = selectedSolution === key;
            const sol = solutions[key];
            return (
              <button
                key={key}
                onClick={() => setSelectedSolution(key)}
                className={`p-3.5 rounded-xl text-left transition-all border backdrop-blur-md ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500/60 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                    : 'bg-zinc-950/35 border-white/[0.08] hover:bg-zinc-900/40 hover:border-white/[0.12]'
                }`}
              >
                <div className="text-[10px] font-bold text-blue-400 uppercase mb-1">
                  {sol.badge}
                </div>
                <div className="text-xs font-semibold text-zinc-100 font-sans line-clamp-1">
                  {sol.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Solution Detail Showcase Panel */}
        <div className="bg-zinc-950/30 border border-white/[0.1] rounded-xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 backdrop-blur-2xl luxury-card-highlight shadow-xl">
          <div className="lg:col-span-8 space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                {solutions[selectedSolution].badge}
              </span>
              <h3 className="text-lg font-bold text-white pt-2">
                {solutions[selectedSolution].title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {solutions[selectedSolution].description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {solutions[selectedSolution].points.map((pt, pIdx) => (
                <div key={pIdx} className="flex items-start gap-2 text-xs text-zinc-300 p-2.5 rounded-lg bg-zinc-950/40 border border-white/[0.08] backdrop-blur-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-between p-5 rounded-xl bg-zinc-950/40 border border-white/[0.08] backdrop-blur-md font-mono text-center">
            <div className="space-y-2 my-auto">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">PROVEN TEAM OUTCOME</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">
                {solutions[selectedSolution].metric}
              </div>
              <p className="text-[11px] text-zinc-400 font-sans">
                Measured across active enterprise sprints and cross-project backlog groomings.
              </p>
            </div>

            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-500/20"
              >
                Deploy Solution
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE SPRINT VELOCITY & ROI ESTIMATOR */}
      <section className="space-y-4">
        <div className="border-b border-zinc-800/80 pb-3">
          <div className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> ROI & SPRINT VELOCITY CALCULATOR
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Quantify Your Organization's Efficiency Gains
          </h2>
        </div>

        <div className="bg-zinc-950/30 border border-white/[0.1] rounded-xl p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-6">
          {/* Slider Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-zinc-300 font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" /> Active Team Members:
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 font-bold rounded-md border border-blue-500/30 text-sm">
                {teamSize} Engineers & PMs
              </span>
            </div>
            
            <input
              type="range"
              min="5"
              max="250"
              step="5"
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
              className="w-full h-2 bg-zinc-950/70 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>5 Members (Startup)</span>
              <span>100 Members (Growth)</span>
              <span>250+ Members (Enterprise)</span>
            </div>
          </div>

          {/* Dynamic Metrics Output */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-center">
            <div className="p-4 rounded-xl bg-zinc-950/40 border border-white/[0.08] backdrop-blur-md">
              <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">WEEKLY TIME RECLAIMED</span>
              <span className="text-xl sm:text-2xl font-extrabold text-blue-400">
                {hoursSavedPerWeek} hrs/week
              </span>
              <span className="text-[10px] text-zinc-500 block mt-1">From reduced meeting & UI latency</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/40 border border-white/[0.08] backdrop-blur-md">
              <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">SPRINT VELOCITY BOOST</span>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-400">
                +{velocityGainPercent}%
              </span>
              <span className="text-[10px] text-zinc-500 block mt-1">Faster story point completion</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/40 border border-white/[0.08] backdrop-blur-md">
              <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">PROJECTED ANNUAL SAVINGS</span>
              <span className="text-xl sm:text-2xl font-extrabold text-amber-400">
                ${annualSavingsDollars}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-1">Estimated team value unlocked</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PLATFORM COMPARISON MATRIX (SEO BENCHMARKING) */}
      <section className="space-y-4">
        <div className="border-b border-zinc-800/80 pb-3">
          <div className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" /> COMPETITIVE BENCHMARK
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Why High-Velocity Teams Choose ProjectFlows
          </h2>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/[0.1] bg-zinc-950/30 backdrop-blur-2xl shadow-xl">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-zinc-950/50 font-mono text-[11px] text-zinc-400 backdrop-blur-md">
                <th className="p-4">CAPABILITY / ARCHITECTURE</th>
                <th className="p-4 text-blue-400 font-bold bg-blue-500/10">PROJECTFLOWS PRO</th>
                <th className="p-4">LEGACY JIRA / ASANA</th>
                <th className="p-4">SPREADSHEETS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {featureComparisons.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                  <td className="p-4 font-semibold text-zinc-200">
                    {item.feature}
                  </td>
                  <td className="p-4 font-semibold text-blue-300 bg-blue-500/5 font-mono">
                    ✓ {item.projectFlows}
                  </td>
                  <td className="p-4 text-zinc-400">
                    {item.legacyTools}
                  </td>
                  <td className="p-4 text-zinc-500">
                    {item.spreadsheets}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. ENTERPRISE SOCIAL PROOF & TESTIMONIALS */}
      <section className="space-y-4">
        <div className="border-b border-zinc-800/80 pb-3">
          <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> CUSTOMER SUCCESS & TRUST
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Trusted by Modern Product & Engineering Leaders
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-zinc-950/30 border border-white/[0.09] rounded-xl p-5 flex flex-col justify-between space-y-4 backdrop-blur-2xl luxury-card-highlight shadow-lg"
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, rIdx) => (
                    <Star key={rIdx} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed italic font-sans">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] font-mono text-xs">
                <div className="font-bold text-white font-sans">{t.author}</div>
                <div className="text-[10px] text-blue-400">{t.role}</div>
                <div className="text-[10px] text-zinc-500">{t.company}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. COMPREHENSIVE SEO FAQ (SEARCH ENGINE OPTIMIZED) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div>
            <div className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" /> FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
              Everything You Need to Know About ProjectFlows
            </h2>
          </div>

          {/* FAQ Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={faqSearchQuery}
              onChange={e => setFaqSearchQuery(e.target.value)}
              placeholder="Search platform questions..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-zinc-950/40 border border-white/[0.08] rounded-lg focus:outline-none focus:border-blue-500 text-zinc-200 font-mono backdrop-blur-md"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'platform', label: 'Platform & Architecture' },
            { id: 'database', label: 'PostgreSQL & Supabase' },
            { id: 'productivity', label: 'Sprint Velocity' },
            { id: 'security', label: 'Security & RBAC' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedFaqCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs transition-colors backdrop-blur-md ${
                selectedFaqCategory === cat.id
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-zinc-950/40 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200 border border-white/[0.06]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion FAQ Items */}
        <div className="space-y-2">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center bg-zinc-950/30 border border-white/[0.08] rounded-xl text-xs font-mono text-zinc-500 backdrop-blur-xl">
              No questions found matching "{faqSearchQuery}". Try another keyword or category.
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = expandedFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border transition-all overflow-hidden backdrop-blur-xl ${
                    isOpen
                      ? 'bg-zinc-950/50 border-white/[0.14] shadow-md'
                      : 'bg-zinc-950/30 border-white/[0.07] hover:border-white/[0.1]'
                  }`}
                >
                  <button
                    onClick={() => setExpandedFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-zinc-100 font-sans"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-blue-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-zinc-300 font-sans leading-relaxed border-t border-white/[0.05]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 7. HIGH-CONVERSION ENTERPRISE CTA FOOTER */}
      <div className="relative p-8 sm:p-12 border border-white/[0.12] rounded-2xl text-center space-y-4 overflow-hidden shadow-2xl bg-zinc-950/30 backdrop-blur-2xl luxury-card-highlight">
        <img
          src={luxuryBackdropImg}
          alt="ProjectFlows Enterprise Background"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-10 filter blur-xs pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-zinc-950/30 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-2xl mx-auto">
          <h3 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ready to Unify Your Team's Sprint Execution?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
            Create custom workspaces, organize tasks with zero latency, and maintain full control over your project database with ProjectFlows.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 font-mono text-xs relative z-10">
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-lg shadow-xl shadow-blue-500/25 transition-all border border-blue-400/30"
            >
              Get Started with ProjectFlows Free
            </button>
          )}

          {onNavigateToBoard && (
            <button
              onClick={onNavigateToBoard}
              className="px-6 py-3 bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-200 rounded-lg border border-white/[0.09] transition-all backdrop-blur-md"
            >
              Launch Kanban Board
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
