# AI Policy Builder — Sources & Pedagogical Content

These three sources power the Policy Builder in Module 3. Each is used both in the questionnaire insight boxes and in the generated charter's "Why this matters" sections.

---

## Source 1 — VietnamPlus / MoET Survey (2026)

**Full title**: "Artificial intelligence in universities: Much use, little preparation"
**Published**: 12/03/2026, Báo Giáo dục và Thời đại
**URL**: https://www.vietnam.vn/en/tri-tue-nhan-tao-trong-dai-hoc-su-dung-nhieu-chuan-bi-it
**Original source**: Coursera international survey, 4,200 lecturers and students, 5 countries

### Key stats for in-app use

| Stat | Use in app |
|------|-----------|
| Only **26%** of universities have formal AI regulations | Q1 insight — "you are among the pioneers" |
| **56%** believe their university is not adequately prepared for AI | Opening framing of the Policy Builder |
| **95%+** of faculty and students have used AI in studies or work | Establishes urgency |
| **65%** believe unchecked AI could undermine the value of degrees | Art. 5 "Why this matters" |
| **37%** concerned about cheating/plagiarism | Art. 5 context |
| **37%** concerned about reduced human interaction | Art. 2 context |
| **35%** concerned about personal data security | Art. 4 context |
| Only **25%** of faculty feel confident in their AI skills | Art. 2 — need for training, not just rules |
| Only **27%** believe they can detect AI-generated content | Art. 3 — why transparency > detection |

### Key quote
> "Students are now ahead of universities in exploring how to use AI. Learners are increasingly aware of how to leverage this technology to support their learning process in a more flexible and personalized way." — Dr. Marni Baker Stein, Coursera

### Vietnamese HE context (MoET, 2026)
- MoET piloting AI curriculum framework from early 2026, rollout nationwide Grades 1–12
- 4 core strands: human-centred thinking, AI ethics, AI techniques and applications, AI system design
- Ho Chi Minh City Department of Education considers AI pilot a "strategic step towards fostering digital capacity"

---

## Source 2 — UNamur Master's Thesis (Coumont, 2025)

**Full title**: "Usages et perceptions de l'intelligence artificielle par les étudiants"
**Author**: Coumont, Lorys (2025)
**Institution**: Université de Namur, Belgium
**URL**: https://researchportal.unamur.be/fr/studentTheses/usages-et-perceptions-de-lintelligence-artificielle-par-les-%C3%A9tudi/

### Key stats for in-app use

| Stat | Use in app |
|------|-----------|
| **99%** of students use AI tools (mainly ChatGPT) | Q2 insight — adoption is already here |
| **63%** have used AI for academic tasks without declaring it | Q2 insight — not bad faith, just unclear rules |
| **84%** say their professors tolerate AI to some extent | Q3 — ambiguity is institutional, not individual |
| **44%** of students want stricter, clearer institutional rules | Q1 insight — students themselves are asking for policy |
| **77%** believe AI = cheating "depends on how it's used" | Q3 — nuanced approach needed, not binary ban |
| **46%** want a dedicated course on responsible AI use | Art. 2 — training is part of the policy |
| **76.8%** acknowledge AI encourages intellectual laziness | Art. 5 "Why this matters" |
| **51%** worried about detection software | Art. 3 — detection ≠ transparency |
| **31%** have already tried to circumvent detection tools | Art. 3 — detection-first policies backfire |

### Key insights for policy design
1. **Clarify, don't prohibit** — the problem is ambiguity, not malice
2. **Train, don't just regulate** — 46% want education on AI use
3. **Rethink cheating** — 77% say context matters; binary bans create gaming behavior
4. **Protect cognitive skills** — 76.8% admit intellectual laziness risk
5. **Restore equity** — current void advantages students who use AI covertly

---

## Source 3 — Sorbonne Paris 1 AI Charter (2025)

**Full title**: "Charte des usages de l'Intelligence artificielle au sein de l'École Droit de la Sorbonne"
**Institution**: École de Droit de la Sorbonne, Université Paris 1 Panthéon-Sorbonne
**Date**: September 2025
**URL**: https://droit.pantheonsorbonne.fr/sites/default/files/2025-10/2025-Charte%20IA-VF%20EDS-Septembre2025.pdf

### The 7 principles (structural backbone of the generated charter)

| Article | Principle | Core message |
|---------|-----------|-------------|
| Art. 1 | Necessity | Use AI only when necessary; prefer less resource-intensive alternatives |
| Art. 2 | Subsidiarity & added value | AI supplements proven learning methods; students must be able to do tasks without AI first |
| Art. 3 | Verification | Students are responsible for verifying AI outputs (hallucinations, plagiarism, obsolescence) |
| Art. 4 | Transparency | AI use must be explicitly declared; log prompts and outputs |
| Art. 5 | Personal data protection | Never input personal or sensitive data into AI tools |
| Art. 6 | Confidentiality | Never input confidential institutional or case data |
| Art. 7 | Intellectual property | AI outputs must be verified for copyright compliance |

### 3-level usage framework (reused in Policy Builder)
- **Open approach**: AI use authorized and encouraged, with transparency requirements
- **Intermediate approach**: AI use authorized only in specific circumstances defined per course
- **Restrictive approach**: AI use prohibited; all work must be produced independently

### Student declaration form (4 levels — reused as annex in generated charter)
1. No AI use
2. Limited assistance (spell-check, minor suggestions)
3. Shared production (significant AI contribution)
4. Majority AI-assisted (human intervention minimal)

*Model adapted from UQAC/Université de Sherbrooke (Cabana, 2024), CC BY 4.0*

---

## How these sources combine in the generated charter

```
Article 1 (Scope)          ← Sorbonne Art. 1-2 structure
Article 2 (Acceptable use) ← Sorbonne 3-level framework + MoET strands + Coumont training insight
Article 3 (Transparency)   ← Sorbonne Art. 4 + Coumont detection findings (31% circumvention)
Article 4 (Data protection) ← Sorbonne Art. 5-6 + VietnamPlus 35% data concern
Article 5 (Academic integrity) ← Coumont 76.8% laziness + Hong et al. (2026) peer mimicry
Annex (Declaration form)   ← Sorbonne/UQAC 4-level model
```

---

## AI Advisor system prompt fragment (for charter generation)

When generating the charter, the AI Advisor must:
1. Adapt the posture chosen (permissive/guided/restrictive) across all 5 articles
2. Use Vietnamese HE vocabulary and reference MoET context explicitly
3. Include a "Why this matters" box per article citing at least one of the 3 sources above
4. Keep each article to ~100 words maximum (workshop readability)
5. End with the 4-level student declaration form as Annex 1
6. Include clickable source links at the bottom of the generated document
