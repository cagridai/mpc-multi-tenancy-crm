import { useState, useEffect } from "react";
import { useActivitiesStore } from "@/stores/activities";
import { useCompaniesStore } from "@/stores/companies";
import { useContactsStore } from "@/stores/contacts";
import { useDealsStore } from "@/stores/deals";
import { useAuthStore } from "@/stores/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Activity } from "@/types";

interface ActivityDialogProps {
  open: boolean;
  onClose: () => void;
  activity?: Activity | null;
}

const ActivityDialog = ({ open, onClose, activity }: ActivityDialogProps) => {
  const [formData, setFormData] = useState({
    title: "",
    type: "CALL" as const,
    description: "",
    status: "PLANNED" as const,
    dueDate: "",
    assignedToId: "",
    companyId: "",
    contactId: "",
    dealId: "",
  });

  const { createActivity, updateActivity, isLoading } = useActivitiesStore();
  const { companies } = useCompaniesStore();
  const { contacts } = useContactsStore();
  const { deals } = useDealsStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: (activity.type as any) || "CALL",
        description: activity.description || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: (activity.status as any) || "PLANNED",
        dueDate: activity.dueDate ? activity.dueDate.split("T")[0] : "",
        assignedToId: activity.assignedToId || user?.id || "",
        companyId: activity.companyId || "",
        contactId: activity.contactId || "",
        dealId: activity.dealId || "",
      });
    } else {
      setFormData({
        title: "",
        type: "CALL",
        description: "",
        status: "PLANNED",
        dueDate: "",
        assignedToId: user?.id || "",
        companyId: "",
        contactId: "",
        dealId: "",
      });
    }
  }, [activity, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const submitData: any = {
        title: formData.title,
        type: formData.type,
        assignedToId: formData.assignedToId,
        status: formData.status,
      };

      if (formData.description) submitData.description = formData.description;
      if (formData.dueDate)
        submitData.dueDate = new Date(formData.dueDate).toISOString();
      if (formData.companyId) submitData.companyId = formData.companyId;
      if (formData.contactId) submitData.contactId = formData.contactId;
      if (formData.dealId) submitData.dealId = formData.dealId;

      if (activity) {
        await updateActivity(activity.id, submitData);
      } else {
        await createActivity(submitData);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save activity:", error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {activity ? "Edit Activity" : "Create Activity"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CALL">Call</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="MEETING">Meeting</SelectItem>
                  <SelectItem value="TASK">Task</SelectItem>
                  <SelectItem value="NOTE">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNED">Planned</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="companyId">Company</Label>
              <Select
                value={formData.companyId}
                onValueChange={(value) => handleChange("companyId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No Company">No Company</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contactId">Contact</Label>
              <Select
                value={formData.contactId}
                onValueChange={(value) => handleChange("contactId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No Contact">No Contact</SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dealId">Deal</Label>
              <Select
                value={formData.dealId}
                onValueChange={(value) => handleChange("dealId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a deal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No Deal">No Deal</SelectItem>
                  {deals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : activity ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityDialog;
