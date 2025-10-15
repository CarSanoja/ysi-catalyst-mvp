import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { ShapersDashboard } from './components/ShapersDashboard';
import { GlobalInsights } from './components/GlobalInsights';
import { CaptureNotes } from './components/CaptureNotes';
import { ProcessedDocuments } from './components/ProcessedDocuments';
import { StakeholderDirectory } from './components/StakeholderDirectory';
import { Login } from './components/Login';
import { useShapers, useDocuments } from './hooks/useApi';
import { Users, FileText, FolderOpen, Lightbulb, RefreshCw, ContactRound, LogOut } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user, logout, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardSubTab, setDashboardSubTab] = useState('shapers');

  const { data: shapers, loading: shapersLoading, error: shapersError, refetch: refetchShapers } = useShapers();
  const { data: documents, loading: documentsLoading, error: documentsError, refetch: refetchDocuments } = useDocuments();

  const handleReloadData = async () => {
    await Promise.all([refetchShapers(), refetchDocuments()]);
  };

  const isReloading = shapersLoading || documentsLoading;

  // Show login if not authenticated
  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #ffffff, #E8F1F9)' }}>
      <Toaster />
      
      {/* Header */}
      <header className="border-b border-[#E0E0E0] bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ color: '#0077B6' }}>Youth & Social Innovation</h1>
              <p className="text-muted-foreground mt-1">
                Charter Co-creation Platform
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleReloadData}
                disabled={isReloading}
                variant="outline"
                size="sm"
                className="gap-2 border-[#0077B6]/20 hover:bg-[#0077B6]/10"
              >
                <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Reload Data</span>
              </Button>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0077B6]/10 to-[#FF6B6B]/10 rounded-full border border-[#0077B6]/20">
                <div className="w-2 h-2 bg-[#FF6B6B] rounded-full animate-pulse" />
                <span className="text-sm">Live Collaboration</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 hidden md:inline">{user.email}</span>
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="flex w-full max-w-5xl mx-auto bg-white border-2 border-[#E0E0E0] p-1 h-auto">
            <TabsTrigger
              value="dashboard"
              className="gap-2 data-[state=active]:bg-[#0077B6] data-[state=active]:text-white py-3 rounded-lg transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger
                value="capture"
                className="gap-2 data-[state=active]:bg-[#0077B6] data-[state=active]:text-white py-3 rounded-lg transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Capture Notes</span>
              </TabsTrigger>
            )}
            <TabsTrigger
              value="documents"
              className="gap-2 data-[state=active]:bg-[#0077B6] data-[state=active]:text-white py-3 rounded-lg transition-all"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger
              value="stakeholders"
              className="gap-2 data-[state=active]:bg-[#0077B6] data-[state=active]:text-white py-3 rounded-lg transition-all"
            >
              <ContactRound className="w-4 h-4" />
              <span>Stakeholders</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-4">
            {/* Dashboard Sub-tabs */}
            <Tabs value={dashboardSubTab} onValueChange={setDashboardSubTab} className="space-y-3">
              <TabsList className="flex w-full max-w-xl mx-auto bg-white border-2 border-[#E0E0E0] p-1 h-auto">
                <TabsTrigger
                  value="shapers"
                  className="flex-1 gap-2 data-[state=active]:bg-[#0077B6] data-[state=active]:text-white py-2.5 rounded-lg transition-all"
                >
                  <Users className="w-4 h-4" />
                  <span>Shapers Network</span>
                </TabsTrigger>
                <TabsTrigger
                  value="insights"
                  className="flex-1 gap-2 data-[state=active]:bg-[#0077B6] data-[state=active]:text-white py-2.5 rounded-lg transition-all"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>Global Insights</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="shapers">
                <ShapersDashboard
                  shapers={shapers || []}
                  loading={shapersLoading}
                  error={shapersError}
                />
              </TabsContent>

              <TabsContent value="insights">
                <GlobalInsights />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="capture" className="mt-8">
              <CaptureNotes />
            </TabsContent>
          )}

          <TabsContent value="documents" className="mt-8">
            <ProcessedDocuments
              documents={documents || []}
              loading={documentsLoading}
              error={documentsError}
            />
          </TabsContent>

          <TabsContent value="stakeholders" className="mt-8">
            <StakeholderDirectory />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E0E0E0] bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                © 2025 Youth & Social Innovation Charter Initiative
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Powered by {shapers?.length || 0} Global Shapers worldwide
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#0077B6] rounded-full" />
                <span className="text-muted-foreground">Capital Access</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#C3B1E1] rounded-full" />
                <span className="text-muted-foreground">Recognition</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#A8E6CF] rounded-full" />
                <span className="text-muted-foreground">Wellbeing</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
