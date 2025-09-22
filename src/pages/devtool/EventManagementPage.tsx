import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Clock
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
    <div className="bg-card rounded-lg border border-border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Event Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage Kafka topics and event streams</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Create Topic
        </Button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-border bg-muted/10">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search topics by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={flowFilter} onValueChange={setFlowFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Flows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Flows</SelectItem>
                <SelectItem value="flow-001">Flow 001</SelectItem>
                <SelectItem value="flow-003">Flow 003</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Topics Table */}
      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/30">
              <TableHead className="h-12 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Name
              </TableHead>
              <TableHead className="h-12 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="h-12 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Partitions
              </TableHead>
              <TableHead className="h-12 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Replication Factor
              </TableHead>
              <TableHead className="h-12 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Linked Flow Edge
              </TableHead>
              <TableHead className="h-12 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Last Error
              </TableHead>
              <TableHead className="h-12 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Created By
              </TableHead>
              <TableHead className="h-12 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Created At
              </TableHead>
              <TableHead className="h-12 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTopics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Activity className="h-8 w-8 text-muted-foreground/50" />
                    <span className="text-sm">No topics found</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTopics.map((topic) => (
                <TableRow key={topic.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="font-medium text-foreground">{topic.name}</div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge 
                      variant="outline"
                      className={`text-xs font-medium ${getStatusBadge(topic.status)}`}
                    >
                      {topic.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                    {topic.partitions}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                    {topic.replicationFactor}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {topic.linkedFlowEdge ? (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-primary hover:text-primary/80"
                        onClick={() => {/* Navigate to flow detail */}}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {topic.linkedFlowEdge}
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {topic.lastError ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 text-destructive cursor-help">
                              <AlertCircle className="h-3 w-3" />
                              <span className="text-xs">{truncateError(topic.lastError)}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{topic.lastError}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                    {topic.createdBy}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDate(topic.createdAt)}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(topic)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                      {topic.status === "Failed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetryCreate(topic.id)}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Retry
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSyncWithKafka(topic.id)}
                      >
                        <RefreshCcw className="h-3 w-3 mr-1" />
                        Sync
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTopic(topic.id)}
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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Topic Details: {selectedTopic?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedTopic && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Topic Info</TabsTrigger>
                <TabsTrigger value="metrics">Kafka Metrics</TabsTrigger>
                <TabsTrigger value="flow">Flow Link</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Name</Label>
                        <p className="text-sm text-muted-foreground mt-1">{selectedTopic.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="mt-1">
                          <Badge variant="outline" className={`text-xs ${getStatusBadge(selectedTopic.status)}`}>
                            {selectedTopic.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Partitions</Label>
                        <p className="text-sm text-muted-foreground mt-1">{selectedTopic.partitions}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Replication Factor</Label>
                        <p className="text-sm text-muted-foreground mt-1">{selectedTopic.replicationFactor}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Created By</Label>
                        <p className="text-sm text-muted-foreground mt-1">{selectedTopic.createdBy}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Created At</Label>
                        <p className="text-sm text-muted-foreground mt-1">{formatDate(selectedTopic.createdAt)}</p>
                      </div>
                    </div>
                    {selectedTopic.lastError && (
                      <div>
                        <Label className="text-sm font-medium text-destructive">Error Message</Label>
                        <p className="text-sm text-destructive mt-1 p-2 bg-destructive/10 rounded border">
                          {selectedTopic.lastError}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="metrics" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Total Messages
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{selectedTopic.metrics.totalMessages.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Consumer Groups
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{selectedTopic.metrics.consumerGroups.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Network className="h-4 w-4" />
                        Partitions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{selectedTopic.partitions}</p>
                    </CardContent>
                  </Card>
                </div>
                
                {selectedTopic.metrics.consumerGroups.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Consumer Group Lag</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedTopic.metrics.consumerGroups.map((group: string) => (
                          <div key={group} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                            <span className="font-medium">{group}</span>
                            <Badge variant="outline" className="bg-warning text-warning-foreground border-warning">
                              Lag: {selectedTopic.metrics.groupLags[group] || 0}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="flow" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Flow Connection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedTopic.linkedFlowEdge ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Connected Flow Edge</Label>
                          <p className="text-sm text-muted-foreground mt-1">{selectedTopic.linkedFlowEdge}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Flow ID</Label>
                          <p className="text-sm text-muted-foreground mt-1">{selectedTopic.flowId}</p>
                        </div>
                        <Button variant="outline" className="w-fit">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Flow Details
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>This topic is not linked to any flow edge</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}