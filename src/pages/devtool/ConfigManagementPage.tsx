import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Database,
  Shield,
  Settings,
  History,
  Copy,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for Kafka Configs
const mockKafkaConfigs = [
  {
    id: "config-001",
    name: "production-kafka",
    version: "v1.2.0",
    active: true,
    bootstrapServers: "kafka1.safaricom.co.ke:9092,kafka2.safaricom.co.ke:9092,kafka3.safaricom.co.ke:9092",
    securityProtocol: "SASL_SSL",
    clientId: "mediation-producer-001",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
    createdBy: "admin@safaricom.co.ke",
    updatedBy: "devops@safaricom.co.ke",
    saslMechanism: "PLAIN",
    saslUsername: "mediation-user",
    saslPassword: "***encrypted***",
    retries: 3,
    requestTimeoutMs: 30000,
    versionComment: "Updated security settings for production deployment",
    history: [
      {
        version: "v1.2.0",
        createdAt: "2024-01-15T14:30:00Z",
        createdBy: "devops@safaricom.co.ke",
        comment: "Updated security settings for production deployment",
        active: true
      },
      {
        version: "v1.1.0", 
        createdAt: "2024-01-12T10:15:00Z",
        createdBy: "admin@safaricom.co.ke",
        comment: "Increased retry count and timeout values",
        active: false
      },
      {
        version: "v1.0.0",
        createdAt: "2024-01-10T08:00:00Z", 
        createdBy: "admin@safaricom.co.ke",
        comment: "Initial configuration setup",
        active: false
      }
    ]
  },
  {
    id: "config-002",
    name: "staging-kafka",
    version: "v2.0.0",
    active: false,
    bootstrapServers: "kafka-staging1.safaricom.co.ke:9092,kafka-staging2.safaricom.co.ke:9092",
    securityProtocol: "PLAINTEXT",
    clientId: "mediation-staging-001",
    createdAt: "2024-01-12T09:30:00Z",
    updatedAt: "2024-01-16T11:45:00Z",
    createdBy: "dev@safaricom.co.ke",
    updatedBy: "dev@safaricom.co.ke",
    saslMechanism: null,
    saslUsername: null,
    saslPassword: null,
    retries: 5,
    requestTimeoutMs: 15000,
    versionComment: "Staging environment configuration with enhanced logging",
    history: [
      {
        version: "v2.0.0",
        createdAt: "2024-01-16T11:45:00Z",
        createdBy: "dev@safaricom.co.ke", 
        comment: "Staging environment configuration with enhanced logging",
        active: false
      },
      {
        version: "v1.0.0",
        createdAt: "2024-01-12T09:30:00Z",
        createdBy: "dev@safaricom.co.ke",
        comment: "Initial staging setup",
        active: false
      }
    ]
  },
  {
    id: "config-003",
    name: "development-kafka",
    version: "v1.0.0",
    active: false,
    bootstrapServers: "localhost:9092",
    securityProtocol: "PLAINTEXT",
    clientId: "mediation-dev-001",
    createdAt: "2024-01-08T16:20:00Z",
    updatedAt: "2024-01-08T16:20:00Z",
    createdBy: "developer@safaricom.co.ke",
    updatedBy: "developer@safaricom.co.ke",
    saslMechanism: null,
    saslUsername: null,
    saslPassword: null,
    retries: 1,
    requestTimeoutMs: 10000,
    versionComment: "Local development configuration",
    history: [
      {
        version: "v1.0.0",
        createdAt: "2024-01-08T16:20:00Z",
        createdBy: "developer@safaricom.co.ke",
        comment: "Local development configuration",
        active: false
      }
    ]
  }
];

