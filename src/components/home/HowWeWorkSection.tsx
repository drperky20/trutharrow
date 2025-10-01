import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Eye, Lock, MessageSquare, BookOpen } from 'lucide-react';

export const HowWeWorkSection = () => {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="container px-4 py-12 md:py-16">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="h-8 w-8 text-primary" />
          <h2 className="text-3xl md:text-4xl font-black">How We Work</h2>
        </div>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
          TruthArrow is a student-run accountability watchdog for Broken Arrow Public Schools. 
          We investigate, document, and publish verifiable information with journalistic standards 
          and source protection.
        </p>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold">Verification First</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every submission verified through multiple sources before publication.
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold">Source Protection</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Anonymous submissions stay anonymous. No IP logging, no tracking.
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold">Editorial Standards</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Journalistic ethics: verify, protect sources, correct errors publicly.
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold">Transparency</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Open methodology, public corrections, explained grading system.
            </p>
          </div>
        </div>
        
        <Link to="/about">
          <Button variant="outline" size="lg" className="font-semibold min-h-[44px]">
            Read Full Yearbook
          </Button>
        </Link>
      </div>
    </section>
  );
};
