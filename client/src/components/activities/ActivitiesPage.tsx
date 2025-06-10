import { useEffect, useState } from "react";
import { useActivitiesStore } from "@/stores/activities";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import ActivityDialog from "./ActivityDialog";
import type { Activity } from "@/types";

const ActivitiesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );

  const {
    activities,
    isLoading,
    page,
    totalPages,
    fetchActivities,
    deleteActivity,
  } = useActivitiesStore();
  const { fetchCompanies } = useCompaniesStore();
  const { fetchContacts } = useContactsStore();
  const { fetchDeals } = useDealsStore();

  useEffect(() => {
    fetchActivities(page);
    fetchCompanies();
    fetchContacts();
    fetchDeals();
  }, [page, fetchActivities, fetchCompanies, fetchContacts, fetchDeals]);

  const filteredActivities = activities.filter((activity) =>
    activity.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this activity?")) {
      try {
        await deleteActivity(id);
      } catch (error) {
        console.error("Failed to delete activity:", error);
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedActivity(null);
  };

  const handlePrevPage = () => {
    const asd = parseInt(page);
    if (page > 1) fetchActivities(asd - 1);
  };

  const handleNextPage = () => {
    const asd = parseInt(page);
    if (page < totalPages) fetchActivities(asd + 1);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "CALL":
        return "bg-blue-100 text-blue-800";
      case "EMAIL":
        return "bg-green-100 text-green-800";
      case "MEETING":
        return "bg-purple-100 text-purple-800";
      case "TASK":
        return "bg-orange-100 text-orange-800";
      case "NOTE":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLANNED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Activity
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search activities..."
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
              <span className="ml-2">Loading activities...</span>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Deal</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">
                        {activity.title}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(activity.type)}>
                          {activity.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(
                            activity.status || "PLANNED"
                          )}
                        >
                          {activity.status || "PLANNED"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {activity.dueDate
                          ? new Date(activity.dueDate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>{activity.company?.name || "-"}</TableCell>
                      <TableCell>
                        {activity.contact
                          ? `${activity.contact.firstName} ${activity.contact.lastName}`
                          : "-"}
                      </TableCell>
                      <TableCell>{activity.deal?.title || "-"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(activity)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(activity.id)}
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

      <ActivityDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        activity={selectedActivity}
      />
    </div>
  );
};

export default ActivitiesPage;
