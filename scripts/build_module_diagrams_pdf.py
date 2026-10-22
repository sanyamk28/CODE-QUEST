import os
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

class NumberedCanvas(canvas.Canvas):
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
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#475569"))
        
        # Header (Only on page 2 and later)
        if self._pageNumber > 1:
            self.drawString(40, letter[0] - 25, "CODE QUEST — System Module & Architectural Design Diagrams")
            self.setFont("Helvetica", 8)
            self.drawRightString(letter[1] - 40, letter[0] - 25, "Engineering Documentation")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.75)
            self.line(40, letter[0] - 30, letter[1] - 40, letter[0] - 30)

        # Footer
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.75)
        self.line(40, 30, letter[1] - 40, 30)
        self.setFont("Helvetica", 8)
        self.drawString(40, 20, "Code Quest: Placement Preparation & Assessment Platform | Confidential Evaluation Copy")
        self.drawRightString(letter[1] - 40, 20, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def build_pdf():
    output_pdf = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs", "Code_Quest_Module_Design_Diagrams.pdf"))
    
    # Landscape Letter: 792 x 612 pt
    doc = SimpleDocTemplate(
        output_pdf,
        pagesize=landscape(letter),
        leftMargin=40,
        rightMargin=40,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f172a'),
        alignment=TA_LEFT
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#2563eb'),
        alignment=TA_LEFT
    )

    caption_style = ParagraphStyle(
        'Caption',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#334155'),
        alignment=TA_CENTER
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white,
        alignment=TA_LEFT
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#1e293b'),
        alignment=TA_LEFT
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#0f172a'),
        alignment=TA_LEFT
    )

    badge_complete = ParagraphStyle(
        'BadgeComplete',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#15803d'),
        alignment=TA_CENTER
    )

    story = []

    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    arch_img_path = os.path.join(base_dir, "docs", "images", "system_architecture_diagram.jpg")
    use_case_img_path = os.path.join(base_dir, "docs", "images", "use_case_diagram.jpg")
    dfd_img_path = os.path.join(base_dir, "docs", "images", "data_flow_diagram.jpg")

    # =========================================================================
    # PAGE 1: SYSTEM MODULE ARCHITECTURE DIAGRAM
    # =========================================================================
    story.append(Paragraph("CODE QUEST — SYSTEM MODULE ARCHITECTURE", title_style))
    story.append(Paragraph("Placement Preparation, Assessment, and Multiplayer Hiring Ecosystem | Architectural Design Diagram", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563eb"), spaceBefore=4, spaceAfter=8))

    if os.path.exists(arch_img_path):
        # 16:9 ratio: 712 width x 400.5 height
        story.append(Image(arch_img_path, width=712, height=400))
        story.append(Spacer(1, 6))
        story.append(Paragraph("<b>Figure 1:</b> Multi-Tier System Module Architecture (Client Layer, FastAPI Gateway, Core Services, and Distributed Data Tier)", caption_style))
    
    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: UML USE CASE DIAGRAM
    # =========================================================================
    story.append(Paragraph("CODE QUEST — UML USE CASE DIAGRAM", title_style))
    story.append(Paragraph("Actor Catalog & Functional System Boundaries (Students, Institutional Admins, Sandbox Judge, AI Gemini, Redis)", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0f766e"), spaceBefore=4, spaceAfter=8))

    if os.path.exists(use_case_img_path):
        story.append(Image(use_case_img_path, width=712, height=400))
        story.append(Spacer(1, 6))
        story.append(Paragraph("<b>Figure 2:</b> Formal UML Use Case Diagram mapping 16 Functional Use Cases across System Actors", caption_style))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: DATA FLOW DIAGRAM (DFD)
    # =========================================================================
    story.append(Paragraph("CODE QUEST — DATA FLOW DIAGRAMS (DFD)", title_style))
    story.append(Paragraph("Gane & Sarson Multi-Level Decompositions: Level 0 Context Diagram, Level 1 Core Processes, Level 2 Pipelines", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#7c3aed"), spaceBefore=4, spaceAfter=8))

    if os.path.exists(dfd_img_path):
        story.append(Image(dfd_img_path, width=712, height=400))
        story.append(Spacer(1, 6))
        story.append(Paragraph("<b>Figure 3:</b> Complete Multi-Level Data Flow Diagram (Level 0 Context, Level 1 Decomposition P1-P8, Level 2 Execution Pipelines)", caption_style))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 4: MODULE STATUS GRID & IMPLEMENTATION SPECIFICATION
    # =========================================================================
    story.append(Paragraph("CODE QUEST — COMPLETE MODULE STATUS GRID", title_style))
    story.append(Paragraph("Systematic Implementation, Test Verification, and Production Readiness Audit", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1e3a8a"), spaceBefore=4, spaceAfter=8))

    grid_data = [
        [
            Paragraph("<b>#</b>", table_header_style),
            Paragraph("<b>Module Name</b>", table_header_style),
            Paragraph("<b>Architectural Responsibility & Features</b>", table_header_style),
            Paragraph("<b>Technologies & Stacks</b>", table_header_style),
            Paragraph("<b>Verification / Tests</b>", table_header_style),
            Paragraph("<b>Status</b>", table_header_style)
        ],
        [
            Paragraph("1", table_cell_bold),
            Paragraph("<b>Auth & RBAC</b>", table_cell_bold),
            Paragraph("Registration, JWT token pair, Google OAuth 2.0 SSO, bcrypt hashing, profile readiness tracking.", table_cell),
            Paragraph("FastAPI, PyJWT, Passlib, SQLAlchemy", table_cell),
            Paragraph("test_auth.py (5/5 Passing)", table_cell),
            Paragraph("<b>100% COMPLETED</b>", badge_complete)
        ],
        [
            Paragraph("2", table_cell_bold),
            Paragraph("<b>DSA Code Arena & Judge</b>", table_cell_bold),
            Paragraph("Monaco editor, multi-language sandbox judge (Python, C++, Java, JS), timeout & memory constraints.", table_cell),
            Paragraph("Docker Alpine, Subprocess, Cgroups", table_cell),
            Paragraph("test_problems_topics.py (4/4)", table_cell),
            Paragraph("<b>100% COMPLETED</b>", badge_complete)
        ],
        [
            Paragraph("3", table_cell_bold),
            Paragraph("<b>Safe SQL Playground</b>", table_cell_bold),
            Paragraph("Interactive query execution on real schemas, destructive keyword blocking, unconditional transaction ROLLBACK.", table_cell),
            Paragraph("PostgreSQL, SQLite, Transaction API", table_cell),
            Paragraph("test_mcqs_sql.py (4/4 Passing)", table_cell),
            Paragraph("<b>100% COMPLETED</b>", badge_complete)
        ],
        [
            Paragraph("4", table_cell_bold),
            Paragraph("<b>CS Domain Assessments</b>", table_cell_bold),
            Paragraph("Timed MCQs covering OS, DBMS, Networks, OOP, and Aptitude with negative marking penalties.", table_cell),
            Paragraph("FastAPI, Pydantic, SQLAlchemy", table_cell),
            Paragraph("test_mcqs_sql.py (Passing)", table_cell),
            Paragraph("<b>100% COMPLETED</b>", badge_complete)
        ],
        [
            Paragraph("5", table_cell_bold),
            Paragraph("<b>Algorithmic Puzzles</b>", table_cell_bold),
            Paragraph("Lateral thinking & math challenges, 3-tier progressive hint unlocking with XP point deductions.", table_cell),
            Paragraph("FastAPI, React 18, TailwindCSS", table_cell),
            Paragraph("test_puzzles_and_battles.py", table_cell),
            Paragraph("<b>100% COMPLETED</b>", badge_complete)
        ],
        [
            Paragraph("6", table_cell_bold),
            Paragraph("<b>Real-Time Code Battles</b>", table_cell_bold),
            Paragraph("1v1 & multiplayer matchmaking via WebSockets, countdown sync, atomic Redis SETNX distributed lock.", table_cell),
            Paragraph("WebSockets, Redis 7+ SETNX", table_cell),
            Paragraph("test_live_battles_ws.py", table_cell),
            Paragraph("<b>100% COMPLETED</b>", badge_complete)
        ],
        [
            Paragraph("7", table_cell_bold),
            Paragraph("<b>AI Mock Technical Recruiter</b>", table_cell_bold),
            Paragraph("Multi-turn conversational mock interview simulation with Google Gemini 1.5 Flash & rubric scorecards.", table_cell),
            Paragraph("Google Gemini 1.5 Flash API", table_cell),
            Paragraph("ai_features.py (Verified)", table_cell),
            Paragraph("<b>100% COMPLETED</b>", badge_complete)
        ],
        [
            Paragraph("8", table_cell_bold),
            Paragraph("<b>AI ATS Resume Analyzer</b>", table_cell_bold),
            Paragraph("PDF text extraction, semantic role matching, missing keyword gap analysis, STAR bullet rewriter.", table_cell),
            Paragraph("PyPDF, Gemini 1.5 Flash, Celery", table_cell),
            Paragraph("test_resume_ats.py (Passing)", table_cell),
            Paragraph("<b>100% COMPLETED</b>", badge_complete)
        ],
        [
            Paragraph("9", table_cell_bold),
            Paragraph("<b>Admin Telemetry & TPO Portal</b>", table_cell_bold),
            Paragraph("Student readiness indexing, DAU/WAU telemetry, drop-off funnels, curriculum CMS, account moderation.", table_cell),
            Paragraph("React 18, TypeScript, Recharts", table_cell),
            Paragraph("test_admin_and_dashboard.py", table_cell),
            Paragraph("<b>100% COMPLETED</b>", badge_complete)
        ],
        [
            Paragraph("10", table_cell_bold),
            Paragraph("<b>Student Web Client</b>", table_cell_bold),
            Paragraph("Responsive SPA web client, Monaco code editor, dynamic XP/streak gamification, theme customization.", table_cell),
            Paragraph("React 18, Vite, TailwindCSS, Axios", table_cell),
            Paragraph("npm run build (0 errors)", table_cell),
            Paragraph("<b>100% COMPLETED</b>", badge_complete)
        ],
        [
            Paragraph("11", table_cell_bold),
            Paragraph("<b>Mobile Application</b>", table_cell_bold),
            Paragraph("Cross-platform mobile client for on-the-go practice, MCQs, and roadmap progression.", table_cell),
            Paragraph("React Native, Expo SDK, TypeScript", table_cell),
            Paragraph("codequest.apk built", table_cell),
            Paragraph("<b>100% COMPLETED</b>", badge_complete)
        ],
    ]

    t_grid = Table(grid_data, colWidths=[20, 110, 240, 140, 110, 92])
    t_grid.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e3a8a")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_grid)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated PDF successfully at: {output_pdf}")
    return output_pdf

if __name__ == "__main__":
    build_pdf()
