import { PageHeader } from "../../components/PageHeader";
import { Card, CardContent } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { FiMapPin, FiClock, FiCheck } from "react-icons/fi";

export function VolunteerDashboard() {
  const pickupRequests = [
    {
      id: 1,
      from: "Downtown Bakery",
      to: "Community Shelter",
      distance: "3.2 km total",
      items: "5 Loaves of Bread",
      time: "Before 5 PM today",
      urgent: true,
    },
    {
      id: 2,
      from: "Green Grocer",
      to: "Food Bank 4",
      distance: "1.5 km total",
      items: "Box of Apples",
      time: "Tomorrow morning",
      urgent: false,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Volunteer Pickup Requests"
        description="Help transport food from donors to recipients."
      />

      <div className="grid grid-cols-1 gap-6">
        {pickupRequests.map((request) => (
          <Card key={request.id} className="border-l-4 border-l-primary/50">
            <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg text-neutral-text">
                    Pickup Request #{request.id}
                  </h3>
                  {request.urgent && <Badge variant="danger">Urgent</Badge>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-sm text-neutral-muted">
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-primary" /> From:{" "}
                    <span className="text-neutral-text font-medium">
                      {request.from}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-red-500" /> To:{" "}
                    <span className="text-neutral-text font-medium">
                      {request.to}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock /> Time: {request.time}
                  </div>
                  <div className="flex items-center gap-2">
                    Items: {request.items}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button variant="outline">View Details</Button>
                <Button variant="primary" className="flex items-center gap-2">
                  <FiCheck /> Accept Pickup
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
