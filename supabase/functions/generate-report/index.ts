import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { reportType } = await req.json();

    let data, error;

    switch (reportType) {
      case "employees":
        ({ data, error } = await supabaseClient
          .from("employees")
          .select(`
            *,
            branches (name),
            departments (name)
          `));
        break;

      case "tasks":
        ({ data, error } = await supabaseClient
          .from("tasks")
          .select(`
            *,
            employees (name),
            departments (name)
          `));
        break;

      case "attendance":
        ({ data, error } = await supabaseClient
          .from("attendance")
          .select(`
            *,
            employees (name),
            branches (name)
          `)
          .order("date", { ascending: false })
          .limit(100));
        break;

      case "analytics":
        const [employees, tasks, attendance, branches] = await Promise.all([
          supabaseClient.from("employees").select("*", { count: "exact" }),
          supabaseClient.from("tasks").select("*", { count: "exact" }),
          supabaseClient.from("attendance").select("*", { count: "exact" }),
          supabaseClient.from("branches").select("*", { count: "exact" }),
        ]);

        data = {
          summary: {
            totalEmployees: employees.count || 0,
            totalTasks: tasks.count || 0,
            totalAttendanceRecords: attendance.count || 0,
            totalBranches: branches.count || 0,
          },
          employees: employees.data,
          tasks: tasks.data,
          attendance: attendance.data,
          branches: branches.data,
        };
        error = null;
        break;

      default:
        throw new Error("Invalid report type");
    }

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
