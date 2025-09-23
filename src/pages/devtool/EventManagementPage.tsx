import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Eye,
  RefreshCcw,
  Trash2,
  RotateCcw,
  ExternalLink,
  Activity,
  AlertCircle,
  Users,
  BarChart3,
  Network,
  Clock,
  Zap,
  Database,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for Kafka Topics
const mockKafkaTopics = [
  {
    id: "topic-001",
    name: "flow-data-stream",
    status: "Created",
    partitions: 3,
    replicationFactor: 2,
    linkedFlowEdge: "Node-A → Node-B",
    flowId: "flow-001",
    lastError: null,
    createdBy: "admin@safaricom.co.ke",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    metrics: {
      totalMessages: 15420,
      consumerGroups: ["group-1", "group-2"],
      groupLags: { "group-1": 5, "group-2": 12 }
    }
  },
  {
    id: "topic-002", 
    name: "error-notifications",
    status: "Failed",
    partitions: 1,
    replicationFactor: 1,
    linkedFlowEdge: null,
    flowId: null,
    lastError: "Failed to create topic: insufficient replicas",
    createdBy: "system@safaricom.co.ke",
    createdAt: "2024-01-14T14:22:00Z",
    updatedAt: "2024-01-14T14:22:00Z",
    metrics: {
      totalMessages: 0,
      consumerGroups: [],
      groupLags: {}
    }
  },
  {
    id: "topic-003",
    name: "billing-events",
    status: "Pending",
    partitions: 5,
    replicationFactor: 3,
    linkedFlowEdge: "Billing-Collector → Processor",
    flowId: "flow-003",
    lastError: null,
    createdBy: "billing@safaricom.co.ke",
    createdAt: "2024-01-16T09:15:00Z",
    updatedAt: "2024-01-16T09:15:00Z",
    metrics: {
      totalMessages: 8932,
      consumerGroups: ["billing-group"],
      groupLags: { "billing-group": 23 }
    }
  }
];

