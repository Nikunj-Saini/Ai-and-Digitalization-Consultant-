import os
import logging
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from app.config import settings

logger = logging.getLogger("digitalization_advisor.diagram_generator")

# Visual Theme Palette (Modern Executive Emerald & Slate)
COLOR_EMERALD_DARK = "#0F766E"
COLOR_EMERALD_MAIN = "#10B981"
COLOR_EMERALD_LIGHT = "#D1FAE5"
COLOR_SLATE_DARK = "#0F172A"
COLOR_SLATE_CARD = "#1E293B"
COLOR_SLATE_TEXT = "#334155"
COLOR_WHITE = "#FFFFFF"
COLOR_RED_ACCENT = "#EF4444"
COLOR_RED_BG = "#FEF2F2"
COLOR_BLUE_BG = "#EFF6FF"
COLOR_BLUE_BORDER = "#3B82F6"

def get_diagrams_dir():
    diagrams_dir = os.path.join(settings.EXPORTS_DIR, "diagrams")
    os.makedirs(diagrams_dir, exist_ok=True)
    return diagrams_dir

def generate_process_flowchart(session_id: str, sol_name: str, workflow_steps: list) -> str:
    """
    Generates a high-resolution, modern process flowchart image (PNG)
    depicting the step-by-step solution execution workflow.
    """
    try:
        steps = workflow_steps or [
            {"step": "Step 1", "title": "Data Intake & Ingestion", "description": "Captures raw business inputs & parameters"},
            {"step": "Step 2", "title": "AI Logic Processing", "description": "Executes core AI transformation models"},
            {"step": "Step 3", "title": "Validation & Rule Check", "description": "Ensures governance, quality & accuracy"},
            {"step": "Step 4", "title": "Automated Execution", "description": "Triggers automated workflows & updates"},
            {"step": "Step 5", "title": "Reporting & Analytics", "description": "Generates real-time executive BRD/PRD stats"}
        ]
        
        num_steps = len(steps)
        fig_width = max(10, num_steps * 2.6)
        fig_height = 4.2
        fig, ax = plt.subplots(figsize=(fig_width, fig_height), dpi=300)
        ax.set_facecolor("#F8FAFC")
        fig.patch.set_facecolor("#F8FAFC")
        
        ax.set_xlim(0, num_steps * 3.0 + 0.5)
        ax.set_ylim(0, 4.5)
        ax.axis('off')

        # Header Title Banner
        title_box = patches.FancyBboxPatch(
            (0.5, 3.6), num_steps * 3.0 - 0.5, 0.6,
            boxstyle="round,pad=0.03,rounding_size=0.1",
            facecolor=COLOR_EMERALD_DARK, edgecolor="none"
        )
        ax.add_patch(title_box)
        ax.text(
            (num_steps * 3.0) / 2.0, 3.9,
            f"PROCESS FLOWCHART: {sol_name.upper()[:50]}",
            color=COLOR_WHITE, fontsize=11, fontweight="bold", ha="center", va="center"
        )

        # Draw Flowchart Steps
        box_width = 2.4
        box_height = 2.2
        y_pos = 1.0

        for i, step_info in enumerate(steps):
            x_pos = 0.5 + i * 3.0
            
            # Step Card Box
            card = patches.FancyBboxPatch(
                (x_pos, y_pos), box_width, box_height,
                boxstyle="round,pad=0.05,rounding_size=0.15",
                facecolor=COLOR_WHITE, edgecolor=COLOR_EMERALD_DARK, linewidth=1.5
            )
            ax.add_patch(card)
            
            # Step Badge Header
            badge = patches.FancyBboxPatch(
                (x_pos, y_pos + box_height - 0.5), box_width, 0.5,
                boxstyle="round,pad=0.02,rounding_size=0.1",
                facecolor=COLOR_EMERALD_LIGHT, edgecolor="none"
            )
            ax.add_patch(badge)
            
            step_num_str = step_info.get("step", f"Step {i+1}")
            step_title_str = step_info.get("title", f"Stage {i+1}")
            step_desc_str = step_info.get("description", "")
            if len(step_desc_str) > 65:
                step_desc_str = step_desc_str[:62] + "..."

            # Text rendering
            ax.text(x_pos + box_width/2.0, y_pos + box_height - 0.25, f"[{step_num_str}] {step_title_str}",
                    color=COLOR_EMERALD_DARK, fontsize=8.5, fontweight="bold", ha="center", va="center")

            # Description (wrapped)
            words = step_desc_str.split(" ")
            lines = []
            curr_line = ""
            for w in words:
                if len(curr_line + " " + w) <= 22:
                    curr_line += (" " if curr_line else "") + w
                else:
                    lines.append(curr_line)
                    curr_line = w
            if curr_line:
                lines.append(curr_line)
            
            desc_formatted = "\n".join(lines[:4])
            ax.text(x_pos + box_width/2.0, y_pos + (box_height - 0.6)/2.0, desc_formatted,
                    color=COLOR_SLATE_TEXT, fontsize=7.5, ha="center", va="center")

            # Connector Arrow to next step
            if i < num_steps - 1:
                arrow_start_x = x_pos + box_width
                arrow_end_x = x_pos + 3.0
                ax.annotate(
                    "", xy=(arrow_end_x - 0.1, y_pos + box_height/2.0),
                    xytext=(arrow_start_x + 0.1, y_pos + box_height/2.0),
                    arrowprops=dict(arrowstyle="-|>", color=COLOR_EMERALD_DARK, lw=2.5, mutation_scale=15)
                )

        plt.tight_layout()
        out_path = os.path.join(get_diagrams_dir(), f"flowchart_{session_id[:8]}.png")
        plt.savefig(out_path, format="png", bbox_inches="tight", dpi=300)
        plt.close(fig)
        logger.info(f"Generated process flowchart image at {out_path}")
        return out_path
    except Exception as e:
        logger.error(f"Error generating process flowchart diagram: {e}")
        return ""

