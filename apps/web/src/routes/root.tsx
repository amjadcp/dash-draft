import React from 'react';
import { useParams } from 'react-router-dom';
import { useQueryState } from 'nuqs';
import { WorkspaceProvider } from '../state/workspace-context';
import { AppLayout } from '../components/layout/app-layout';
import { sidebarTabParser } from '../components/layout/sidebar';
import { LandingPage } from '../components/landing/landing-page';
import { DashboardRoute } from './dashboard';
import { AnalyticsPlaceholderRoute } from './analytics-placeholder';
import { SettingsPlaceholderRoute } from './settings-placeholder';

export function RootRoute(): React.ReactElement {
  const { userId } = useParams<{ userId?: string }>();
  const [activeTab] = useQueryState('tab', sidebarTabParser);

  if (!userId) {
    return <LandingPage />;
  }

  const renderTabContent = (): React.ReactElement => {
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsPlaceholderRoute />;
      case 'settings':
        return <SettingsPlaceholderRoute />;
      case 'tables':
      default:
        return <DashboardRoute />;
    }
  };

  return (
    <WorkspaceProvider>
      <AppLayout>{renderTabContent()}</AppLayout>
    </WorkspaceProvider>
  );
}