export function EventManagementPage() {
  const { toast } = useToast();
  const [topics, setTopics] = useState(mockKafkaTopics);
  const [filteredTopics, setFilteredTopics] = useState(mockKafkaTopics);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [flowFilter, setFlowFilter] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [showTopicDetail, setShowTopicDetail] = useState(false);

  // Filter topics based on search and filters
  useEffect(() => {
    let filtered = topics;

    if (searchTerm) {
      filtered = filtered.filter(topic =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(topic => topic.status.toLowerCase() === statusFilter);
    }

    if (flowFilter !== "all") {
      filtered = filtered.filter(topic => topic.flowId === flowFilter);
    }

    setFilteredTopics(filtered);
  }, [topics, searchTerm, statusFilter, flowFilter]);

  const handleViewDetails = (topic: any) => {
    setSelectedTopic(topic);
    setShowTopicDetail(true);
  };

  const handleRetryCreate = async (topicId: string) => {
    try {
      // Mock API call
      setTopics(topics.map(topic => 
        topic.id === topicId 
          ? { ...topic, status: "Pending", lastError: null, updatedAt: new Date().toISOString() }
          : topic
      ));
      toast({
        title: "Success",
        description: "Topic creation retry initiated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to retry topic creation",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      // Mock API call
      setTopics(topics.filter(topic => topic.id !== topicId));
      toast({
        title: "Success",
        description: "Topic deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to delete topic",
        variant: "destructive"
      });
    }
  };

  const handleSyncWithKafka = async (topicId: string) => {
    try {
      // Mock API call to sync with Kafka
      setTopics(topics.map(topic =>
        topic.id === topicId
          ? { ...topic, status: "Created", updatedAt: new Date().toISOString() }
          : topic
      ));
      toast({
        title: "Success",
        description: "Synced with Kafka cluster successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync with Kafka",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      Created: "bg-success text-success-foreground border-success",
      Pending: "bg-secondary text-secondary-foreground border-secondary", 
      Failed: "bg-destructive text-destructive-foreground border-destructive"
    };
    return variants[status as keyof typeof variants] || "bg-secondary text-secondary-foreground border-secondary";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString();
  };

  const truncateError = (error: string | null) => {
    if (!error) return "N/A";
    return error.length > 50 ? error.substring(0, 50) + "..." : error;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="professional-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Event Management</h1>
            <p className="text-muted-foreground mt-1">Manage Kafka topics and event streaming infrastructure</p>
          </div>
          <Button className="hover-scale">
            <Plus className="h-4 w-4 mr-2" />
            Create Topic
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">{topics.length}</p>
              <p className="text-sm text-muted-foreground">Total Topics</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Database className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-success">{topics.filter(t => t.status === 'Created').length}</p>
              <p className="text-sm text-muted-foreground">Active Topics</p>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-warning">{topics.filter(t => t.status === 'Pending').length}</p>
              <p className="text-sm text-muted-foreground">Pending Topics</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-destructive">{topics.filter(t => t.status === 'Failed').length}</p>
              <p className="text-sm text-muted-foreground">Failed Topics</p>
            </div>
            <div className="p-3 bg-destructive/10 rounded-lg">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="professional-card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search topics by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 surface-interactive"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] surface-interactive">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border shadow-lg">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={flowFilter} onValueChange={setFlowFilter}>
              <SelectTrigger className="w-[140px] surface-interactive">
                <SelectValue placeholder="All Flows" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border shadow-lg">
                <SelectItem value="all">All Flows</SelectItem>
                <SelectItem value="flow-001">Flow 001</SelectItem>
                <SelectItem value="flow-003">Flow 003</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Topics Table */}
      <div className="professional-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/50">
              <TableHead className="h-14 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Topic Name
              </TableHead>
              <TableHead className="h-14 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="h-14 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Configuration
              </TableHead>
              <TableHead className="h-14 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Flow Link
              </TableHead>
              <TableHead className="h-14 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Error Status
              </TableHead>
              <TableHead className="h-14 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Owner
              </TableHead>
              <TableHead className="h-14 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Created
              </TableHead>
              <TableHead className="h-14 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTopics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-muted/30 rounded-full">
                      <Activity className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <div>
                      <p className="font-medium">No topics found</p>
                      <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTopics.map((topic) => (
                <TableRow key={topic.id} className="hover:bg-muted/30 transition-colors border-b border-border/50">
                  <TableCell className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="font-semibold text-foreground">{topic.name}</div>
                      <div className="text-xs text-muted-foreground">ID: {topic.id}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <Badge 
                      variant="outline"
                      className={`text-xs font-medium ${getStatusBadge(topic.status)}`}
                    >
                      {topic.status === 'Created' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {topic.status === 'Pending' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {topic.status === 'Failed' && <XCircle className="h-3 w-3 mr-1" />}
                      {topic.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{topic.partitions} partitions</div>
                      <div className="text-xs text-muted-foreground">RF: {topic.replicationFactor}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    {topic.linkedFlowEdge ? (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-primary hover:text-primary/80 font-medium"
                        onClick={() => {/* Navigate to flow detail */}}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {topic.linkedFlowEdge}
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">No flow linked</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    {topic.lastError ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 text-destructive cursor-help">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-xs font-medium">{truncateError(topic.lastError)}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-card border border-border shadow-lg max-w-sm">
                            <p>{topic.lastError}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <div className="flex items-center gap-1 text-success">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xs font-medium">No errors</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{topic.createdBy.split('@')[0]}</div>
                      <div className="text-xs text-muted-foreground">{topic.createdBy.split('@')[1]}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(topic.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(topic)}
                        className="hover-scale"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {topic.status === "Failed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetryCreate(topic.id)}
                          className="hover-scale text-warning border-warning/30 hover:bg-warning/10"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Retry
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSyncWithKafka(topic.id)}
                        className="hover-scale"
                      >
                        <RefreshCcw className="h-3 w-3 mr-1" />
                        Sync
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTopic(topic.id)}
                        className="hover-scale text-destructive border-destructive/30 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Topic Detail Dialog */}
      <Dialog open={showTopicDetail} onOpenChange={setShowTopicDetail}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto bg-card border border-border shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Topic Details: {selectedTopic?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTopic && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Topic Info</TabsTrigger>
                <TabsTrigger value="metrics">Kafka Metrics</TabsTrigger>
                <TabsTrigger value="flow">Flow Link</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-6">
                <div className="grid gap-6">
                  <div className="professional-card p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Topic Name</Label>
                        <p className="text-base font-semibold text-foreground">{selectedTopic.name}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status</Label>
                        <div>
                          <Badge variant="outline" className={`text-sm font-medium ${getStatusBadge(selectedTopic.status)}`}>
                            {selectedTopic.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Partitions</Label>
                        <p className="text-base font-semibold text-foreground">{selectedTopic.partitions}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Replication Factor</Label>
                        <p className="text-base font-semibold text-foreground">{selectedTopic.replicationFactor}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Created By</Label>
                        <p className="text-base text-foreground">{selectedTopic.createdBy}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Created At</Label>
                        <p className="text-sm text-muted-foreground mt-1">{formatDate(selectedTopic.createdAt)}</p>
                      </div>
                    </div>
                    {selectedTopic.lastError && (
                      <div className="mt-6 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                        <Label className="text-sm font-medium text-destructive uppercase tracking-wider">Error Message</Label>
                        <p className="text-sm text-destructive mt-2">
                          {selectedTopic.lastError}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="metrics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="professional-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Messages</h3>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{selectedTopic.metrics.totalMessages.toLocaleString()}</p>
                  </div>
                  <div className="professional-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-info/10 rounded-lg">
                        <Users className="h-5 w-5 text-info" />
                      </div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Consumer Groups</h3>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{selectedTopic.metrics.consumerGroups.length}</p>
                  </div>
                  <div className="professional-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-warning/10 rounded-lg">
                        <Network className="h-5 w-5 text-warning" />
                      </div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Partitions</h3>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{selectedTopic.partitions}</p>
                  </div>
                </div>
                
                {selectedTopic.metrics.consumerGroups.length > 0 && (
                  <div className="professional-card p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Consumer Group Lag</h3>
                    <div className="space-y-3">
                      {selectedTopic.metrics.consumerGroups.map((group: string) => (
                        <div key={group} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border">
                          <span className="font-medium text-foreground">{group}</span>
                          <Badge variant="outline" className="bg-warning text-warning-foreground border-warning">
                            Lag: {selectedTopic.metrics.groupLags[group] || 0}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="flow" className="space-y-6">
                <div className="professional-card p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Flow Connection</h3>
                  {selectedTopic.linkedFlowEdge ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Connected Flow Edge</Label>
                        <p className="text-base font-semibold text-foreground">{selectedTopic.linkedFlowEdge}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Flow ID</Label>
                        <p className="text-base font-semibold text-foreground">{selectedTopic.flowId}</p>
                      </div>
                      <Button variant="outline" className="w-fit hover-scale mt-4">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Flow Details
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto mb-4">
                        <Network className="h-12 w-12 opacity-50" />
                      </div>
                      <p className="text-lg">No Flow Connection</p>
                      <p className="text-sm mt-1">This topic is not linked to any flow edge</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}