def generate_architecture_diagram(session_id: str, sol_name: str, technologies: list) -> str:
    """
    Generates a high-resolution Technical System Architecture Diagram image (PNG).
    """
    try:
        fig, ax = plt.subplots(figsize=(10, 5.5), dpi=300)
        ax.set_facecolor("#F8FAFC")
        fig.patch.set_facecolor("#F8FAFC")
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 7)
        ax.axis('off')

        # Header Title
        title_box = patches.FancyBboxPatch(
            (0.5, 6.2), 9.0, 0.6,
            boxstyle="round,pad=0.03,rounding_size=0.1",
            facecolor=COLOR_SLATE_CARD, edgecolor="none"
        )
        ax.add_patch(title_box)
        ax.text(5.0, 6.5, f"SYSTEM ARCHITECTURE & TECHNICAL STACK: {sol_name.upper()[:45]}",
                color=COLOR_WHITE, fontsize=10.5, fontweight="bold", ha="center", va="center")

        # Architectural Layers
        layers = [
            {"title": "1. Client & Presentation Layer", "bg": "#F0FDF4", "border": COLOR_EMERALD_DARK,
             "items": ["Web Application Interface", "Interactive Dashboard", "Role-Based Access Control"]},
            {"title": "2. API Gateway & Business Logic Layer", "bg": "#EFF6FF", "border": COLOR_BLUE_BORDER,
             "items": ["FastAPI Microservice Endpoints", "Pydantic Schema Validation", "Session State Manager"]},
            {"title": "3. AI Core Engine & Intelligence Services", "bg": "#FEF3C7", "border": "#D97706",
             "items": [f"Google Gemini Model Engine"] + (technologies[:2] if technologies else ["Automated Reasoning Services"])},
            {"title": "4. Data Storage & Export Generation Layer", "bg": "#F3E8FF", "border": "#7E22CE",
             "items": ["MySQL Database Store", "Redis Cache / State Store", "python-docx Executive Report Engine"]}
        ]

        y_positions = [4.8, 3.4, 2.0, 0.6]
        for idx, layer in enumerate(layers):
            y_pos = y_positions[idx]
            
            # Layer Box
            box = patches.FancyBboxPatch(
                (0.5, y_pos), 9.0, 1.1,
                boxstyle="round,pad=0.03,rounding_size=0.1",
                facecolor=layer["bg"], edgecolor=layer["border"], linewidth=1.5
            )
            ax.add_patch(box)
            
            # Title
            ax.text(0.7, y_pos + 0.8, layer["title"], color=layer["border"], fontsize=9.5, fontweight="bold", va="center")
            
            # Items (render inside layer)
            items_str = "   •   ".join(layer["items"])
            if len(items_str) > 85:
                items_str = items_str[:82] + "..."
            ax.text(0.7, y_pos + 0.35, items_str, color=COLOR_SLATE_TEXT, fontsize=8, va="center")

            # Connector Arrow down to next layer
            if idx < len(layers) - 1:
                ax.annotate(
                    "", xy=(5.0, y_positions[idx+1] + 1.1), xytext=(5.0, y_pos),
                    arrowprops=dict(arrowstyle="-|>", color=COLOR_SLATE_CARD, lw=1.8, mutation_scale=12)
                )

        plt.tight_layout()
        out_path = os.path.join(get_diagrams_dir(), f"architecture_{session_id[:8]}.png")
        plt.savefig(out_path, format="png", bbox_inches="tight", dpi=300)
        plt.close(fig)
        logger.info(f"Generated architecture diagram image at {out_path}")
        return out_path
    except Exception as e:
        logger.error(f"Error generating architecture diagram: {e}")
        return ""

