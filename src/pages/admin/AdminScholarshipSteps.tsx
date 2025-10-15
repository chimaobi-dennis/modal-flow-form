import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit, Save, X } from "lucide-react";
import { useScholarshipSteps, ScholarshipStep } from "@/hooks/useScholarshipSteps";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

export default function AdminScholarshipSteps() {
  const { steps, updateStep, addStep, deleteStep } = useScholarshipSteps();
  const [editingStep, setEditingStep] = useState<ScholarshipStep | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [newStep, setNewStep] = useState<Partial<ScholarshipStep>>({
    title: "",
    type: "information",
    status: "pending",
    instructions: {
      header: "",
      paragraphs: [],
      bulletPoints: [],
      footer: ""
    },
    buttons: []
  });

  const handleSaveStep = () => {
    if (editingStep) {
      updateStep(editingStep.id, editingStep);
      setEditingStep(null);
      toast({ title: "Step updated successfully" });
    }
  };

  const handleCreateStep = () => {
    if (newStep.title && newStep.type) {
      const step: ScholarshipStep = {
        id: `sch${Date.now()}`,
        stepNumber: steps.length + 1,
        title: newStep.title,
        type: newStep.type as any,
        status: newStep.status as any,
        instructions: newStep.instructions || {
          header: "",
          paragraphs: [],
          bulletPoints: [],
          footer: ""
        },
        buttons: newStep.buttons || []
      };
      addStep(step);
      setNewStep({
        title: "",
        type: "information",
        status: "pending",
        instructions: { header: "", paragraphs: [], bulletPoints: [], footer: "" },
        buttons: []
      });
      setIsCreating(false);
      toast({ title: "Step created successfully" });
    }
  };

  const handleDeleteStep = (stepId: string) => {
    deleteStep(stepId);
    toast({ title: "Step deleted successfully" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Scholarship Steps Admin</h1>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Scholarship Step</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newStep.title}
                    onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                    placeholder="Step title"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={newStep.type} onValueChange={(value) => setNewStep({ ...newStep, type: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="form">Form</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="information">Information</SelectItem>
                      <SelectItem value="verification">Verification</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newStep.status} onValueChange={(value) => setNewStep({ ...newStep, status: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="current">Current</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div>
                   <Label htmlFor="header">Header</Label>
                   <Input
                     id="header"
                     value={newStep.instructions?.header || ""}
                     onChange={(e) => setNewStep({
                       ...newStep,
                       instructions: { ...newStep.instructions, header: e.target.value }
                     })}
                     placeholder="Step header"
                   />
                 </div>
                 <div>
                   <Label htmlFor="paragraphs">Instructions Paragraphs (one per line)</Label>
                   <Textarea
                     id="paragraphs"
                     value={newStep.instructions?.paragraphs?.join('\n') || ""}
                     onChange={(e) => setNewStep({
                       ...newStep,
                       instructions: { 
                         ...newStep.instructions, 
                         paragraphs: e.target.value.split('\n').filter(p => p.trim()) 
                       }
                     })}
                     placeholder="Enter paragraphs, one per line"
                     rows={3}
                   />
                 </div>
                 <div>
                   <Label htmlFor="bulletPoints">Instructions Bullet Points (one per line)</Label>
                   <Textarea
                     id="bulletPoints"
                     value={newStep.instructions?.bulletPoints?.join('\n') || ""}
                     onChange={(e) => setNewStep({
                       ...newStep,
                       instructions: { 
                         ...newStep.instructions, 
                         bulletPoints: e.target.value.split('\n').filter(p => p.trim()) 
                       }
                     })}
                     placeholder="Enter bullet points, one per line"
                     rows={3}
                   />
                 </div>
                 <div>
                   <Label htmlFor="footer">Footer</Label>
                   <Input
                     id="footer"
                     value={newStep.instructions?.footer || ""}
                     onChange={(e) => setNewStep({
                       ...newStep,
                       instructions: { ...newStep.instructions, footer: e.target.value }
                     })}
                     placeholder="Step footer"
                   />
                 </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateStep}>
                    Create Step
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {steps.map((step) => (
            <Card key={step.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Step {step.stepNumber}: {step.title}
                      <Badge variant={
                        step.status === 'completed' ? 'default' :
                        step.status === 'current' ? 'secondary' :
                        step.status === 'overdue' ? 'destructive' : 'outline'
                      }>
                        {step.status}
                      </Badge>
                      <Badge variant="outline">{step.type}</Badge>
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    {editingStep?.id === step.id ? (
                      <>
                        <Button size="sm" onClick={handleSaveStep}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingStep(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                         <Button size="sm" variant="outline" onClick={() => {
                          setEditingStep({ ...step });
                          // Show mobile guidance toast and auto-scroll
                          if (window.innerWidth < 1280) {
                            sonnerToast("Scroll down to view step details ↓", {
                              duration: 2000,
                              position: "top-center",
                            });
                            
                            setTimeout(() => {
                              const cardContent = document.querySelector(`[data-step-id="${step.id}"]`);
                              if (cardContent) {
                                cardContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }, 100);
                          }
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteStep(step.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent data-step-id={step.id}>
                {editingStep?.id === step.id ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={editingStep.title}
                        onChange={(e) => setEditingStep({ ...editingStep, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select value={editingStep.type} onValueChange={(value) => setEditingStep({ ...editingStep, type: value as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="form">Form</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="information">Information</SelectItem>
                          <SelectItem value="verification">Verification</SelectItem>
                          <SelectItem value="research">Research</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select value={editingStep.status} onValueChange={(value) => setEditingStep({ ...editingStep, status: value as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="current">Current</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                     <div>
                       <Label>Step Number</Label>
                       <Input
                         type="number"
                         value={editingStep.stepNumber}
                         onChange={(e) => setEditingStep({ ...editingStep, stepNumber: parseInt(e.target.value) || 1 })}
                       />
                     </div>
                     <div>
                       <Label>Header</Label>
                       <Input
                         value={editingStep.instructions.header || ""}
                         onChange={(e) => setEditingStep({
                           ...editingStep,
                           instructions: { ...editingStep.instructions, header: e.target.value }
                         })}
                       />
                     </div>
                     <div>
                       <Label>Instructions Paragraphs (one per line)</Label>
                       <Textarea
                         value={editingStep.instructions.paragraphs?.join('\n') || ""}
                         onChange={(e) => setEditingStep({
                           ...editingStep,
                           instructions: { 
                             ...editingStep.instructions, 
                             paragraphs: e.target.value.split('\n').filter(p => p.trim()) 
                           }
                         })}
                         placeholder="Enter paragraphs, one per line"
                         rows={3}
                       />
                     </div>
                     <div>
                       <Label>Instructions Bullet Points (one per line)</Label>
                       <Textarea
                         value={editingStep.instructions.bulletPoints?.join('\n') || ""}
                         onChange={(e) => setEditingStep({
                           ...editingStep,
                           instructions: { 
                             ...editingStep.instructions, 
                             bulletPoints: e.target.value.split('\n').filter(p => p.trim()) 
                           }
                         })}
                         placeholder="Enter bullet points, one per line"
                         rows={3}
                       />
                     </div>
                     <div>
                       <Label>Footer</Label>
                       <Input
                         value={editingStep.instructions.footer || ""}
                         onChange={(e) => setEditingStep({
                           ...editingStep,
                           instructions: { ...editingStep.instructions, footer: e.target.value }
                         })}
                       />
                     </div>
                     <div>
                       <Label>Deadline</Label>
                       <Input
                         type="date"
                         value={editingStep.deadline || ""}
                         onChange={(e) => setEditingStep({ ...editingStep, deadline: e.target.value })}
                       />
                     </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p><strong>Header:</strong> {step.instructions.header}</p>
                    {step.deadline && <p><strong>Deadline:</strong> {step.deadline}</p>}
                    {step.instructions.bulletPoints && step.instructions.bulletPoints.length > 0 && (
                      <div>
                        <strong>Instructions:</strong>
                        <ul className="list-disc list-inside ml-4 mt-1">
                          {step.instructions.bulletPoints.map((point, index) => (
                            <li key={index} className="text-sm">{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}