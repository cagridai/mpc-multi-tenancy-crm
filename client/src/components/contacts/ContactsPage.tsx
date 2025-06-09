import { useEffect, useState } from "react";
import { useContactsStore } from "@/stores/contacts";
import { useCompaniesStore } from "@/stores/companies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import ContactDialog from "./ContactDialog";
import type { Contact } from "@/types";

const ContactsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const {
    contacts,
    isLoading,
    page,
    totalPages,
    fetchContacts,
    deleteContact,
  } = useContactsStore();
  const { fetchCompanies } = useCompaniesStore();

  useEffect(() => {
    fetchContacts(page);
    fetchCompanies(); // For company selection in dialog
  }, [fetchContacts, fetchCompanies, page]);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      try {
        await deleteContact(id);
      } catch (error) {
        console.error("Failed to delete contact:", error);
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedContact(null);
  };

  const handlePrevPage = () => {
    const asd = parseInt(page);
    if (page > 1) fetchContacts(asd - 1);
  };

  const handleNextPage = () => {
    const asd = parseInt(page);
    if (page < totalPages) fetchContacts(asd + 1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      case "PROSPECT":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">
                        {contact.firstName} {contact.lastName}
                      </TableCell>
                      <TableCell>{contact.email || "-"}</TableCell>
                      <TableCell>{contact.phone || "-"}</TableCell>
                      <TableCell>{contact.position || "-"}</TableCell>
                      <TableCell>{contact.company?.name || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(contact.status || "ACTIVE")}
                        >
                          {contact.status || "ACTIVE"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(contact)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(contact.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages !== 1 && (
                <div className="flex justify-end items-center mt-4 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ContactDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        contact={selectedContact}
      />
    </div>
  );
};

export default ContactsPage;
