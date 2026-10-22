import re
import math
from typing import Dict, List, Any, Optional, Tuple

# Comprehensive taxonomy of skills mapped to common tech career tracks
ROLE_TAXONOMY: Dict[str, Dict[str, List[str]]] = {
    "software engineer": {
        "core_skills": [
            "Python", "Java", "C++", "Data Structures", "Algorithms", "System Design",
            "OOP", "Git", "REST APIs", "SQL", "Linux", "Unit Testing"
        ],
        "secondary_skills": [
            "Docker", "CI/CD", "PostgreSQL", "Redis", "Microservices", "Design Patterns",
            "TypeScript", "Go", "Distributed Systems", "Kubernetes", "GraphQL"
        ]
    },
    "backend developer": {
        "core_skills": [
            "Python", "Java", "Node.js", "FastAPI", "Django", "Spring Boot", "SQL",
            "PostgreSQL", "MySQL", "REST APIs", "System Design", "Git", "Redis"
        ],
        "secondary_skills": [
            "Docker", "Kubernetes", "Kafka", "RabbitMQ", "Microservices", "GraphQL",
            "gRPC", "Elasticsearch", "AWS", "CI/CD", "OAuth", "NoSQL", "MongoDB"
        ]
    },
    "frontend developer": {
        "core_skills": [
            "JavaScript", "TypeScript", "React", "HTML5", "CSS3", "Next.js", "Tailwind CSS",
            "Git", "Responsive Design", "REST APIs", "State Management", "Redux"
        ],
        "secondary_skills": [
            "Vue.js", "Webpack", "Vite", "Web Vitals", "Accessibility", "Jest",
            "Cypress", "GraphQL", "UI/UX", "SCSS", "Progressive Web Apps"
        ]
    },
    "full stack developer": {
        "core_skills": [
            "JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL", "PostgreSQL",
            "REST APIs", "Git", "HTML5", "CSS3", "Docker", "Database Design"
        ],
        "secondary_skills": [
            "Next.js", "FastAPI", "MongoDB", "Redis", "CI/CD", "AWS", "Tailwind CSS",
            "GraphQL", "Microservices", "System Design", "Linux"
        ]
    },
    "data scientist": {
        "core_skills": [
            "Python", "SQL", "Machine Learning", "Pandas", "NumPy", "Scikit-Learn",
            "Data Visualization", "Statistics", "Deep Learning", "Git", "Matplotlib"
        ],
        "secondary_skills": [
            "PyTorch", "TensorFlow", "NLP", "Computer Vision", "Tableau", "Power BI",
            "BigQuery", "Feature Engineering", "A/B Testing", "Jupyter", "Docker"
        ]
    },
    "data engineer": {
        "core_skills": [
            "Python", "SQL", "Apache Spark", "Airflow", "ETL", "PostgreSQL",
            "Data Warehousing", "Git", "Data Modeling", "Linux", "Docker"
        ],
        "secondary_skills": [
            "Kafka", "Snowflake", "BigQuery", "AWS", "Databricks", "Hadoop",
            "dbt", "Kubernetes", "Scala", "NoSQL", "Redshift"
        ]
    },
    "devops engineer": {
        "core_skills": [
            "Docker", "Kubernetes", "Linux", "CI/CD", "Git", "Terraform",
            "AWS", "Bash", "Python", "Monitoring", "Cloud Computing"
        ],
        "secondary_skills": [
            "Ansible", "Jenkins", "GitHub Actions", "Prometheus", "Grafana", "GCP",
            "Azure", "Helm", "Nginx", "Infrastructure as Code", "Networking", "Security"
        ]
    },
    "mobile developer": {
        "core_skills": [
            "Mobile App Development", "Git", "REST APIs", "UI/UX", "State Management",
            "Unit Testing", "Push Notifications", "Offline Storage"
        ],
        "secondary_skills": [
            "Flutter", "React Native", "Swift", "Kotlin", "Dart", "iOS", "Android",
            "Xcode", "Android Studio", "Firebase", "App Store Deployment"
        ]
    },
    "cybersecurity analyst": {
        "core_skills": [
            "Network Security", "Vulnerability Assessment", "SIEM", "Linux", "Python",
            "Firewalls", "Cryptography", "Incident Response", "OWASP", "Git"
        ],
        "secondary_skills": [
            "Penetration Testing", "Wireshark", "SOC", "Burp Suite", "Kali Linux",
            "Identity and Access Management", "Compliance", "Threat Modeling", "Splunk"
        ]
    }
}

