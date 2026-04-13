import { ExternalLink, BookOpen, FlaskConical, Users, Lightbulb, CalendarCheck, Radar, Globe, GraduationCap } from 'lucide-react';

const articles = [
  {
    id: 1,
    authors: 'Bravo-Jaico, J. et al.',
    year: 2025,
    title: 'Model for assessing the maturity level of digital transformation in higher education institutions',
    journal: 'Frontiers in Education',
    url: 'https://doi.org/10.3389/feduc.2025.1581648',
    modules: [1],
    region: 'Latin America',
    sample: 'Peru — public university deans, directors & IT managers',
    summary:
      '8-dimension Maturity Assessment Model (MTM) for higher education. Evaluates institutions across socio-cultural, teaching, academic management, admin, research, governance, marketing, and extension dimensions at 3 maturity levels. Key finding: the #1 barrier is lack of personnel preparation, not technology.',
  },
  {
    id: 2,
    authors: 'Bui, H. Q. et al.',
    year: 2025,
    title: 'AI adoption: a new perspective from accounting students in Vietnam',
    journal: 'Journal of Asian Business and Economic Studies',
    url: 'https://doi.org/10.1108/JABES-06-2024-0300',
    modules: [4],
    region: 'Vietnam',
    sample: 'Ho Chi Minh City — 275 accounting students',
    summary:
      'Empirical study of 275 Vietnamese accounting students. Social influence and peer success stories are powerful adoption drivers for students. Recommends industry partnerships and facilitating conditions (accessible tech support, AI courses in curricula).',
  },
  {
    id: 3,
    authors: 'Cao, K. et al.',
    year: 2026,
    title: 'AI anxiety and adoption intention in higher education based on an extended TAM-UTAUT',
    journal: 'Scientific Reports',
    url: 'https://doi.org/10.1038/s41598-026-35823-9',
    modules: [2, 4],
    region: 'China',
    sample: 'Sichuan Province — 3 universities, faculty & students',
    summary:
      'Identifies 3 types of AI anxiety: learning anxiety, sociotechnical blindness, and job displacement anxiety. Displacement anxiety blocks all adoption. Sociotechnical anxiety can be leveraged positively. STEM profiles adapt faster than humanities. Self-efficacy is the key mediator.',
  },
  {
    id: 4,
    authors: 'Deacon, B. et al.',
    year: 2025,
    title: 'Resisting digital change at the university: an exploration into triggers and organisational countermeasures',
    journal: 'European Journal of Higher Education',
    url: 'https://doi.org/10.1080/21568235.2025.2512735',
    modules: [2],
    region: 'Europe',
    sample: '8 European universities — 68 staff members',
    summary:
      'Study of 68 staff from 8 European universities. Identifies 4 resistance behaviors: pronounced refusal, pronounced opposing, subtle undermining, and subtle avoiding. Workload overload is the #1 trigger. Recommends co-creation over top-down mandates and tangible rewards (reduced teaching load, financial incentives).',
  },
  {
    id: 5,
    authors: 'Hong, T. T. M. et al.',
    year: 2026,
    title: 'Discovering acceptance and intention to use artificial intelligence for learning among pre-service teachers in Vietnam',
    journal: 'Discover Education (Springer)',
    url: 'https://doi.org/10.1007/s44217-026-01289-0',
    modules: [2, 4],
    region: 'Vietnam',
    sample: 'Hanoi — pre-service teachers',
    summary:
      'Vietnamese pre-service teachers view AI positively. Perceived barriers (ethics, cheating, over-reliance) reflect critical engagement, not opposition — these people are assets for drafting AI ethical guidelines. Without formal faculty frameworks, peer mimicry leads to unethical use.',
  },
  {
    id: 6,
    authors: 'Nguyen, H. L. & Hong, Y.',
    year: 2025,
    title: 'National policy analysis of digital transformation in Vietnamese higher education: Conceptualising a three-layer model for implementation',
    journal: 'Policy Futures in Education',
    url: 'https://doi.org/10.1177/14782103251348089',
    modules: [4],
    region: 'Vietnam',
    sample: 'National — analysis of 21 Vietnamese policy documents',
    summary:
      'Proposes a Lewin-based 3-layer deployment model: Activation (infrastructure, vision, equity), Implementation (pedagogy, admin tools, faculty training), Institutionalization (KPIs, quality assurance, continuous adaptation). Highlights the digital divide risk (urban/rural). Students should be consultants, not guinea pigs.',
  },
  {
    id: 7,
    authors: 'Nguyen, N. D. & Uong, L. N. T.',
    year: 2026,
    title: 'Digital transformation in non-public universities: empirical evidence from Hanoi City',
    journal: 'Cogent Social Sciences',
    url: 'https://doi.org/10.1080/23311886.2026.2632388',
    modules: [],
    region: 'Vietnam',
    sample: 'Hanoi — non-public/private universities',
    summary:
      'Empirical evidence from Vietnamese non-public HE sector. Identifies external pressure as a key driver of digital transformation. Provides contextual grounding for the Vietnamese higher education landscape addressed throughout the seminar.',
  },
  {
    id: 8,
    authors: 'Singh, H. & Strzelecki, A.',
    year: 2026,
    title: 'Academics as adopters of generative AI: an application of diffusion of innovations theory',
    journal: 'Education and Information Technologies (Springer)',
    url: 'https://doi.org/10.1007/s10639-025-13835-8',
    modules: [2, 4],
    region: 'Europe',
    sample: 'Poland — 640 academics across 10 universities',
    summary:
      'Study of 640 academics across 10 universities. Identifies 3 adoption levers: relative advantage, compatibility, and low complexity. Key insight: professors evaluate tools privately — do NOT use social pressure or public demos. Offer risk-free solo experimentation and demonstrate immediate time savings on THEIR tasks.',
  },
  {
    id: 9,
    authors: 'Verano-Tacoronte, D. et al.',
    year: 2025,
    title: 'Are university teachers ready for generative artificial intelligence? Unpacking faculty anxiety in the ChatGPT era',
    journal: 'Education and Information Technologies (Springer)',
    url: 'https://doi.org/10.1007/s10639-025-13585-7',
    modules: [2, 4],
    region: 'Europe',
    sample: 'Spain — faculty from public universities',
    summary:
      'In public universities with stable employment, job displacement anxiety does NOT block adoption. The real barriers are ethical/pedagogical: fear of misuse (integrity loss) and fear of negative impact on student learning (plagiarism, reduced effort). Training must focus on ethical use and student conduct codes. Gender matters: female faculty show lower adoption intention — design targeted mentoring. Even non-adopting faculty must be trained to understand how students use AI.',
  },
];

