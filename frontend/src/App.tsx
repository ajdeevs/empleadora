
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserModeProvider } from "@/context/UserModeContext";
import { SavedProfilesProvider } from "@/context/SavedProfilesContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import Index from "./pages/Index";
import Freelancers from "./pages/Freelancers";
import Projects from "./pages/Projects";
import Contests from "./pages/Contests";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Contact from "./pages/Contact";
import SavedProfiles from "./pages/SavedProfiles";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/UserProfile";
import PostProject from "./pages/PostProject";
import HowItWorksPage from "./pages/HowItWorksPage";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
        <UserModeProvider>
          <SavedProfilesProvider>
            <BrowserRouter>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/dashboard" element={<Dashboard userType="freelancer" />} />
                    <Route path="/freelancers" element={<Freelancers />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/post-project" element={<PostProject />} />
                    <Route path="/contests" element={<Contests />} />
                    <Route path="/profile/:id" element={<Profile />} />
                    <Route path="/user-profile" element={<UserProfile />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/how-it-works" element={<HowItWorksPage />} />
                    <Route path="/saved-profiles" element={<SavedProfiles />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </BrowserRouter>
          </SavedProfilesProvider>
        </UserModeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