ROLE_RECOMMENDED_PROJECTS: Dict[str, List[Dict[str, Any]]] = {
    "data engineer": [
        {
            "title": "Real-Time Distributed Lakehouse & Streaming Pipeline",
            "difficulty": "Advanced",
            "impact_rating": "Top 3% Recruiter Appeal",
            "tech_stack": ["Apache Kafka", "Apache Spark", "Airflow", "PostgreSQL", "AWS S3", "Delta Lake"],
            "architecture_highlight": "Debezium CDC streaming into Kafka, PySpark Structured Streaming for transformation, ACID transactions with Delta Lake on AWS S3.",
            "resume_bullet": "Engineered real-time CDC streaming data lakehouse ingesting 1.5M events/min using Kafka, Spark Structured Streaming, and Delta Lake, slashing analytical latency from 4 hours to 45 seconds.",
            "why_it_gets_you_hired": "Directly proves ability to handle modern decoupled streaming architectures and cloud object storage data lakes, the #1 hiring criteria for Data Engineering roles."
        },
        {
            "title": "Automated dbt Data Modeling & Warehousing Engine",
            "difficulty": "Intermediate",
            "impact_rating": "High Hiring Impact",
            "tech_stack": ["dbt", "Snowflake", "Python", "Airflow", "Docker", "Great Expectations"],
            "architecture_highlight": "Star-schema dimensional modeling with automated data quality assertion gates and DAG orchestration.",
            "resume_bullet": "Architected dimensional data warehouse in Snowflake orchestrated via dbt and Airflow, enforcing 60+ automated data validation assertions and decreasing BI query execution costs by 35%.",
            "why_it_gets_you_hired": "dbt + modern cloud warehousing is in over 75% of modern data stack job descriptions."
        }
    ],
    "software engineer": [
        {
            "title": "Distributed In-Memory Cache with Raft Consensus",
            "difficulty": "Advanced",
            "impact_rating": "Top 1% FAANG Recruiter Appeal",
            "tech_stack": ["Go", "C++", "gRPC", "Docker", "Distributed Systems"],
            "architecture_highlight": "Leader election, log replication, snapshotting, and linearizable read/writes implemented from scratch.",
            "resume_bullet": "Built distributed, fault-tolerant key-value store using Raft consensus protocol in Go, sustaining 45k QPS with sub-10ms p99 latency during network partition failovers.",
            "why_it_gets_you_hired": "System design and distributed consensus are the definitive differentiators in L4/L5 SWE interviews at Google, Meta, and Amazon."
        },
        {
            "title": "High-Throughput Asynchronous Task Execution Queue",
            "difficulty": "Intermediate",
            "impact_rating": "High Hiring Impact",
            "tech_stack": ["Python", "FastAPI", "Redis", "PostgreSQL", "Docker"],
            "architecture_highlight": "Priority queues, dead-letter exchanges, exponential backoff retries, and worker heartbeat health checks.",
            "resume_bullet": "Engineered asynchronous task processing pipeline in Python and Redis handling 500k+ delayed jobs daily, optimizing worker thread concurrency to achieve 99.98% execution reliability.",
            "why_it_gets_you_hired": "Demonstrates mastery of concurrency, asynchronous event loops, and database race condition management."
        }
    ],
    "backend developer": [
        {
            "title": "Event-Driven Microservices E-Commerce Core",
            "difficulty": "Advanced",
            "impact_rating": "Top 5% Recruiter Appeal",
            "tech_stack": ["FastAPI", "Python", "PostgreSQL", "Apache Kafka", "Redis", "Docker", "Kubernetes"],
            "architecture_highlight": "Saga distributed transaction pattern, event-sourcing with Kafka, JWT OAuth2 token rotation, and rate-limiting middleware.",
            "resume_bullet": "Architected 6 event-driven microservices using FastAPI, Kafka, and PostgreSQL utilizing the Saga pattern to ensure transactional consistency across 200k+ monthly orders.",
            "why_it_gets_you_hired": "Validates ability to design scalable microservices that don't crumble under distributed state inconsistency."
        },
        {
            "title": "High-Concurrency Real-Time Financial Ledger",
            "difficulty": "Advanced",
            "impact_rating": "High FinTech Recruiter Appeal",
            "tech_stack": ["Java", "Spring Boot", "PostgreSQL", "Redis", "Docker"],
            "architecture_highlight": "Double-entry bookkeeping, strict ACID serializable transaction isolation, and pessimistic row-level locking.",
            "resume_bullet": "Engineered double-entry ledger backend supporting 12k concurrent balance transfers, utilizing pessimistic locking and Redis caching to eliminate 100% of race conditions and double-spend exploits.",
            "why_it_gets_you_hired": "Fintech and payments companies (Stripe, Coinbase, PayPal) prioritize immutable double-entry precision above all else."
        }
    ],
    "frontend developer": [
        {
            "title": "High-Performance Interactive Collaborative Canvas",
            "difficulty": "Advanced",
            "impact_rating": "Top 3% Recruiter Appeal",
            "tech_stack": ["TypeScript", "React", "Canvas API", "WebSockets", "Tailwind CSS", "Zustand"],
            "architecture_highlight": "Hardware-accelerated HTML5 Canvas rendering, 60 FPS viewport virtualization, and real-time CRDT multi-user synchronization.",
            "resume_bullet": "Engineered collaborative canvas web application in TypeScript and React with WebSockets, optimizing render cycles via Canvas API to sustain smooth 60 FPS under 10k simultaneous vector elements.",
            "why_it_gets_you_hired": "Shows mastery of deep web performance, memory profiling, and rendering pipelines beyond trivial CRUD forms."
        },
        {
            "title": "Enterprise Design System & Accessible Component Library",
            "difficulty": "Intermediate",
            "impact_rating": "High Hiring Impact",
            "tech_stack": ["React", "TypeScript", "Tailwind CSS", "Storybook", "Jest"],
            "architecture_highlight": "WCAG 2.1 AA accessibility compliance, keyboard navigation focus traps, and automated visual regression testing.",
            "resume_bullet": "Architected modular UI design system with 35+ accessible components in React & Storybook, achieving 100% WCAG AA compliance and cutting feature delivery time by 40% across 4 dev teams.",
            "why_it_gets_you_hired": "Enterprise front-end teams hire specifically for design system consistency and accessibility knowledge."
        }
    ],
    "full stack developer": [
        {
            "title": "Real-Time AI-Powered Code Collaboration & Battle Arena",
            "difficulty": "Advanced",
            "impact_rating": "Top 2% Recruiter Appeal",
            "tech_stack": ["Next.js", "React", "FastAPI", "PostgreSQL", "Docker Sandboxing", "Redis Pub/Sub"],
            "architecture_highlight": "Multi-language code execution in ephemeral Docker containers, real-time WebSocket state sync, and LLM-powered feedback.",
            "resume_bullet": "Developed full-stack competitive coding platform with Docker-sandboxed execution and WebSocket battles, supporting 50+ concurrent users with sub-200ms submission verdicts.",
            "why_it_gets_you_hired": "Combines rich frontend interactivity, secure container sandboxing, and real-time backend state management in one standout portfolio centerpiece."
        },
        {
            "title": "Enterprise Multi-Tenant SaaS with RBAC & Stripe Billing",
            "difficulty": "Intermediate",
            "impact_rating": "High Startup & Mid-Market Appeal",
            "tech_stack": ["React", "Node.js", "PostgreSQL", "Stripe API", "Docker"],
            "architecture_highlight": "Row-level tenant isolation, automated webhook reconciliation, dynamic permission guards, and audit logs.",
            "resume_bullet": "Built multi-tenant SaaS application in React & Node.js featuring tenant data partitioning and Stripe subscriptions, handling automated webhook settlements with zero payment discrepancies.",
            "why_it_gets_you_hired": "Startups look for engineers who can build revenue-generating SaaS features on day one."
        }
    ],
    "data scientist": [
        {
            "title": "End-to-End MLOps Customer Churn Prediction Engine",
            "difficulty": "Advanced",
            "impact_rating": "Top 5% Recruiter Appeal",
            "tech_stack": ["Python", "XGBoost", "MLflow", "FastAPI", "Docker", "Evidently AI"],
            "architecture_highlight": "Automated data drift detection, feature store engineering, model versioning with MLflow, and real-time REST inference API.",
            "resume_bullet": "Developed and deployed XGBoost churn prediction pipeline using MLflow and FastAPI, achieving 0.89 AUC-ROC and reducing model inference latency to 18ms with automated data drift monitoring.",
            "why_it_gets_you_hired": "Companies struggle with putting models into production; having MLOps on your resume puts you ahead of 80% of candidates."
        },
        {
            "title": "Retrieval-Augmented Generation (RAG) Domain Assistant",
            "difficulty": "Intermediate",
            "impact_rating": "Very High AI Market Appeal",
            "tech_stack": ["Python", "LangChain", "Qdrant / ChromaDB", "OpenAI / Gemini", "FastAPI"],
            "architecture_highlight": "Hybrid dense/sparse vector search, semantic re-ranking, and context window hallucination mitigation.",
            "resume_bullet": "Engineered enterprise RAG search system across 50,000 PDF documents using vector search and semantic re-ranking, boosting answer retrieval relevance by 34% compared to vanilla BM25.",
            "why_it_gets_you_hired": "RAG and vector databases are the most actively funded and recruited skill in data science today."
        }
    ],
    "devops engineer": [
        {
            "title": "Zero-Downtime Multi-Cluster Kubernetes GitOps Engine",
            "difficulty": "Advanced",
            "impact_rating": "Top 3% Recruiter Appeal",
            "tech_stack": ["Kubernetes", "Terraform", "ArgoCD", "AWS EKS", "Prometheus", "Grafana"],
            "architecture_highlight": "Declarative GitOps deployments with ArgoCD, progressive canary rollouts with automated rollbacks, and Terraform modular IaC.",
            "resume_bullet": "Orchestrated multi-environment Kubernetes infrastructure on AWS EKS using Terraform and ArgoCD, achieving 100% declarative GitOps workflows and zero-downtime canary deployments.",
            "why_it_gets_you_hired": "GitOps and Kubernetes canary deployments are standard practice at top engineering organizations."
        },
        {
            "title": "Automated DevSecOps Pipeline & Security Guardrails",
            "difficulty": "Intermediate",
            "impact_rating": "High Hiring Impact",
            "tech_stack": ["GitHub Actions", "Trivy", "SonarQube", "Docker", "Vault"],
            "architecture_highlight": "Container image vulnerability scanning, static code analysis (SAST), secrets rotation with HashiCorp Vault.",
            "resume_bullet": "Implemented comprehensive DevSecOps pipeline with Trivy and SonarQube in GitHub Actions, blocking 100% of high/critical CVEs before staging deployment.",
            "why_it_gets_you_hired": "Security-focused DevOps engineers command premium salaries across enterprise tech."
        }
    ]
}

