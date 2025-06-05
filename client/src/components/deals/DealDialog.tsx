import { useState, useEffect } from "react";
import { useDealsStore } from "@/stores/deals";
import { useCompaniesStore } from "@/stores/companies";
import { useContactsStore } from "@/stores/contacts";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Deal } from "@/types";

interface DealDialogProps {
  open: boolean;
  onClose: () => void;
  deal?: Deal | null;
}

const DealDialog = ({ open, onClose, deal }: DealDialogProps) => {
  const [formData, setFormData] = useState({
    title: "",
    value: "",
    currency: "USD",
    stage: "QUALIFICATION" as const,
    status: "OPEN" as const,
    probability: "",
    closeDate: "",
    companyId: "",
    contactId: "",
    ownerId: "",
  });

  const { createDeal, updateDeal, isLoading } = useDealsStore();
  const { companies } = useCompaniesStore();
  const { contacts } = useContactsStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || "",
        value: deal.value?.toString() || "",
        currency: deal.currency || "USD",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        stage: (deal.stage as any) || "QUALIFICATION",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: (deal.status as any) || "OPEN",
        probability: deal.probability?.toString() || "",
        closeDate: deal.closeDate ? deal.closeDate.split("T")[0] : "",
        companyId: deal.companyId || "",
        contactId: deal.contactId || "",
        ownerId: deal.ownerId || user?.id || "",
      });
    } else {
      setFormData({
        title: "",
        value: "",
        currency: "USD",
        stage: "QUALIFICATION",
        status: "OPEN",
        probability: "",
        closeDate: "",
        companyId: "",
        contactId: "",
        ownerId: user?.id || "",
      });
    }
  }, [deal, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const submitData: any = {
        title: formData.title,
        ownerId: formData.ownerId,
        stage: formData.stage,
        status: formData.status,
      };

      if (formData.value) submitData.value = parseFloat(formData.value);
      if (formData.currency) submitData.currency = formData.currency;
      if (formData.probability)
        submitData.probability = parseInt(formData.probability);
      if (formData.closeDate)
        submitData.closeDate = new Date(formData.closeDate).toISOString();
      if (formData.companyId) submitData.companyId = formData.companyId;
      if (formData.contactId) submitData.contactId = formData.contactId;

      if (deal) {
        await updateDeal(deal.id, submitData);
      } else {
        await createDeal(submitData);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save deal:", error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{deal ? "Edit Deal" : "Create Deal"}</DialogTitle>
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
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => handleChange("value", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleChange("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="stage">Stage</Label>
              <Select
                value={formData.stage}
                onValueChange={(value) => handleChange("stage", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROSPECTING">Prospecting</SelectItem>
                  <SelectItem value="QUALIFICATION">Qualification</SelectItem>
                  <SelectItem value="PROPOSAL">Proposal</SelectItem>
                  <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                  <SelectItem value="CLOSED_WON">Closed Won</SelectItem>
                  <SelectItem value="CLOSED_LOST">Closed Lost</SelectItem>
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
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="WON">Won</SelectItem>
                  <SelectItem value="LOST">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="probability">Probability (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => handleChange("probability", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="closeDate">Close Date</Label>
              <Input
                id="closeDate"
                type="date"
                value={formData.closeDate}
                onChange={(e) => handleChange("closeDate", e.target.value)}
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
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : deal ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DealDialog;
