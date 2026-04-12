import type { ResistanceBehavior, AnxietyType, MissingLever, StakeholderRole, Discipline, PowerLevel, InterestLevel } from '../types';

interface CounterMeasureInput {
  role: StakeholderRole;
  discipline?: Discipline;
  power?: PowerLevel;
  interest?: InterestLevel;
  behavior: ResistanceBehavior;
  anxiety: AnxietyType;
  missingLever: MissingLever;
}

export function generateCounterMeasure(input: CounterMeasureInput): string {
  const parts: string[] = [];

  // Special case: supportive stakeholder — leverage them
  if (input.behavior === 'supportive') {
    return (
      'This stakeholder is an active supporter — a valuable asset for your transformation. ' +
      'Leverage their enthusiasm: involve them as an early adopter, gather their success stories, ' +
      'and use their experience to inspire peers. ' +
      (input.role === 'Professors'
        ? 'However, remember that professors influence peers through private demonstration, not public advocacy (Singh & Strzelecki, 2026). '
        : 'Social influence and peer success stories are powerful adoption drivers (Bui et al., 2025). ') +
      'Consider assigning them as person in charge of an AI initiative in your 90-day plan (Module 4).'
    );
  }

  // Special case: ethical engagement is an ASSET, not a problem
  if (input.anxiety === 'ethical_engagement') {
    return (
      'Do not fight this! This opposition reflects critical engagement and professional responsibility. ' +
      'These are your most valuable allies for drafting ethical AI guidelines. ' +
      'Involve them in governance and policy design, not in adoption campaigns (Hong et al., 2026). ' +
      'Their ethical concerns (integrity, plagiarism, student over-reliance) are the real adoption blockers for many faculty — ' +
      'address them with clear institutional guidelines and student conduct codes (Verano-Tacoronte et al., 2025).'
    );
  }

  // Behavior-based opening
  switch (input.behavior) {
    case 'pronounced_refusal':
      parts.push(
        'This stakeholder is openly opposing AI adoption. Do not confront directly — identify their underlying values (academic freedom, quality standards) and create safe spaces for debate (Deacon et al., 2025).'
      );
      break;
    case 'pronounced_opposing':
      parts.push(
        'This stakeholder actively argues against AI. Their concerns may be legitimate. Involve them in co-designing the implementation rather than imposing it top-down (Deacon et al., 2025).'
      );
      break;
    case 'subtle_undermining':
      parts.push(
        'Warning: this is the most dangerous form of resistance — invisible until too late. Monitor actual adoption metrics, not just stated attitudes. Look for patterns of quiet non-compliance (Deacon et al., 2025).'
      );
      break;
    case 'subtle_avoiding':
      parts.push(
        'This stakeholder minimizes or deflects ("it\'s just a fad"). They are not hostile but disengaged. Use visible quick wins and peer success stories to shift their perception (Deacon et al., 2025).'
      );
      break;
  }

  // Anxiety-based middle
  switch (input.anxiety) {
    case 'learning':
      parts.push(
        'Their root cause is fear of not mastering the technology. Provide structured, low-stakes hands-on workshops. Start with tools that augment existing workflows. Emphasize skill-building over performance pressure (Cao et al., 2026).'
      );
      break;
    case 'sociotechnical':
      parts.push(
        'Their root cause is fear of being left behind. This anxiety can actually be leveraged positively — it motivates learning IF paired with a community of practice. Ensure inclusive communication: every stakeholder must see their role in the AI-enhanced institution (Cao et al., 2026).'
      );
      break;
    case 'displacement':
      parts.push(
        'Their root cause is existential fear of losing professional value. This is the hardest to solve. Frame AI as augmentation, not replacement. Provide career orientation sessions and demonstrate how AI frees time for higher-value tasks they actually enjoy (Cao et al., 2026).'
      );
      parts.push(
        'Important nuance: in public universities where employment is stable, displacement anxiety may NOT be the real blocker. The actual fears are often ethical (misusing the tool, losing integrity) and pedagogical (students plagiarizing, reduced effort). Focus training on ethical use frameworks and student conduct codes rather than job reassurance (Verano-Tacoronte et al., 2025).'
      );
      break;
  }

  // Role-specific modifier for professors
  if (input.role === 'Professors') {
    parts.push(
      'Key insight for professors: do NOT rely on social pressure, public demonstrations, or top-down mandates. Academics evaluate tools privately and in isolation. Offer risk-free, individual experimentation with no audience (Singh & Strzelecki, 2026).'
    );
    parts.push(
      'Even professors who refuse to adopt AI must be trained on its capabilities — they need to understand how their own students are using it. Training should go beyond technical skills: focus on ethical use, academic integrity, and how to create student AI conduct codes (Verano-Tacoronte et al., 2025).'
    );
  }

  // Discipline modifier
  if (input.role === 'Professors' && input.discipline) {
    if (input.discipline === 'STEM') {
      parts.push(
        'STEM professors tend to convert anxiety into motivation more easily. Focus on demonstrating immediate research utility (Cao et al., 2026).'
      );
    } else if (input.discipline === 'Humanities' || input.discipline === 'Social Sciences') {
      parts.push(
        'Humanities and social sciences faculty need specific interventions to defuse the perceived threat to their disciplinary traditions. Position AI as a tool for critical analysis, not a replacement for intellectual work (Cao et al., 2026).'
      );
    }
  }

  // Missing lever — actionable closing
  switch (input.missingLever) {
    case 'relative_advantage':
      parts.push(
        'Action: demonstrate immediate, tangible benefit on THEIR specific tasks — not generic demos. Show time saved on tasks they find tedious (Singh & Strzelecki, 2026).'
      );
      break;
    case 'compatibility':
      parts.push(
        'Action: adapt the tool to their existing methods and values. Do not ask them to change their workflow for the tool — the tool must fit their world (Singh & Strzelecki, 2026).'
      );
      break;
    case 'low_complexity':
      parts.push(
        'Action: reduce all friction — no installation, no complex login, one-click access, guided tutorials. The tool must feel effortless from the first interaction (Singh & Strzelecki, 2026).'
      );
      break;
  }

  // Power/Interest priority framing
  if (input.power && input.interest) {
    if (input.power === 'high' && input.interest === 'high') {
      parts.push(
        'Priority: KEY PLAYER — this stakeholder has both the power to block your initiative and a strong personal stake. They require your most intense engagement. Schedule direct meetings, involve them in design decisions, and address their concerns first.'
      );
    } else if (input.power === 'high' && input.interest === 'low') {
      parts.push(
        'Priority: KEEP SATISFIED — this stakeholder can block your plans but is currently disengaged. This is dangerous: if they turn hostile later, they have the power to shut things down. Keep them informed and avoid surprises. Minimal demands, maximum courtesy.'
      );
    } else if (input.power === 'low' && input.interest === 'high') {
      parts.push(
        'Priority: KEEP INFORMED — this stakeholder is enthusiastic but lacks formal authority. They make excellent early adopters, pilot participants, and internal advocates. Leverage their energy without overburdening them.'
      );
    } else {
      parts.push(
        'Priority: MONITOR — low power, low interest. Don\'t invest significant effort here. A brief update is sufficient. Focus your energy on stakeholders who can move the needle.'
      );
    }
  }

  // Workload reminder (from Deacon)
  if (input.role === 'Professors' || input.role === 'Administration') {
    parts.push(
      'Remember: workload overload is the #1 barrier to adoption. Consider offering reduced teaching load or financial incentives for those who invest in digital transformation (Deacon et al., 2025).'
    );
  }

  return parts.join('\n\n');
}
