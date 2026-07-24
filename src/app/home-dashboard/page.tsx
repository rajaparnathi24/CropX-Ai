import AppLayout from '@/components/AppLayout';
import DashboardGreeting from './components/DashboardGreeting';
import MetricsBentoGrid from './components/MetricsBentoGrid';
import CategoryFilter from './components/CategoryFilter';
import RecentDiagnosesTable from './components/RecentDiagnosesTable';
import DiseaseAlertsSection from './components/DiseaseAlertsSection';
import AgricultureNewsStrip from './components/AgricultureNewsStrip';
import QuickScanButton from './components/QuickScanButton';

export default function HomeDashboardPage() {
  return (
    <AppLayout currentPath="/home-dashboard">
      <div className="space-y-6">
        <DashboardGreeting />
        <MetricsBentoGrid />
        <DiseaseAlertsSection />
        <div className="space-y-4">
          <CategoryFilter />
          <RecentDiagnosesTable />
        </div>
        <AgricultureNewsStrip />
        <QuickScanButton />
      </div>
    </AppLayout>
  );
}