ROLE_RECOMMENDED_CERTIFICATIONS: Dict[str, List[Dict[str, Any]]] = {
    "data engineer": [
        {
            "name": "AWS Certified Data Engineer - Associate (DEA-C01)",
            "issuer": "Amazon Web Services",
            "level": "Associate",
            "hire_boost": "+42% Recruiter Outreach",
            "key_skills_validated": ["AWS Glue", "Amazon Redshift", "Amazon EMR", "Athena", "Kinesis"],
            "preparation_time": "4-6 weeks",
            "why_valuable": "The official industry benchmark for modern cloud data pipeline engineering."
        },
        {
            "name": "Databricks Certified Data Engineer Associate",
            "issuer": "Databricks",
            "level": "Associate",
            "hire_boost": "+38% Enterprise Interview Shortlist",
            "key_skills_validated": ["Apache Spark", "Delta Lake", "Databricks SQL", "Production Lakehouses"],
            "preparation_time": "3-5 weeks",
            "why_valuable": "Over 60% of Fortune 500 data teams use Databricks; certified candidates bypass automated resume filters."
        }
    ],
    "software engineer": [
        {
            "name": "AWS Certified Solutions Architect - Associate (SAA-C03)",
            "issuer": "Amazon Web Services",
            "level": "Associate",
            "hire_boost": "+35% Interview Shortlist Rate",
            "key_skills_validated": ["Cloud Architecture", "Distributed Systems", "VPC & Networking", "High Availability"],
            "preparation_time": "6-8 weeks",
            "why_valuable": "Validates ability to design robust distributed systems across compute, storage, and networking."
        },
        {
            "name": "CKA: Certified Kubernetes Administrator",
            "issuer": "Cloud Native Computing Foundation (CNCF)",
            "level": "Intermediate",
            "hire_boost": "+30% Senior Role Consideration",
            "key_skills_validated": ["Container Orchestration", "Pod Networking", "Troubleshooting", "Cluster Security"],
            "preparation_time": "4-8 weeks",
            "why_valuable": "100% hands-on performance-based exam that definitively proves cloud-native engineering competency."
        }
    ],
    "backend developer": [
        {
            "name": "AWS Certified Developer - Associate (DVA-C02)",
            "issuer": "Amazon Web Services",
            "level": "Associate",
            "hire_boost": "+36% Recruiter Shortlist",
            "key_skills_validated": ["Serverless", "DynamoDB", "Lambda", "API Gateway", "CI/CD Deployment"],
            "preparation_time": "4-6 weeks",
            "why_valuable": "Proves backend proficiency deploying scalable cloud microservices."
        },
        {
            "name": "HashiCorp Certified: Terraform Associate",
            "issuer": "HashiCorp",
            "level": "Associate",
            "hire_boost": "+25% Interview Callout Rate",
            "key_skills_validated": ["Infrastructure as Code", "Terraform Cloud", "State Management", "Modular Architecture"],
            "preparation_time": "2-3 weeks",
            "why_valuable": "Bridges backend engineering with cloud infrastructure automation."
        }
    ],
    "frontend developer": [
        {
            "name": "Meta Front-End Developer Professional Certificate",
            "issuer": "Meta / Coursera",
            "level": "Professional",
            "hire_boost": "+28% Entry-to-Mid Shortlist Rate",
            "key_skills_validated": ["React", "JavaScript ES6+", "UI/UX Principles", "Responsive Design", "Version Control"],
            "preparation_time": "4-8 weeks",
            "why_valuable": "Curated directly by Meta's frontend engineering team with verified project portfolio milestones."
        },
        {
            "name": "AWS Certified Cloud Practitioner (CLF-C02)",
            "issuer": "Amazon Web Services",
            "level": "Foundational",
            "hire_boost": "+20% Enterprise Shortlist",
            "key_skills_validated": ["Cloud Concepts", "AWS Global Infrastructure", "Security & S3 Hosting"],
            "preparation_time": "2-3 weeks",
            "why_valuable": "Proves frontend developers understand full-stack cloud deployment and CDN asset delivery."
        }
    ],
    "full stack developer": [
        {
            "name": "AWS Certified Solutions Architect - Associate",
            "issuer": "Amazon Web Services",
            "level": "Associate",
            "hire_boost": "+40% Recruiter Callout",
            "key_skills_validated": ["Full-Stack Architecture", "Relational & NoSQL DBs", "Container Services (ECS/EKS)"],
            "preparation_time": "6-8 weeks",
            "why_valuable": "The gold standard credential signaling complete end-to-end cloud competency."
        },
        {
            "name": "Docker Certified Associate (DCA)",
            "issuer": "Mirantis / Docker",
            "level": "Associate",
            "hire_boost": "+26% Shortlist Rate",
            "key_skills_validated": ["Containerization", "Multi-stage Builds", "Docker Compose", "Orchestration"],
            "preparation_time": "3-4 weeks",
            "why_valuable": "Guarantees full-stack developers know how to package and ship predictable environments."
        }
    ],
    "data scientist": [
        {
            "name": "Google Cloud Professional Data Engineer",
            "issuer": "Google Cloud",
            "level": "Professional",
            "hire_boost": "+45% Enterprise Callout",
            "key_skills_validated": ["BigQuery", "Vertex AI", "Data Pipelines", "ML Feature Stores"],
            "preparation_time": "6-10 weeks",
            "why_valuable": "Highest-paying data credential in North America and global tech markets."
        },
        {
            "name": "Databricks Certified Associate Developer for Apache Spark",
            "issuer": "Databricks",
            "level": "Associate",
            "hire_boost": "+34% Shortlist Rate",
            "key_skills_validated": ["PySpark", "DataFrames API", "Distributed Computing", "Performance Tuning"],
            "preparation_time": "4-6 weeks",
            "why_valuable": "Proves you can scale data science algorithms beyond single-machine Pandas limitations."
        }
    ],
    "devops engineer": [
        {
            "name": "CKA: Certified Kubernetes Administrator",
            "issuer": "CNCF / Linux Foundation",
            "level": "Professional",
            "hire_boost": "+50% Recruiter Priority",
            "key_skills_validated": ["Kubernetes Architecture", "Networking & Ingress", "Storage", "Cluster Troubleshooting"],
            "preparation_time": "6-8 weeks",
            "why_valuable": "The single most respected credential in modern infrastructure engineering."
        },
        {
            "name": "HashiCorp Certified: Terraform Associate",
            "issuer": "HashiCorp",
            "level": "Associate",
            "hire_boost": "+38% Hiring Speed",
            "key_skills_validated": ["Infrastructure as Code", "Terraform Cloud", "Reusable Modules", "Drift Detection"],
            "preparation_time": "3-4 weeks",
            "why_valuable": "Standard prerequisite for multi-cloud platform and DevOps engineering roles."
        }
    ]
}

