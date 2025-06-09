import { useEffect, useState } from "react";
import { useDealsStore } from "@/stores/deals";
import { useCompaniesStore } from "@/stores/companies";
import { useContactsStore } from "@/stores/contacts";
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
import DealDialog from "./DealDialog";
import type { Deal } from "@/types";

const DealsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const { deals, isLoading, page, totalPages, fetchDeals, deleteDeal } =
    useDealsStore();
  const { fetchCompanies } = useCompaniesStore();
  const { fetchContacts } = useContactsStore();

  useEffect(() => {
    fetchDeals(page);
    fetchCompanies();
    fetchContacts();
  }, [fetchDeals, fetchCompanies, fetchContacts, page]);

  const filteredDeals = deals.filter((deal) =>
    deal.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this deal?")) {
      try {
        await deleteDeal(id);
      } catch (error) {
        console.error("Failed to delete deal:", error);
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedDeal(null);
  };

  const handlePrevPage = () => {
    const asd = parseInt(page);
    if (page > 1) fetchDeals(asd - 1);
  };

  const handleNextPage = () => {
    const asd = parseInt(page);
    if (page < totalPages) fetchDeals(asd + 1);
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "PROSPECTING":
        return "bg-gray-100 text-gray-800";
      case "QUALIFICATION":
        return "bg-blue-100 text-blue-800";
      case "PROPOSAL":
        return "bg-yellow-100 text-yellow-800";
      case "NEGOTIATION":
        return "bg-orange-100 text-orange-800";
      case "CLOSED_WON":
        return "bg-green-100 text-green-800";
      case "CLOSED_LOST":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-100 text-blue-800";
      case "WON":
        return "bg-green-100 text-green-800";
      case "LOST":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Deals</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Deal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search deals..."
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
                    <TableHead>Title</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Probability</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Close Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell className="font-medium">
                        {deal.title}
                      </TableCell>
                      <TableCell>
                        {deal.value
                          ? `${
                              deal.currency || "$"
                            }${deal.value.toLocaleString()}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStageColor(deal.stage || "PROSPECTING")}
                        >
                          {deal.stage || "PROSPECTING"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(deal.status || "OPEN")}
                        >
                          {deal.status || "OPEN"}
                        </Badge>
                      </TableCell>
                      <TableCell>{deal.probability || 0}%</TableCell>
                      <TableCell>{deal.company?.name || "-"}</TableCell>
                      <TableCell>
                        {deal.closeDate
                          ? new Date(deal.closeDate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(deal)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(deal.id)}
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

      <DealDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        deal={selectedDeal}
      />
    </div>
  );
};

export default DealsPage;
