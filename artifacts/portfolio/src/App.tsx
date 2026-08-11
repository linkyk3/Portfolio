import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import Home from '@/pages/Home';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import Creations from '@/pages/Creations';
import Music from './pages/Music';
import CV from '@/pages/CV';
import WorkInProgress from '@/pages/WorkInProgress';
import { GlobalNav } from '@/components/GlobalNav';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cv" component={CV} />
      <Route path="/projects" component={Projects} />
      <Route path="/projects/:id" component={ProjectDetail} />
      <Route path="/creations" component={Creations} />
      <Route path="/music" component={Music} />
      <Route path="/music/mixtapes" component={() => <WorkInProgress title="Mixtapes" />} />
      <Route path="/music/inspiration" component={() => <WorkInProgress title="Inspiration" />} />
      <Route path="/visualizations" component={() => <WorkInProgress title="Visualizations" />} />
      <Route path="/blog" component={() => <WorkInProgress title="Blog" />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <GlobalNav />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
