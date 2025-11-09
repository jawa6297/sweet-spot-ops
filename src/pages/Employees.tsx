import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  name: string;
  email: string;
  designation: string;
  status: string;
  branches: { name: string };
  departments: { name: string } | null;
}

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select(`
          *,
          branches (name),
          departments (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
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

  const downloadReport = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-report", {
        body: { reportType: "employees" },
      });

      if (error) throw error;

      // Create CSV
      const csv = [
        ["Name", "Email", "Branch", "Department", "Designation", "Status"],
        ...employees.map((emp) => [
          emp.name,
          emp.email,
          emp.branches.name,
          emp.departments?.name || "N/A",
          emp.designation || "N/A",
          emp.status,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `employees-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();

      toast({
        title: "Report downloaded! 📊",
        description: "Employee report has been saved",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse-soft">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-foreground">
            Employees
          </h2>
          <p className="text-muted-foreground">
            Manage your team across all branches
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((employee, index) => (
          <motion.div
            key={employee.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {employee.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {employee.designation || "No designation"}
                    </p>
                  </div>
                  <Badge
                    variant={
                      employee.status === "active" ? "default" : "secondary"
                    }
                  >
                    {employee.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email: </span>
                    <span className="text-foreground">{employee.email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Branch: </span>
                    <span className="text-foreground">
                      {employee.branches.name}
                    </span>
                  </div>
                  {employee.departments && (
                    <div>
                      <span className="text-muted-foreground">Department: </span>
                      <span className="text-foreground">
                        {employee.departments.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Employees;
