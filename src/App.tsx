import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { RainbowBanner } from "@/components/RainbowBanner";
import { Footer } from "@/components/Footer";
import Index from "./pages/Index";
import Issues from "./pages/Issues";
import IssueDetail from "./pages/IssueDetail";
import Feed from "./pages/Feed";
import Receipts from "./pages/Receipts";
import Submit from "./pages/Submit";
import About from "./pages/About";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <RainbowBanner />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/issues" element={<Issues />} />
              <Route path="/issues/:slug" element={<IssueDetail />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/receipts" element={<Receipts />} />
              <Route path="/submit" element={<Submit />} />
              <Route path="/about" element={<About />} />
              <Route path="/search" element={<Search />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
