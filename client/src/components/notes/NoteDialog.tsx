import { useState, useEffect } from "react";
import { useNotesStore } from "@/stores/notes";
import { useCompaniesStore } from "@/stores/companies";
import { useContactsStore } from "@/stores/contacts";
import { useDealsStore } from "@/stores/deals";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Note } from "@/types";

interface NoteDialogProps {
  open: boolean;
  onClose: () => void;
  note?: Note | null;
}

const NoteDialog = ({ open, onClose, note }: NoteDialogProps) => {
  const [formData, setFormData] = useState({
    content: "",
    companyId: "",
    contactId: "",
    dealId: "",
  });

  const { createNote, updateNote, isLoading } = useNotesStore();
  const { companies } = useCompaniesStore();
  const { contacts } = useContactsStore();
  const { deals } = useDealsStore();

  useEffect(() => {
    if (note) {
      setFormData({
        content: note.content || "",
        companyId: note.companyId || "",
        contactId: note.contactId || "",
        dealId: note.dealId || "",
      });
    } else {
      setFormData({
        content: "",
        companyId: "",
        contactId: "",
        dealId: "",
      });
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const submitData: any = {
        content: formData.content,
      };

      if (formData.companyId) submitData.companyId = formData.companyId;
      if (formData.contactId) submitData.contactId = formData.contactId;
      if (formData.dealId) submitData.dealId = formData.dealId;

      if (note) {
        await updateNote(note.id, submitData);
      } else {
        await createNote(submitData);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{note ? "Edit Note" : "Create Note"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange("content", e.target.value)}
              rows={5}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
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
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : note ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NoteDialog;
