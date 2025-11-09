import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, ClipboardList, Building2, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [stats, setStats] = useState({
    employees: 0,
    tasks: 0,
    branches: 0,
    activeToday: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [employees, tasks, branches, attendance] = await Promise.all([
        supabase.from("employees").select("*", { count: "exact", head: true }),
        supabase.from("tasks").select("*", { count: "exact", head: true }),
        supabase.from("branches").select("*", { count: "exact", head: true }),
        supabase
          .from("attendance")
          .select("*", { count: "exact", head: true })
          .eq("date", new Date().toISOString().split("T")[0]),
      ]);

      setStats({
        employees: employees.count || 0,
        tasks: tasks.count || 0,
        branches: branches.count || 0,
        activeToday: attendance.count || 0,
      });
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Employees",
      value: stats.employees,
      icon: Users,
      color: "text-accent",
    },
    {
      title: "Active Tasks",
      value: stats.tasks,
      icon: ClipboardList,
      color: "text-success",
    },
    {
      title: "Branches",
      value: stats.branches,
      icon: Building2,
      color: "text-secondary",
    },
    {
      title: "Present Today",
      value: stats.activeToday,
      icon: TrendingUp,
      color: "text-primary",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">
          Welcome back! 🍬
        </h2>
        <p className="text-muted-foreground">
          Here's what's happening with your operations today
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="font-display text-xl font-bold text-foreground mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left rounded-lg border border-border hover:bg-muted/50 transition-colors">
            <div className="font-semibold text-foreground mb-1">Add Employee</div>
            <div className="text-sm text-muted-foreground">
              Register a new team member
            </div>
          </button>
          <button className="p-4 text-left rounded-lg border border-border hover:bg-muted/50 transition-colors">
            <div className="font-semibold text-foreground mb-1">Create Task</div>
            <div className="text-sm text-muted-foreground">
              Assign work to your team
            </div>
          </button>
          <button className="p-4 text-left rounded-lg border border-border hover:bg-muted/50 transition-colors">
            <div className="font-semibold text-foreground mb-1">View Reports</div>
            <div className="text-sm text-muted-foreground">
              Download analytics
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
