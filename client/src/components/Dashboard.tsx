import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  companiesAPI,
  contactsAPI,
  dealsAPI,
  activitiesAPI,
} from "@/services/api";
import { Building2, Users, Handshake, Activity } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    companies: 0,
    contacts: 0,
    deals: 0,
    activities: 0,
  });
  const [upcomingActivities, setUpcomingActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          companiesRes,
          contactsRes,
          dealsRes,
          activitiesRes,
          upcomingRes,
        ] = await Promise.all([
          companiesAPI.getStats(),
          contactsAPI.getStats(),
          dealsAPI.getStats(),
          activitiesAPI.getStats(),
          activitiesAPI.getUpcoming(),
        ]);

        setStats({
          companies: companiesRes.data.total || 0,
          contacts: contactsRes.data.total || 0,
          deals: dealsRes.data.total || 0,
          activities: activitiesRes.data.total || 0,
        });

        setUpcomingActivities(upcomingRes.data.data || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: "Companies",
      value: stats.companies,
      icon: Building2,
      color: "text-blue-600",
    },
    {
      title: "Contacts",
      value: stats.contacts,
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Deals",
      value: stats.deals,
      icon: Handshake,
      color: "text-purple-600",
    },
    {
      title: "Activities",
      value: stats.activities,
      icon: Activity,
      color: "text-orange-600",
    },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
                      {stat.value}
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
          {upcomingActivities.length > 0 ? (
            <div className="space-y-4">
              {upcomingActivities.slice(0, 5).map((activity: any) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {activity.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">{activity.type}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No upcoming activities</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