def generate_roadmap_timeline(session_id: str, phases: list) -> str:
    """
    Generates a high-resolution Phased Implementation Roadmap Chart (PNG).
    """
    try:
        phases_data = phases or [
            {"phase": "Phase 1: Discovery & Architecture", "duration": "Weeks 1-2", "deliverables": "System design, setup & environment provisioning"},
            {"phase": "Phase 2: Core Development & Integration", "duration": "Weeks 3-6", "deliverables": "AI model integration, API setup & backend build"},
            {"phase": "Phase 3: Testing & Security UAT", "duration": "Weeks 7-8", "deliverables": "User acceptance testing, security audits & benchmarks"},
            {"phase": "Phase 4: Deployment & Enterprise Scale", "duration": "Weeks 9-10", "deliverables": "Production rollout, monitoring & SLA operationalization"}
        ]
        
        fig, ax = plt.subplots(figsize=(10, 4.5), dpi=300)
        ax.set_facecolor("#F8FAFC")
        fig.patch.set_facecolor("#F8FAFC")
        ax.set_xlim(0, 10)
        ax.set_ylim(0, len(phases_data) + 1.5)
        ax.axis('off')

        # Header Title
        title_box = patches.FancyBboxPatch(
            (0.5, len(phases_data) + 0.6), 9.0, 0.6,
            boxstyle="round,pad=0.03,rounding_size=0.1",
            facecolor=COLOR_EMERALD_DARK, edgecolor="none"
        )
        ax.add_patch(title_box)
        ax.text(5.0, len(phases_data) + 0.9, "PHASED IMPLEMENTATION DELIVERY ROADMAP & MILESTONES",
                color=COLOR_WHITE, fontsize=10.5, fontweight="bold", ha="center", va="center")

        y_base = len(phases_data) - 0.3
        for i, p in enumerate(phases_data):
            y_pos = y_base - i * 1.0
            
            p_name = p.get("phase", f"Phase {i+1}")
            p_dur = p.get("duration", "")
            p_deliv = p.get("deliverables", "")
            if len(p_deliv) > 55:
                p_deliv = p_deliv[:52] + "..."

            # Phase Card Bar
            bar_color = COLOR_EMERALD_MAIN if i % 2 == 0 else COLOR_EMERALD_DARK
            bar = patches.FancyBboxPatch(
                (0.5, y_pos), 9.0, 0.7,
                boxstyle="round,pad=0.03,rounding_size=0.1",
                facecolor=COLOR_WHITE, edgecolor=bar_color, linewidth=1.5
            )
            ax.add_patch(bar)

            # Left Badge
            badge = patches.FancyBboxPatch(
                (0.5, y_pos), 2.8, 0.7,
                boxstyle="round,pad=0.03,rounding_size=0.1",
                facecolor=bar_color, edgecolor="none"
            )
            ax.add_patch(badge)

            ax.text(1.9, y_pos + 0.35, f"{p_name}\n[{p_dur}]", color=COLOR_WHITE, fontsize=8, fontweight="bold", ha="center", va="center")
            ax.text(3.5, y_pos + 0.35, f"Deliverables: {p_deliv}", color=COLOR_SLATE_TEXT, fontsize=8, va="center")

        plt.tight_layout()
        out_path = os.path.join(get_diagrams_dir(), f"roadmap_{session_id[:8]}.png")
        plt.savefig(out_path, format="png", bbox_inches="tight", dpi=300)
        plt.close(fig)
        logger.info(f"Generated roadmap timeline image at {out_path}")
        return out_path
    except Exception as e:
        logger.error(f"Error generating roadmap timeline: {e}")
        return ""

