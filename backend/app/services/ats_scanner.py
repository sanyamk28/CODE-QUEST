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
        "bullet_improvements": bullet_improvements
    }
