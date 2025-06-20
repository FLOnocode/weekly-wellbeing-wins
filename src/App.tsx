import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/auth/AuthForm";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import Index from "./pages/Index";
import WeighIn from "./pages/WeighIn";
import Rankings from "./pages/Rankings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, afficher le formulaire d'authentification
  if (!user) {
    return <AuthForm />;
  }

  // Si l'utilisateur est connecté mais n'a pas de profil complet, afficher l'onboarding
  if (!profile || !profile.nickname || profile.goal_weight === 0 || profile.current_weight === 0) {
    return <OnboardingForm />;
  }

  // Si l'utilisateur est connecté et a un profil complet, afficher l'application
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/weigh-in" element={<WeighIn />} />
        <Route path="/rankings" element={<Rankings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;