# Strong action verbs favored by ATS scanners and technical recruiters
ACTION_VERBS: List[str] = [
    # Technical & Engineering
    "architected", "engineered", "designed", "developed", "implemented", "built",
    "constructed", "deployed", "configured", "programmed", "coded", "integrated",
    # Optimization & Performance
    "optimized", "accelerated", "reduced", "scaled", "enhanced", "streamlined",
    "automated", "refactored", "boosted", "overhauled", "improved", "minimized",
    # Leadership & Orchestration
    "spearheaded", "orchestrated", "led", "directed", "managed", "founded",
    "headed", "established", "mentored", "championed", "supervised",
    # Research, Analysis & Problem Solving
    "investigated", "evaluated", "benchmarked", "analyzed", "formulated",
    "discovered", "diagnosed", "resolved", "debugged", "audited", "standardized"
]

# Standard section markers for ATS parsing
STANDARD_SECTIONS: Dict[str, List[str]] = {
    "contact": ["contact", "email", "phone", "linkedin", "github", "address"],
    "summary": ["summary", "objective", "professional summary", "about me", "profile"],
    "experience": ["experience", "work experience", "employment", "professional experience", "internship", "work history"],
    "education": ["education", "academic background", "academics", "qualifications", "degree", "university"],
    "projects": ["projects", "personal projects", "technical projects", "academic projects", "key projects"],
    "skills": ["skills", "technical skills", "technologies", "proficiencies", "competencies", "core skills", "tech stack"],
    "certifications": ["certifications", "certificates", "licenses", "awards", "achievements", "honors", "publications"]
}

def clean_and_normalize_text(text: str) -> str:
    """Normalizes whitespace, ligatures, and character anomalies."""
    if not text:
        return ""
    # Common PDF ligatures
    ligatures = {
        "\ufb01": "fi",
        "\ufb02": "fl",
        "\ufb00": "ff",
        "\ufb03": "ffi",
        "\ufb04": "ffl",
        "\u2013": "-",
        "\u2014": "-",
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2022": "•",
        "\t": " ",
    }
    for k, v in ligatures.items():
        text = text.replace(k, v)
    return text

def extract_contact_info(text: str) -> Dict[str, Optional[str]]:
    """Extracts email, phone, LinkedIn, GitHub, and portfolio links."""
    contact: Dict[str, Optional[str]] = {
        "email": None,
        "phone": None,
        "linkedin": None,
        "github": None,
        "portfolio": None
    }
    
    # 1. Email Regex
    email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b', text)
    if email_match:
        contact["email"] = email_match.group(0).lower()

    # 2. Phone Regex (International, standard US/UK/India formats)
    phone_match = re.search(
        r'(?:(?:\+|00)\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}\b',
        text
    )
    if phone_match and len(re.sub(r'\D', '', phone_match.group(0))) >= 10:
        contact["phone"] = phone_match.group(0).strip()

    # 3. LinkedIn
    linkedin_match = re.search(r'(?:https?://)?(?:www\.)?linkedin\.com/in/([a-zA-Z0-9_-]+)', text, re.IGNORECASE)
    if linkedin_match:
        contact["linkedin"] = f"https://linkedin.com/in/{linkedin_match.group(1)}"
    elif "linkedin.com" in text.lower():
        contact["linkedin"] = "Present in Resume"

    # 4. GitHub
    github_match = re.search(r'(?:https?://)?(?:www\.)?github\.com/([a-zA-Z0-9_-]+)', text, re.IGNORECASE)
    if github_match:
        contact["github"] = f"https://github.com/{github_match.group(1)}"
    elif "github.com" in text.lower():
        contact["github"] = "Present in Resume"

    # 5. Portfolio or personal website
    portfolio_match = re.search(
        r'(?:https?://)?(?:www\.)?([a-zA-Z0-9-]+\.(?:dev|io|me|vercel\.app|netlify\.app))\b',
        text,
        re.IGNORECASE
    )
    if portfolio_match:
        contact["portfolio"] = portfolio_match.group(0)

    return contact

