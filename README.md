# AINotesStudio ✦ Powered by Gen-Zineers

An Apple-grade, production-ready AI academic productivity platform that analyzes university and college examination questions collectively and generates professionally formatted, exam-oriented A4 PDF notes documents.

- **Official Name**: `AINotesStudio`
- **GitHub Repository**: `ainotesstudio`
- **Cloudflare Pages Project**: `ainotesstudio`
- **Target Deployment URL**: [https://ainotesstudio.pages.dev](https://ainotesstudio.pages.dev/)

---

## 🌟 Key Highlights & Features

### 1. 🛡️ Authentic Gen-Zineers Watermark Integration
- **Image 1 (Gen-Zineers Logo)** is embedded directly as a watermark across **every single page** of the generated PDF document.
- Adjustable opacity (slider from 4% to 30%) and customizable positioning (Center, Diagonal, Corner).
- Fully rendered in both the high-DPI client-side PDF export and native browser vector printing.

### 2. 🧠 Collective Question Analysis Engine
- Analyzes all questions in the bank simultaneously rather than answering in isolation.
- Detects the overarching subject domain (e.g. Computer Organization & Architecture, Industrial Management & Systems Theory, Applied Mathematics).
- Organizes concepts into structured syllabus modules.
- Identifies required mathematical formulations (KaTeX / LaTeX) and plans vector diagrams.

### 3. 🎨 Reference Visual Style Matching (Images 2 & 3)
- **Academic Notebook Aesthetic**: Solid yellow/black module badge headers, red star question numbering, mark tags (e.g. `[10 Marks]`, `[15 Marks]`), and highlighted definition callouts.
- **5 Built-in Academic Templates**:
  1. *Reference Notebook Style* (Exact match to uploaded references)
  2. *Academic Colorful Pro* (Modern college theme with gradient accents)
  3. *Minimal Apple iOS SF* (Typography-first clean SF Pro style)
  4. *Exam Booster High-Yield* (Revision summary cards and warnings)
  5. *University Textbook Classic* (Formal academic layout)

### 4. 📐 Mathematical Typesetting & Vector Diagrams
- **KaTeX Equations**: Typesets complex fractions, roots, summations, and indices (e.g., IEEE-754 value formula, CLA generate/propagate equations, quadratic formulas).
- **Crisp SVG Vector Diagrams**:
  - Von Neumann Stored Program Architecture
  - 3-Stage Instruction Execution Cycle (Fetch-Decode-Execute)
  - 4-Bit Ripple Carry Adder vs Carry Look-Ahead Generator
  - IEEE-754 Single Precision 32-bit Bit Breakdown
  - Dynamic Closed-Loop Feedback Control System
  - Employee Morale to Productivity Enablement Matrix
  - Precision Cartesian Coordinate Function Curves

### 5. ✍️ Student-Friendly English & Interactive Editor
- Enforces clear, student-friendly English without unnecessarily convoluted jargon.
- **Section-Level AI Refinement**:
  - ✦ **Simplify**: Explains concepts in straightforward language.
  - ✦ **Expand**: Adds comprehensive theoretical depth.
  - ✦ **Exam Tips**: Injects university scoring advice and key takeaways.
  - ✦ **Diagram**: Attaches labeled architecture and flow diagrams.
- **Live Side-by-Side A4 Preview**: Immediate visual feedback with true A4 proportions.

### 6. 📄 PDF Pre-Flight Validation & Custom Renaming
- Live validation checklist verifying questions processed, sections generated, math formulas intact, and watermarks attached.
- Renaming modal with input sanitization before downloading.
- Dual export methods:
  - **High-DPI PDF Download** (`.pdf` via jsPDF and html2canvas)
  - **Native Browser Print** (100% vector typography output)

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 + Custom Claymorphism & iOS SF Pro tokens
- **Math Engine**: KaTeX LaTeX typesetting
- **Icons**: Lucide React
- **PDF Generation**: jsPDF + html2canvas + Native A4 Print CSS
- **Animations**: Canvas Confetti + Claymorphic 3D transitions