const moduleConfig: Record<number, { label: string; color: string; icon: React.ElementType }> = {
  1: { label: 'Module 1 — Diagnostic', color: 'bg-blue-100 text-blue-700', icon: Radar },
  2: { label: 'Module 2 — Resistance', color: 'bg-orange-100 text-orange-700', icon: Users },
  3: { label: 'Module 3 — Arsenal', color: 'bg-purple-100 text-purple-700', icon: Lightbulb },
  4: { label: 'Module 4 — 90-Day Plan', color: 'bg-green-100 text-green-700', icon: CalendarCheck },
};

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="text-primary-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">Research Articles</h1>
        </div>
        <p className="text-gray-500 text-sm">
          The 9 peer-reviewed studies (2025-2026) that power every recommendation, diagnostic, and counter-measure in this app.
          Click any article to read the full text.
        </p>
      </div>

      {/* Geographic map */}
      <div className="mb-8 bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={18} className="text-primary-600" />
          <h2 className="text-sm font-semibold text-gray-900">Geographic Coverage</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          These 9 studies span 4 regions — universal frameworks from Latin America and Europe, applied to a Vietnamese context documented by 4 local studies.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { region: 'Vietnam', count: 4, color: 'bg-red-50 border-red-200 text-red-700', detail: 'HCMC, Hanoi, national policy' },
            { region: 'Latin America', count: 1, color: 'bg-amber-50 border-amber-200 text-amber-700', detail: 'Peru — MTM maturity model' },
            { region: 'Europe', count: 3, color: 'bg-blue-50 border-blue-200 text-blue-700', detail: 'Germany, Poland, Spain' },
            { region: 'China', count: 1, color: 'bg-emerald-50 border-emerald-200 text-emerald-700', detail: 'Sichuan — AI anxiety study' },
          ].map((r) => (
            <div key={r.region} className={`rounded-lg border p-3 ${r.color}`}>
              <div className="text-lg font-bold">{r.count}</div>
              <div className="text-xs font-semibold">{r.region}</div>
              <div className="text-xs opacity-75 mt-0.5">{r.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Tutorials */}
      <div className="mb-8 bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap size={18} className="text-primary-600" />
          <h2 className="text-sm font-semibold text-gray-900">AI Tutorials</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Hands-on tutorials to explore AI concepts covered during the seminar.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a
            href="https://tuto-rag.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 p-4 hover:border-purple-400 hover:shadow-md transition-all group"
          >
            <div className="flex-1">
              <div className="text-sm font-semibold text-purple-800 group-hover:text-purple-900">
                RAG Tutorial
              </div>
              <div className="text-xs text-purple-600 mt-0.5">
                Learn how Retrieval-Augmented Generation works — the technique behind NotebookLM and enterprise AI assistants.
              </div>
            </div>
            <ExternalLink size={14} className="text-purple-300 group-hover:text-purple-500 shrink-0" />
          </a>
          <a
            href="https://vibe-coding-trends.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50 p-4 hover:border-indigo-400 hover:shadow-md transition-all group"
          >
            <div className="flex-1">
              <div className="text-sm font-semibold text-indigo-800 group-hover:text-indigo-900">
                Vibe Coding Tutorial
              </div>
              <div className="text-xs text-indigo-600 mt-0.5">
                Discover vibe coding — building software by describing what you want in natural language, powered by AI.
              </div>
            </div>
            <ExternalLink size={14} className="text-indigo-300 group-hover:text-indigo-500 shrink-0" />
          </a>
        </div>
      </div>

      <div className="space-y-4">
        {articles.map((article) => (
          <a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FlaskConical size={14} className="text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-400 font-medium">
                    {article.journal} &middot; {article.year}
                  </span>
                </div>

                <h2 className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors leading-snug mb-1">
                  {article.title}
                </h2>

                <p className="text-xs text-gray-500 mb-1">{article.authors}</p>

                <p className="text-xs text-gray-400 mb-3">
                  <Globe size={10} className="inline -mt-0.5 mr-1" />
                  {article.region} — {article.sample}
                </p>

                <p className="text-sm text-gray-600 leading-relaxed">{article.summary}</p>

                {article.modules.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {article.modules.map((m) => {
                      const cfg = moduleConfig[m];
                      return (
                        <span
                          key={m}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
                        >
                          <cfg.icon size={11} />
                          {cfg.label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <ExternalLink
                size={16}
                className="text-gray-300 group-hover:text-primary-500 transition-colors shrink-0 mt-1"
              />
            </div>
          </a>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong>Citation format used in the app:</strong> (Author et al., Year). Full references are also included in the exported PDF report.
          All articles are available in the facilitator's NotebookLM notebook "AI - DIVE - Vietnam".
        </p>
      </div>
    </div>
  );
}