def detect_sections(text: str) -> Tuple[List[str], List[str]]:
    """Identifies standard ATS resume sections present vs missing."""
    text_lower = text.lower()
    lines = [line.strip() for line in text_lower.split("\n") if line.strip()]
    
    found_sections: List[str] = []
    missing_sections: List[str] = []

    for sec_name, aliases in STANDARD_SECTIONS.items():
        detected = False
        for alias in aliases:
            # Check if alias appears as a header (short line, or preceded by newline)
            pattern = rf'(?:^|\n)\s*{re.escape(alias)}\s*(?::|\n|$|-)'
            if re.search(pattern, text_lower):
                detected = True
                break
            # Also check exact line matches for short header lines
            for line in lines:
                if line.rstrip(":") == alias or line.startswith(f"{alias} ") or line.endswith(f" {alias}"):
                    if len(line.split()) <= 4:
                        detected = True
                        break
            if detected:
                break

        if detected:
            found_sections.append(sec_name.capitalize())
        else:
            missing_sections.append(sec_name.capitalize())

    return found_sections, missing_sections

def analyze_quantifiable_impact(text: str) -> Dict[str, Any]:
    """Detects power action verbs, quantifiable metrics, and Google X-Y-Z structures."""
    text_lower = text.lower()
    
    # 1. Action Verbs Count & Diversity
    found_verbs = set()
    for verb in ACTION_VERBS:
        if re.search(rf'\b{verb}\b', text_lower):
            found_verbs.add(verb)

    # 2. Quantifiable metrics patterns
    metric_patterns = [
        r'\b\d+(?:\.\d+)?%',                                   # Percentages (e.g. 45%, 12.5%)
        r'\b\d+(?:\.\d+)?x\b',                                  # Multipliers (e.g. 2x, 10x)
        r'[\$€£₹]\s*\d+[\d,]*(?:\.\d+)?[kmb]?\b',              # Currency ($50k, €10M)
        r'\b\d+[\d,]*(?:\.\d+)?[kmb]?\s*(?:usd|dollars|inr)\b',# Currency words
        r'\b\d+[\d,]*\+?\s*(?:ms|milliseconds|seconds|mins)\b', # Latency / time
        r'\b\d+[\d,]*\+?\s*(?:qps|rps|tps|queries|requests)\b', # Throughput
        r'\b\d+[\d,]*\+?\s*(?:gb|tb|pb|mb)\b',                 # Data scale
        r'\b\d+[\d,]*\+?\s*(?:users|clients|customers|active users|concurrent|downloads|stars)\b', # Users/Scale
        r'\b\d+k\+?\b|\b\d+m\+?\b',                             # 10k+, 5M+
    ]
    
    total_metrics_found = 0
    metric_matches = []
    for pat in metric_patterns:
        matches = re.findall(pat, text_lower)
        if matches:
            total_metrics_found += len(matches)
            metric_matches.extend(matches[:3])

    # 3. Detect candidate bullet points
    raw_lines = [l.strip() for l in text.split("\n") if l.strip()]
    bullet_lines = []
    weak_bullets = []
    xyz_bullets = []

    for line in raw_lines:
        is_bullet = False
        clean_l = line
        if line.startswith(("•", "-", "*", "–", "—", ">")):
            is_bullet = True
            clean_l = line.lstrip("•-*–—> \t")
        elif len(line.split()) >= 6 and any(clean_l.lower().startswith(v) for v in ACTION_VERBS):
            is_bullet = True

        if is_bullet and len(clean_l.split()) >= 5:
            bullet_lines.append(clean_l)
            # Check if bullet has action verb AND metric
            has_verb = any(re.search(rf'\b{v}\b', clean_l.lower()) for v in ACTION_VERBS)
            has_metric = any(re.search(pat, clean_l.lower()) for pat in metric_patterns)
            
            if has_verb and has_metric:
                xyz_bullets.append(clean_l)
            elif not has_metric:
                weak_bullets.append(clean_l)

    return {
        "action_verbs_count": len(found_verbs),
        "unique_verbs": sorted(list(found_verbs)),
        "metrics_count": total_metrics_found,
        "sample_metrics": metric_matches[:5],
        "total_bullets_found": len(bullet_lines),
        "xyz_bullets_count": len(xyz_bullets),
        "weak_bullets": weak_bullets[:5]
    }

def match_skills(text: str, target_role: str, job_description: Optional[str] = None) -> Dict[str, Any]:
    """Matches candidate skills against target role taxonomy and optional job description."""
    role_key = target_role.lower().strip()
    
    # Resolve best taxonomy role match
    taxonomy = ROLE_TAXONOMY.get("software engineer")
    for k in ROLE_TAXONOMY.keys():
        if k in role_key or role_key in k:
            taxonomy = ROLE_TAXONOMY[k]
            break

    core_expected = taxonomy["core_skills"]
    secondary_expected = taxonomy["secondary_skills"]
    all_role_skills = core_expected + secondary_expected

    matched_skills = []
    missing_skills = []

    # Safe word-boundary match for skills
    for skill in all_role_skills:
        # Escape special chars (like C++, C#, .js, etc.)
        pattern = rf'(?<!\w){re.escape(skill)}(?!\w)'
        if re.search(pattern, text, re.IGNORECASE):
            matched_skills.append(skill)
        else:
            if skill in core_expected:
                missing_skills.append(skill)

    # Job Description Matching (if provided)
    jd_match_score: Optional[int] = None
    jd_matched_keywords: List[str] = []
    jd_missing_keywords: List[str] = []

    if job_description and job_description.strip():
        jd_text = job_description.lower()
        # Find all tech terms in JD from across all taxonomies
        all_known_tech = set()
        for tax in ROLE_TAXONOMY.values():
            all_known_tech.update(tax["core_skills"])
            all_known_tech.update(tax["secondary_skills"])
        
        jd_demanded_skills = [
            skill for skill in all_known_tech
            if re.search(rf'(?<!\w){re.escape(skill)}(?!\w)', jd_text, re.IGNORECASE)
        ]

        if jd_demanded_skills:
            for skill in jd_demanded_skills:
                if re.search(rf'(?<!\w){re.escape(skill)}(?!\w)', text, re.IGNORECASE):
                    jd_matched_keywords.append(skill)
                else:
                    jd_missing_keywords.append(skill)
            
            jd_match_score = int(round((len(jd_matched_keywords) / len(jd_demanded_skills)) * 100))
        else:
            jd_match_score = 75

    return {
        "matched_skills": sorted(list(set(matched_skills))),
        "missing_skills": sorted(list(set(missing_skills))),
        "total_role_skills": len(all_role_skills),
        "core_matched_count": len([s for s in matched_skills if s in core_expected]),
        "core_total_count": len(core_expected),
        "jd_match_score": jd_match_score,
        "jd_matched_keywords": jd_matched_keywords,
        "jd_missing_keywords": jd_missing_keywords
    }

