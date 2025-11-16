import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft,
  User,
  Clock,
  AlertCircle,
  Paperclip,
  Link as LinkIcon,
  MessageSquare,
  CheckCircle2,
  Circle,
  PlayCircle,
  TestTube,
  Rocket
} from "lucide-react";
import { toast } from "sonner";

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comment, setComment] = useState("");

  const ticket = {
    id: id || "TK-001",
    title: "Implement user authentication",
    description: "We need to implement a comprehensive user authentication system with email/password login, social login options (Google, Facebook), password reset functionality, and email verification. The system should use JWT tokens for session management and include rate limiting to prevent brute force attacks.",
    project: "E-Commerce Platform",
    assignee: "John Doe",
    status: "Developing",
    priority: "High",
    dueDate: "2024-12-01",
    estimatedHours: 16,
    createdAt: "2024-11-20",
    attachments: [
      { name: "auth-flow-diagram.png", size: "245 KB" },
      { name: "requirements.pdf", size: "128 KB" }
    ],
    links: [
      "https://figma.com/design/auth-mockups",
      "https://docs.google.com/document/requirements"
    ],
    statusHistory: [
      { status: "New", timestamp: "2024-11-20 10:00 AM", user: "Admin" },
      { status: "Developing", timestamp: "2024-11-21 02:30 PM", user: "John Doe" }
    ],
    comments: [
      {
        user: "Sarah Miller",
        avatar: "SM",
        timestamp: "2024-11-21 03:45 PM",
        text: "Started working on the OAuth integration. Google login is almost ready."
      },
      {
        user: "Admin",
        avatar: "AD",
        timestamp: "2024-11-22 09:15 AM",
        text: "Great progress! Make sure to add proper error handling for failed login attempts."
      }
    ]
  };

  const statusFlow = [
    { status: "New", icon: Circle, color: "#4cc9f0" },
    { status: "Developing", icon: PlayCircle, color: "#4361ee" },
    { status: "Testing", icon: TestTube, color: "#f72585" },
    { status: "Deployed", icon: Rocket, color: "#4ade80" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New": return "bg-[#4cc9f0] text-white";
      case "Developing": return "bg-[#4361ee] text-white";
      case "Testing": return "bg-[#f72585] text-white";
      case "Deployed": return "bg-[#4ade80] text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-500 text-white";
      case "High": return "bg-orange-500 text-white";
      case "Medium": return "bg-yellow-500 text-white";
      case "Low": return "bg-green-500 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const currentStatusIndex = statusFlow.findIndex(s => s.status === ticket.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/admin-site/tickets")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{ticket.title}</h1>
          <p className="text-sm text-muted-foreground">Ticket ID: {ticket.id}</p>
        </div>
        <Badge className={getStatusColor(ticket.status)}>
          {ticket.status}
        </Badge>
        <Badge className={getPriorityColor(ticket.priority)}>
          <AlertCircle className="h-3 w-3 mr-1" />
          {ticket.priority}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {ticket.description}
              </p>
            </CardContent>
          </Card>

          {/* Status Flow */}
          <Card>
            <CardHeader>
              <CardTitle>Status Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {statusFlow.map((flow, idx) => {
                  const Icon = flow.icon;
                  const isActive = idx === currentStatusIndex;
                  const isCompleted = idx < currentStatusIndex;
                  
                  return (
                    <div key={flow.status} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div 
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isActive ? 'ring-4 ring-offset-2' : ''
                          }`}
                          style={{ 
                            backgroundColor: isActive || isCompleted ? flow.color : '#e5e7eb',
                            ...(isActive && { '--tw-ring-color': flow.color + '40' } as React.CSSProperties)
                          }}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-6 w-6 text-white" />
                          ) : (
                            <Icon className="h-6 w-6" style={{ color: isActive ? 'white' : '#9ca3af' }} />
                          )}
                        </div>
                        <span className={`text-xs mt-2 font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {flow.status}
                        </span>
                      </div>
                      {idx < statusFlow.length - 1 && (
                        <div 
                          className="h-1 flex-1 mx-2"
                          style={{ 
                            backgroundColor: isCompleted ? flow.color : '#e5e7eb'
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-[#4361ee] hover:bg-[#3f37c9]"
                  onClick={() => toast.info("Status update functionality coming soon")}
                >
                  Update Status
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toast.info("Reassign functionality coming soon")}
                >
                  Reassign
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Attachments & Links */}
          <Card>
            <CardHeader>
              <CardTitle>Attachments & Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Files
                </h4>
                <div className="space-y-2">
                  {ticket.attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{file.size}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Related Links
                </h4>
                <div className="space-y-2">
                  {ticket.links.map((link, idx) => (
                    <a 
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-[#4361ee] hover:underline truncate"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Activity & Comments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status History */}
              <div className="space-y-2">
                {ticket.statusHistory.map((history, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded">
                    <div className="w-2 h-2 rounded-full bg-[#4361ee] mt-2" />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{history.user}</span> changed status to{" "}
                        <Badge className={getStatusColor(history.status)} variant="outline">
                          {history.status}
                        </Badge>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{history.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comments */}
              <div className="space-y-3">
                {ticket.comments.map((comm, idx) => (
                  <div key={idx} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-[#4361ee] to-[#3f37c9] text-white text-xs">
                        {comm.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{comm.user}</span>
                        <span className="text-xs text-muted-foreground">{comm.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{comm.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="flex gap-3 pt-4 border-t">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-[#4361ee] to-[#3f37c9] text-white text-xs">
                    AD
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    size="sm"
                    className="bg-[#4361ee] hover:bg-[#3f37c9]"
                    onClick={() => {
                      if (comment.trim()) {
                        toast.success("Comment added");
                        setComment("");
                      }
                    }}
                  >
                    Add Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Assigned To</div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-[#4361ee] to-[#3f37c9] text-white text-xs">
                      {ticket.assignee.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{ticket.assignee}</span>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Project</div>
                <div className="font-medium">{ticket.project}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Due Date</div>
                <div className="flex items-center gap-2 font-medium">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {ticket.dueDate}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Estimated Hours</div>
                <div className="font-medium">{ticket.estimatedHours}h</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Created</div>
                <div className="font-medium">{ticket.createdAt}</div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start bg-[#4361ee] hover:bg-[#3f37c9]"
                onClick={() => toast.info("Log time functionality coming soon")}
              >
                <Clock className="h-4 w-4 mr-2" />
                Log Time
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast.info("Add attachment functionality coming soon")}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Add Attachment
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast.info("Edit functionality coming soon")}
              >
                Edit Ticket
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
