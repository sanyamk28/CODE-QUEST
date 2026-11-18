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
    Two-pass canvas for running header and dynamic 'Page X of Y' footer.
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
            self.drawString(54, letter[1] - 36, "CODE QUEST — UI/UX, Data Analyst & Frontend Viva Defense Manual")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748b"))
            self.drawRightString(letter[0] - 54, letter[1] - 36, "Candidate Defense Guide")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.75)
            self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)

            # Running Footer
            self.line(54, 45, letter[0] - 54, 45)
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748b"))
            self.drawString(54, 32, "Viva & Project Review Submission Copy | Candidate: Sanyam Kumar")
            self.drawRightString(letter[0] - 54, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def build_pdf():
    pdf_filename = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs", "Code_Quest_Viva_Defense_Roles_Guide.pdf"))
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

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=21, leading=25,
        textColor=colors.HexColor('#0a192f'), alignment=TA_CENTER
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=11, leading=15,
        textColor=colors.HexColor('#0284c7'), alignment=TA_CENTER
    )
    meta_style = ParagraphStyle(
        'DocMeta', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8.5, leading=12.5,
        textColor=colors.HexColor('#475569'), alignment=TA_CENTER
    )
    h1_style = ParagraphStyle(
        'SectionH1', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=13, leading=17,
        textColor=colors.HexColor('#0f172a'), spaceBefore=12, spaceAfter=5, keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'ModuleH2', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=10.5, leading=14,
        textColor=colors.HexColor('#0369a1'), spaceBefore=9, spaceAfter=3, keepWithNext=True
    )
    body_style = ParagraphStyle(
        'BodyDark', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8.5, leading=12,
        textColor=colors.HexColor('#1e293b'), alignment=TA_JUSTIFY, spaceAfter=3
    )
    speech_style = ParagraphStyle(
        'SpeechBox', parent=styles['Normal'],
        fontName='Helvetica-Oblique', fontSize=8.5, leading=12,
        textColor=colors.HexColor('#0369a1')
    )
    bullet_style = ParagraphStyle(
        'BulletCustom', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8.5, leading=11.5,
        textColor=colors.HexColor('#334155'), leftIndent=14, firstLineIndent=-10, spaceAfter=2
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
    q_style = ParagraphStyle(
        'QuestionStyle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=8.5, leading=11.5,
        textColor=colors.HexColor('#b91c1c'), spaceBefore=5, keepWithNext=True
    )
    a_style = ParagraphStyle(
        'AnswerStyle', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8.5, leading=11.5,
        textColor=colors.HexColor('#1e293b'), spaceAfter=5
    )

    story = []

    # =========================================================================
    # TITLE & HEADER
    # =========================================================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("PROJECT VIVA & EXAMINER EVALUATION MANUAL", subtitle_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("CODE QUEST: ROLE-SPECIFIC TECHNICAL DEFENSE", title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("Master Guide for UI/UX Design, Data Analysis & Frontend Engineering Dimensions", subtitle_style))
    story.append(Spacer(1, 10))

    # Meta Box
    meta_box = [[
        Paragraph("<b>Target Evaluation Areas:</b> UI/UX Design Engineering &bull; Data Analyst / Engineering &bull; Frontend Development<br/>"
                  "<b>Candidate Author:</b> Sanyam Kumar &nbsp;|&nbsp; <b>Project:</b> Code Quest Ecosystem<br/>"
                  "<b>Purpose:</b> Structured viva answers, technical defense arguments, and exact phrases to tell your teacher.", meta_style)
    ]]
    t_meta = Table(meta_box, colWidths=[content_width])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('ROUNDEDCORNERS', [5, 5, 5, 5]),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 12))

    # Overview
    story.append(Paragraph("<b>Executive Rationale for Your Teacher</b>", h2_style))
    story.append(Paragraph(
        "When an examiner or faculty guide asks: <i>'What was your specific role and contribution in this project?'</i>, "
        "the strongest response demonstrates proficiency across <b>three complementary engineering disciplines</b>: "
        "(1) <b>UI/UX Design</b> (human-computer interaction, cognitive load reduction, aesthetic design systems), "
        "(2) <b>Data Analysis & Engineering</b> (telemetry analytics, SQL relational querying, ATS keyword parsing, statistical scoring), and "
        "(3) <b>Frontend Engineering</b> (React 18, TypeScript type safety, PWA capabilities, state reactivity, Vite bundling). "
        "This guide provides the exact technical terminology, architectural justifications, and defense scripts for each area.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # =========================================================================
    # ROLE 1: UI / UX DESIGN & HUMAN-CENTERED ENGINEERING
    # =========================================================================
    story.append(Paragraph("1. UI/UX Design Engineering & Cognitive Ergonomics", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#0284c7'), spaceAfter=6))

    story.append(Paragraph(
        "<b>Core Concept:</b> In competitive interview preparation, candidates experience high cognitive fatigue. "
        "Our UI/UX design objective was to build an interface that minimizes cognitive friction while maximizing focus, "
        "task completion rates, and emotional engagement through gamified feedback loops.",
        body_style
    ))

    # Speech Box 1
    say_uiux = [[
        Paragraph(
            "<b>🗣️ EXACT SCRIPT TO TELL YOUR TEACHER:</b><br/>"
            "<i>\"Sir/Ma'am, for the UI/UX dimension, I developed a design system called <b>Midnight Cyber</b>. "
            "Instead of standard high-contrast white that causes eye fatigue during prolonged coding sessions, "
            "I chose an obsidian void palette (#06080F) with electric cyan (#00E5FF) and indigo (#6366F1) laser accents. "
            "I applied <b>Fitts's Law</b> and <b>Miller's Law</b> by chunking complex interview prep into bite-sized missions, "
            "using dynamic SVG circular HUD dials to give immediate visual feedback on readiness, and incorporating "
            "haptic/audio rewards via Web Audio API fanfare when problems are solved.\"</i>",
            speech_style
        )
    ]]
    t_say1 = Table(say_uiux, colWidths=[content_width])
    t_say1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#e0f2fe')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#38bdf8')),
        ('ROUNDEDCORNERS', [5, 5, 5, 5]),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_say1)
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>Key UI/UX Pillars Implemented in Code Quest:</b>", h2_style))
    story.append(Paragraph("• <b>Dark Theme Ergonomics (Midnight Cyber):</b> True black/obsidian canvas (#06080F) with 1px laser borders (rgba(0, 229, 255, 0.2)) provides high spatial hierarchy without excessive contrast glare. Meets WCAG 2.1 AA accessibility contrast ratios.", bullet_style))
    story.append(Paragraph("• <b>Visual Hierarchy & Progressive Disclosure:</b> In the Coding Arena, problem statements, starter templates, hints, and test case results are layered. Hints are hidden behind progressive click reveals so students solve problems independently before checking solutions.", bullet_style))
    story.append(Paragraph("• <b>Micro-Interactions & Gamification UX:</b> Streak flame pulse animations, level badge indicators, XP floating chips, and interactive SVG circle dashes keep students motivated to return daily.", bullet_style))
    story.append(Paragraph("• <b>Dual-Mode Viewport Simulator:</b> Users can toggle seamlessly between a Desktop Full-Screen Experience and an embedded Mobile Phone Preview frame with a single click, proving true responsive adaptability.", bullet_style))
    story.append(Spacer(1, 8))

    # =========================================================================
    # ROLE 2: DATA ANALYST & DATA ENGINEERING PERSPECTIVE
    # =========================================================================
    story.append(Paragraph("2. Data Analyst & Data Engineering Dimension", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#0284c7'), spaceAfter=6))

    story.append(Paragraph(
        "<b>Core Concept:</b> Code Quest is fundamentally a <b>data-driven analytics engine</b>. It collects, parses, "
        "aggregates, and evaluates student behavioral telemetry, SQL relational queries, and textual resume data to derive "
        "predictive hiring insights.",
        body_style
    ))

    # Speech Box 2
    say_data = [[
        Paragraph(
            "<b>🗣️ EXACT SCRIPT TO TELL YOUR TEACHER:</b><br/>"
            "<i>\"From a Data Analyst and Data Engineering perspective, Code Quest processes three distinct data streams: "
            "First, in the <b>SQL Lab</b>, I built an interactive SQL engine where students write analytical queries—such as "
            "window functions (RANK(), DENSE_RANK()), aggregations (GROUP BY, HAVING), and multi-table JOINs—against relational schemas. "
            "Second, I built an <b>Activity Telemetry Pipeline</b> (activityTracker.ts) that tracks user solve events in real time "
            "and calculates a weighted multi-factor <b>Readiness Score</b>: 35% DSA + 25% SQL + 20% MCQs + 10% Puzzles + 10% Assessments. "
            "Third, in the <b>ATS Resume Analyzer</b>, we apply text analytics and NLP token matching to compute resume-job description cosine similarity.\"</i>",
            speech_style
        )
    ]]
    t_say2 = Table(say_data, colWidths=[content_width])
    t_say2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0fdf4')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#4ade80')),
        ('ROUNDEDCORNERS', [5, 5, 5, 5]),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_say2)
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>Data Engineering & Analytics Architecture:</b>", h2_style))
    story.append(Paragraph("• <b>Telemetry Event Bus:</b> Custom event dispatcher (<font name='Courier'>cq_activity_updated</font>) captures user submissions without latency, persisting metrics to local storage and backend SQLite/PostgreSQL.", bullet_style))
    story.append(Paragraph("• <b>Relational Data Modeling:</b> Database schemas enforce referential integrity across Users, Problems, Submissions, Badges, and Assessment Sessions with ACID compliance in WAL mode.", bullet_style))
    story.append(Paragraph("• <b>Statistical Readiness Algorithm:</b> Normalizes diverse discrete metrics (queries run, test cases passed, MCQs answered) into an aggregate placement index from 0% to 100%.", bullet_style))
    story.append(Paragraph("• <b>Resume Text Analytics:</b> Parses raw unstructured PDF bytes via PyPDF2, conducts regex token extraction, removes stopwords, and calculates keyword frequency against target job roles (e.g., Data Engineer, Full Stack).", bullet_style))
    story.append(PageBreak())

    # =========================================================================
    # ROLE 3: FRONTEND ENGINEERING & SPA ARCHITECTURE
    # =========================================================================
    story.append(Paragraph("3. Frontend Engineering & Architecture", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#0284c7'), spaceAfter=6))

    story.append(Paragraph(
        "<b>Core Concept:</b> The frontend is built as a production-ready, type-safe Single Page Application (SPA) "
        "leveraging React 18, TypeScript, Tailwind CSS, and Vite, featuring Progressive Web App (PWA) installation.",
        body_style
    ))

    # Speech Box 3
    say_fe = [[
        Paragraph(
            "<b>🗣️ EXACT SCRIPT TO TELL YOUR TEACHER:</b><br/>"
            "<i>\"On the Frontend Engineering side, I architected a modular, component-driven SPA using <b>React 18 and TypeScript</b>. "
            "To achieve sub-second load times, I utilized <b>Vite</b> with dynamic chunk splitting, keeping our initial bundle lightweight. "
            "State is handled cleanly using custom React hooks and event listeners without bloated third-party libraries. "
            "Furthermore, I configured Code Quest as a full <b>Progressive Web App (PWA)</b> with a custom Service Worker and web manifest, "
            "allowing users to install it directly to their Windows/macOS desktop or mobile home screen as a standalone application.\"</i>",
            speech_style
        )
    ]]
    t_say3 = Table(say_fe, colWidths=[content_width])
    t_say3.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#faf5ff')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#c084fc')),
        ('ROUNDEDCORNERS', [5, 5, 5, 5]),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_say3)
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>Frontend Engineering Highlights:</b>", h2_style))
    story.append(Paragraph("• <b>Strict TypeScript Type Safety:</b> Shared types (<font name='Courier'>ActiveTabType</font>, <font name='Courier'>CodingProblem</font>, <font name='Courier'>UserActivityStats</font>) eliminate runtime undefined errors.", bullet_style))
    story.append(Paragraph("• <b>Optimized Code-Splitting:</b> Views like <font name='Courier'>ArenaView</font>, <font name='Courier'>SqlLabView</font>, and <font name='Courier'>ResumeAtsView</font> are bundled into independent chunks, minimizing memory overhead.", bullet_style))
    story.append(Paragraph("• <b>PWA Offline & Installable Experience:</b> Features an <font name='Courier'>InstallPwaButton</font> utilizing the browser's <font name='Courier'>beforeinstallprompt</font> API to deliver a native desktop app look without electron bloat.", bullet_style))
    story.append(Paragraph("• <b>Audio Synthesis via Web Audio API:</b> Generates non-blocking celebratory fanfare frequencies on problem completion without downloading heavy MP3 audio assets.", bullet_style))
    story.append(Spacer(1, 8))

    # =========================================================================
    # ROLE MATRIX COMPARISON TABLE
    # =========================================================================
    story.append(Paragraph("Role Summary Matrix for Project Evaluation", h2_style))
    matrix_data = [
        [Paragraph("<b>Evaluation Dimension</b>", table_header_style), Paragraph("<b>Key Responsibilities & Deliverables</b>", table_header_style), Paragraph("<b>Academic Competencies Demonstrated</b>", table_header_style)],
        [
            Paragraph("<b>UI / UX Designer</b>", table_cell_style),
            Paragraph("• Midnight Cyber Design System<br/>• SVG Dynamic Readiness Gauge<br/>• Mobile/Desktop dual-mode simulator<br/>• Progressive disclosure & micro-animations", table_cell_style),
            Paragraph("HCI principles, accessibility (WCAG AA), visual hierarchy, cognitive load reduction, gamification feedback loops.", table_cell_style)
        ],
        [
            Paragraph("<b>Data Analyst / Eng.</b>", table_cell_style),
            Paragraph("• SQL Lab analytical query visualizer<br/>• Event-driven user telemetry tracker<br/>• Weighted Readiness Index algorithm<br/>• ATS Resume text extraction & token scoring", table_cell_style),
            Paragraph("Relational schema design, SQL window functions, statistical data aggregation, text analytics & keyword parsing.", table_cell_style)
        ],
        [
            Paragraph("<b>Frontend Engineer</b>", table_cell_style),
            Paragraph("• React 18 + TypeScript SPA architecture<br/>• Vite tree-shaking & chunk splitting<br/>• PWA Service Worker & manifest integration<br/>• Web Audio API sound synthesis", table_cell_style),
            Paragraph("Component modularity, type safety, state reactivity, web performance optimization, modern browser APIs.", table_cell_style)
        ],
    ]
    t_matrix = Table(matrix_data, colWidths=[100, 210, 194])
    t_matrix.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#ffffff'), colors.HexColor('#f8fafc')]),
    ]))
    story.append(t_matrix)
    story.append(Spacer(1, 10))

    # =========================================================================
    # VIVA Q&A: COMMON QUESTIONS TEACHERS ASK ON THESE 3 ROLES
    # =========================================================================
    story.append(Paragraph("4. Targeted Teacher Viva Questions & Model Answers", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#0284c7'), spaceAfter=6))

    viva_roles = [
        ("Teacher: Why did you redesign the theme to 'Midnight Cyber' instead of leaving the default dark theme?",
         "Answer: The default dark theme had inconsistent low-contrast grays and generic purple accents that blurred visual focus. The 'Midnight Cyber' design uses an obsidian void (#06080F) with electric cyan (#00E5FF) and indigo (#6366F1) laser borders. This establishes high contrast and distinct spatial layering, guiding the student's eyes straight to mission objectives and code editors, thus reducing visual fatigue during long practice sessions."),

        ("Teacher: As a Data Analyst, how did you ensure the user readiness score is accurate and not just random?",
         "Answer: The readiness score is driven by a mathematical weighting model implemented in activityTracker.ts. It aggregates verified completions: Readiness = (Arena * 0.35) + (SQL * 0.25) + (MCQs * 0.20) + (Brainteasers * 0.10) + (Assessments * 0.10). When a student runs an SQL query or solves a DSA problem, an event updates the persistent state, and the readiness percentage is dynamically recalculated in real-time."),

        ("Teacher: In the SQL Lab, why did you include both simple queries and window functions?",
         "Answer: Campus recruiters from top tier firms specifically filter candidates based on advanced SQL proficiency. Simple SELECT and WHERE queries only test basic syntax; analytical functions like RANK(), DENSE_RANK(), and PARTITION BY test the candidate's understanding of data partitions, ranking, and cumulative aggregates, which are crucial for real-world Data Engineering and Analyst roles."),

        ("Teacher: What frontend performance optimizations did you apply to keep the web app responsive?",
         "Answer: We applied three major frontend optimizations: (1) Vite dynamic import chunking to ensure heavy views like the coding arena load only when requested, (2) Avoiding heavy third-party audio files by using browser-native Web Audio API frequency oscillators for fanfare, and (3) CSS hardware acceleration using Tailwind's transform and opacity utilities for 60fps animations without repainting the DOM."),

        ("Teacher: How does the PWA feature benefit students compared to a normal website?",
         "Answer: A Progressive Web App allows students to install Code Quest onto their desktop or laptop with one click. It runs in its own standalone window without browser tabs or address bar distractions, caches static assets via Service Worker for offline access, and delivers a native desktop application experience without the heavy memory footprint of Electron.")
    ]

    for q, a in viva_roles:
        story.append(Paragraph(f"<b>{q}</b>", q_style))
        story.append(Paragraph(a, a_style))

    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#0284c7'), spaceAfter=6))
    story.append(Paragraph(
        "<b>Summary for Candidate:</b> Presenting these three roles proves to your evaluation committee that you possess "
        "well-rounded full-stack competence: aesthetic design empathy (UI/UX), quantitative analytical acumen (Data Analyst), "
        "and disciplined software engineering rigor (Frontend).",
        meta_style
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] PDF generated at: {pdf_filename}")
    return pdf_filename

if __name__ == "__main__":
    build_pdf()

