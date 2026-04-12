import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// DB column prefixes → frontend dimension keys
const DIMENSION_MAP: Record<string, string> = {
  socio_cultural: "socioCultural",
  teaching: "teachingLearning",
  academic_mgmt: "academicManagement",
  admin_mgmt: "administrativeManagement",
  research: "researchInnovation",
  governance: "digitalGovernance",
  image: "institutionalImage",
  extension: "universityExtension",
};

interface DimScores {
  tools: number;
  data: number;
  culture: number;
  count: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch all assessments
    const { data: assessments, error: assErr } = await supabase
      .from("dive_assessments")
      .select("*");
    if (assErr) throw assErr;

    // Aggregate dimension averages across all participants
    const dimTotals: Record<string, DimScores> = {};
    for (const feKey of Object.values(DIMENSION_MAP)) {
      dimTotals[feKey] = { tools: 0, data: 0, culture: 0, count: 0 };
    }

    for (const row of assessments || []) {
      for (const [dbPrefix, feKey] of Object.entries(DIMENSION_MAP)) {
        const tools = row[`${dbPrefix}_tools`];
        const data = row[`${dbPrefix}_data`];
        const culture = row[`${dbPrefix}_culture`];
        // Only count if at least one sub-criterion is filled (> 0)
        if (tools > 0 || data > 0 || culture > 0) {
          dimTotals[feKey].tools += tools || 0;
          dimTotals[feKey].data += data || 0;
          dimTotals[feKey].culture += culture || 0;
          dimTotals[feKey].count += 1;
        }
      }
    }

    const dimensionAverages: Record<
      string,
      { tools: number; data: number; culture: number }
    > = {};
    for (const [feKey, totals] of Object.entries(dimTotals)) {
      if (totals.count > 0) {
        dimensionAverages[feKey] = {
          tools: Math.round((totals.tools / totals.count) * 10) / 10,
          data: Math.round((totals.data / totals.count) * 10) / 10,
          culture: Math.round((totals.culture / totals.count) * 10) / 10,
        };
      }
    }

    // Fetch all stakeholders
    const { data: stakeholders } = await supabase
      .from("dive_stakeholders")
      .select("role, behavior, anxiety, missing_lever");

    // Fetch all solutions
    const { data: solutions } = await supabase
      .from("dive_solutions")
      .select("name, target, difficulty, status, assigned_phase");

    // Fetch all tasks + kpis
    const { data: tasks } = await supabase
      .from("dive_plan_tasks")
      .select(
        "name, phase, champion_target, priority, status"
      );

    const { data: kpis } = await supabase
      .from("dive_kpis")
      .select("name, type, phase");

    const result = {
      participantCount: assessments?.length || 0,
      dimensionAverages,
      stakeholders: stakeholders || [],
      solutions: solutions || [],
      tasks: tasks || [],
      kpis: kpis || [],
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("plenary-data error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch plenary data", details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
