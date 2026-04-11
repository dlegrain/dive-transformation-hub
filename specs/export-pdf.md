# Executive Report — PDF Export

> The tangible deliverable participants take home from the seminar.

## What Gets Exported

A compiled A4 document containing all 4 modules' outputs for one institution/group:

### Page Structure

1. **Cover Page**
   - Title: "AI Adoption Strategic Plan"
   - Subtitle: "DIVE Transformation Hub — Executive Report"
   - Institution name
   - Team members / assessor names
   - Date of generation

2. **Module 1 Summary: Maturity Diagnostic**
   - Radar chart (rendered as image)
   - Overall maturity score
   - Table of 8 dimensions with scores
   - Key weaknesses highlighted

3. **Module 2 Summary: Resistance Map**
   - Table of stakeholders with role, discipline, and triple diagnostic (behavior / anxiety / missing lever)
   - Generated counter-measures for each stakeholder
   - Self-debrief results (what anxiety the team experienced)

4. **Module 3 Summary: AI Solutions Arsenal**
   - Grid/table of solution cards with name, target, difficulty, status
   - Vibe coding notes and prototype outcomes
   - Phase assignments for Module 4

5. **Module 4 Summary: 90-Day Plan**
   - 3-phase timeline with all tasks
   - Champion assignments with system feedback (positive or warning)
   - Cross-module alerts (if any conflicts detected)
   - **KPI table** aligned with Change Dashboard (name, type, target, data source, responsible)

6. **Operational Recommendations** (full page)
   - Top 4-5 research-backed recommendations relevant to this institution's profile
   - Drawn from cross-module analysis (weak dimensions + resistance patterns + plan choices)

7. **Footer (every page)**
   - Scientific bibliography — see `specs/references.md`

## Technical Approach

### Recommended: `html2pdf.js`
- Renders a hidden HTML div as PDF
- Handles Recharts SVG → canvas conversion
- Simpler integration than jsPDF for styled content

### Fallback: `react-to-print` + browser print dialog
- If html2pdf.js has rendering issues with SVG charts
- Less control over pagination but more reliable

### Considerations
- Charts (SVG) must be converted to canvas/image before PDF generation
- Tailwind classes won't carry into PDF — use inline styles for the export view
- Create a dedicated `<ExportView />` component with print-optimized styles
- Test with actual content length — pagination breaks must be handled

## Design

- Clean, institutional look — appropriate for university leadership
- No bright colors — professional blues, grays, white
- Logo placeholder (participants might want to add their university logo)
- Page numbers
- Consistent typography
