import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, AlertCircle, Workflow, Network, GitFork, Database, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

import { CollapsibleNodePalette } from './CollapsibleNodePalette';
import { EnhancedFlowNode } from './EnhancedFlowNode';

import { flowService, useFlow } from '@/services/flowService';
import { nodeService } from '@/services/nodeService';

// Import node types
import { SftpCollectorNode } from './nodes/SftpCollectorNode';
import { FdcNode } from './nodes/FdcNode';
import { Asn1DecoderNode } from './nodes/Asn1DecoderNode';
import { AsciiDecoderNode } from './nodes/AsciiDecoderNode';
import { ValidationBlnNode } from './nodes/ValidationBlnNode';
import { EnrichmentBlnNode } from './nodes/EnrichmentBlnNode';
import { EncoderNode } from './nodes/EncoderNode';
import { DiameterInterfaceNode } from './nodes/DiameterInterfaceNode';
import { RawBackupNode } from './nodes/RawBackupNode';

const nodeTypes = {
  sftp_collector: EnhancedFlowNode,
  fdc: EnhancedFlowNode,
  asn1_decoder: EnhancedFlowNode,
  ascii_decoder: EnhancedFlowNode,
  validation_bln: EnhancedFlowNode,
  enrichment_bln: EnhancedFlowNode,
  encoder: EnhancedFlowNode,
  diameter_interface: EnhancedFlowNode,
  raw_backup: EnhancedFlowNode,
  enhanced: EnhancedFlowNode,
};

interface RealTimeFlowEditorProps {
  flowId: string;
}

