import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  progress_percentage: number;
  employees: { name: string } | null;
  departments: { name: string } | null;
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          employees (name),
          departments (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      todo: "bg-muted",
      in_progress: "bg-accent",
      blocked: "bg-destructive",
      completed: "bg-success",
    };
    return colors[status] || "bg-muted";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "text-success",
      medium: "text-accent",
      high: "text-secondary",
      urgent: "text-destructive",
    };
    return colors[priority] || "text-muted-foreground";
  };

  const groupedTasks = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    blocked: tasks.filter((t) => t.status === "blocked"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse-soft">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-foreground">
            Tasks
          </h2>
          <p className="text-muted-foreground">
            Manage and track work across your organization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {Object.entries(groupedTasks).map(([status, statusTasks]) => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground capitalize">
                {status.replace("_", " ")}
              </h3>
              <Badge variant="outline">{statusTasks.length}</Badge>
            </div>

            <div className="space-y-3">
              {statusTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-4 hover:shadow-md transition-all duration-300">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-foreground text-sm">
                          {task.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className={getPriorityColor(task.priority)}
                        >
                          {task.priority}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {task.employees && (
                        <div className="text-xs text-muted-foreground">
                          👤 {task.employees.name}
                        </div>
                      )}

                      {task.progress_percentage > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              Progress
                            </span>
                            <span className="text-foreground font-medium">
                              {task.progress_percentage}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getStatusColor(task.status)}`}
                              style={{
                                width: `${task.progress_percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