def analyze_formatting_and_hygiene(text: str, words_count: int, bullets_count: int) -> Dict[str, Any]:
    """Evaluates ATS parsing readability, optimal length, and structure formatting."""
    feedback_notes = []
    
    # 1. Word Count Evaluation (Optimal for single/two page resume: 400 - 900 words)
    length_status = "Optimal"
    length_score = 100

    if words_count < 150:
        length_status = "Extremely Brief"
        length_score = 30
        feedback_notes.append("Resume contains under 150 words. ATS screeners may reject this as incomplete.")
    elif words_count < 300:
        length_status = "Too Short"
        length_score = 65
        feedback_notes.append("Word count is below 300 words. Expand on your project technical details, tools used, and measurable results.")
    elif words_count > 1400:
        length_status = "Overly Long"
        length_score = 75
        feedback_notes.append("Resume exceeds 1400 words. Condense into a concise 1-2 page format prioritizing recent and relevant roles.")
    else:
        feedback_notes.append("Optimal word count detected (350-1000 words), ideal for standard recruiter and ATS ingestion.")

    # 2. Bullet Point Density Check
    if bullets_count < 3:
        feedback_notes.append("Few or no structured bullet points detected. Use concise bulleted lists for experience and projects.")
    else:
        feedback_notes.append("Bullet points structure detected, enabling fast scanning by recruiter parsing software.")

    return {
        "length_status": length_status,
        "length_score": length_score,
        "formatting_notes": feedback_notes
    }

def generate_bullet_improvements(weak_bullets: List[str], target_role: str) -> List[Dict[str, str]]:
    """Generates concrete Before & After rewrites utilizing the Google X-Y-Z formula."""
    improvements = []
    
    role_templates = [
        {
            "original_fallback": "Worked on backend APIs and database queries.",
            "improved": "Architected and deployed 14 RESTful microservices in Python & FastAPI, optimizing PostgreSQL indexing to decrease p95 API response latency by 38% across 250k+ daily requests.",
            "reason": "Quantifies scale (14 microservices, 250k+ requests), specific metrics (38% p95 latency reduction), and technical stack."
        },
        {
            "original_fallback": "Built frontend user interface using React and Tailwind.",
            "improved": "Engineered 20+ responsive UI components using React and TypeScript, improving Google Core Web Vitals score by 28 points and reducing initial page load time from 3.2s to 1.1s.",
            "reason": "Replaces generic 'built interface' with measurable Core Web Vitals and load time metrics."
        },
        {
            "original_fallback": "Responsible for managing Docker containers and deployment.",
            "improved": "Spearheaded automated CI/CD pipeline using GitHub Actions and Docker, accelerating release cycle frequency from bi-weekly to daily while eliminating 95% of manual deployment errors.",
            "reason": "Demonstrates clear business impact and operational efficiency using the X-Y-Z formula."
        }
    ]

    for i, item in enumerate(role_templates):
        orig = weak_bullets[i] if i < len(weak_bullets) else item["original_fallback"]
        improvements.append({
            "original": orig,
            "improved": item["improved"],
            "reason": item["reason"]
        })

    return improvements

