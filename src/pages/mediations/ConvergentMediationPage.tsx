import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Monitor,
  RefreshCw,
  Bell,
  Play,
  Square,
  AlertCircle,
  Info,
  GitMerge
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const convergentStreams = [
  {
    id: "convergent-001",
    name: "CONVERGENT_BILLING_MAIN_STREAM",
    errors: 89,
    warnings: 156,
    instances: 1,
    status: "RUNNING",
    uptime: "18d 14h 22m",
    lastActivity: "1 second ago",
    throughput: "4.2K/sec"
  },
  {
    id: "convergent-002", 
    name: "UNIFIED_RATING_STREAM",
    errors: 234,
    warnings: 67,
    instances: 1,
    status: "PARTIAL",
    uptime: "9d 8h 30m",
    lastActivity: "3 seconds ago",
    throughput: "2.1K/sec"
  },
  {
    id: "convergent-003",
    name: "ACCOUNT_BALANCE_PROCESSOR",
    errors: 12,
    warnings: 28,
    instances: 1,
    status: "RUNNING",
    uptime: "25d 11h 05m",
    lastActivity: "2 seconds ago",
    throughput: "3.8K/sec"
  }
];

export function ConvergentMediationPage() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RUNNING": return "text-success";
      case "PARTIAL": return "text-warning";
      case "STOPPED": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === "RUNNING" ? "default" :
                   status === "PARTIAL" ? "secondary" : 
                   "destructive";
    
    return (
      <Badge variant={variant} className="text-xs font-medium">
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-6 p-6">
        {/* Dashboard Header */}
        <Card className="border border-border bg-card">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted">
                    <GitMerge className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      Convergent Mediation
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Real-time monitoring of unified billing and rating streams
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-9"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <div className="flex flex-col items-end gap-1 ml-4">
                  <div className="text-xs text-muted-foreground">
                    {currentTime.toLocaleDateString()}
                  </div>
                  <div className="text-sm font-bold text-primary">
                    {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-6">
          <Card className="border border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted">
                  <Play className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-success">
                    {convergentStreams.filter(stream => stream.status === "RUNNING").length}
                  </div>
                  <div className="text-sm text-muted-foreground">All Running Streams</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted">
                  <Square className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-destructive">
                    {convergentStreams.filter(stream => stream.status === "STOPPED").length}
                  </div>
                  <div className="text-sm text-muted-foreground">All Stopped Streams</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted">
                  <Monitor className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {convergentStreams.length}
                  </div>
                  <div className="text-sm text-muted-foreground">All Streams</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-destructive">
                    335
                  </div>
                  <div className="text-sm text-muted-foreground">Total Errors</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted">
                  <AlertCircle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-warning">
                    251
                  </div>
                  <div className="text-sm text-muted-foreground">Total Warnings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted">
                  <Info className="h-5 w-5 text-info" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-info">
                    43
                  </div>
                  <div className="text-sm text-muted-foreground">Info Messages</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Streams Table */}
        <Card className="border border-border bg-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg font-semibold text-foreground">Streams</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2">
                  <label htmlFor="status-filter" className="text-sm font-medium text-muted-foreground">
                    Filter by:
                  </label>
                  <select 
                    id="status-filter"
                    className="h-9 border border-input bg-background px-3 py-1 text-sm text-foreground"
                    defaultValue="all"
                  >
                    <option value="all">All Status</option>
                    <option value="RUNNING">Running</option>
                    <option value="STOPPED">Stopped</option>
                    <option value="PARTIAL">Partial</option>
                  </select>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search flows..."
                    className="h-9 w-full sm:w-64 border border-input bg-background px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 border-b border-border">
                    <tr>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">
                        Stream Name
                      </th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">
                        Errors / Warnings  
                      </th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">
                        Instances
                      </th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">
                        Status
                      </th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">
                        Throughput
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {convergentStreams.map((stream) => (
                      <tr 
                        key={stream.id}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => navigate(`/streams/${stream.id}`)}
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {stream.name}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${stream.errors > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {stream.errors.toLocaleString()}
                            </span>
                            <span className="text-muted-foreground">/</span>
                            <span className={`font-medium ${stream.warnings > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
                              {stream.warnings}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {stream.instances}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(stream.status)}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {stream.throughput}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
              <div className="text-sm text-muted-foreground">
                Showing 1 to {convergentStreams.length} of {convergentStreams.length} flows
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}