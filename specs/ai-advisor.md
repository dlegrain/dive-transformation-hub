# AI Advisor

> A contextual AI coach that reads the participant's data across all modules and the research articles to give personalized, science-backed recommendations.

## UX

### Side Panel
- Accessible from any module via a floating button (bottom-right) or sidebar toggle
- Opens as a slide-over panel (doesn't replace the current view)
- Header shows which module the user is currently on
- Conversation history persisted per group per module

### Behavior
- **Not a generic chatbot** — the AI Advisor is a strategic coach
- It has full context: the group's assessment data, stakeholder map, solution cards, plan tasks, and KPIs
- It references the 8 research articles by name and citation
- Responses are actionable, concise, and always cite sources

## System Prompt

The Edge Function builds the system prompt dynamically:

```
You are the DIVE AI Advisor, a strategic coach for university leaders 
planning AI adoption at their institution. You are embedded in the 
DIVE Transformation Hub workshop tool.

CONTEXT:
You have access to this group's data across 4 modules:
- Module 1 (Maturity Diagnostic): [inject assessment data]
- Module 2 (Resistance Map): [inject stakeholder data]
- Module 3 (Solutions Arsenal): [inject solution cards]
- Module 4 (90-Day Plan): [inject plan tasks + KPIs]

RESEARCH BASE:
Your recommendations must be grounded in these 8 studies:
[inject key findings from each article — see specs/references.md]

RULES:
- Always cite your source: "(Author et al., Year)"
- Be concise — max 3-4 paragraphs per response
- Be actionable — every recommendation should be something they can do
- Be specific to THEIR data — don't give generic advice
- If you spot contradictions between modules (e.g., displacement anxiety 
  in Module 2 but champion assigned to professors in Module 4), flag them
- Language: English only
- Tone: professional but warm, like a knowledgeable colleague

CURRENT MODULE: [inject current module name]
```

## Trigger Points

The AI Advisor can be invoked in two ways:

### 1. User-initiated (chat)
User types a question in the panel. Examples:
- "What should be our top priority in Phase 1?"
- "We have strong resistance from our engineering faculty. What do you suggest?"
- "Is our plan realistic for a public university in Vietnam?"

### 2. System-triggered (proactive alerts)
The app triggers an automatic AI Advisor suggestion when it detects:

| Trigger | When | Suggestion |
|---------|------|------------|
| Weak dimension + no action | Module 4 opened, Module 1 has dimension < 1.5, no corresponding task in plan | "Your [dimension] score is critically low but your 90-day plan doesn't address it. Consider adding..." |
| Champion conflict | Module 4, champion assigned to Professors + Module 2 has displacement anxiety for professors | "Conflict detected: you've identified displacement anxiety among professors but assigned a champion to them..." |
| No KPIs | Module 4, plan has tasks but no KPIs | "Your plan has [N] tasks but no success metrics. Without KPIs, you won't know if the transformation is working..." |
| Low-hanging fruit | Module 3, solution marked Low difficulty but not assigned to Phase 1 | "You have a low-difficulty solution that could be a quick win in Phase 1..." |
| Missing stakeholder coverage | Module 2, only one role type mapped | "You've only mapped [role]. Consider also mapping [missing roles] to get a complete picture..." |

Proactive alerts appear as a subtle notification on the AI Advisor button (badge with count), not as intrusive popups.

## Data Flow

```
User asks question
      │
      ▼
React Frontend
  - Collects current module data
  - Collects cross-module data (assessment, stakeholders, solutions, tasks, KPIs)
  - Sends to Edge Function
      │
      ▼
Supabase Edge Function (ai-advisor)
  - Builds system prompt with group data + research context
  - Appends conversation history
  - Calls Claude API (claude-sonnet-4-6)
  - Stores message pair in ai_conversations table
  - Returns response
      │
      ▼
React Frontend
  - Displays response in side panel
  - Updates conversation history
```

## Model Choice

- **Claude Sonnet** for regular queries (fast, cost-effective)
- Consider Haiku for proactive alerts (high volume, simpler analysis)
- System prompt + group data + research context ≈ 3-4K tokens
- Typical response: 200-500 tokens

## Conversation Persistence

- Conversations are stored per group per module in `ai_conversations` table
- When switching modules, the panel loads the relevant conversation
- A "General" conversation is available for cross-module questions
- History is included in the PDF export (optional — group can choose)
