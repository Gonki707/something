import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/AppLayout";

// Import pages
import { HomePage } from "@/pages/home/HomePage";
import { NewsListPage } from "@/pages/news/NewsListPage";
import { NewsDetailPage } from "@/pages/news/NewsDetailPage";
import { AnnouncementListPage } from "@/pages/announcements/AnnouncementListPage";
import { AnnouncementDetailPage } from "@/pages/announcements/AnnouncementDetailPage";
import { TenderListPage } from "@/pages/tenders/TenderListPage";
import { TenderDetailPage } from "@/pages/tenders/TenderDetailPage";
import { CompetitionListPage } from "@/pages/competitions/CompetitionListPage";
import { CompetitionDetailPage } from "@/pages/competitions/CompetitionDetailPage";
import { GazetteListPage } from "@/pages/gazette/GazetteListPage";
import { ProjectListPage } from "@/pages/projects/ProjectListPage";
import { ProjectDetailPage } from "@/pages/projects/ProjectDetailPage";
import { LegislationListPage } from "@/pages/legislation/LegislationListPage";
import { LegislationDetailPage } from "@/pages/legislation/LegislationDetailPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/novosti" component={NewsListPage} />
        <Route path="/novosti/:id" component={NewsDetailPage} />
        <Route path="/soopstenija" component={AnnouncementListPage} />
        <Route path="/soopstenija/:id" component={AnnouncementDetailPage} />
        <Route path="/oglasi" component={TenderListPage} />
        <Route path="/oglasi/:id" component={TenderDetailPage} />
        <Route path="/konkursi" component={CompetitionListPage} />
        <Route path="/konkursi/:id" component={CompetitionDetailPage} />
        <Route path="/sluzben-glasnik" component={GazetteListPage} />
        <Route path="/proekti" component={ProjectListPage} />
        <Route path="/proekti/:id" component={ProjectDetailPage} />
        <Route path="/legislativa" component={LegislationListPage} />
        <Route path="/legislativa/:id" component={LegislationDetailPage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
