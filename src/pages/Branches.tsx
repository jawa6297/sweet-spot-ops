import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Branch {
  id: string;
  name: string;
  location: string;
  geo_fence_radius: number;
  pf_enabled: boolean;
  pf_percentage: number;
}

const Branches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .order("name");

      if (error) throw error;
      setBranches(data || []);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse-soft">Loading branches...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-foreground">
            Branches
          </h2>
          <p className="text-muted-foreground">
            Manage your locations and geo-fencing settings
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Branch
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch, index) => (
          <motion.div
            key={branch.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {branch.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {branch.location}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Geo-Fence:</span>
                    <span className="text-foreground font-medium">
                      {branch.geo_fence_radius}m
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">PF Enabled:</span>
                    <Badge
                      variant={branch.pf_enabled ? "default" : "secondary"}
                    >
                      {branch.pf_enabled ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {branch.pf_enabled && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">PF Rate:</span>
                      <span className="text-foreground font-medium">
                        {branch.pf_percentage}%
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

export default Branches;
