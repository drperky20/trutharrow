import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { Navbar } from "./components/Navbar";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { RainbowBanner } from "./components/RainbowBanner";
import { Footer } from "./components/Footer";
import Index from "./pages/Index";
import Issues from "./pages/Issues";
import IssueDetail from "./pages/IssueDetail";
import Feed from "./pages/Feed";
import ThreadView from "./pages/ThreadView";
import Receipts from "./pages/Receipts";
import Submit from "./pages/Submit";
import About from "./pages/About";
import Search from "./pages/Search";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminIssues from "./pages/admin/Issues";
import AdminPosts from "./pages/admin/Posts";
import AdminEvidence from "./pages/admin/Evidence";
import AdminBanners from "./pages/admin/Banners";
import AdminPolls from "./pages/admin/Polls";
import AdminTicker from "./pages/admin/Ticker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <RainbowBanner />
            <div className="mobile-nav-padding">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/issues" element={<Issues />} />
                <Route path="/issues/:slug" element={<IssueDetail />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/feed/:postId" element={<ThreadView />} />
                <Route path="/receipts" element={<Receipts />} />
                <Route path="/submit" element={<Submit />} />
                <Route path="/about" element={<About />} />
                <Route path="/search" element={<Search />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/issues" element={<AdminIssues />} />
                <Route path="/admin/posts" element={<AdminPosts />} />
                <Route path="/admin/evidence" element={<AdminEvidence />} />
                <Route path="/admin/banners" element={<AdminBanners />} />
                <Route path="/admin/polls" element={<AdminPolls />} />
                <Route path="/admin/ticker" element={<AdminTicker />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
            </div>
            <MobileBottomNav />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
