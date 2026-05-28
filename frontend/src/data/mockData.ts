import { Candidate, RejectedCandidate, RubricDimension } from "../types";

export const DEFAULT_CANDIDATES: Candidate[] = [
  {
    id: "elena-rodriguez",
    rank: "#01",
    name: "Elena Rodriguez",
    initials: "ER",
    role: "Senior Full Stack Engineer",
    experience: 8,
    semanticScore: 95,
    behavioralScore: 89,
    eloRating: 2145,
    confidence: "High",
    avatarColor: "bg-primary/20 text-primary",
    bio: "Building high-performance systems at ScaleTech since 2019.",
    location: "Palo Alto, CA",
    githubStats: {
      repositories: 142,
      totalStars: "2.4k",
      lastActive: "2h ago",
      topLanguage: "TypeScript",
      commitVelocity: [20, 45, 80, 60, 95, 75, 100]
    },
    behavioralBreakdown: {
      quantifiedImpact: {
        score: 9.2,
        quote: "Redesigned the checkout flow, reducing latency by 45% and increasing conversion by 12% ($4.2M ARR impact).",
        evidence: "Q3 ROADMAP"
      },
      ownership: {
        score: 8.7,
        quote: "Self-started the migration to Turborepo across 12 microservices without formal PM direction.",
        evidence: "GITHUB PR #442"
      },
      technicalDepth: {
        score: 9.5,
        quote: "Implemented a custom Raft consensus algorithm for internal state synchronization.",
        evidence: "ENGINEERING BLOG"
      },
      mentorship: {
        score: 7.2,
        quote: "Regularly conducts 'Architecture Hour' and has on-boarded 4 junior engineers in 12 months.",
        evidence: "LINKEDIN RECS"
      }
    },
    hiringBrief: {
      fitSummary: [
        "Exceptional full-stack expertise with deep knowledge of low-latency systems.",
        "Proven track record of high-impact feature ownership in Series B/C environments.",
        "Strong open-source contributor with high community trust signals."
      ],
      gaps: [
        "Limited exposure to enterprise-scale AWS infrastructure (multi-region).",
        "Recent roles show a shift away from front-end heavy development (last 12 months)."
      ],
      interviewStrategy: {
        goal: "Test for architectural trade-offs in distributed environments.",
        question: "Elena, walk us through the Raft implementation you did. Why Raft over Paxos for your specific use case, and what was the hardest failure state to debug?"
      }
    },
    rawResumeData: JSON.stringify({
      "personal": {
        "name": "Elena Rodriguez",
        "links": ["github.com/elena_dev", "linkedin.com/in/erodriguez"],
        "bio": "Building high-performance systems at ScaleTech since 2019."
      },
      "history": [
        {
          "company": "ScaleTech",
          "role": "Staff Engineer",
          "period": "2021 - Present",
          "bullets": [
            "Led migration of monolith to microservices using Node/Go.",
            "Owned core checkout service handling $20k+ requests/sec."
          ]
        },
        {
          "company": "ProtoFlow",
          "role": "Senior Engineer",
          "period": "2019 - 2021"
        }
      ],
      "technical_tags": ["TypeScript", "Golang", "PostgreSQL", "Redis", "Kafka", "Kubernetes"]
    }, null, 2)
  },
  {
    id: "sarah-chen",
    rank: "#02",
    name: "Sarah Chen",
    initials: "SC",
    role: "Sr. Product Engineer",
    experience: 8,
    semanticScore: 98,
    behavioralScore: 92,
    eloRating: 2140,
    confidence: "High",
    avatarColor: "bg-teal-500/20 text-teal-300",
    bio: "Ex-Stripe, ex-Meta UI tech lead specializing in reactive systems design, performant canvases, and building web development tools.",
    location: "San Francisco, CA",
    githubStats: {
      repositories: 94,
      totalStars: "5.1k",
      lastActive: "10m ago",
      topLanguage: "TypeScript",
      commitVelocity: [60, 50, 75, 80, 85, 90, 95]
    },
    behavioralBreakdown: {
      quantifiedImpact: {
        score: 9.8,
        quote: "Designed and built the real-time slate compiler, reducing client paint bundle loads by 3.2MB and growing engagement 35%.",
        evidence: "RELEASE NOTES"
      },
      ownership: {
        score: 9.2,
        quote: "Independently planned and led the deprecation of legacy reactive frameworks in favor of light canvas primitives.",
        evidence: "ARCH BLUEPRINT"
      },
      technicalDepth: {
        score: 9.0,
        quote: "Deep experience with V8 engine quirks, garbage collector tuning, and frame-rate scheduling in dynamic browsers.",
        evidence: "TECH TALK #12"
      },
      mentorship: {
        score: 9.0,
        quote: "Organized internal typescript alignment workshops and mentored 6 graduate hires into core pods.",
        evidence: "INTERNAL PEER FEEDBACK"
      }
    },
    hiringBrief: {
      fitSummary: [
        "Unmatched front-end system level maturity with exceptional canvas-rendering expertise.",
        "Strong system efficiency mindset with proven browser-level optimization feats.",
        "Demonstrated technical leadership across horizontal organization units."
      ],
      gaps: [
        "Lower familiarity with heavy backend multi-tenant cloud databases (e.g., Spanner, Aurora).",
        "Higher salary expectations in sync with Staff-level profiles."
      ],
      interviewStrategy: {
        goal: "Evaluate systems level browser expertise and layout compilation.",
        question: "Sarah, how do you manage complex multi-threaded workers for massive spreadsheet painting loops? Walk us through frame scheduling strategies."
      }
    },
    rawResumeData: JSON.stringify({
      "personal": {
        "name": "Sarah Chen",
        "links": ["github.com/datacompiler", "linkedin.com/in/sarahchen-systems"],
        "bio": "Staff browser engineer. Crafting performant interactive runtimes."
      },
      "history": [
        {
          "company": "Framer Suite",
          "role": "Staff Engineer",
          "period": "2022 - Present",
          "bullets": [
            "Re-architected browser renderer yielding 60FPS on 100k nodes.",
            "Mentored WebGL and canvas optimization initiatives for three teams."
          ]
        },
        {
          "company": "Stripe Inc.",
          "role": "Senior UI Engineer",
          "period": "2019 - 2022"
        }
      ],
      "technical_tags": ["TypeScript", "WebAssembly", "WebGL", "Rust", "Vite", "Canvas API", "React"]
    }, null, 2)
  },
  {
    id: "marcus-rodriguez",
    rank: "#03",
    name: "Marcus Rodriguez",
    initials: "MR",
    role: "Fullstack Architect",
    experience: 12,
    semanticScore: 94,
    behavioralScore: 88,
    eloRating: 2085,
    confidence: "High",
    avatarColor: "bg-secondary/20 text-secondary-fixed",
    bio: "Distributed architect specializing in cloud infrastructure, Go/Rust microservices, and high-concurrency systems design.",
    location: "Austin, TX",
    githubStats: {
      repositories: 182,
      totalStars: "1.2k",
      lastActive: "1d ago",
      topLanguage: "Go",
      commitVelocity: [40, 35, 90, 70, 85, 80, 75]
    },
    behavioralBreakdown: {
      quantifiedImpact: {
        score: 8.9,
        quote: "Implemented sub-second caching routing algorithms over 12 locations, saving $150k ARR in AWS outbound bills.",
        evidence: "Q1 INFRA AUDIT"
      },
      ownership: {
        score: 9.0,
        quote: "Successfully stood in as dynamic product manager during massive cloud security overhaul targeting VPC boundaries.",
        evidence: "SEC Ops SIGN-OFF"
      },
      technicalDepth: {
        score: 9.2,
        quote: "Engineered high-concurrent consumer channels handling 80,000 requests/sec with minimal lock contention.",
        evidence: "BENCHMARK LABS"
      },
      mentorship: {
        score: 8.0,
        quote: "Managed a remote engineering pod of 6, resolving tech-debt and setting high quality linting guidelines.",
        evidence: "PEER REVIEW 2025"
      }
    },
    hiringBrief: {
      fitSummary: [
        "Incredibly strong infrastructure automation and backend scalability paradigms.",
        "Vast Go/Rust production engineering experience over ten years.",
        "Demonstrated ability to drive business alignment and lead vendor calculations."
      ],
      gaps: [
        "Minimal experience with modern layout frameworks (Tailwind, React 19 rules).",
        "Prefer back-end or system infrastructure focused tracks and tasks."
      ],
      interviewStrategy: {
        goal: "Assess concurrency designs, race condition debugging, and database partition keys.",
        question: "Marcus, how do you handle localized read replication delays or write-through partition conflicts in high-intensity messaging queues?"
      }
    },
    rawResumeData: JSON.stringify({
      "personal": {
        "name": "Marcus Rodriguez",
        "links": ["github.com/mrod_concurrency", "linkedin.com/in/marcus-rodriguez-arch"],
        "bio": "Building robust multi-tenant networks and distributed cloud structures."
      },
      "history": [
        {
          "company": "InfraCore",
          "role": "Principal Architect",
          "period": "2020 - Present",
          "bullets": [
            "Designed geo-replicated data ingestion framework keeping delays under 40ms.",
            "Led migration from legacy ruby services to lightweight Go binaries."
          ]
        }
      ],
      "technical_tags": ["Go", "Rust", "gRPC", "Kubernetes", "AWS Aurora", "Redis", "Kafka", "Docker"]
    }, null, 2)
  },
  {
    id: "jessica-lee",
    rank: "#04",
    name: "Jessica Lee",
    initials: "JL",
    role: "Lead Frontend",
    experience: 6,
    semanticScore: 82,
    behavioralScore: 74,
    eloRating: 1940,
    confidence: "Medium",
    avatarColor: "bg-tertiary/20 text-tertiary",
    bio: "Lead Designer-Developer with a strong passion for design systems, state management performance, and rich interactive layouts.",
    location: "New York, NY",
    githubStats: {
      repositories: 58,
      totalStars: "880",
      lastActive: "3h ago",
      topLanguage: "TypeScript",
      commitVelocity: [30, 45, 50, 42, 60, 54, 58]
    },
    behavioralBreakdown: {
      quantifiedImpact: {
        score: 7.9,
        quote: "Standardized modern components library, shrinking layout development cycles by 40% across 5 global portals.",
        evidence: "Rubric Q4 Audit"
      },
      ownership: {
        score: 7.5,
        quote: "Orchestrated responsive layouts restructuring for mobile-first user channels, raising checkouts 15%.",
        evidence: "UX SIGMA"
      },
      technicalDepth: {
        score: 7.2,
        quote: "Strong CSS engineering, responsive flex layouts, web assets optimization, and Next.js SSG setup designs.",
        evidence: "STYLING BRIEF"
      },
      mentorship: {
        score: 7.0,
        quote: "Regularly conducts styling audits and reviews frontend code guidelines for three cross-functional pods.",
        evidence: "FRONTEND GUILD"
      }
    },
    hiringBrief: {
      fitSummary: [
        "Highly aesthetic eye with strong implementation capability of design mockups.",
        "Demonstrated capability in maintaining production-grade component engines.",
        "Enthusiastic and positive team contributor."
      ],
      gaps: [
        "Lacks deep infrastructure or deployment tooling experience.",
        "Limited systems level concurrency or backend architecture history."
      ],
      interviewStrategy: {
        goal: "Evaluate component decoupling, react performance rules, and design alignment cycles.",
        question: "Jessica, walk us through designing a robust, accessible combo-box that can virtualize list rendering for 5,000 items."
      }
    },
    rawResumeData: JSON.stringify({
      "personal": {
        "name": "Jessica Lee",
        "links": ["github.com/jlee_design", "linkedin.com/in/jessicalee-ux"],
        "bio": "Bridging high craftsmanship UI with sound React layouts."
      },
      "history": [
        {
          "company": "CreativeLab",
          "role": "Lead Frontend UI Developer",
          "period": "2021 - Present"
        }
      ],
      "technical_tags": ["TypeScript", "React", "Next.js", "Tailwind CSS", "Framer Motion", "Design Systems"]
    }, null, 2)
  },
  {
    id: "bill-thompson",
    rank: "#05",
    name: "Bill Thompson",
    initials: "BT",
    role: "Product Manager",
    experience: 15,
    semanticScore: 45,
    behavioralScore: 32,
    eloRating: 1420,
    confidence: "Low",
    avatarColor: "bg-error-red/20 text-error",
    bio: "Seasoned product professional transitioning towards technical project coordination with deep experience in enterprise client cycles.",
    location: "Chicago, IL",
    githubStats: {
      repositories: 12,
      totalStars: "4",
      lastActive: "15d ago",
      topLanguage: "Markdown",
      commitVelocity: [5, 2, 8, 4, 12, 8, 2]
    },
    behavioralBreakdown: {
      quantifiedImpact: {
        score: 4.5,
        quote: "Managed high-level roadmap presentation alignments across six non-technical external partners.",
        evidence: "EXECUTIVE RETREAT"
      },
      ownership: {
        score: 3.5,
        quote: "Participated in agile scrum tracking of layout modifications across legacy back-office tools.",
        evidence: "JIRA TICKETS"
      },
      technicalDepth: {
        score: 2.1,
        quote: "Limited hands-on programming. Relies on visual design systems and architectural summaries to understand tech limits.",
        evidence: "PEER REVIEW"
      },
      mentorship: {
        score: 5.5,
        quote: "Guided project planners and business analysts on writing robust specifications sheets.",
        evidence: "COACHING TRACK"
      }
    },
    hiringBrief: {
      fitSummary: [
        "Vast business experience in enterprise agile roadmapping.",
        "Excellent high-level technical communication traits.",
        "Deep industry experience in client alignments."
      ],
      gaps: [
        "Not a technical engineer; lacks software designing or direct coding capabilities.",
        "Lacks semantic compatibility for deep distributed engineering expectations."
      ],
      interviewStrategy: {
        goal: "Confirm technical project alignment potential or suitability for non-technical leadership role.",
        question: "Bill, explain how you handle diverging engineering priorities when timelines are squeezed and stakeholders demand rigid scopes."
      }
    },
    rawResumeData: JSON.stringify({
      "personal": {
        "name": "Bill Thompson",
        "links": ["linkedin.com/in/billthompsonpm"],
        "bio": "Aligning technology tracks with business targets."
      },
      "history": [
        {
          "company": "E-Enterprise Ltd",
          "role": "VP Product Delivery",
          "period": "2015 - Present"
        }
      ],
      "technical_tags": ["Agile", "Scrum", "Product Roadmap", "Jira", "Stakeholder Alignment"]
    }, null, 2)
  }
];

