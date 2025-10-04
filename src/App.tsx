import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Navbar } from "./components/Navbar";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { RainbowBanner } from "./components/RainbowBanner";
import { Footer } from "./components/Footer";
import { AquaDock } from "./components/aqua/AquaDock";

const Index = lazy(() => import("./pages/Index"));
const Issues = lazy(() => import("./pages/Issues"));
const IssueDetail = lazy(() => import("./pages/IssueDetail"));
const Feed = lazy(() => import("./pages/Feed"));
const ThreadView = lazy(() => import("./pages/ThreadView"));
const Receipts = lazy(() => import("./pages/Receipts"));
const Submit = lazy(() => import("./pages/Submit"));
const About = lazy(() => import("./pages/About"));
const Search = lazy(() => import("./pages/Search"));
const Auth = lazy(() => import("./pages/Auth"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminIssues = lazy(() => import("./pages/admin/Issues"));
const AdminPosts = lazy(() => import("./pages/admin/Posts"));
const AdminEvidence = lazy(() => import("./pages/admin/Evidence"));
const AdminBanners = lazy(() => import("./pages/admin/Banners"));
const AdminPolls = lazy(() => import("./pages/admin/Polls"));
const AdminTicker = lazy(() => import("./pages/admin/Ticker"));
const AdminHeadlines = lazy(() => import("./pages/admin/Headlines"));
const AdminSubmissions = lazy(() => import("./pages/admin/Submissions"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AuthProvider>
            <div className="min-h-screen bg-background text-foreground">
              <RainbowBanner />
              <div className="mobile-nav-padding">
                <Suspense
                  fallback={
                    <div className="py-12 text-center text-sm text-muted-foreground">
                      Loading…
                    </div>
                  }
                >
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
                    <Route path="/admin/headlines" element={<AdminHeadlines />} />
                    <Route path="/admin/submissions" element={<AdminSubmissions />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <Footer />
              </div>
              <MobileBottomNav />
              <AquaDock />
            </div>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
