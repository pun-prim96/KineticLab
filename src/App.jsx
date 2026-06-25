import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';

import PageLayout from '@/components/layout/PageLayout';
import Home from '@/pages/Home';
import WorkExperiment from '@/pages/WorkExperiment';
import EnergyExperiment from '@/pages/EnergyExperiment';
import PowerExperiment from '@/pages/PowerExperiment';
import Formulas from '@/pages/Formulas';
import Calculators from '@/pages/Calculators';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route element={<PageLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/experiment/work" element={<WorkExperiment />} />
              <Route path="/experiment/energy" element={<EnergyExperiment />} />
              <Route path="/experiment/power" element={<PowerExperiment />} />
              <Route path="/formulas" element={<Formulas />} />
              <Route path="/calculators" element={<Calculators />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App