export function RealTimeFlowEditor({ flowId }: RealTimeFlowEditorProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // Flow data from API
  const { data: flowData, loading: flowLoading, refetch: refetchFlow } = useFlow(flowId);
  
  // Canvas state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  // Panel collapse states
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  
  // Real-time state
  const [flowNodeMap, setFlowNodeMap] = useState<Map<string, string>>(new Map()); // Canvas node ID -> FlowNode ID
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Array<{flow_node_id: string; error: string}>>([]);

  // Load flow graph on mount
  useEffect(() => {
    const loadFlowGraph = async () => {
      if (!flowId) return;
      
      try {
        const graphData = await flowService.getFlowGraph(flowId);
        console.log('📊 Loaded flow graph:', graphData);
        
        // Convert API nodes to React Flow nodes
        const canvasNodes: Node[] = [];
        const nodeIdMapping = new Map<string, string>();
        
        for (let i = 0; i < graphData.nodes.length; i++) {
          const apiNode = graphData.nodes[i];
          const canvasNodeId = `canvas-${apiNode.id}`;
          
            // Get node family data for display
            try {
              const nodeFamily = await nodeService.getNode(apiNode.node_family);
              
              // Use subnodes from node family data if available, otherwise fetch from service
              let subnodes: any[] = [];
              
              // First try to get subnodes from the node family's published version
              if (nodeFamily.published_version?.subnodes && nodeFamily.published_version.subnodes.length > 0) {
                subnodes = nodeFamily.published_version.subnodes.map((subnode: any) => ({
                  id: subnode.id,
                  name: subnode.name,
                  description: subnode.description || ''
                }));
              } else {
                // Fallback: Fetch from subnode service
                try {
                  const { subnodeService } = await import('@/services/subnodeService');
                  const allSubnodes = await subnodeService.getAllSubnodes();
                  subnodes = allSubnodes.results
                    .filter((subnode: any) => subnode.node_family === apiNode.node_family)
                    .map((subnode: any) => ({
                      id: subnode.id,
                      name: subnode.name,
                      description: subnode.description
                    }));
                } catch (subnodeError) {
                  console.warn('Could not load subnodes for node:', apiNode.node_family, subnodeError);
                  subnodes = [];
                }
              }
              
              const nodeType = determineNodeType(nodeFamily.name);
            
            const canvasNode: Node = {
              id: canvasNodeId,
              type: 'enhanced',
              position: { x: 100 + i * 250, y: 100 + (i % 3) * 150 },
              data: {
                label: nodeFamily.name,
                description: nodeFamily.description || '',
                nodeId: apiNode.node_family,
                flowNodeId: apiNode.id,
                selectedSubnode: apiNode.selected_subnode,
                subnodes: subnodes,
                onSubnodeChange: handleSubnodeChange,
              },
            };
            
            canvasNodes.push(canvasNode);
            nodeIdMapping.set(canvasNodeId, apiNode.id);
          } catch (error) {
            console.error('Error loading node family:', apiNode.node_family, error);
          }
        }
        
        // Convert API edges to React Flow edges with same styling as FlowPipeline
        const canvasEdges: Edge[] = graphData.edges.map(apiEdge => ({
          id: apiEdge.id,
          source: `canvas-${apiEdge.from_node}`,
          target: `canvas-${apiEdge.to_node}`,
          type: 'bezier', // Use bezier curves for flexible connections
          animated: true,
          style: {
            stroke: 'hsl(var(--primary))',
            strokeWidth: 3,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'hsl(var(--primary))',
            width: 20,
            height: 20,
          },
        }));
        
        setNodes(canvasNodes);
        setEdges(canvasEdges);
        setFlowNodeMap(nodeIdMapping);
        
      } catch (error) {
        console.error('❌ Error loading flow graph:', error);
        toast({
          title: "Load Error",
          description: "Failed to load flow graph.",
          variant: "destructive"
        });
      }
    };

    loadFlowGraph();
  }, [flowId, setNodes, setEdges, toast]);

  // Helper function to determine node type
  const determineNodeType = (nodeName: string): string => {
    const name = nodeName.toLowerCase();
    if (name.includes('sftp') || name.includes('collector')) return 'sftp_collector';
    if (name.includes('fdc')) return 'fdc';
    if (name.includes('asn1') || name.includes('decoder')) return 'asn1_decoder';
    if (name.includes('ascii')) return 'ascii_decoder';
    if (name.includes('validation')) return 'validation_bln';
    if (name.includes('enrichment')) return 'enrichment_bln';
    if (name.includes('encoder')) return 'encoder';
    if (name.includes('diameter')) return 'diameter_interface';
    if (name.includes('backup')) return 'raw_backup';
    return 'sftp_collector';
  };

  // 🎯 REAL-TIME FUNCTIONALITY 1: Drop Node → Create FlowNode
  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      
      const nodeId = event.dataTransfer.getData('application/reactflow');
      if (!nodeId || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 50,
      };

      console.log('🎯 Dropping node:', nodeId, 'at position:', position);

      try {
        // 🚀 Real-time API call: Create FlowNode immediately
        const flowNode = await flowService.createFlowNode({
          flow: flowId,
          node_family: nodeId
        });
        console.log('✅ FlowNode created:', flowNode);

        // Get node family data for display
        const nodeFamily = await nodeService.getNode(nodeId);
        
        // Use subnodes from node family data if available, otherwise fetch from service
        let subnodes: any[] = [];
        
        // First try to get subnodes from the node family's published version
        if (nodeFamily.published_version?.subnodes && nodeFamily.published_version.subnodes.length > 0) {
          subnodes = nodeFamily.published_version.subnodes.map((subnode: any) => ({
            id: subnode.id,
            name: subnode.name,
            description: subnode.description || ''
          }));
        } else {
          // Fallback: Fetch from subnode service
          try {
            const { subnodeService } = await import('@/services/subnodeService');
            const allSubnodes = await subnodeService.getAllSubnodes();
            subnodes = allSubnodes.results
              .filter((subnode: any) => subnode.node_family === nodeId)
              .map((subnode: any) => ({
                id: subnode.id,
                name: subnode.name,
                description: subnode.description
              }));
          } catch (subnodeError) {
            console.warn('Could not load subnodes for node:', nodeId, subnodeError);
            subnodes = [];
          }
        }
        
        const nodeType = determineNodeType(nodeFamily.name);
        
        // Create canvas node
        const canvasNodeId = `canvas-${flowNode.id}`;
        const newNode: Node = {
          id: canvasNodeId,
          type: 'enhanced',
          position,
          data: {
            label: nodeFamily.name,
            description: nodeFamily.description || '',
            nodeId: nodeId,
            flowNodeId: flowNode.id,
            selectedSubnode: flowNode.selected_subnode,
            subnodes: subnodes,
            onSubnodeChange: handleSubnodeChange,
          },
        };

        // Update state immediately
        setNodes((nds) => [...nds, newNode]);
        setFlowNodeMap(prev => new Map(prev.set(canvasNodeId, flowNode.id)));

        toast({
          title: "Node Added",
          description: `${nodeFamily.name} has been added to the flow.`,
        });

      } catch (error) {
        console.error('❌ Error creating FlowNode:', error);
        toast({
          title: "Error",
          description: "Failed to add node to flow.",
          variant: "destructive"
        });
      }
    },
    [flowId, setNodes, toast],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // 🎯 REAL-TIME FUNCTIONALITY 2: Connect Nodes → Create Edge
  const onConnect = useCallback(
    async (params: Connection) => {
      console.log('🔗 Connecting nodes:', params);
      
      if (!params.source || !params.target) return;

      // Optimistically update UI first with bezier style
      const newEdge = {
        id: `temp-${Date.now()}`,
        source: params.source,
        target: params.target,
        type: 'bezier',
        animated: true,
        style: {
          stroke: 'hsl(var(--primary))',
          strokeWidth: 3,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--primary))',
          width: 20,
          height: 20,
        },
      };
      setEdges((eds) => [...eds, newEdge]);
      
      try {
        // Get FlowNode IDs from mapping
        const sourceFlowNodeId = flowNodeMap.get(params.source);
        const targetFlowNodeId = flowNodeMap.get(params.target);
        
        if (!sourceFlowNodeId || !targetFlowNodeId) {
          throw new Error('FlowNode IDs not found');
        }

        // 🚀 Real-time API call: Create Edge immediately
        const edge = await flowService.createFlowEdge({
          flow: flowId,
          from_node: sourceFlowNodeId,
          to_node: targetFlowNodeId,
          condition: ''
        });
        console.log('✅ Edge created:', edge);

        // Update edge with real ID and maintain style
        setEdges((eds) => eds.map(e => 
          e.id === newEdge.id ? { 
            ...e, 
            id: edge.id,
            type: 'bezier',
            animated: true,
            style: {
              stroke: 'hsl(var(--primary))',
              strokeWidth: 3,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: 'hsl(var(--primary))',
              width: 20,
              height: 20,
            },
          } : e
        ));

        toast({
          title: "Connection Created",
          description: "Nodes have been connected successfully.",
        });

      } catch (error) {
        console.error('❌ Error creating edge:', error);
        
        // Remove optimistic edge on error
        setEdges((eds) => eds.filter(e => e.id !== newEdge.id));
        
        toast({
          title: "Connection Error",
          description: "Failed to create connection.",
          variant: "destructive"
        });
      }
    },
    [flowId, flowNodeMap, setEdges, toast],
  );

  // 🎯 REAL-TIME FUNCTIONALITY 3: Select SubNode
  const handleSubnodeChange = useCallback(async (nodeKey: string, subnodeId: string) => {
    console.log('🔄 Changing subnode for node key:', nodeKey, 'to:', subnodeId);
    
    // Try to resolve flowNodeId from map; if not found, assume nodeKey is already a flowNodeId
    const resolvedFlowNodeId = flowNodeMap.get(nodeKey) || nodeKey;

    if (!resolvedFlowNodeId) {
      console.error('FlowNode ID could not be resolved for key:', nodeKey);
      return;
    }

    // Optimistically update UI for both canvas node id and flow node id
    setNodes((nds) =>
      nds.map((node) => {
        const matches = node.id === nodeKey || (node.data as any)?.flowNodeId === resolvedFlowNodeId;
        return matches ? { ...node, data: { ...node.data, selectedSubnode: subnodeId } } : node;
      })
    );

    try {
      // 🚀 Real-time API call: Set subnode immediately
      const updatedFlowNode = await flowService.setFlowNodeSubnode(resolvedFlowNodeId, subnodeId);
      console.log('✅ Subnode updated:', updatedFlowNode);

      // Update node data with parameters
      setNodes((nds) =>
        nds.map((node) => {
          const matches = node.id === nodeKey || (node.data as any)?.flowNodeId === resolvedFlowNodeId;
          return matches
            ? { 
                ...node, 
                data: { 
                  ...node.data, 
                  selectedSubnode: subnodeId,
                  parameters: (updatedFlowNode as any).parameters 
                } 
              }
            : node;
        })
      );

      toast({
        title: 'Subnode Selected',
        description: 'Subnode selection updated with parameters.',
      });

    } catch (error) {
      console.error('❌ Error setting subnode:', error);
      
      // Revert optimistic update
      setNodes((nds) =>
        nds.map((node) => {
          const matches = node.id === nodeKey || (node.data as any)?.flowNodeId === resolvedFlowNodeId;
          return matches ? { ...node, data: { ...node.data, selectedSubnode: (node.data as any).selectedSubnode } } : node;
        })
      );
      
      toast({
        title: 'Update Error',
        description: 'Failed to update subnode selection.',
        variant: 'destructive'
      });
    }
  }, [flowNodeMap, setNodes, toast]);

  // 🎯 REAL-TIME FUNCTIONALITY 4: Save Flow
  const handleSaveFlow = useCallback(async () => {
    setIsValidating(true);

    try {
      // 🚀 Real-time API call: Save flow
      await flowService.updateFlow(flowId, { 
        name: flowData?.name,
        description: flowData?.description 
      });
      
      toast({
        title: "Flow Saved",
        description: "Flow has been saved successfully.",
      });

    } catch (error) {
      console.error('❌ Error saving flow:', error);
      toast({
        title: "Save Error",
        description: "Failed to save flow.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  }, [flowId, flowData, toast]);

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
    },
    [],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  if (flowLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading flow...</p>
        </div>
      </div>
    );
  }

  // Helper to determine back navigation
  const getBackRoute = () => {
    const referrer = document.referrer;
    const currentOrigin = window.location.origin;
    
    if (referrer.startsWith(currentOrigin)) {
      const referrerPath = new URL(referrer).pathname;
      if (referrerPath.includes('/devtool')) return '/devtool';
      if (referrerPath.includes('/dashboard')) return '/dashboard';
      if (referrerPath.includes('/mediations')) return '/mediations';
    }
    
    return '/flows';
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Professional Header */}
      <div className="bg-card/95 backdrop-blur-sm border-b border-border/60 shadow-sm">
        <div className="px-8 py-6">
          {/* Top Section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
                  <Workflow className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    {flowData?.name || `Flow ${flowId}`}
                  </h1>
                  <div className="px-3 py-1.5 bg-muted border border-border rounded-md">
                    <span className="text-sm font-semibold text-foreground">v1.0</span>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-medium">
                    Editing Mode
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {validationErrors.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">
                    {validationErrors.length} error{validationErrors.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              
              <Button 
                onClick={handleSaveFlow}
                disabled={isValidating}
                className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 gap-2 font-medium"
              >
                {isValidating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isValidating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
          
          {/* Status Section removed to align version and mode with name */}
        </div>
      </div>

      {/* Professional Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {/* Mobile Panel Toggle Button */}
        <div className="lg:hidden absolute top-4 left-4 z-30 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
            className="bg-card/95 backdrop-blur-sm border-border/60 shadow-lg"
          >
            <Database className="h-4 w-4" />
          </Button>
        </div>

        {/* Overlay for mobile panels */}
        {!isLeftPanelCollapsed && (
          <div 
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-10"
            onClick={() => {
              setIsLeftPanelCollapsed(true);
            }}
          />
        )}

        <div className="h-full flex">
          {/* Left Sidebar - Node Palette */}
          <div className={`transition-all duration-300 ${isLeftPanelCollapsed ? 'w-12' : 'w-96'} bg-card/95 backdrop-blur-sm border-r border-border/60 shadow-lg lg:shadow-none h-full`}>
            <CollapsibleNodePalette 
              isCollapsed={isLeftPanelCollapsed}
              onToggleCollapse={setIsLeftPanelCollapsed}
              onAddNode={async (nodeId) => {
                const position = { x: Math.random() * 300 + 200, y: Math.random() * 200 + 150 };
                const event = {
                  preventDefault: () => {},
                  dataTransfer: { getData: () => nodeId }
                } as any;
                await onDrop(event);
              }} 
            />
          </div>
          
          {/* Center - Canvas */}
          <div className="flex-1 transition-all duration-300">
            <div className="h-full relative">
              {/* Canvas Toolbar - Removed */}
              
              <div 
                ref={reactFlowWrapper}
                className="w-full h-full"
                onDrop={onDrop}
                onDragOver={onDragOver}
              >
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onNodeClick={onNodeClick}
                  onPaneClick={onPaneClick}
                  nodeTypes={nodeTypes}
                  className="bg-gradient-to-br from-background/50 to-muted/30"
                  fitView
                  fitViewOptions={{ padding: 0.2 }}
                >
                  <Controls className="bg-card/95 backdrop-blur-sm border-border/60 shadow-lg [&>button]:bg-transparent [&>button]:border-border/60 [&>button]:hover:bg-muted/50" />
                  <MiniMap 
                    className="bg-card/95 backdrop-blur-sm border-border/60 shadow-lg rounded-lg overflow-hidden" 
                    nodeColor="hsl(var(--primary))"
                    maskColor="rgba(0, 0, 0, 0.05)"
                  />
                  <Background 
                    variant={BackgroundVariant.Dots} 
                    gap={24} 
                    size={1.2} 
                    className="opacity-40" 
                    color="hsl(var(--border))"
                  />
                </ReactFlow>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}