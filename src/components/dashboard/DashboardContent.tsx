import React from 'react';
import { RotateCw } from 'lucide-react';
import { TrialTrackerBanner } from '../TrialTrackerBanner';
import { AnalyticsOverview } from '../AnalyticsOverview';
import { CategoryBreakdownChart } from '../CategoryBreakdownChart';
import { SpendTrendChart } from '../SpendTrendChart';
import { RenewalCalendar } from '../RenewalCalendar';
import { SubscriptionList } from '../SubscriptionList';
import { useSubtrackApp } from '../../hooks/useSubtrackApp';

interface DashboardContentProps {
  appState: ReturnType<typeof useSubtrackApp>;
}

export function DashboardContent({ appState }: DashboardContentProps) {
  const {
    isLoading, subscriptions, analyticsData, currentUser,
    potentialSavings, setSubToEdit, setIsSubModalOpen,
    setIsUpgradeModalOpen, setIsOptimizerOpen,
    handleDeleteSubscription, handleToggleStatus,
  } = appState;

  const openEdit = (sub: any) => { setSubToEdit(sub); setIsSubModalOpen(true); };
  const openAdd = () => { setSubToEdit(null); setIsSubModalOpen(true); };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 space-y-3">
        <RotateCw className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium">Loading SubTrack Engine...</p>
      </div>
    );
  }

  return (
    <>
      <TrialTrackerBanner
        subscriptions={subscriptions}
        preferredCurrency={currentUser.preferredCurrency}
        onEditSubscription={openEdit}
      />
      <AnalyticsOverview
        monthlySpend={analyticsData.totalMonthlySpend}
        annualSpend={analyticsData.totalAnnualSpend}
        activeCount={analyticsData.activeCount}
        trialsCount={analyticsData.trialsCount}
        totalCount={analyticsData.totalSubsCount}
        currency={currentUser.preferredCurrency}
        userTier={currentUser.tier}
        onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        potentialAnnualSavings={potentialSavings}
        onOpenOptimizer={() => setIsOptimizerOpen(true)}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CategoryBreakdownChart
          data={analyticsData.categoryBreakdown}
          currency={currentUser.preferredCurrency}
          totalMonthly={analyticsData.totalMonthlySpend}
        />
        <SpendTrendChart
          monthlySpend={analyticsData.totalMonthlySpend}
          currency={currentUser.preferredCurrency}
        />
      </div>
      <RenewalCalendar
        subscriptions={subscriptions}
        preferredCurrency={currentUser.preferredCurrency}
        onEditSubscription={openEdit}
      />
      <SubscriptionList
        subscriptions={subscriptions}
        preferredCurrency={currentUser.preferredCurrency}
        onEdit={openEdit}
        onDelete={handleDeleteSubscription}
        onToggleStatus={handleToggleStatus}
        onAddNew={openAdd}
      />
    </>
  );
}
