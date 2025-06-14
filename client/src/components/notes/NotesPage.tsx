import { useEffect, useState } from "react";
import { useNotesStore } from "@/stores/notes";
import { useCompaniesStore } from "@/stores/companies";
import { useContactsStore } from "@/stores/contacts";
import { useDealsStore } from "@/stores/deals";
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
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import NoteDialog from "./NoteDialog";
import type { Note } from "@/types";

const NotesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const { notes, isLoading, page, totalPages, fetchNotes, deleteNote } =
    useNotesStore();
  const { fetchCompanies } = useCompaniesStore();
  const { fetchContacts } = useContactsStore();
  const { fetchDeals } = useDealsStore();

  useEffect(() => {
    fetchNotes(page);
    fetchCompanies();
    fetchContacts();
    fetchDeals();
  }, [fetchNotes, fetchCompanies, fetchContacts, fetchDeals, page]);

  const filteredNotes = notes.filter((note) =>
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (note: Note) => {
    setSelectedNote(note);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteNote(id);
      } catch (error) {
        console.error("Failed to delete note:", error);
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedNote(null);
  };

  const handlePrevPage = () => {
    const asd = parseInt(page);
    if (page > 1) fetchNotes(asd - 1);
  };

  const handleNextPage = () => {
    const asd = parseInt(page);
    if (page < totalPages) fetchNotes(asd + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">Loading notes...</span>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Deal</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotes.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell className="font-medium max-w-xs whitespace-pre-line break-words">
                        {note.content}
                      </TableCell>
                      <TableCell>{note.company?.name || "-"}</TableCell>
                      <TableCell>
                        {note.contact
                          ? `${note.contact.firstName} ${note.contact.lastName}`
                          : "-"}
                      </TableCell>
                      <TableCell>{note.deal?.title || "-"}</TableCell>
                      <TableCell>
                        {new Date(note.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(note)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(note.id)}
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

      <NoteDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        note={selectedNote}
      />
    </div>
  );
};

export default NotesPage;
