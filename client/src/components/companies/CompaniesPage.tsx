import { useEffect, useState } from "react";
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
import CompanyDialog from "./CompanyDialog";
import type { Company } from "@/types";

const CompaniesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const {
    companies,
    page,
    totalPages,
    isLoading,
    fetchCompanies,
    deleteCompany,
  } = useCompaniesStore();

  useEffect(() => {
    fetchCompanies(page);
  }, [fetchCompanies, page]);

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this company?")) {
      try {
        await deleteCompany(id);
      } catch (error) {
        console.error("Failed to delete company:", error);
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCompany(null);
  };

  const handlePrevPage = () => {
    const asd = parseInt(page);
    if (page > 1) fetchCompanies(asd - 1);
  };

  const handleNextPage = () => {
    const asd = parseInt(page);
    if (page < totalPages) fetchCompanies(asd + 1);
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
        <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search companies..."
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
              <span className="ml-2">Loading companies...</span>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        {company.name}
                      </TableCell>
                      <TableCell>{company.industry || "-"}</TableCell>
                      <TableCell>{company.size || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(company.status || "ACTIVE")}
                        >
                          {company.status || "ACTIVE"}
                        </Badge>
                      </TableCell>
                      <TableCell>{company.email || "-"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(company)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(company.id)}
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

      <CompanyDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        company={selectedCompany}
      />
    </div>
  );
};

export default CompaniesPage;
