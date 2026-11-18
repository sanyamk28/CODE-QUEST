import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and display 'Page X of Y' 
    along with running academic headers and footers.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        self.saveState()
        if self._pageNumber > 1:
            # Running Header
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#0f172a"))
            self.drawString(54, letter[1] - 36, "CODE QUEST — Comprehensive Component & Module Technical Guide")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748b"))
            self.drawRightString(letter[0] - 54, letter[1] - 36, "Academic Evaluator & Viva Defense Edition")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.75)
            self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)

            # Running Footer
            self.line(54, 45, letter[0] - 54, 45)
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748b"))
            self.drawString(54, 32, "Project Guide & Evaluation Manual | Candidate: Sanyam Kumar")
            self.drawRightString(letter[0] - 54, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def build_pdf():
    pdf_filename = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs", "Code_Quest_Comprehensive_Teacher_Guide.pdf"))
    os.makedirs(os.path.dirname(pdf_filename), exist_ok=True)

    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    content_width = letter[0] - 108 # 504 points
    styles = getSampleStyleSheet()

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=22, leading=26,
        textColor=colors.HexColor('#0a192f'), alignment=TA_CENTER
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=12, leading=16,
        textColor=colors.HexColor('#0284c7'), alignment=TA_CENTER
    )
    meta_style = ParagraphStyle(
        'DocMeta', parent=styles['Normal'],
        fontName='Helvetica', fontSize=9, leading=13,
        textColor=colors.HexColor('#475569'), alignment=TA_CENTER
    )
    h1_style = ParagraphStyle(
        'SectionH1', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=14, leading=18,
        textColor=colors.HexColor('#0f172a'), spaceBefore=14, spaceAfter=6, keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'ModuleH2', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=11, leading=15,
        textColor=colors.HexColor('#0369a1'), spaceBefore=10, spaceAfter=4, keepWithNext=True
    )
    body_style = ParagraphStyle(
        'BodyDark', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8.5, leading=12.5,
        textColor=colors.HexColor('#1e293b'), alignment=TA_JUSTIFY, spaceAfter=4
    )
    bullet_style = ParagraphStyle(
        'BulletCustom', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8.5, leading=12,
        textColor=colors.HexColor('#334155'), leftIndent=14, firstLineIndent=-10, spaceAfter=2
    )
    code_inline_style = ParagraphStyle(
        'CodeInline', parent=styles['Normal'],
        fontName='Courier-Bold', fontSize=8, leading=10,
        textColor=colors.HexColor('#0284c7')
    )
    table_cell_style = ParagraphStyle(
        'TableCell', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8, leading=11,
        textColor=colors.HexColor('#1e293b')
    )
    table_header_style = ParagraphStyle(
        'TableHeader', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=8, leading=11,
        textColor=colors.HexColor('#ffffff')
    )
    callout_text = ParagraphStyle(
        'Callout', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8.5, leading=12,
        textColor=colors.HexColor('#0c4a6e')
    )
    q_style = ParagraphStyle(
        'QuestionStyle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=9, leading=12,
        textColor=colors.HexColor('#b91c1c'), spaceBefore=6, keepWithNext=True
    )
    a_style = ParagraphStyle(
        'AnswerStyle', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8.5, leading=12,
        textColor=colors.HexColor('#1e293b'), spaceAfter=6
    )

    story = []

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    story.append(Spacer(1, 20))
    story.append(Paragraph("PROJECT EVALUATION & TECHNICAL DEFENSE GUIDE", subtitle_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("CODE QUEST", title_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph("AI-Powered Full-Stack Placement Preparation & Gamified Technical Assessment Ecosystem", subtitle_style))
    story.append(Spacer(1, 14))

    # Badge Box
    badge_data = [[
        Paragraph("<b>Academic Degree:</b> B.Tech / B.E. Computer Science & Engineering<br/>"
                  "<b>Document Nature:</b> Exhaustive Component Architecture, Module Mechanics & Viva Defense Manual<br/>"
                  "<b>Candidate Author:</b> Sanyam Kumar &nbsp;|&nbsp; <b>Framework:</b> React 18, FastAPI, SQLite/PostgreSQL, Gemini AI<br/>"
                  "<b>Live Deployment:</b> Cloudflare High-Speed Tunnels & Vite PWA", meta_style)
    ]]
    badge_table = Table(badge_data, colWidths=[content_width])
    badge_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(badge_table)
    story.append(Spacer(1, 16))

    # Executive Overview
    story.append(Paragraph("<b>Executive Academic Abstract</b>", h2_style))
    story.append(Paragraph(
        "<b>Code Quest</b> is a comprehensive, production-grade technical interview readiness platform engineered "
        "to bridge the critical competency gap between traditional computer science classroom instruction and real-world "
        "tier-1 corporate recruitment assessments (e.g., Google, Amazon, Microsoft, TCS NQT, Infosys, and Accenture). "
        "The system replaces fragmented preparation resources with a unified, state-driven, gamified web ecosystem "
        "comprising <b>12 fully functional modules</b>, including safe sandboxed multi-language code execution, interactive "
        "SQL query analysis, dynamic CS fundamentals MCQs, gamified 1v1 coding battles, live company hiring intelligence scraping, "
        "an automated AI-powered Resume ATS scoring pipeline, and an autonomous 24/7 technical mentor agent (<b>QuestAI</b>). "
        "This document is explicitly structured to provide project examiners, faculty guides, and evaluation panels with "
        "exhaustive algorithmic, architectural, and component-level defense rationale.",
        body_style
    ))
    story.append(Spacer(1, 10))

    # Tech Stack Matrix Table
    stack_data = [
        [Paragraph("<b>Layer</b>", table_header_style), Paragraph("<b>Technologies & Libraries</b>", table_header_style), Paragraph("<b>Architectural Responsibility</b>", table_header_style)],
        [Paragraph("<b>Frontend Core</b>", table_cell_style), Paragraph("React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons", table_cell_style), Paragraph("SPA rendering, reactive state, atomic design tokens, type safety, 60fps animations.", table_cell_style)],
        [Paragraph("<b>Backend API</b>", table_cell_style), Paragraph("FastAPI, Python 3.10+, Uvicorn ASGI, Pydantic v2", table_cell_style), Paragraph("High-throughput async REST endpoints, automatic OpenAPI schema docs, validation.", table_cell_style)],
        [Paragraph("<b>Database</b>", table_cell_style), Paragraph("SQLite (WAL mode enabled) / PostgreSQL, SQLAlchemy ORM", table_cell_style), Paragraph("Relational data integrity, ACID compliance, dynamic schema migrations via Alembic.", table_cell_style)],
        [Paragraph("<b>Code Sandbox</b>", table_cell_style), Paragraph("Python Subprocess Isolation / Docker Sandbox (C++, Java, Py, JS)", table_cell_style), Paragraph("Secure compilation, execution timeout guards, I/O memory capture, test case grading.", table_cell_style)],
        [Paragraph("<b>AI & Agents</b>", table_cell_style), Paragraph("Google Gemini API, PyPDF2 parser, Scraper Engine", table_cell_style), Paragraph("ATS keyword density evaluation, interview question generation, conversational QuestAI.", table_cell_style)],
        [Paragraph("<b>Deployment</b>", table_cell_style), Paragraph("Cloudflare Quick Tunnels, Service Workers (PWA), Docker", table_cell_style), Paragraph("Zero-config global HTTPS routing, offline capability, cross-platform responsiveness.", table_cell_style)],
    ]
    t_stack = Table(stack_data, colWidths=[90, 180, 234])
    t_stack.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#ffffff'), colors.HexColor('#f8fafc')]),
    ]))
    story.append(t_stack)
    story.append(PageBreak())

    # =========================================================================
    # SECTION 1: ARCHITECTURAL DEEP-DIVE & DATA FLOW
    # =========================================================================
    story.append(Paragraph("1. System Architecture & Component Interaction Flow", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#0284c7'), spaceAfter=8))

    story.append(Paragraph(
        "Code Quest follows a decoupled <b>Client-Server Micro-Monolith Architecture</b>. The client application is an "
        "optimized Single Page Application (SPA) bundled via Vite with comprehensive code splitting and dynamic lazy loading. "
        "Communication with the backend occurs asynchronously through a centralized type-safe HTTP client (<font name='Courier'>apiClient</font>) "
        "interfacing with FastAPI endpoints. An activity event bus (<font name='Courier'>cq_activity_updated</font>) enables real-time "
        "synchronization between discrete view features without requiring intrusive prop-drilling or external heavyweight state stores.",
        body_style
    ))

    # Flow Explanation Callout
    arch_callout = [[
        Paragraph(
            "<b>Architectural Data Flow Pipeline:</b><br/>"
            "<b>1. User Interaction:</b> User writes code, submits an SQL query, answers an MCQ, or uploads an ATS resume.<br/>"
            "<b>2. Client Validation:</b> Client conducts sanitization, parameter validation, and emits activity telemetry.<br/>"
            "<b>3. Async Dispatch:</b> Request travels over HTTPS (or Cloudflare Tunnel) to FastAPI ASGI router.<br/>"
            "<b>4. Isolated Execution:</b> Code execution is routed to isolated sandbox processes with strict resource timeouts.<br/>"
            "<b>5. Persistent Ledger:</b> User XP, streak counts, problem completions, and assessment scores commit to SQLite/PostgreSQL.<br/>"
            "<b>6. Reactive Telemetry:</b> Client receives JSON response, dispatches audio fanfare/sound effects, and animates dashboard dials.",
            callout_text
        )
    ]]
    t_arch = Table(arch_callout, colWidths=[content_width])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#e0f2fe')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#7dd3fc')),
        ('ROUNDEDCORNERS', [5, 5, 5, 5]),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 10))

    # =========================================================================
    # SECTION 2: EXHAUSTIVE BREAKDOWN OF EVERY COMPONENT & MODULE
    # =========================================================================
    story.append(Paragraph("2. Detailed Component & Module Technical Specifications", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#0284c7'), spaceAfter=8))

    # MODULE 1: Dashboard
    story.append(Paragraph("Module 1: Placement Command Center & Readiness Telemetry (DashboardView.tsx)", h2_style))
    story.append(Paragraph(
        "<b>Component File:</b> <font name='Courier'>frontend/src/features/dashboard/DashboardView.tsx</font><br/>"
        "<b>Role & Academic Purpose:</b> Serves as the central command telemetry deck where students track their placement preparedness in real-time. "
        "It eliminates arbitrary static progress percentages by calculating a true dynamic Readiness Index from 0% to 100% based on verified student actions across all modules.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Key Technical & Algorithmic Mechanics:</b>", body_style
    ))
    story.append(Paragraph("• <b>Dynamic Readiness Formula:</b> Readiness Index = (Arena Pct * 0.35) + (SQL Pct * 0.25) + (MCQ Pct * 0.20) + (Brainteasers Pct * 0.10) + (Assessments Pct * 0.10). This weighted sum accurately mirrors multi-stage recruitment rounds.", bullet_style))
    story.append(Paragraph("• <b>Telemetry Modules:</b> Features 4 holographic stat cards (Overall Readiness Gauge with SVG circle path, Operative Tier/Level L1-L10, Active Day Streak counter with flame animation, and Total Verified Problem Solves).", bullet_style))
    story.append(Paragraph("• <b>Mission Directives:</b> Today's Quests dynamically check off when the student executes queries, solves coding problems, or completes MCQs, awarding instant XP.", bullet_style))
    story.append(Paragraph("• <b>UI Aesthetic:</b> Styled with the high-tech <i>Theme 1: Midnight Cyber</i> design token system (Obsidian canvas #06080F, Electric Cyan #00E5FF glows, and crisp 1px laser borders).", bullet_style))
    story.append(Spacer(1, 6))

    # MODULE 2: Coding Arena
    story.append(Paragraph("Module 2: Coding Arena — DSA Practice & Sandboxed Execution (ArenaView.tsx)", h2_style))
    story.append(Paragraph(
        "<b>Component File:</b> <font name='Courier'>frontend/src/features/arena/ArenaView.tsx</font><br/>"
        "<b>Backend Route:</b> <font name='Courier'>POST /api/v1/execute</font> &nbsp;|&nbsp; <b>Sandboxed Process:</b> Python Subprocess / Docker Runner<br/>"
        "<b>Role & Academic Purpose:</b> Emulates professional platforms like LeetCode and HackerRank. Students practice Data Structures & Algorithms (Arrays, Dynamic Programming, Graphs, Trees, Strings) with company tagging (Google, Amazon, Meta, Microsoft).",
        body_style
    ))
    story.append(Paragraph("• <b>Multi-Language Support:</b> Provides syntax-highlighted code editors with starter code templates in Python, JavaScript, Java, and C++.", bullet_style))
    story.append(Paragraph("• <b>Execution Safety:</b> Submissions execute in isolated sandbox processes with a 5-second hard execution timeout guard to prevent infinite loops (e.g. while True) and memory leaks.", bullet_style))
    story.append(Paragraph("• <b>Complexity & Percentile Benchmarking:</b> Analyzes Big-O Time Complexity (e.g., O(N), O(log N)) and Space Complexity, calculating percentile beats (e.g. 'Faster than 94.8% of submissions').", bullet_style))
    story.append(Paragraph("• <b>Test Case Validation:</b> Runs public visible test cases and private hidden edge test cases, returning granular standard output (stdout), stderr, execution time (ms), and memory consumption (MB).", bullet_style))
    story.append(Spacer(1, 6))

    # MODULE 3: SQL Lab
    story.append(Paragraph("Module 3: SQL Laboratory & Interactive Schema Query Engine (SqlLabView.tsx)", h2_style))
    story.append(Paragraph(
        "<b>Component File:</b> <font name='Courier'>frontend/src/features/sql/SqlLabView.tsx</font><br/>"
        "<b>Backend Engine:</b> In-memory SQLite with pre-seeded enterprise relational schemas (Employees, Departments, Salaries, Projects)<br/>"
        "<b>Role & Academic Purpose:</b> Designed specifically for Data Engineering, Backend, and Business Analyst placement preparation where relational database query proficiency is tested.",
        body_style
    ))
    story.append(Paragraph("• <b>Live Query Execution:</b> Students write raw SQL queries (SELECT, JOIN, GROUP BY, HAVING, Window Functions like RANK(), DENSE_RANK()).", bullet_style))
    story.append(Paragraph("• <b>Schema Visualizer:</b> Interactive sidebar exposes table definitions, column datatypes, primary keys, and foreign key relationships.", bullet_style))
    story.append(Paragraph("• <b>Real-Time Result Grid:</b> Dynamically parses JSON query output into formatted, sortable HTML tables, displaying query duration in milliseconds.", bullet_style))
    story.append(Paragraph("• <b>Query Explanation & Plan:</b> Provides automated syntactic explanations and query optimization suggestions for subqueries vs joins.", bullet_style))
    story.append(Spacer(1, 6))

    # MODULE 4: CS Fundamentals
    story.append(Paragraph("Module 4: CS Fundamentals & Technical Quiz Engine (CsFundamentalsView.tsx)", h2_style))
    story.append(Paragraph(
        "<b>Component File:</b> <font name='Courier'>frontend/src/features/mcqs/CsFundamentalsView.tsx</font><br/>"
        "<b>Core Disciplines:</b> Operating Systems (OS), Database Management Systems (DBMS), Computer Networks (CN), and Object-Oriented Programming (OOPs).<br/>"
        "<b>Role & Academic Purpose:</b> Prepares candidates for Technical MCQ screening rounds conducted by campus recruiters (e.g., TCS Digital, Infosys SP/DSE, Cognizant).",
        body_style
    ))
    story.append(Paragraph("• <b>Topic Categorization:</b> Organizes questions by core subject (Process Scheduling, Deadlocks, Normalization, ACID properties, TCP/IP vs OSI model, Polymorphism).", bullet_style))
    story.append(Paragraph("• <b>Immediate Pedagogical Feedback:</b> Selecting an option highlights correct answers in neon emerald and incorrect answers in crimson, accompanied by a comprehensive technical explanation.", bullet_style))
    story.append(Paragraph("• <b>Subject Mastery Tracking:</b> Tracks mastery percentage per discipline to expose student weaknesses before real interview rounds.", bullet_style))
    story.append(Spacer(1, 6))

    story.append(PageBreak())

    # MODULE 5: Brainteasers
    story.append(Paragraph("Module 5: Brainteasers & Logical Aptitude Suite (BrainteasersView.tsx)", h2_style))
    story.append(Paragraph(
        "<b>Component File:</b> <font name='Courier'>frontend/src/features/puzzles/BrainteasersView.tsx</font><br/>"
        "<b>Role & Academic Purpose:</b> Solves the common student failure point in quantitative aptitude and mathematical puzzle rounds frequently administered by Goldman Sachs, Morgan Stanley, and analytics firms.",
        body_style
    ))
    story.append(Paragraph("• <b>Curated Puzzle Vault:</b> Houses classic and modern logic puzzles (e.g., 25 Horses Puzzle, Monty Hall Problem, Burning Ropes, Weighing Balls).", bullet_style))
    story.append(Paragraph("• <b>Progressive Hint System:</b> Features multi-stage hints so students can develop deductive reasoning without immediately spoiling the solution.", bullet_style))
    story.append(Paragraph("• <b>Mathematical Breakdown:</b> Full step-by-step mathematical proofs and probability calculations revealed upon completion.", bullet_style))
    story.append(Spacer(1, 6))

    # MODULE 6: Code Battles
    story.append(Paragraph("Module 6: Real-Time Gamified Code Battles (BattleArenaView.tsx)", h2_style))
    story.append(Paragraph(
        "<b>Component File:</b> <font name='Courier'>frontend/src/features/battle/BattleArenaView.tsx</font><br/>"
        "<b>Role & Academic Purpose:</b> Introduces gamification and competitive programming psychology. Simulates high-pressure live coding assessments under strict countdown timers against simulated or peer opponents.",
        body_style
    ))
    story.append(Paragraph("• <b>Live Matchmaking Engine:</b> Pairs the candidate with algorithmic opponents with simulated typing speeds and test pass intervals.", bullet_style))
    story.append(Paragraph("• <b>Dual Live Progress Bars:</b> Visualizes real-time test case passing rates (e.g., 2/5 -> 4/5 -> 5/5) side-by-side.", bullet_style))
    story.append(Paragraph("• <b>Fanfare & Rating Adjustment:</b> On victory, triggers custom Web Audio API synthesized fanfare and increments competitive battle rating points.", bullet_style))
    story.append(Spacer(1, 6))

    # MODULE 7: Company Intelligence Scraper Agent
    story.append(Paragraph("Module 7: Company Intelligence & Question Scraper Agent (CompanyScraperAgentView.tsx)", h2_style))
    story.append(Paragraph(
        "<b>Component File:</b> <font name='Courier'>frontend/src/features/company/CompanyScraperAgentView.tsx</font><br/>"
        "<b>Backend Route:</b> <font name='Courier'>GET /api/v1/company/{company_id}/intel</font> &nbsp;|&nbsp; <b>AI Engine:</b> Gemini LLM & Web Scraper Parser<br/>"
        "<b>Role & Academic Purpose:</b> Gives students actionable insider intelligence on specific hiring companies (Google, Amazon, TCS, Infosys, Wipro, Accenture).",
        body_style
    ))
    story.append(Paragraph("• <b>Round Breakdown:</b> Details exact hiring pipelines (Online Assessment duration, Technical Rounds count, System Design requirements, HR questions).", bullet_style))
    story.append(Paragraph("• <b>Recent Question Bank:</b> Dynamically displays real interview questions asked in the past 6-12 months for specific target roles.", bullet_style))
    story.append(Paragraph("• <b>Package & Compensation Intel:</b> Displays CTC package ranges (Base + Bonus + Stocks) for fresher and experienced tiers.", bullet_style))
    story.append(Spacer(1, 6))

    # MODULE 8: AI Resume ATS Analyzer
    story.append(Paragraph("Module 8: AI-Powered Resume ATS Analyzer & Optimizer (ResumeAtsView.tsx)", h2_style))
    story.append(Paragraph(
        "<b>Component File:</b> <font name='Courier'>frontend/src/features/resume/ResumeAtsView.tsx</font><br/>"
        "<b>Backend Route:</b> <font name='Courier'>POST /api/v1/resume/analyze-ats</font> &nbsp;|&nbsp; <b>Libraries:</b> PyPDF2, pdfminer.six, NLP RegEx<br/>"
        "<b>Role & Academic Purpose:</b> Addresses the automated screening barrier where over 70% of student resumes are rejected by corporate Applicant Tracking Systems (ATS) prior to human review.",
        body_style
    ))
    story.append(Paragraph("• <b>PDF Parsing & Extraction:</b> Extracts raw textual tokens, contact headers, education sections, project descriptions, and technical skills from uploaded PDF files.", bullet_style))
    story.append(Paragraph("• <b>Algorithmic Scoring Matrix:</b> Evaluates 4 pillars: (1) Role-Specific Keyword Match % against selected job profiles, (2) Action Verb Strength (e.g. 'Engineered', 'Optimized' vs 'Worked on'), (3) Quantifiable Metrics Density (% improvements, latency reductions), and (4) Formatting & Section Hygiene.", bullet_style))
    story.append(Paragraph("• <b>Actionable Suggestions:</b> Pinpoints exact missing keywords (e.g., 'Docker', 'Kubernetes', 'Redis', 'PostgreSQL') required for target roles.", bullet_style))
    story.append(Spacer(1, 6))

    # MODULE 9: Career Roadmaps
    story.append(Paragraph("Module 9: Interactive Role Roadmaps (RoadmapsView.tsx)", h2_style))
    story.append(Paragraph(
        "<b>Component File:</b> <font name='Courier'>frontend/src/features/roadmaps/RoadmapsView.tsx</font><br/>"
        "<b>Role & Academic Purpose:</b> Provides clear, non-linear architectural milestone roadmaps for major technical roles: Full Stack Developer, Data Engineer, Cloud/DevOps Engineer, and AI/ML Specialist.",
        body_style
    ))
    story.append(Paragraph("• <b>Step-by-Step Milestones:</b> Breaks curricula into Foundation -> Intermediate -> Production Specialization nodes.", bullet_style))
    story.append(Paragraph("• <b>Direct Navigation Hook:</b> Clicking roadmap skills links directly into practice questions in the Coding Arena or SQL Lab.", bullet_style))
    story.append(Spacer(1, 6))

    story.append(PageBreak())

    # MODULE 10: Assessments Simulator
    story.append(Paragraph("Module 10: Placement Simulation & Timed Assessments (AssessmentsView.tsx)", h2_style))
    story.append(Paragraph(
        "<b>Component File:</b> <font name='Courier'>frontend/src/features/assessments/AssessmentsView.tsx</font><br/>"
        "<b>Role & Academic Purpose:</b> High-stakes simulated examinations matching actual placement exam patterns (TCS NQT 90-min multi-section exam, Infosys HackWithInfy, Accenture Cognitive & Technical Assessment).",
        body_style
    ))
    story.append(Paragraph("• <b>Sectional Timers & Auto-Submit:</b> Enforces realistic section switching, question navigation palettes, and countdown timers.", bullet_style))
    story.append(Paragraph("• <b>Comprehensive Diagnostic Report:</b> Generates percentile breakdown, accuracy per topic, and areas requiring immediate remedial study.", bullet_style))
    story.append(Spacer(1, 6))

    # MODULE 11: Competitive Leaderboard
    story.append(Paragraph("Module 11: Global Leaderboard & Gamification Engine (LeaderboardView.tsx)", h2_style))
    story.append(Paragraph(
        "<b>Component File:</b> <font name='Courier'>frontend/src/features/leaderboard/LeaderboardView.tsx</font><br/>"
        "<b>Role & Academic Purpose:</b> Drives long-term student engagement and consistency via positive peer benchmarking, streak recognition, and badge unlocks.",
        body_style
    ))
    story.append(Paragraph("• <b>XP & Tier Hierarchy:</b> Computes global ranks across 10 Operative Tiers (Initiate -> Novice -> Specialist -> Architect -> Grandmaster).", bullet_style))
    story.append(Paragraph("• <b>Badge Engine:</b> Unlocks verifiable digital badges (e.g. 'SQL Wizard', '7-Day Iron Streak', 'Algorithmic Duelist').", bullet_style))
    story.append(Spacer(1, 6))

    # MODULE 12: QuestAI Mentor
    story.append(Paragraph("Module 12: QuestAI — 24/7 Autonomous Technical Mentor Agent (QuestChatbot.tsx)", h2_style))
    story.append(Paragraph(
        "<b>Component File:</b> <font name='Courier'>frontend/src/features/chatbot/QuestChatbot.tsx</font><br/>"
        "<b>Backend Route:</b> <font name='Courier'>POST /api/v1/ai/chat</font> &nbsp;|&nbsp; <b>Model:</b> Google Gemini API (gemini-1.5-flash)<br/>"
        "<b>Role & Academic Purpose:</b> Acts as an autonomous 24/7 technical mentor that guides students through complex code debugging, mathematical proofs, and mock behavioral interviews without giving away direct answers immediately.",
        body_style
    ))
    story.append(Paragraph("• <b>Context-Aware Mentorship:</b> Retains candidate's target role, current code attempt, and difficulty level in conversational prompt context.", bullet_style))
    story.append(Paragraph("• <b>Socratic Guidance Principle:</b> Uses Socratic questioning to guide students toward the right algorithmic approach rather than merely generating copy-paste solutions.", bullet_style))
    story.append(Spacer(1, 10))

    # =========================================================================
    # SECTION 3: VIVA & TEACHER EVALUATION DEFENSE CHEAT SHEET
    # =========================================================================
    story.append(Paragraph("3. Examiner Evaluation & Viva Defense Q&A Guide", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#0284c7'), spaceAfter=8))
    story.append(Paragraph(
        "This section prepares the student with definitive, academically rigorous answers to the most common questions "
        "posed by professors, external examiners, and technical project evaluation committees.",
        body_style
    ))
    story.append(Spacer(1, 4))

    viva_qa = [
        ("Q1: What is the primary problem statement and motivation behind Code Quest?",
         "A: Traditional placement preparation is fragmented across disjointed websites (one for DSA, another for SQL, separate PDFs for MCQs, and expensive standalone ATS tools). Furthermore, students lack realistic placement simulations and real-time guidance. Code Quest unifies all five pillars of technical placement into a cohesive, gamified, and state-synchronized platform powered by AI."),

        ("Q2: Why did you choose FastAPI over traditional Django or Flask for the backend?",
         "A: FastAPI is built on top of Starlette and Pydantic, providing native asynchronous ASGI concurrency capable of matching Node.js/Go speeds. It generates automatic interactive OpenAPI (Swagger) documentation, enforces strict type validation at runtime, and easily handles concurrent long-running tasks like code execution and AI streaming with negligible CPU overhead."),

        ("Q3: How do you prevent malicious user code (e.g. system shut down, infinite loops) from crashing the server?",
         "A: Code execution is strictly separated from the main API process. Code runs in an isolated subprocess sandbox with explicit resource limitations: a 5-second execution timeout kills infinite loops, execution runs in an isolated temporary directory, system environment variables are scrubbed, and forbidden system commands (e.g., 'os.system', 'subprocess', 'fork') are blocked prior to compilation."),

        ("Q4: How does the Dynamic Readiness algorithm work on the Dashboard?",
         "A: Rather than displaying fake static numbers, the dashboard uses an event-driven telemetry tracker (activityTracker.ts). It computes: Readiness = (Arena * 0.35) + (SQL * 0.25) + (MCQs * 0.20) + (Brainteasers * 0.10) + (Assessments * 0.10). When any problem or query is executed, an event (cq_activity_updated) updates local storage and animates the SVG circular HUD ring dynamically."),

        ("Q5: How is the ATS Resume score calculated in the Resume module?",
         "A: The backend uses PyPDF2/pdfminer to parse PDF binary streams into normalized text. It extracts technical tokens and compares them against role-specific skill dictionaries using cosine similarity and keyword frequency. It also evaluates action-oriented power verbs, section structure (Experience, Education, Projects), and detects quantifiable achievements (e.g., percentages, dollar amounts, scale metrics)."),

        ("Q6: How does the application support both Desktop browser and Mobile app experiences?",
         "A: The frontend is responsive by design using Tailwind CSS fluid breakpoints. In addition, Code Quest is configured as a Progressive Web App (PWA) with a manifest.json and Service Worker, enabling one-click desktop installation ('Install App' button) and full standalone window execution without address bar clutter."),

        ("Q7: How did you implement live public hosting using Cloudflare Tunnels?",
         "A: Instead of opening insecure router ports or paying for static public IPs, we integrated Cloudflare Quick Tunnels (cloudflared.exe). The tunnel establishes an outbound-only encrypted QUIC/HTTP2 connection to Cloudflare's global edge network, routing public HTTPS traffic directly to our local Vite frontend (port 5173) and FastAPI backend (port 8000)."),

        ("Q8: How does the system handle database storage and persistence?",
         "A: The system uses SQLAlchemy ORM configured with SQLite in WAL (Write-Ahead Logging) mode for local high-concurrency development, with seamless zero-code configuration switching to PostgreSQL in production environments via environment variables."),

        ("Q9: What future enhancements are planned for Code Quest 2.0?",
         "A: Future milestones include: (1) Real-time WebRTC audio/video AI mock interviewer with facial expression analysis, (2) WebAssembly (WASM) in-browser code execution for zero-latency C++ compilation, and (3) Native iOS and Android application store deployments using React Native.")
    ]

    for q, a in viva_qa:
        story.append(Paragraph(f"<b>{q}</b>", q_style))
        story.append(Paragraph(a, a_style))

    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#0284c7'), spaceAfter=8))
    story.append(Paragraph(
        "<b>Summary for Evaluator:</b> Code Quest demonstrates mastery of full-stack engineering, asynchronous systems programming, "
        "database design, secure code sandboxing, AI integration, and production deployment. It stands ready for university evaluation "
        "and major project viva defense.",
        meta_style
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] PDF generated at: {pdf_filename}")
    return pdf_filename

if __name__ == "__main__":
    build_pdf()