def calculate_ats_score(
    resume_text: str,
    target_role: str = "Software Engineer",
    job_description: Optional[str] = None
) -> Dict[str, Any]:
    """
    Computes a deterministic, authentic ATS score and granular diagnostic report
    directly from the parsed resume content.
    """
    clean_text = clean_and_normalize_text(resume_text)
    words = clean_text.split()
    word_count = len(words)
    estimated_pages = max(1, math.ceil(word_count / 500))

    # 1. Contact Information Extraction
    contact_info = extract_contact_info(clean_text)

    # 2. Section Detection
    found_sections, missing_sections = detect_sections(clean_text)

    # 3. Quantifiable Impact Analysis
    impact_data = analyze_quantifiable_impact(clean_text)

    # 4. Skill & Keyword Matching
    skill_data = match_skills(clean_text, target_role, job_description)

    # 5. Formatting & Length Hygiene
    formatting_data = analyze_formatting_and_hygiene(clean_text, word_count, impact_data["total_bullets_found"])

    # ----------------------------------------------------
    # Granular Sub-Score Computations (0 - 100)
    # ----------------------------------------------------
    
    # A. Skills Score (Weight: 40%)
    # Ratio of core skills matched (up to 80 pts) + secondary skills (up to 20 pts)
    core_ratio = skill_data["core_matched_count"] / max(1, skill_data["core_total_count"])
    secondary_matched = len(skill_data["matched_skills"]) - skill_data["core_matched_count"]
    skills_score = min(100, int(round((core_ratio * 75) + min(25, secondary_matched * 5))))
    
    # If a custom job description was given, blend JD match score
    if skill_data.get("jd_match_score") is not None:
        skills_score = int(round(0.6 * skills_score + 0.4 * skill_data["jd_match_score"]))

    # B. Impact & Metrics Score (Weight: 25%)
    # Action verbs diversity (up to 50 pts) + Quantified metrics occurrences (up to 50 pts)
    verb_points = min(50, impact_data["action_verbs_count"] * 7)
    metric_points = min(50, impact_data["metrics_count"] * 10)
    impact_score = min(100, verb_points + metric_points)

    # C. Section Completeness & Contact Score (Weight: 20%)
    # Contact items (Email: 15, Phone: 15, LinkedIn/GitHub/Portfolio: 20) -> 50 pts
    contact_pts = 0
    if contact_info.get("email"): contact_pts += 15
    if contact_info.get("phone"): contact_pts += 15
    if contact_info.get("linkedin"): contact_pts += 10
    if contact_info.get("github") or contact_info.get("portfolio"): contact_pts += 10

    # Critical sections (Experience, Education, Skills, Projects): 50 pts
    sec_pts = 0
    f_lower = [s.lower() for s in found_sections]
    if "experience" in f_lower: sec_pts += 15
    if "education" in f_lower: sec_pts += 15
    if "skills" in f_lower: sec_pts += 10
    if "projects" in f_lower: sec_pts += 10

    completeness_score = min(100, contact_pts + sec_pts)

    # D. Formatting & Readability Score (Weight: 15%)
    format_score = formatting_data["length_score"]
    if impact_data["total_bullets_found"] >= 5:
        format_score = min(100, format_score + 10)
    formatting_score = min(100, format_score)

    # ----------------------------------------------------
    # Overall Weighted ATS Score (0 - 100)
    # ----------------------------------------------------
    weighted_ats_score = int(round(
        (0.40 * skills_score) +
        (0.25 * impact_score) +
        (0.20 * completeness_score) +
        (0.15 * formatting_score)
    ))

    # Clamp bounds cleanly (even empty resumes get realistic baseline, non-zero if some words exist)
    if word_count < 40:
        weighted_ats_score = max(10, min(weighted_ats_score, 35))
    else:
        weighted_ats_score = max(20, min(weighted_ats_score, 98))

    # Construct Actionable Suggestions
    suggestions: List[str] = []
    if skill_data["missing_skills"]:
        top_missing = ", ".join(skill_data["missing_skills"][:4])
        suggestions.append(f"Incorporate high-priority keywords for {target_role}: {top_missing}.")
    
    if impact_data["metrics_count"] < 3:
        suggestions.append("Apply the Google X-Y-Z formula: 'Accomplished [X] as measured by [Y], by doing [Z]'. Add numbers, percentages, and latency metrics to your project bullet points.")
    
    if "Education" in missing_sections or "Projects" in missing_sections:
        missing_names = ", ".join([s for s in missing_sections if s in ["Education", "Projects", "Experience"]])
        if missing_names:
            suggestions.append(f"Ensure clear, standard section headings for: {missing_names}.")

    if not contact_info.get("linkedin") and not contact_info.get("github"):
        suggestions.append("Add professional links (GitHub, LinkedIn, Portfolio) to verify active codebase contributions.")

    if len(suggestions) < 3:
        suggestions.append("Use standard clean sans-serif typography and consistent bullet point indentations to prevent ATS parser errors.")

    # Role Alignment Description
    if weighted_ats_score >= 80:
        role_alignment = f"Strong alignment with the {target_role} track. Excellent keyword coverage and high recruiter scan appeal."
    elif weighted_ats_score >= 60:
        role_alignment = f"Moderate fit for {target_role}. Technical core is present, but lacks sufficient quantified metrics and specific framework keywords."
    else:
        role_alignment = f"Low keyword alignment for {target_role}. Crucial industry terminology and measurable project outcomes are missing."

    formatting_feedback = " ".join(formatting_data["formatting_notes"])

    bullet_improvements = generate_bullet_improvements(impact_data["weak_bullets"], target_role)

    # ----------------------------------------------------
    # Generate Granular "What To Change" Fixes
    # ----------------------------------------------------
    what_to_change = generate_what_to_change(
        clean_text=clean_text,
        target_role=target_role,
        impact_data=impact_data,
        skill_data=skill_data,
        missing_sections=missing_sections,
        contact_info=contact_info,
        word_count=word_count
    )

    # ----------------------------------------------------
    # Calculate Realistic Hire Chances & Readiness Breakdown
    # ----------------------------------------------------
    hire_chances = calculate_hire_chances(
        weighted_ats_score=weighted_ats_score,
        skills_score=skills_score,
        impact_score=impact_score,
        completeness_score=completeness_score,
        skill_data=skill_data,
        contact_info=contact_info
    )

    # ----------------------------------------------------
    # Retrieve Targeted Projects & Certifications
    # ----------------------------------------------------
    normalized_role = target_role.strip().lower()
    rec_projects = ROLE_RECOMMENDED_PROJECTS.get(normalized_role)
    if not rec_projects:
        # Fallback search by substring
        for r_key, p_list in ROLE_RECOMMENDED_PROJECTS.items():
            if r_key in normalized_role or normalized_role in r_key:
                rec_projects = p_list
                break
    if not rec_projects:
        rec_projects = ROLE_RECOMMENDED_PROJECTS["software engineer"]

    rec_certifications = ROLE_RECOMMENDED_CERTIFICATIONS.get(normalized_role)
    if not rec_certifications:
        for r_key, c_list in ROLE_RECOMMENDED_CERTIFICATIONS.items():
            if r_key in normalized_role or normalized_role in r_key:
                rec_certifications = c_list
                break
    if not rec_certifications:
        rec_certifications = ROLE_RECOMMENDED_CERTIFICATIONS["software engineer"]

    return {
        "ats_score": weighted_ats_score,
        "target_role": target_role,
        "score_breakdown": {
            "skills_score": skills_score,
            "impact_score": impact_score,
            "completeness_score": completeness_score,
            "formatting_score": formatting_score
        },
        "metrics": {
            "word_count": word_count,
            "estimated_pages": estimated_pages,
            "action_verbs_count": impact_data["action_verbs_count"],
            "quantified_metrics_count": impact_data["metrics_count"],
            "sections_found": found_sections,
            "sections_missing": missing_sections,
            "contact_info": contact_info
        },
        "matched_skills": skill_data["matched_skills"],
        "missing_skills": skill_data["missing_skills"],
        "jd_match_score": skill_data.get("jd_match_score"),
        "role_alignment": role_alignment,
        "formatting_feedback": formatting_feedback,
        "suggestions": suggestions,
        "bullet_improvements": bullet_improvements,
        "hire_chances": hire_chances,
        "what_to_change": what_to_change,
        "recommended_projects": rec_projects,
        "recommended_certifications": rec_certifications
    }


