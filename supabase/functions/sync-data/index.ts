import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Map frontend dimension keys to DB column prefixes
const DIMENSION_MAP: Record<string, string> = {
  socioCultural: "socio_cultural",
  teachingLearning: "teaching",
  academicManagement: "academic_mgmt",
  administrativeManagement: "admin_mgmt",
  researchInnovation: "research",
  digitalGovernance: "governance",
  institutionalImage: "image",
  universityExtension: "extension",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { participant_id, group_id, module, data } = body;

    if (!participant_id) {
      return new Response(
        JSON.stringify({ error: "participant_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (module === "assessments") {
      // Flatten dimensions into DB columns
      const row: Record<string, unknown> = {
        participant_id,
        group_id: group_id || null,
      };

      for (const [feKey, dbPrefix] of Object.entries(DIMENSION_MAP)) {
        const dim = data.dimensions?.[feKey];
        if (dim) {
          row[`${dbPrefix}_tools`] = dim.tools;
          row[`${dbPrefix}_data`] = dim.data;
          row[`${dbPrefix}_culture`] = dim.culture;
        }
      }

      // Upsert: one assessment per participant
      const { error } = await supabase
        .from("dive_assessments")
        .upsert(row, { onConflict: "participant_id" });

      if (error) throw error;
    } else if (module === "stakeholders") {
      // Delete existing + re-insert (simplest for array data)
      await supabase
        .from("dive_stakeholders")
        .delete()
        .eq("participant_id", participant_id);

      if (data.stakeholders?.length > 0) {
        const rows = data.stakeholders.map(
          (s: Record<string, unknown>) => ({
            participant_id,
            group_id: group_id || null,
            name: s.name,
            role: s.role,
            discipline: s.discipline || null,
            behavior: s.behavior,
            anxiety: s.anxiety,
            missing_lever: s.missing_lever,
            notes: s.notes || null,
            generated_counter_measure: s.generated_counter_measure || null,
          })
        );
        const { error } = await supabase
          .from("dive_stakeholders")
          .insert(rows);
        if (error) throw error;
      }
    } else if (module === "solutions") {
      await supabase
        .from("dive_solutions")
        .delete()
        .eq("participant_id", participant_id);

      if (data.solutions?.length > 0) {
        const rows = data.solutions.map(
          (s: Record<string, unknown>, i: number) => ({
            participant_id,
            group_id: group_id || null,
            name: s.name,
            target: s.target,
            difficulty: s.difficulty,
            status: s.status || "Planned",
            problem_solved: s.problem_solved || null,
            vibe_coding_notes: s.vibe_coding_notes || null,
            platform_used: s.platform_used || null,
            assigned_phase: s.assigned_phase || null,
            linked_quick_win: s.linked_quick_win || null,
            sort_order: i,
          })
        );
        const { error } = await supabase.from("dive_solutions").insert(rows);
        if (error) throw error;
      }
    } else if (module === "plan") {
      // Sync both tasks and kpis
      await supabase
        .from("dive_plan_tasks")
        .delete()
        .eq("participant_id", participant_id);
      await supabase
        .from("dive_kpis")
        .delete()
        .eq("participant_id", participant_id);

      if (data.tasks?.length > 0) {
        const rows = data.tasks.map(
          (t: Record<string, unknown>, i: number) => ({
            participant_id,
            group_id: group_id || null,
            name: t.name,
            phase: t.phase,
            champion_name: t.champion_name || null,
            champion_target: t.champion_target || null,
            priority: t.priority || "Medium",
            status: t.status || "Not Started",
            sort_order: i,
          })
        );
        const { error } = await supabase.from("dive_plan_tasks").insert(rows);
        if (error) throw error;
      }

      if (data.kpis?.length > 0) {
        const rows = data.kpis.map((k: Record<string, unknown>) => ({
          participant_id,
          group_id: group_id || null,
          name: k.name,
          type: k.type,
          target: k.target || null,
          data_source: k.data_source || null,
          responsible: k.responsible || null,
          phase: k.phase || null,
        }));
        const { error } = await supabase.from("dive_kpis").insert(rows);
        if (error) throw error;
      }
    } else {
      return new Response(
        JSON.stringify({
          error: `Unknown module: ${module}. Use: assessments, stakeholders, solutions, plan`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("sync-data error:", error);
    return new Response(
      JSON.stringify({ error: "Sync failed", details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
