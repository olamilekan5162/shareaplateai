import { PageHeader } from "../../components/PageHeader";
import { StatCard } from "../../components/StatCard";
import { Card, CardContent } from "../../components/Card";
import { FiTrendingUp, FiSmile, FiGlobe } from "react-icons/fi";

export function ImpactPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Your Impact"
        description="Visualizing the difference you are making."
      />

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Meals Provided"
          value="1,245"
          icon={FiSmile}
          className="border-primary/20 bg-primary/5"
        />
        <StatCard
          title="CO₂ Emissions Saved"
          value="450kg"
          icon={FiGlobe}
          className="border-green-200 bg-green-50"
        />
        <StatCard
          title="Community Value"
          value="$6,200"
          icon={FiTrendingUp}
          className="border-blue-200 bg-blue-50"
        />
      </div>

      {/* Impact Visualization Mock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-neutral-text">Monthly Donations</h3>
            <select className="text-sm border-gray-200 rounded-md">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <CardContent className="h-64 flex items-end justify-between px-6 pb-6 gap-2">
            {/* Visual bar chart using pure CSS/HTML since no chart lib allowed */}
            {[40, 65, 45, 80, 55, 90].map((h, i) => (
              <div key={i} className="flex flex-col items-center flex-1 group">
                <div className="w-full relative h-48 flex items-end">
                  <div
                    className="w-full bg-primary/20 rounded-t-sm transition-all duration-500 group-hover:bg-primary"
                    style={{ height: `${h}%` }}
                  ></div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {h} meals
                  </div>
                </div>
                <span className="text-xs text-neutral-muted mt-2">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i]}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600 to-green-800 text-white">
          <CardContent className="h-full flex flex-col justify-center items-center text-center p-8">
            <FiGlobe size={64} className="mb-6 opacity-80" />
            <h3 className="text-2xl font-bold mb-2">Did you know?</h3>
            <p className="text-green-100 max-w-sm text-lg">
              You've saved enough CO₂ to drive a car for{" "}
              <span className="font-bold text-white">2,500 miles</span>!
            </p>
            <div className="mt-8 p-4 bg-white/10 rounded-lg backdrop-blur-sm w-full max-w-xs">
              <p className="text-sm font-medium opacity-90">
                Next Badge Milestone
              </p>
              <div className="mt-2 h-2 bg-black/20 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-white rounded-full"></div>
              </div>
              <p className="text-xs mt-2 text-right opacity-75">
                750 / 1000 kg CO₂
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