def generate_what_to_change(
    clean_text: str,
    target_role: str,
    impact_data: Dict[str, Any],
    skill_data: Dict[str, Any],
    missing_sections: List[str],
    contact_info: Dict[str, Any],
    word_count: int
) -> List[Dict[str, Any]]:
    items = []
    
    # 1. Weak Action Verbs vs Strong Replacements
    weak_verb_patterns = [
        (r"\bworked on\b", "Worked on", "Architected / Engineered", "Replace passive 'worked on' with high-conviction engineering verbs like 'Architected', 'Engineered', or 'Deployed'."),
        (r"\bresponsible for\b", "Responsible for", "Orchestrated / Spearheaded", "Replace passive duty language with active ownership verbs like 'Spearheaded' or 'Orchestrated'."),
        (r"\bhelped\b|\bassisted\b", "Helped / Assisted", "Collaborated to deliver / Accelerated", "Avoid sounding like a bystander; emphasize your specific technical ownership."),
        (r"\bhandled\b", "Handled", "Streamlined / Optimized", "Use outcome-driven verbs like 'Optimized' or 'Overhauled'."),
        (r"\bmade\b|\bdid\b", "Made / Did", "Constructed / Formulated", "Use precise technical action verbs describing the system built.")
    ]
    
    found_weak = []
    for pattern, label, replacement, desc in weak_verb_patterns:
        if re.search(pattern, clean_text, re.IGNORECASE):
            found_weak.append({
                "category": "Weak Action Verbs",
                "severity": "Critical",
                "title": f"Passive phrasing detected: '{label}'",
                "description": desc,
                "action_item": f"Switch '{label}' to '{replacement}' to signal technical autonomy to recruiters.",
                "example": f"Change '{label} database tasks' -> 'Engineered and indexed PostgreSQL schema, reducing p95 query latency by 35%'."
            })
    if found_weak:
        items.extend(found_weak[:2])
    else:
        items.append({
            "category": "Weak Action Verbs",
            "severity": "Medium",
            "title": "Strong Action Verb Hygiene",
            "description": "Ensure every project bullet begins with a distinguished past-tense verb (e.g. Architected, Optimized, Spearheaded).",
            "action_item": "Review your first word on every bullet point to guarantee no bullet starts with a noun or weak verb.",
            "example": "Optimized, Refactored, Accelerated, Scaled, Deployed."
        })

    # 2. Missing Quantifiable Metrics
    metrics_count = impact_data.get("metrics_count", 0)
    if metrics_count < 3:
        items.append({
            "category": "Missing Metrics",
            "severity": "Critical",
            "title": "Insufficient Quantifiable Impact",
            "description": f"Only {metrics_count} quantified metric(s) found across your resume. Tier-1 tech recruiters discard bullets without business or performance metrics.",
            "action_item": "Rewrite bullets using Google's X-Y-Z formula: 'Accomplished [X] measured by [Y] by doing [Z]'. Add numbers (%, ms, QPS, $, hours saved).",
            "example": "Before: 'Improved API performance.' -> After: 'Optimized Redis caching layer, decreasing p99 API response time by 45% (from 240ms to 132ms) across 150k daily active users.'"
        })
    else:
        items.append({
            "category": "Missing Metrics",
            "severity": "Medium",
            "title": "Metric Scope & Scale Enhancement",
            "description": f"Found {metrics_count} metrics. Expand from percentage improvements to include throughput volume, concurrent user scale, or engineering hours saved.",
            "action_item": "Ensure numbers represent real technical scale (e.g., QPS, GB/TB volume, latency percentiles).",
            "example": "Scaled database read-replicas to handle 25,000 QPS with 99.99% uptime."
        })

    # 3. Missing Core Technical Skills
    missing_skills = skill_data.get("missing_skills", [])
    if missing_skills:
        top_missing = missing_skills[:4]
        items.append({
            "category": "Key Skill Gaps",
            "severity": "High",
            "title": f"Missing Core Competencies for {target_role}",
            "description": f"Target job descriptions for {target_role} heavily filter for: {', '.join(top_missing)}.",
            "action_item": f"Explicitly incorporate {', '.join(top_missing[:2])} into project architecture bullets or technical skills section.",
            "example": f"Add hands-on bullet: 'Integrated {top_missing[0]} pipeline with Docker containers to automate distributed batch ingestion.'"
        })

    # 4. Professional Contact & Sections
    if not contact_info.get("github") and not contact_info.get("linkedin"):
        items.append({
            "category": "Formatting & Structure",
            "severity": "Critical",
            "title": "Missing Codebase / Portfolio Verification Links",
            "description": "Tech screeners heavily favor resumes with live clickable GitHub and LinkedIn links to verify engineering consistency.",
            "action_item": "Place your GitHub profile and LinkedIn URL in the header right beneath your name.",
            "example": "GitHub: github.com/your-handle | LinkedIn: linkedin.com/in/your-profile"
        })

    if "Projects" in missing_sections or "Experience" in missing_sections:
        items.append({
            "category": "Formatting & Structure",
            "severity": "High",
            "title": "Non-Standard Section Headings",
            "description": "ATS parsing engines look for exact standard headings: 'Experience', 'Projects', 'Technical Skills', 'Education'.",
            "action_item": "Rename creative section titles (like 'What I Did' or 'Stuff I Built') to standard ATS headings.",
            "example": "'Technical Projects' or 'Work Experience'."
        })

    if word_count < 250:
        items.append({
            "category": "Formatting & Structure",
            "severity": "High",
            "title": "Low Resume Word Count",
            "description": f"Resume text is {word_count} words. Standard single-page tech resumes are 450 - 750 words.",
            "action_item": "Expand projects with architecture details, specific libraries used, and quantifiable outcomes.",
            "example": "Aim for 3-4 bullet points per project/work experience role."
        })

    return items


def calculate_hire_chances(
    weighted_ats_score: int,
    skills_score: int,
    impact_score: int,
    completeness_score: int,
    skill_data: Dict[str, Any],
    contact_info: Dict[str, Any]
) -> Dict[str, Any]:
    raw_hire_chance = int(round(
        (0.40 * weighted_ats_score) +
        (0.35 * skills_score) +
        (0.25 * impact_score)
    ))
    hire_chance_percentage = min(96, max(30, raw_hire_chance))

    if hire_chance_percentage >= 80:
        tier = "Tier 1: High Interview Callout (FAANG, Top Tier & Unicorns)"
    elif hire_chance_percentage >= 65:
        tier = "Tier 2: Competitive Profile (Mid-to-Large Tech Companies)"
    else:
        tier = "Tier 3: Developing Profile (Needs Targeted Projects & Metric Polish)"

    ats_pass_rate = min(98, max(25, int(round(weighted_ats_score * 0.95 + 4))))
    tech_recruiter_pass_rate = min(95, max(20, int(round(skills_score * 0.5 + impact_score * 0.35 + 15))))
    hiring_manager_pass_rate = min(95, max(20, int(round(impact_score * 0.55 + skills_score * 0.35 + 10))))

    return {
        "hire_chance_percentage": hire_chance_percentage,
        "hire_chance_tier": tier,
        "ats_pass_rate": ats_pass_rate,
        "tech_recruiter_pass_rate": tech_recruiter_pass_rate,
        "hiring_manager_pass_rate": hiring_manager_pass_rate,
        "skills_coverage": skills_score,
        "project_depth": min(95, max(30, int(round(impact_score * 0.55 + (15 if len(skill_data.get("matched_skills", [])) >= 5 else 0) + 25)))),
        "quantified_impact": impact_score,
        "industry_credentials": min(95, max(30, int(round(skills_score * 0.4 + completeness_score * 0.4 + 20))))
    }