export function ConfigManagementPage() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState(mockKafkaConfigs);
  const [filteredConfigs, setFilteredConfigs] = useState(mockKafkaConfigs);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [configType, setConfigType] = useState("kafka");
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [showConfigDetail, setShowConfigDetail] = useState(false);
  const [showCreateEdit, setShowCreateEdit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  // Filter configs based on search and filters
  useEffect(() => {
    let filtered = configs;

    if (searchTerm) {
      filtered = filtered.filter(config =>
        config.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeFilter === "active") {
      filtered = filtered.filter(config => config.active);
    } else if (activeFilter === "inactive") {
      filtered = filtered.filter(config => !config.active);
    }

    setFilteredConfigs(filtered);
  }, [configs, searchTerm, activeFilter]);

  const handleViewDetails = (config: any) => {
    setSelectedConfig(config);
    setShowConfigDetail(true);
  };

  const handleActivateConfig = async (configId: string) => {
    try {
      // Deactivate all configs first, then activate the selected one
      setConfigs(configs.map(config => ({
        ...config,
        active: config.id === configId,
        updatedAt: config.id === configId ? new Date().toISOString() : config.updatedAt
      })));
      
      toast({
        title: "Success",
        description: "Configuration activated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate configuration",
        variant: "destructive"
      });
    }
  };

  const handleDeactivateConfig = async (configId: string) => {
    try {
      setConfigs(configs.map(config =>
        config.id === configId
          ? { ...config, active: false, updatedAt: new Date().toISOString() }
          : config
      ));
      
      toast({
        title: "Success",
        description: "Configuration deactivated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deactivate configuration",
        variant: "destructive"
      });
    }
  };

  const handleDeleteConfig = async (configId: string) => {
    try {
      setConfigs(configs.filter(config => config.id !== configId));
      toast({
        title: "Success",
        description: "Configuration deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete configuration",
        variant: "destructive"
      });
    }
  };

  const handleEditConfig = (config: any) => {
    setSelectedConfig(config);
    setEditForm({ ...config });
    setIsEditing(true);
    setShowCreateEdit(true);
  };

  const handleCreateNew = () => {
    setEditForm({
      name: "",
      bootstrapServers: "",
      securityProtocol: "PLAINTEXT",
      clientId: "",
      saslMechanism: "",
      saslUsername: "",
      saslPassword: "",
      retries: 3,
      requestTimeoutMs: 30000,
      versionComment: ""
    });
    setIsEditing(false);
    setShowCreateEdit(true);
  };

  const handleCloneConfig = (config: any) => {
    setEditForm({
      ...config,
      name: `${config.name}-copy`,
      version: "v1.0.0",
      versionComment: `Cloned from ${config.name} ${config.version}`
    });
    setIsEditing(false);
    setShowCreateEdit(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString();
  };

  const truncateServers = (servers: string) => {
    return servers.length > 50 ? servers.substring(0, 50) + "..." : servers;
  };

  const getActiveConfigs = () => configs.filter(config => config.active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="professional-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Configuration Management</h1>
            <p className="text-muted-foreground mt-1">Manage system configurations and service integrations</p>
          </div>
          <div className="flex gap-3">
            <Select value={configType} onValueChange={setConfigType}>
              <SelectTrigger className="w-[160px] surface-interactive">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border shadow-lg">
                <SelectItem value="kafka">Kafka Config</SelectItem>
                <SelectItem value="database" disabled>Database Config</SelectItem>
                <SelectItem value="redis" disabled>Redis Config</SelectItem>
                <SelectItem value="security" disabled>Security Config</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleCreateNew} className="hover-scale">
              <Plus className="h-4 w-4 mr-2" />
              Create {configType === 'kafka' ? 'Kafka' : 'New'} Config
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">{configs.length}</p>
              <p className="text-sm text-muted-foreground">Total Configs</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Database className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-success">{getActiveConfigs().length}</p>
              <p className="text-sm text-muted-foreground">Active Configs</p>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <Power className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-warning">{configs.filter(c => c.securityProtocol === "SASL_SSL").length}</p>
              <p className="text-sm text-muted-foreground">Secure Configs</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg">
              <Shield className="h-6 w-6 text-warning" />
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-info">{configs.reduce((sum, c) => sum + c.history.length, 0)}</p>
              <p className="text-sm text-muted-foreground">Total Versions</p>
            </div>
            <div className="p-3 bg-info/10 rounded-lg">
              <History className="h-6 w-6 text-info" />
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
                placeholder="Search configurations by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 surface-interactive"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[140px] surface-interactive">
                <SelectValue placeholder="All Configs" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border shadow-lg">
                <SelectItem value="all">All Configs</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Configs Table */}
      <div className="professional-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/50">
              <TableHead className="h-14 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Configuration Name
              </TableHead>
              <TableHead className="h-14 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Version & Status
              </TableHead>
              <TableHead className="h-14 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Connection Details
              </TableHead>
              <TableHead className="h-14 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Security
              </TableHead>
              <TableHead className="h-14 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Client Info
              </TableHead>
              <TableHead className="h-14 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Last Updated
              </TableHead>
              <TableHead className="h-14 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConfigs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-muted/30 rounded-full">
                      <Database className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <div>
                      <p className="font-medium">No configurations found</p>
                      <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredConfigs.map((config) => (
                <TableRow key={config.id} className="hover:bg-muted/30 transition-colors border-b border-border/50">
                  <TableCell className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="font-semibold text-foreground">{config.name}</div>
                      <div className="text-xs text-muted-foreground">ID: {config.id}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs font-medium">
                        {config.version}
                      </Badge>
                      <div>
                        {config.active ? (
                          <Badge className="bg-success text-success-foreground border-success">
                            <Power className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            <PowerOff className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{truncateServers(config.bootstrapServers)}</div>
                      <div className="text-xs text-muted-foreground">
                        {config.bootstrapServers.split(',').length} servers
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <Badge 
                      variant="outline"
                      className={`text-xs font-medium ${
                        config.securityProtocol === "SASL_SSL" 
                          ? "bg-success text-success-foreground border-success"
                          : "bg-warning text-warning-foreground border-warning"
                      }`}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {config.securityProtocol}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{config.clientId}</div>
                      <div className="text-xs text-muted-foreground">
                        Retries: {config.retries} | Timeout: {config.requestTimeoutMs}ms
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{formatDate(config.updatedAt)}</div>
                      <div className="text-xs text-muted-foreground">by {config.updatedBy}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(config)}
                        className="hover-scale"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {!config.active ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActivateConfig(config.id)}
                          className="hover-scale text-success border-success/30 hover:bg-success/10"
                        >
                          <Power className="h-3 w-3 mr-1" />
                          Activate
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivateConfig(config.id)}
                          className="hover-scale text-muted-foreground border-muted-foreground/30"
                        >
                          <PowerOff className="h-3 w-3 mr-1" />
                          Deactivate
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditConfig(config)}
                        className="hover-scale"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCloneConfig(config)}
                        className="hover-scale"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Clone
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteConfig(config.id)}
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

      {/* Config Detail Dialog */}
      <Dialog open={showConfigDetail} onOpenChange={setShowConfigDetail}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Config Details: {selectedConfig?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedConfig && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="auth">Auth Info</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Basic Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Name</Label>
                        <p className="text-sm text-muted-foreground mt-1">{selectedConfig.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Version</Label>
                        <Badge variant="outline" className="text-xs mt-1">
                          {selectedConfig.version}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="mt-1">
                          {selectedConfig.active ? (
                            <Badge className="bg-success text-success-foreground border-success">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Security Protocol</Label>
                        <Badge 
                          variant="outline"
                          className={`text-xs mt-1 ${
                            selectedConfig.securityProtocol === "SASL_SSL" 
                              ? "bg-success text-success-foreground border-success"
                              : "bg-warning text-warning-foreground border-warning"
                          }`}
                        >
                          {selectedConfig.securityProtocol}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Bootstrap Servers</Label>
                      <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted/20 rounded border">
                        {selectedConfig.bootstrapServers}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Version Comment</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedConfig.versionComment}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="auth" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Authentication Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedConfig.securityProtocol === "SASL_SSL" ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">SASL Mechanism</Label>
                          <p className="text-sm text-muted-foreground mt-1">{selectedConfig.saslMechanism || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">SASL Username</Label>
                          <p className="text-sm text-muted-foreground mt-1">{selectedConfig.saslUsername || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">SASL Password</Label>
                          <p className="text-sm text-muted-foreground mt-1 font-mono">
                            {selectedConfig.saslPassword || "N/A"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>This configuration does not use authentication</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Advanced Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Client ID</Label>
                        <p className="text-sm text-muted-foreground mt-1">{selectedConfig.clientId}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Retries</Label>
                        <p className="text-sm text-muted-foreground mt-1">{selectedConfig.retries}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Request Timeout (ms)</Label>
                        <p className="text-sm text-muted-foreground mt-1">{selectedConfig.requestTimeoutMs.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Version History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedConfig.history.map((historyItem: any, index: number) => (
                        <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className="flex-shrink-0">
                            <Badge 
                              variant="outline" 
                              className={historyItem.active ? "bg-success text-success-foreground border-success" : ""}
                            >
                              {historyItem.version}
                            </Badge>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-3 w-3" />
                              <span className="text-muted-foreground">{formatDate(historyItem.createdAt)}</span>
                              <span className="text-muted-foreground">by {historyItem.createdBy}</span>
                            </div>
                            <p className="text-sm">{historyItem.comment}</p>
                          </div>
                          {historyItem.active && (
                            <Badge className="bg-success text-success-foreground border-success">
                              Current
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
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