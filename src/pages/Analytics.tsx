import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, TrendingUp, Users, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalTasks: 0,
    completedTasks: 0,
    averageCompletionRate: 0,
    attendanceToday: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [employees, tasks, attendance] = await Promise.all([
        supabase.from("employees").select("*", { count: "exact" }),
        supabase.from("tasks").select("*", { count: "exact" }),
        supabase
          .from("attendance")
          .select("*", { count: "exact" })
          .eq("date", new Date().toISOString().split("T")[0]),
      ]);

      const completedTasks =
        tasks.data?.filter((t) => t.status === "completed").length || 0;
      const activeEmps =
        employees.data?.filter((e) => e.status === "active").length || 0;

      setAnalytics({
        totalEmployees: employees.count || 0,
        activeEmployees: activeEmps,
        totalTasks: tasks.count || 0,
        completedTasks,
        averageCompletionRate:
          tasks.count ? Math.round((completedTasks / tasks.count) * 100) : 0,
        attendanceToday: attendance.count || 0,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const downloadFullReport = async () => {
    try {
      // Generate comprehensive report
      const reportData = {
        generatedAt: new Date().toISOString(),
        analytics,
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split("T")[0]}.json`;
      a.click();

      toast({
        title: "Report downloaded! 📊",
        description: "Full analytics report has been saved",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const metrics = [
    {
      title: "Total Employees",
      value: analytics.totalEmployees,
      icon: Users,
      color: "text-accent",
      change: "+12%",
    },
    {
      title: "Present Today",
      value: analytics.attendanceToday,
      icon: CheckCircle,
      color: "text-success",
      change: "+5%",
    },
    {
      title: "Completion Rate",
      value: `${analytics.averageCompletionRate}%`,
      icon: TrendingUp,
      color: "text-secondary",
      change: "+8%",
    },
    {
      title: "Active Tasks",
      value: analytics.totalTasks - analytics.completedTasks,
      icon: Clock,
      color: "text-primary",
      change: "3 urgent",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-foreground">
            Analytics & Reports
          </h2>
          <p className="text-muted-foreground">
            Track performance and download detailed reports
          </p>
        </div>
        <Button onClick={downloadFullReport}>
          <Download className="mr-2 h-4 w-4" />
          Download Full Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <metric.icon className={`h-8 w-8 ${metric.color}`} />
                <span className="text-xs text-success font-medium">
                  {metric.change}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <p className="text-3xl font-bold text-foreground">
                  {metric.value}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-display text-xl font-bold text-foreground mb-4">
            Task Distribution
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completed</span>
              <span className="text-sm font-medium text-success">
                {analytics.completedTasks}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">In Progress</span>
              <span className="text-sm font-medium text-accent">
                {analytics.totalTasks - analytics.completedTasks}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-sm font-medium text-foreground">
                {analytics.totalTasks}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-xl font-bold text-foreground mb-4">
            Employee Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active</span>
              <span className="text-sm font-medium text-success">
                {analytics.activeEmployees}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Inactive/Leave
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {analytics.totalEmployees - analytics.activeEmployees}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-sm font-medium text-foreground">
                {analytics.totalEmployees}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