export const REJECTED_CANDIDATES: RejectedCandidate[] = [
  {
    id: "jordan-wells",
    name: "Jordan Wells",
    initials: "JW",
    currentRole: "Junior Software Engineer",
    experience: "1.5y",
    missingSkill: "Cloud Architecture",
    reason: "Below min experience"
  },
  {
    id: "amara-chen",
    name: "Amara Chen",
    initials: "AC",
    currentRole: "Data Analyst",
    experience: "4y",
    missingSkill: "Python",
    reason: "Missing: Python"
  },
  {
    id: "david-lassiter",
    name: "David Lassiter",
    initials: "DL",
    currentRole: "Systems Admin",
    experience: "12y",
    missingSkill: "React / Next.js",
    reason: "Missing: Core Frontend Stack"
  },
  {
    id: "sarah-ramos",
    name: "Sarah Ramos",
    initials: "SR",
    currentRole: "Marketing Ops",
    experience: "3y",
    missingSkill: "Technical Degree",
    reason: "Education mismatch"
  },
  {
    id: "marcus-price",
    name: "Marcus Price",
    initials: "MP",
    currentRole: "Freelance Dev",
    experience: "2y",
    missingSkill: "PostgreSQL",
    reason: "Below min experience"
  }
];

export const DEFAULT_RUBRIC: RubricDimension[] = [
  {
    id: "ml-system",
    name: "ML System Depth",
    description: "Architecture of distributed training, MLOps maturity, and inference optimization.",
    weight: 35,
    precisionSignalName: "Precision Signal",
    precisionValue: "88% Confidence",
    colorClass: "bg-primary text-on-primary",
    keySignals: ["Kubernetes / Kubeflow", "TensorRT / ONNX"],
    redFlags: ["Notebook-only dev", "Lack of CI/CD context"]
  },
  {
    id: "quantified-impact",
    name: "Quantified Impact",
    description: "Specific revenue, latency, or accuracy metrics achieved in previous roles.",
    weight: 25,
    precisionSignalName: "Evidence Extraction",
    precisionValue: "92% Precision",
    colorClass: "bg-secondary text-white",
    evidenceText: "Looking for specific results like 'Reduced inference latency by 40%' or 'Improved CTR by 5.2% through bandit optimization'."
  },
  {
    id: "research-bridge",
    name: "Research-to-Prod Bridging",
    description: "Ability to translate SOTA papers into reliable production systems.",
    weight: 20,
    precisionSignalName: "Accuracy Signal",
    precisionValue: "84% Confidence",
    colorClass: "bg-tertiary text-on-tertiary",
    tags: ["Transformers", "PyTorch Lightning", "A/B Testing", "Vector DBs"]
  },
  {
    id: "distributed-computing",
    name: "Distributed Computing",
    description: "Experience with data partitioning, sharding, consensus protocols and sync pipelines.",
    weight: 10,
    precisionSignalName: "Evidence Check",
    precisionValue: "78% Precision",
    colorClass: "bg-primary/60 text-white"
  },
  {
    id: "leadership-mentorship",
    name: "Leadership/Mentorship",
    description: "Growing teams, running architecture forums, and running cross-functional pods.",
    weight: 10,
    precisionSignalName: "Audit Level",
    precisionValue: "90% Checked",
    colorClass: "bg-primary/60 text-white"
  }
];

export const MOCK_FAQS = [
  {
    id: "faq-1",
    question: "How does TalentLens handle bias in its rankings?",
    answer: "TalentLens utilizes a 'blind-judgment' model where PII (Personally Identifiable Information) can be masked before the AI analysis. Our models are regularly audited against the NYC Bias Audit standards to ensure equitable ranking across all protected classes."
  },
  {
    id: "faq-2",
    question: "Can I customize the Behavioral Signals rubric?",
    answer: "Yes. In the 'Rubric' section, you can define custom weights for specific behavioral traits like 'Proactive Problem Solving' or 'Technical Mentorship,' allowing the AI to mirror your unique team culture."
  },
  {
    id: "faq-3",
    question: "How do I export results to my ATS?",
    answer: "Use the 'Export' tab in the sidebar to download a formatted CSV or JSON file. We also support direct API integrations with Greenhouse, Lever, and Workday for Enterprise users."
  }
];
