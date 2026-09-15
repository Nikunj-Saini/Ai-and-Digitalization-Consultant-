import os
import re
import logging
import textwrap
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
    depicting the step-by-step solution execution workflow with clean typography,
    no overlapping headers, and nicely formatted word wrapping.
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
        step_gap = 3.2
        box_width = 2.7
        box_height = 2.9
        
        fig_width = max(12, num_steps * 3.2)
        fig_height = 5.2
        fig, ax = plt.subplots(figsize=(fig_width, fig_height), dpi=300)
        ax.set_facecolor("#F8FAFC")
        fig.patch.set_facecolor("#F8FAFC")
        
        total_x = num_steps * step_gap + 0.4
        ax.set_xlim(0, total_x)
        ax.set_ylim(0, 5.2)
        ax.axis('off')

        # Header Title Banner
        title_box = patches.FancyBboxPatch(
            (0.5, 4.3), total_x - 1.0, 0.6,
            boxstyle="round,pad=0.03,rounding_size=0.1",
            facecolor=COLOR_EMERALD_DARK, edgecolor="none"
        )
        ax.add_patch(title_box)
        
        clean_sol_name = sol_name.upper()[:50]
        ax.text(
            total_x / 2.0, 4.6,
            f"PROCESS FLOWCHART: {clean_sol_name}",
            color=COLOR_WHITE, fontsize=11, fontweight="bold", ha="center", va="center"
        )

        # Draw Flowchart Steps
        y_pos = 0.9

        for i, step_info in enumerate(steps):
            x_pos = 0.5 + i * step_gap
            
            # Step Card Container Box
            card = patches.FancyBboxPatch(
                (x_pos, y_pos), box_width, box_height,
                boxstyle="round,pad=0.05,rounding_size=0.15",
                facecolor=COLOR_WHITE, edgecolor=COLOR_EMERALD_DARK, linewidth=1.8
            )
            ax.add_patch(card)
            
            # Top Header Badge Box (Height = 0.85)
            badge = patches.FancyBboxPatch(
                (x_pos, y_pos + box_height - 0.85), box_width, 0.85,
                boxstyle="round,pad=0.02,rounding_size=0.1",
                facecolor=COLOR_EMERALD_LIGHT, edgecolor="none"
            )
            ax.add_patch(badge)
            
            # Parse step number and title cleanly without string duplication
            raw_title = str(step_info.get("title") or step_info.get("step") or f"Stage {i+1}")
            # Strip out any repeated "[Step X]" or "Step X:" prefixes from the title string
            clean_title = re.sub(r'^\[?Step\s*\d+\]?\s*:?\s*', '', raw_title, flags=re.IGNORECASE).strip()
            if not clean_title:
                clean_title = f"Task Execution Stage {i+1}"

            raw_desc = str(step_info.get("description") or step_info.get("desc") or "")

            # Format Step Number Badge Text (e.g. STEP 01)
            ax.text(
                x_pos + box_width / 2.0, y_pos + box_height - 0.24,
                f"STEP 0{i+1}",
                color=COLOR_EMERALD_DARK, fontsize=8.2, fontweight="bold", ha="center", va="center"
            )

            # Format Step Title (Line 2 & 3 of Header Badge - wrapped max 16 chars)
            wrapped_title_lines = textwrap.wrap(clean_title, width=16)
            title_formatted = "\n".join(wrapped_title_lines[:2])
            ax.text(
                x_pos + box_width / 2.0, y_pos + box_height - 0.56,
                title_formatted,
                color=COLOR_SLATE_DARK, fontsize=7.2, fontweight="bold", ha="center", va="center", multialignment="center"
            )

            # Description (wrapped cleanly inside card body, max 18 chars per line, up to 5 lines)
            wrapped_desc_lines = textwrap.wrap(raw_desc, width=18)
            desc_formatted = "\n".join(wrapped_desc_lines[:5])
            ax.text(
                x_pos + box_width / 2.0, y_pos + (box_height - 0.95) / 2.0,
                desc_formatted,
                color=COLOR_SLATE_TEXT, fontsize=7.0, ha="center", va="center", multialignment="center"
            )

            # Connector Arrow to next step
            if i < num_steps - 1:
                arrow_start_x = x_pos + box_width
                arrow_end_x = x_pos + step_gap
                ax.annotate(
                    "", xy=(arrow_end_x - 0.08, y_pos + box_height / 2.0),
                    xytext=(arrow_start_x + 0.08, y_pos + box_height / 2.0),
                    arrowprops=dict(arrowstyle="-|>", color=COLOR_EMERALD_DARK, lw=2.5, mutation_scale=16)
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
            
            # Items (render inside layer with word wrapping)
            items_str = "   •   ".join(layer["items"])
            wrapped_items = "\n".join(textwrap.wrap(items_str, width=78)[:2])
            ax.text(0.7, y_pos + 0.35, wrapped_items, color=COLOR_SLATE_TEXT, fontsize=7.8, va="center")

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
            
            wrapped_deliv = "\n".join(textwrap.wrap(f"Deliverables: {p_deliv}", width=48)[:2])

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
            ax.text(3.5, y_pos + 0.35, wrapped_deliv, color=COLOR_SLATE_TEXT, fontsize=7.8, va="center")

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
    Generates a side-by-side Process Comparison Flow Chart image (PNG)
    with clean headers and multiline text wrapping to prevent any overflow.
    """
    try:
        fig, ax = plt.subplots(figsize=(10, 4.4), dpi=300)
        ax.set_facecolor("#F8FAFC")
        fig.patch.set_facecolor("#F8FAFC")
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 4.5)
        ax.axis('off')

        # Header Title Banner
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
            (0.5, 0.5), 3.8, 2.8,
            boxstyle="round,pad=0.05,rounding_size=0.15",
            facecolor=COLOR_RED_BG, edgecolor=COLOR_RED_ACCENT, linewidth=1.5
        )
        ax.add_patch(curr_box)

        # Header Badge inside Left Box
        curr_badge = patches.FancyBboxPatch(
            (0.5, 2.75), 3.8, 0.55,
            boxstyle="round,pad=0.02,rounding_size=0.1",
            facecolor="#FEE2E2", edgecolor="none"
        )
        ax.add_patch(curr_badge)
        ax.text(2.4, 3.0, "AS-IS (CURRENT STATE)", color=COLOR_RED_ACCENT, fontsize=9.0, fontweight="bold", ha="center", va="center")
        
        curr_text = current_state or "Manual overhead, disparate spreadsheets, high friction & human error."
        wrapped_curr = "\n".join(textwrap.wrap(curr_text, width=28)[:6])
        ax.text(2.4, 1.5, wrapped_curr, color=COLOR_SLATE_TEXT, fontsize=7.8, ha="center", va="center", multialignment="center")

        # Transformation Arrow (Center)
        ax.annotate(
            "", xy=(5.5, 1.9), xytext=(4.5, 1.9),
            arrowprops=dict(arrowstyle="-|>", color=COLOR_EMERALD_DARK, lw=3.0, mutation_scale=20)
        )
        ax.text(5.0, 2.3, "AI DIGITAL\nTRANSFORMATION", color=COLOR_EMERALD_DARK, fontsize=7.5, fontweight="bold", ha="center", va="center", multialignment="center")

        # Target State Box (Right - Emerald Success Accent)
        target_box = patches.FancyBboxPatch(
            (5.7, 0.5), 3.8, 2.8,
            boxstyle="round,pad=0.05,rounding_size=0.15",
            facecolor=COLOR_EMERALD_LIGHT, edgecolor=COLOR_EMERALD_DARK, linewidth=1.5
        )
        ax.add_patch(target_box)

        # Header Badge inside Right Box
        targ_badge = patches.FancyBboxPatch(
            (5.7, 2.75), 3.8, 0.55,
            boxstyle="round,pad=0.02,rounding_size=0.1",
            facecolor="#A7F3D0", edgecolor="none"
        )
        ax.add_patch(targ_badge)
        ax.text(7.6, 3.0, "TO-BE (TARGET STATE)", color=COLOR_EMERALD_DARK, fontsize=9.0, fontweight="bold", ha="center", va="center")

        targ_text = target_state or "Automated execution, real-time metrics, automated BRD/PRD, optimized ROI."
        wrapped_targ = "\n".join(textwrap.wrap(targ_text, width=28)[:6])
        ax.text(7.6, 1.5, wrapped_targ, color=COLOR_SLATE_TEXT, fontsize=7.8, ha="center", va="center", multialignment="center")

        plt.tight_layout()
        out_path = os.path.join(get_diagrams_dir(), f"comparison_{session_id[:8]}.png")
        plt.savefig(out_path, format="png", bbox_inches="tight", dpi=300)
        plt.close(fig)
        logger.info(f"Generated current vs target diagram image at {out_path}")
        return out_path
    except Exception as e:
        logger.error(f"Error generating comparison diagram: {e}")
        return ""
