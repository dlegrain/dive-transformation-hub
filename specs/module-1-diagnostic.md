# Module 1: Maturity Diagnostic (Day 1 Afternoon)

> "Where are we now?" — The morning gave you frameworks for WHY change is needed. Now let's measure WHERE your institution stands.

## Morning → Afternoon Bridge

J. Parisse introduces Lewin and Kotter. Module 1 applies these by answering the prerequisite question: before you can plan change, you need to know your starting point. The radar chart IS the "current state" in Lewin's unfreeze phase.

## Workshop Flow

| Time | Activity | Mode | Tool |
|------|----------|------|------|
| 13:45-14:30 | Conceptual input: Rogers' Diffusion, MTM model, demo | Plenary | Slides |
| 14:30-15:00 | Self-assessment: rate your institution on 8 dimensions | Individual | **App** |
| 15:00-15:15 | Break | | |
| 15:15-15:45 | Compare radars in small groups, discuss gaps | Groups | **App** (overlay) |
| 15:45-16:00 | Plenary debrief: common patterns, weakest dimensions | Plenary | **App** (projector) |

## The 8 Dimensions (MTM Model — Bravo-Jaico et al., 2025)

Each dimension is evaluated on **3 sub-criteria**, making the assessment much more grounded than a single score.

### 1. Socio-cultural
| Sub-criterion | Level 1 (Beginner) | Level 2 (In Progress) | Level 3 (Continuous Improvement) |
|---|---|---|---|
| **Tools & Processes** | No digital community engagement | Some social media presence | Integrated digital sustainability and social impact strategy |
| **Data** | No data on community impact | Basic metrics collected | Data-driven community engagement decisions |
| **Culture** | No awareness of digital social responsibility | Emerging interest | Digital citizenship embedded in institutional values |

### 2. Teaching & Learning
| Sub-criterion | Level 1 | Level 2 | Level 3 |
|---|---|---|---|
| **Tools & Processes** | No LMS, manual course design | LMS exists but underused, some flexible spaces | Fully digital pedagogy with virtual environments and adaptive tutoring |
| **Data** | No learning analytics | Basic usage stats | Learning analytics drive course design decisions |
| **Culture** | Faculty unaware or resistant | Faculty beginning to experiment | Faculty actively innovate and share digital pedagogy |

### 3. Academic Management
| Sub-criterion | Level 1 | Level 2 | Level 3 |
|---|---|---|---|
| **Tools & Processes** | Manual enrollment, paper records | Digital portals exist but buggy, duplicated systems | Fully automated, integrated student services |
| **Data** | No curriculum data analysis | Some market alignment data | Continuous curriculum updates based on global market data |
| **Culture** | Staff see digitization as extra burden | Staff adapting but lack training | Staff own the digital processes, continuous improvement |

### 4. Administrative Management
| Sub-criterion | Level 1 | Level 2 | Level 3 |
|---|---|---|---|
| **Tools & Processes** | Manual workflows, paper-based HR/finance | Some automation, partial digitization | Full workflow automation, real-time dashboards |
| **Data** | No data-driven decision making | Emerging analytics but siloed | Integrated data governance for institutional steering |
| **Culture** | Resistance to process change | Openness but skill gaps | Administrative staff are digital-first |

### 5. Research & Innovation
| Sub-criterion | Level 1 | Level 2 | Level 3 |
|---|---|---|---|
| **Tools & Processes** | No digital research tools | Access to indexed databases, some digital tools | AI-augmented research workflows, patents, tech transfer |
| **Data** | No research output tracking | Basic publication metrics | Comprehensive research analytics and impact measurement |
| **Culture** | Research is analog and siloed | Growing interest in digital methods | Culture of digital innovation and entrepreneurship |

### 6. Digital Governance
| Sub-criterion | Level 1 | Level 2 | Level 3 |
|---|---|---|---|
| **Tools & Processes** | No cybersecurity, no digital regulations | Basic security protocols, some policies | Full cybersecurity framework, Open Data, transparency |
| **Data** | Data in silos, no governance | Some data governance initiatives | Centralized data governance, privacy compliance |
| **Culture** | No digital strategy ownership | Emerging digital leadership | Transformational leadership, continuous tech adaptation |

### 7. Institutional Image & Marketing
| Sub-criterion | Level 1 | Level 2 | Level 3 |
|---|---|---|---|
| **Tools & Processes** | No digital marketing | Basic website and social media | Data-driven marketing, competitor analysis, student CRM |
| **Data** | No digital engagement metrics | Basic web analytics | Advanced analytics driving recruitment and retention |
| **Culture** | Brand is managed offline | Digital presence is managed reactively | Proactive digital brand strategy |

### 8. University Extension
| Sub-criterion | Level 1 | Level 2 | Level 3 |
|---|---|---|---|
| **Tools & Processes** | No digital outreach | Some online engagement with community | Full digital knowledge transfer to society and industry |
| **Data** | No partnership or outreach data | Basic tracking | Impact measurement of community engagement |
| **Culture** | University operates in isolation | Emerging partnerships | Deep ecosystem integration (industry, government, civil society) |

## Scoring

- Each sub-criterion scores 1, 2, or 3
- Dimension score = average of 3 sub-criteria (can be fractional: 1.0 to 3.0)
- Overall score = average of 8 dimensions
- Visual: radar chart with 8 axes, scale 1-3

## Smart Logic

- **Weakest dimensions highlighted** (score < 1.5) with a prompt: "This dimension should be a priority in your 90-day plan (Module 4)."
- **Dimension correlation insights**: e.g., if Digital Governance is low but Teaching & Learning is high → "Warning: AI adoption without governance creates compliance risk."
- **Group comparison**: overlay multiple radars to show institutional diversity in the room

## Data Model

```typescript
interface DimensionAssessment {
  tools: 1 | 2 | 3;
  data: 1 | 2 | 3;
  culture: 1 | 2 | 3;
  average: number;
}

interface MaturityAssessment {
  institutionName: string;
  assessorName: string;
  dimensions: {
    socioCultural: DimensionAssessment;
    teachingLearning: DimensionAssessment;
    academicManagement: DimensionAssessment;
    administrativeManagement: DimensionAssessment;
    researchInnovation: DimensionAssessment;
    digitalGovernance: DimensionAssessment;
    institutionalImage: DimensionAssessment;
    universityExtension: DimensionAssessment;
  };
  overallScore: number;
  timestamp: string;
}
```
