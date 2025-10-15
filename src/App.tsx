
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AIProvider } from "@/contexts/AIContext";
import { Layout } from "@/components/Layout";
import { AdminLayout } from "@/layouts/AdminLayout";
import Index from "./pages/Index";
import StudyInSweden from "./pages/StudyInSweden";
import ApplicationJourney from "./pages/ApplicationJourney";
import PathwaySelection from "./pages/PathwaySelection";
import SelfDirectedPath from "./pages/SelfDirectedPath";
import PremiumService from "./pages/PremiumService";
import MyProfile from "./pages/MyProfile";
import AdminScholarshipSteps from "./pages/admin/AdminScholarshipSteps";
import AdminVisaSteps from "./pages/admin/AdminVisaSteps";
import AdminSteps from "./pages/admin/AdminSteps";
import Documents from "./pages/Documents";
// Document related components are now handled within the Documents page
import NotFound from "./pages/NotFound";
import EditDocument from "./pages/EditDocument";
import StartApplication from "./pages/StartApplication";
import Application from "./pages/Application";
import StartApplicationP2 from "./pages/StartApplicationP2";
import ManageApplication from "./pages/ManageApplication";
import StudyDestination from "./pages/admin/StudyDestination";
import UpdateStudyDestination from "./pages/admin/UpdateStudyDestination";
import { ResumeEdit } from "./pages/ResumeEdit";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AIProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Routes>
          <Route path="/student/dashboard" element={<Layout><Index /></Layout>} />
          <Route path="/student/start-application" element={<Layout><StartApplication /></Layout>} />
          <Route path="/student/application" element={<Layout><Application /></Layout>} />
          <Route path="/student/start-application-p2" element={<Layout><StartApplicationP2 /></Layout>} />
          <Route path="/student/manage-application" element={<Layout><ManageApplication /></Layout>} />
          <Route path="/admin/study-destination" element={<AdminLayout><StudyDestination /></AdminLayout>} />
          <Route path="/admin/update-study-destination" element={<AdminLayout><UpdateStudyDestination /></AdminLayout>} />
          <Route path="/student/documents" element={<Layout><Documents /></Layout>} />
           {/* Resume editor routes - No Layout wrapper for full-page experience */}
           <Route path="/user/document/resume" element={<ResumeEdit />} />
           <Route path="/user/document/edit-resume" element={<ResumeEdit />} />
           <Route path="/user/document/edit-doc" element={<EditDocument />} />
          
          {/* not in use */}
          <Route path="/student/application-journey" element={<Layout><ApplicationJourney /></Layout>} />
          <Route path="/student/pathway-selection" element={<Layout><PathwaySelection /></Layout>} />
          <Route path="/student/self-directed" element={<Layout><SelfDirectedPath /></Layout>} />
          <Route path="/student/premium-service" element={<Layout><PremiumService /></Layout>} />
          
          
          <Route path="/student/my-profile" element={<Layout><MyProfile /></Layout>} />
          <Route path="/admin/scholarship-steps" element={<AdminLayout><AdminScholarshipSteps /></AdminLayout>} />
          <Route path="/admin/visa-steps" element={<AdminLayout><AdminVisaSteps /></AdminLayout>} />
          <Route path="/admin/steps" element={<AdminLayout><AdminSteps /></AdminLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
      </AIProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
