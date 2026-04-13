import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Frontend dimension keys → DB column prefixes
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

// DB column prefixes → frontend dimension keys (reverse)
const DIMENSION_MAP_REVERSE: Record<string, string> = {};
for (const [fe, db] of Object.entries(DIMENSION_MAP)) {
  DIMENSION_MAP_REVERSE[db] = fe;
}

const FE_DIMENSION_KEYS = Object.keys(DIMENSION_MAP);

interface DimScores {
  tools: number;
  data: number;
  culture: number;
  count: number;
}

function unflattenRow(row: Record<string, unknown>) {
  const dims: Record<string, { tools: number; data: number; culture: number }> = {};
  for (const [dbPrefix, feKey] of Object.entries(DIMENSION_MAP_REVERSE)) {
    dims[feKey] = {
      tools: (row[`${dbPrefix}_tools`] as number) || 0,
      data: (row[`${dbPrefix}_data`] as number) || 0,
      culture: (row[`${dbPrefix}_culture`] as number) || 0,
    };
  }
  return dims;
}

function flattenDimensions(dimensions: Record<string, { tools: number; data: number; culture: number }>) {
  const row: Record<string, number> = {};
  for (const [feKey, dbPrefix] of Object.entries(DIMENSION_MAP)) {
    const dim = dimensions[feKey];
    if (dim) {
      row[`${dbPrefix}_tools`] = dim.tools;
      row[`${dbPrefix}_data`] = dim.data;
      row[`${dbPrefix}_culture`] = dim.culture;
    }
  }
  return row;
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

    const body = await req.json();
    const { action } = body;

    // ── GET GROUP ASSESSMENTS ──────────────────────────────────
    if (action === "get_group_assessments") {
      const { group_id } = body;
      if (!group_id) throw new Error("group_id is required");

      // Get group info (consensus status)
      const { data: group, error: grpErr } = await supabase
        .from("dive_groups")
        .select("id, name, institution_name, consensus_status, consensus_validated_at, consensus_validated_by, reopen_requested_by, reopen_requested_at")
        .eq("id", group_id)
        .single();
      if (grpErr) throw grpErr;

      // Get group members
      const { data: members, error: memErr } = await supabase
        .from("dive_participants")
        .select("id, name")
        .eq("group_id", group_id);
      if (memErr) throw memErr;

      // Get individual assessments for this group (exclude consensus)
      const { data: assessments, error: assErr } = await supabase
        .from("dive_assessments")
        .select("*")
        .eq("group_id", group_id)
        .or("is_consensus.is.null,is_consensus.eq.false");
      if (assErr) throw assErr;

      // Get consensus row if exists
      const { data: consensusRows } = await supabase
        .from("dive_assessments")
        .select("*")
        .eq("group_id", group_id)
        .eq("is_consensus", true)
        .limit(1);

      // Determine which members have completed (have an assessment row)
      const completedIds = new Set((assessments || []).map((a: Record<string, unknown>) => a.participant_id));
      const memberStatuses = (members || []).map((m: { id: string; name: string }) => ({
        id: m.id,
        name: m.name,
        has_completed: completedIds.has(m.id),
      }));

      // Compute group average (exclude 0 = "I don't know")
      const dimTotals: Record<string, DimScores> = {};
      for (const feKey of FE_DIMENSION_KEYS) {
        dimTotals[feKey] = { tools: 0, data: 0, culture: 0, count: 0 };
      }

      for (const row of assessments || []) {
        for (const [dbPrefix, feKey] of Object.entries(DIMENSION_MAP_REVERSE)) {
          const tools = (row[`${dbPrefix}_tools`] as number) || 0;
          const data = (row[`${dbPrefix}_data`] as number) || 0;
          const culture = (row[`${dbPrefix}_culture`] as number) || 0;
          if (tools > 0 || data > 0 || culture > 0) {
            dimTotals[feKey].tools += tools;
            dimTotals[feKey].data += data;
            dimTotals[feKey].culture += culture;
            dimTotals[feKey].count += 1;
          }
        }
      }

      const groupAverage: Record<string, { tools: number; data: number; culture: number }> | null =
        (assessments || []).length > 0
          ? Object.fromEntries(
              Object.entries(dimTotals).map(([feKey, totals]) => [
                feKey,
                totals.count > 0
                  ? {
                      tools: Math.round((totals.tools / totals.count) * 10) / 10,
                      data: Math.round((totals.data / totals.count) * 10) / 10,
                      culture: Math.round((totals.culture / totals.count) * 10) / 10,
                    }
                  : { tools: 0, data: 0, culture: 0 },
              ])
            )
          : null;

      // Build consensus object if exists
      let consensus = null;
      if (consensusRows && consensusRows.length > 0) {
        const cRow = consensusRows[0];
        consensus = {
          dimensions: unflattenRow(cRow),
          customDimensions: cRow.custom_data?.customDimensions || [],
          hiddenDimensions: cRow.custom_data?.hiddenDimensions || [],
          updated_at: cRow.updated_at,
        };
      }

      // Get validator name if validated
      let validatedByName = null;
      if (group.consensus_validated_by) {
        const { data: validator } = await supabase
          .from("dive_participants")
          .select("name")
          .eq("id", group.consensus_validated_by)
          .single();
        validatedByName = validator?.name || null;
      }

      // Get requester name if reopen requested
      let reopenRequestedByName = null;
      if (group.reopen_requested_by) {
        const { data: requester } = await supabase
          .from("dive_participants")
          .select("name")
          .eq("id", group.reopen_requested_by)
          .single();
        reopenRequestedByName = requester?.name || null;
      }

      return new Response(
        JSON.stringify({
          members: memberStatuses,
          groupAverage,
          consensus,
          consensusStatus: group.consensus_status || "none",
          completedCount: completedIds.size,
          totalCount: (members || []).length,
          validatedByName,
          reopenRequestedByName,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── SAVE CONSENSUS ─────────────────────────────────────────
    if (action === "save_consensus") {
      const { group_id, dimensions, custom_data } = body;
      if (!group_id || !dimensions) throw new Error("group_id and dimensions are required");

      const row: Record<string, unknown> = {
        group_id,
        participant_id: null,
        is_consensus: true,
        custom_data: custom_data || null,
        updated_at: new Date().toISOString(),
        ...flattenDimensions(dimensions),
      };

      // Upsert using the partial unique index (group_id WHERE is_consensus=true)
      // We need to check if a consensus row exists first
      const { data: existing } = await supabase
        .from("dive_assessments")
        .select("id")
        .eq("group_id", group_id)
        .eq("is_consensus", true)
        .limit(1);

      if (existing && existing.length > 0) {
        // Update existing
        const { error } = await supabase
          .from("dive_assessments")
          .update(row)
          .eq("id", existing[0].id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("dive_assessments")
          .insert(row);
        if (error) throw error;
      }

      // Set status to draft if currently 'none'
      const { data: grp } = await supabase
        .from("dive_groups")
        .select("consensus_status")
        .eq("id", group_id)
        .single();

      if (grp?.consensus_status === "none") {
        await supabase
          .from("dive_groups")
          .update({ consensus_status: "draft" })
          .eq("id", group_id);
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── VALIDATE CONSENSUS ─────────────────────────────────────
    if (action === "validate_consensus") {
      const { group_id, participant_id } = body;
      if (!group_id) throw new Error("group_id is required");

      const { error } = await supabase
        .from("dive_groups")
        .update({
          consensus_status: "validated",
          consensus_validated_at: new Date().toISOString(),
          consensus_validated_by: participant_id || null,
        })
        .eq("id", group_id);
      if (error) throw error;

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── REQUEST REOPEN ─────────────────────────────────────────
    if (action === "request_reopen") {
      const { group_id, participant_id } = body;
      if (!group_id) throw new Error("group_id is required");

      const { error } = await supabase
        .from("dive_groups")
        .update({
          consensus_status: "reopen_requested",
          reopen_requested_by: participant_id || null,
          reopen_requested_at: new Date().toISOString(),
        })
        .eq("id", group_id);
      if (error) throw error;

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── APPROVE REOPEN ─────────────────────────────────────────
    if (action === "approve_reopen") {
      const { group_id } = body;
      if (!group_id) throw new Error("group_id is required");

      const { error } = await supabase
        .from("dive_groups")
        .update({
          consensus_status: "reopened",
          reopen_requested_by: null,
          reopen_requested_at: null,
        })
        .eq("id", group_id);
      if (error) throw error;

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── DENY REOPEN ────────────────────────────────────────────
    if (action === "deny_reopen") {
      const { group_id } = body;
      if (!group_id) throw new Error("group_id is required");

      const { error } = await supabase
        .from("dive_groups")
        .update({
          consensus_status: "validated",
          reopen_requested_by: null,
          reopen_requested_at: null,
        })
        .eq("id", group_id);
      if (error) throw error;

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── GET REOPEN REQUESTS (admin) ────────────────────────────
    if (action === "get_reopen_requests") {
      const { data: groups, error } = await supabase
        .from("dive_groups")
        .select("id, name, institution_name, reopen_requested_by, reopen_requested_at")
        .eq("consensus_status", "reopen_requested");
      if (error) throw error;

      // Fetch requester names
      const requests = [];
      for (const g of groups || []) {
        let requesterName = null;
        if (g.reopen_requested_by) {
          const { data: p } = await supabase
            .from("dive_participants")
            .select("name")
            .eq("id", g.reopen_requested_by)
            .single();
          requesterName = p?.name || null;
        }
        requests.push({
          group_id: g.id,
          group_name: g.name,
          institution_name: g.institution_name,
          requester_name: requesterName,
          requested_at: g.reopen_requested_at,
        });
      }

      return new Response(JSON.stringify({ requests }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── GET ALL GROUP CONSENSUSES (plenary) ────────────────────
    if (action === "get_group_consensuses") {
      // Fetch all groups with their consensus status
      const { data: groups, error: grpErr } = await supabase
        .from("dive_groups")
        .select("id, name, institution_name, consensus_status, consensus_validated_at");
      if (grpErr) throw grpErr;

      // Exclude admin group (contains admin email)
      const ADMIN_EMAIL = "dlegrain@gmail.com";
      const { data: adminParticipant } = await supabase
        .from("dive_participants")
        .select("group_id")
        .eq("email", ADMIN_EMAIL)
        .limit(1);
      const adminGroupId = adminParticipant?.[0]?.group_id;
      const filteredGroups = (groups || []).filter(
        (g: Record<string, unknown>) => g.id !== adminGroupId
      );

      // Fetch all consensus assessment rows
      const { data: consensusRows, error: consErr } = await supabase
        .from("dive_assessments")
        .select("*")
        .eq("is_consensus", true);
      if (consErr) throw consErr;

      // Build a map of group_id → consensus dimensions
      const consensusMap: Record<string, Record<string, unknown>> = {};
      for (const row of consensusRows || []) {
        consensusMap[row.group_id] = row;
      }

      const result = filteredGroups.map((g: Record<string, unknown>) => {
        const cRow = consensusMap[g.id as string];
        return {
          group_id: g.id,
          institution_name: g.institution_name,
          consensus_status: g.consensus_status || "none",
          consensus_validated_at: g.consensus_validated_at,
          dimensions: cRow ? unflattenRow(cRow) : null,
        };
      });

      return new Response(JSON.stringify({ groups: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("group-data error:", error);
    return new Response(
      JSON.stringify({ error: "Group data operation failed", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
