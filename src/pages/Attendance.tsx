import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

interface Branch {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  geo_fence_radius: number;
}

interface AttendanceRecord {
  id: string;
  employee_id: string;
  check_in_time: string;
  check_out_time: string | null;
  distance_from_branch: number;
  latitude: number;
  longitude: number;
  status: string;
  employees: {
    name: string;
  };
}

const Attendance = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [userAttendance, setUserAttendance] = useState<AttendanceRecord | null>(null);
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);

  useEffect(() => {
    fetchBranches();
    fetchTodayAttendance();
    getCurrentLocation();
    fetchCurrentEmployee();
  }, []);

  const fetchCurrentEmployee = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setCurrentEmployee(data);
    }
  };

  const fetchBranches = async () => {
    const { data, error } = await supabase
      .from("branches")
      .select("*");

    if (data) {
      setBranches(data);
      if (data.length > 0) {
        setSelectedBranch(data[0]);
      }
    }
  };

  const fetchTodayAttendance = async () => {
    const today = new Date().toISOString().split("T")[0];
    
    const { data, error } = await supabase
      .from("attendance")
      .select(`
        *,
        employees (
          name
        )
      `)
      .eq("date", today)
      .order("check_in_time", { ascending: false });

    if (data) {
      setTodayAttendance(data as any);
      
      // Find user's attendance for today
      if (user && currentEmployee) {
        const userRecord = data.find((record: any) => record.employee_id === currentEmployee.id);
        setUserAttendance(userRecord as any || null);
      }
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
        toast({
          title: "Location detected",
          description: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`,
        });
      },
      (error) => {
        toast({
          title: "Location access denied",
          description: "Please enable location access to check in",
          variant: "destructive",
        });
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c); // Distance in meters
  };

  const handleCheckIn = async () => {
    if (!location || !selectedBranch || !currentEmployee) {
      toast({
        title: "Missing information",
        description: "Please enable location and select a branch",
        variant: "destructive",
      });
      return;
    }

    const distance = calculateDistance(
      location.lat,
      location.lng,
      selectedBranch.latitude,
      selectedBranch.longitude
    );

    const withinRadius = distance <= selectedBranch.geo_fence_radius;

    setLoading(true);

    const { data, error } = await supabase
      .from("attendance")
      .insert({
        employee_id: currentEmployee.id,
        branch_id: selectedBranch.id,
        check_in_time: new Date().toISOString(),
        latitude: location.lat,
        longitude: location.lng,
        distance_from_branch: distance,
        date: new Date().toISOString().split("T")[0],
        status: withinRadius ? "present" : "late",
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast({
        title: "Check-in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: withinRadius ? "✅ Checked In" : "⚠️ Checked In (Outside Range)",
        description: `Distance: ${distance}m from ${selectedBranch.name}`,
      });
      fetchTodayAttendance();
    }
  };

  const handleCheckOut = async () => {
    if (!userAttendance) return;

    setLoading(true);

    const checkInTime = new Date(userAttendance.check_in_time);
    const checkOutTime = new Date();
    const workedHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    const { error } = await supabase
      .from("attendance")
      .update({
        check_out_time: checkOutTime.toISOString(),
        worked_hours: parseFloat(workedHours.toFixed(2)),
      })
      .eq("id", userAttendance.id);

    setLoading(false);

    if (error) {
      toast({
        title: "Check-out failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "✅ Checked Out",
        description: `Worked ${workedHours.toFixed(1)} hours`,
      });
      fetchTodayAttendance();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">
          Attendance Tracking
        </h2>
        <p className="text-muted-foreground">
          Live location-based check-in/check-out system
        </p>
      </div>

      {/* Check-in Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-bold text-foreground">
            📍 Live Location Check-in
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            <span className="ml-2">Refresh Location</span>
          </Button>
        </div>

        {location && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Current Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
            {selectedBranch && (
              <p className="text-sm text-muted-foreground mt-1">
                Distance from {selectedBranch.name}:{" "}
                {calculateDistance(
                  location.lat,
                  location.lng,
                  selectedBranch.latitude,
                  selectedBranch.longitude
                )}
                m (Max: {selectedBranch.geo_fence_radius}m)
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Select Branch
            </label>
            <select
              className="w-full p-2 rounded-lg border border-border bg-background text-foreground"
              value={selectedBranch?.id || ""}
              onChange={(e) => {
                const branch = branches.find((b) => b.id === e.target.value);
                setSelectedBranch(branch || null);
              }}
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            {!userAttendance ? (
              <Button
                className="flex-1"
                onClick={handleCheckIn}
                disabled={loading || !location || !selectedBranch}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Check In
              </Button>
            ) : !userAttendance.check_out_time ? (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCheckOut}
                disabled={loading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Check Out
              </Button>
            ) : (
              <div className="flex-1 p-4 bg-success/10 border border-success rounded-lg text-center">
                <p className="text-success font-semibold">
                  ✅ Already checked out today
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Today's Attendance */}
      <Card className="p-6">
        <h3 className="font-display text-xl font-bold text-foreground mb-4">
          Today's Attendance ({todayAttendance.length})
        </h3>

        <div className="space-y-3">
          {todayAttendance.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-muted rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    record.check_out_time
                      ? "bg-success/20 text-success"
                      : "bg-primary/20 text-primary"
                  }`}
                >
                  {record.check_out_time ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {record.employees.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Check-in: {new Date(record.check_in_time).toLocaleTimeString()}
                    {record.check_out_time &&
                      ` • Check-out: ${new Date(record.check_out_time).toLocaleTimeString()}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {record.distance_from_branch}m away
                </p>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    record.status === "present"
                      ? "bg-success/20 text-success"
                      : "bg-warning/20 text-warning"
                  }`}
                >
                  {record.status}
                </span>
              </div>
            </motion.div>
          ))}

          {todayAttendance.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No attendance records for today
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Attendance;
