
import { TrendingUp, Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface Application {
  id: number;
  university: string;
  program: string;
  deadline: string;
  status: number;
  progress: number;
  requirements: string[];
  completed: string[];
}

interface StatsOverviewProps {
  applications: Application[];
}

export const StatsOverview = ({ applications }: StatsOverviewProps) => {
  const totalApplications = applications.length;
  const completedApplications = applications.filter(app => app.status === 2 || app.status === 1).length;
  const inProgressApplications = applications.filter(app => app.status === 0).length;
  const averageProgress = Math.round(
    (applications.reduce((sum, app) => sum + (app.progress / 4) * 100, 0) / totalApplications)
  );

  const stats = [
    {
      title: "Total Applications",
      value: totalApplications,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Completed",
      value: completedApplications,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "In Progress",
      value: inProgressApplications,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      title: "Average Progress",
      value: `${averageProgress}%`,
      icon: AlertTriangle,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={index} 
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