def generate_current_vs_target_diagram(session_id: str, current_state: str, target_state: str) -> str:
    """
    Generates a side-by-side Process Comparison Flow Chart image (PNG).
    """
    try:
        fig, ax = plt.subplots(figsize=(10, 4.0), dpi=300)
        ax.set_facecolor("#F8FAFC")
        fig.patch.set_facecolor("#F8FAFC")
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 4.5)
        ax.axis('off')

        # Header Title
        title_box = patches.FancyBboxPatch(
            (0.5, 3.6), 9.0, 0.6,
            boxstyle="round,pad=0.03,rounding_size=0.1",
            facecolor=COLOR_SLATE_DARK, edgecolor="none"
        )
        ax.add_patch(title_box)
        ax.text(5.0, 3.9, "OPERATIONAL TRANSFORMATION: CURRENT vs TARGET STATE",
                color=COLOR_WHITE, fontsize=10.5, fontweight="bold", ha="center", va="center")

        # Current State Box (Left - Warning Red/Amber accent)
        curr_box = patches.FancyBboxPatch(
            (0.5, 0.6), 3.8, 2.6,
            boxstyle="round,pad=0.05,rounding_size=0.15",
            facecolor=COLOR_RED_BG, edgecolor=COLOR_RED_ACCENT, linewidth=1.5
        )
        ax.add_patch(curr_box)
        ax.text(2.4, 2.8, "AS-IS (CURRENT STATE)", color=COLOR_RED_ACCENT, fontsize=9.5, fontweight="bold", ha="center")
        
        curr_text = current_state or "Manual overhead, disparate spreadsheets, high friction & human error."
        if len(curr_text) > 110:
            curr_text = curr_text[:107] + "..."
        ax.text(2.4, 1.6, curr_text, color=COLOR_SLATE_TEXT, fontsize=8, ha="center", va="center", wrap=True)

        # Transformation Arrow (Center)
        ax.annotate(
            "", xy=(5.5, 1.9), xytext=(4.5, 1.9),
            arrowprops=dict(arrowstyle="-|>", color=COLOR_EMERALD_DARK, lw=3.0, mutation_scale=20)
        )
        ax.text(5.0, 2.2, "AI DIGITAL\nTRANSFORMATION", color=COLOR_EMERALD_DARK, fontsize=7.5, fontweight="bold", ha="center")

        # Target State Box (Right - Emerald Success Accent)
        target_box = patches.FancyBboxPatch(
            (5.7, 0.6), 3.8, 2.6,
            boxstyle="round,pad=0.05,rounding_size=0.15",
            facecolor=COLOR_EMERALD_LIGHT, edgecolor=COLOR_EMERALD_DARK, linewidth=1.5
        )
        ax.add_patch(target_box)
        ax.text(7.6, 2.8, "TO-BE (TARGET STATE)", color=COLOR_EMERALD_DARK, fontsize=9.5, fontweight="bold", ha="center")

        targ_text = target_state or "Automated execution, real-time metrics, automated BRD/PRD, optimized ROI."
        if len(targ_text) > 110:
            targ_text = targ_text[:107] + "..."
        ax.text(7.6, 1.6, targ_text, color=COLOR_SLATE_TEXT, fontsize=8, ha="center", va="center", wrap=True)

        plt.tight_layout()
        out_path = os.path.join(get_diagrams_dir(), f"comparison_{session_id[:8]}.png")
        plt.savefig(out_path, format="png", bbox_inches="tight", dpi=300)
        plt.close(fig)
        logger.info(f"Generated current vs target diagram image at {out_path}")
        return out_path
    except Exception as e:
        logger.error(f"Error generating comparison diagram: {e}")
        return ""
