import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Handshake, Activity } from "lucide-react";
import { Button } from "./ui/button";
import { useCompaniesStore } from "@/stores/companies";
import { useContactsStore } from "@/stores/contacts";
import { useDealsStore } from "@/stores/deals";
import { useActivitiesStore } from "@/stores/activities";

const Dashboard = () => {
  // Get stats and loading states from stores
  const {
    stats: companiesStats,
    fetchStats: fetchCompaniesStats,
    isLoading: companiesLoading,
  } = useCompaniesStore();

  const {
    stats: contactsStats,
    fetchStats: fetchContactsStats,
    isLoading: contactsLoading,
  } = useContactsStore();

  const {
    stats: dealsStats,
    fetchStats: fetchDealsStats,
    isLoading: dealsLoading,
  } = useDealsStore();

  const {
    stats: activitiesStats,
    upcomingActivities,
    upcomingPage,
    upcomingTotalPages,
    fetchStats: fetchActivitiesStats,
    fetchUpcoming,
    isLoadingStats: activitiesStatsLoading,
    isLoadingUpcoming: upcomingLoading,
  } = useActivitiesStore();

  // Fetch stats on mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log("Loading dashboard data...");
        await Promise.all([
          fetchCompaniesStats(),
          fetchContactsStats(),
          fetchDealsStats(),
          fetchActivitiesStats(),
          fetchUpcoming(1),
        ]);
        console.log("Dashboard data loaded successfully");
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      }
    };

    loadDashboardData();
  }, [
    fetchCompaniesStats,
    fetchContactsStats,
    fetchDealsStats,
    fetchActivitiesStats,
    fetchUpcoming,
  ]);

  // Extract totals from stats objects
  const companiesTotal = companiesStats?.total ?? 0;
  const contactsTotal = contactsStats?.total ?? 0;
  const dealsTotal = dealsStats?.total ?? 0;
  const activitiesTotal = activitiesStats?.total ?? 0;

  const statCards = [
    {
      title: "Companies",
      value: companiesTotal,
      icon: Building2,
      color: "text-blue-600",
      loading: companiesLoading,
    },
    {
      title: "Contacts",
      value: contactsTotal,
      icon: Users,
      color: "text-green-600",
      loading: contactsLoading,
    },
    {
      title: "Deals",
      value: dealsTotal,
      icon: Handshake,
      color: "text-purple-600",
      loading: dealsLoading,
    },
    {
      title: "Activities",
      value: activitiesTotal,
      icon: Activity,
      color: "text-orange-600",
      loading: activitiesStatsLoading,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        stat.value.toLocaleString()
                      )}
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upcoming Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">Loading upcoming activities...</span>
            </div>
          ) : upcomingActivities && upcomingActivities.length > 0 ? (
            <div className="space-y-4">
              {upcomingActivities.map((activity: any) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {activity.title}
                    </h4>
                    {activity.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      {activity.dueDate && (
                        <p className="text-xs text-gray-500">
                          Due:{" "}
                          {new Date(activity.dueDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      )}
                      {activity.assignedTo && (
                        <p className="text-xs text-gray-500">
                          Assigned to: {activity.assignedTo.firstName}{" "}
                          {activity.assignedTo.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{activity.type}</Badge>
                    <Badge variant="secondary" className="text-xs">
                      {activity.status?.replace("_", " ") || "PLANNED"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No upcoming activities</p>
              <p className="text-sm text-gray-500 mt-1">
                Activities will appear here when you create them
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
