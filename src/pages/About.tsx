import { Shield, Eye, Lock, MessageSquare } from 'lucide-react';

export default function About() {
  return (
    <div className="container px-4 py-12 max-w-4xl">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black mb-4">Yearbook</h1>
        <p className="text-xl text-muted-foreground">
          Who we are, what we do, and how we operate.
        </p>
      </div>
      
      {/* Mission */}
      <section className="mb-12">
        <h2 className="text-3xl font-black mb-4">Mission</h2>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-lg leading-relaxed mb-4">
            TruthArrow is a student-run accountability watchdog for Broken Arrow Public Schools.
            We investigate, document, and publish verifiable information about issues affecting
            students, transparency gaps, and institutional accountability.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We exist because students deserve to know what's happening in their schools. When
            administrators avoid questions, when facility issues persist, when policies are applied
            inconsistently — we document it. We're not here to tear down the district. We're here
            to hold it accountable.
          </p>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="mb-12">
        <h2 className="text-3xl font-black mb-6">How It Works</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold">Verification First</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Every submission is verified through multiple sources before publication. We check
              documents, corroborate accounts, and ensure accuracy.
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold">Source Protection</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Anonymous submissions are truly anonymous. We don't log IPs, don't require accounts,
              and use encrypted channels for sensitive communications.
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold">Editorial Standards</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              We follow journalistic ethics: verify before publishing, protect sources, correct
              errors promptly, and provide context. Every claim is backed by documentation.
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold">Transparency</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              We publish our methodology, note when information is redacted, and explain our
              grading system. If we get something wrong, we correct it publicly.
            </p>
          </div>
        </div>
      </section>
      
      {/* Moderation */}
      <section className="mb-12">
        <h2 className="text-3xl font-black mb-4">Moderation Process</h2>
        <div className="bg-card border border-border rounded-lg p-6">
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                1
              </span>
              <div>
                <h3 className="font-bold mb-1">Submission Review</h3>
                <p className="text-sm text-muted-foreground">
                  All submissions enter a pending queue visible only to editors.
                </p>
              </div>
            </li>
            
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                2
              </span>
              <div>
                <h3 className="font-bold mb-1">Verification</h3>
                <p className="text-sm text-muted-foreground">
                  We check facts, request additional documentation if needed, and corroborate with
                  other sources when possible.
                </p>
              </div>
            </li>
            
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                3
              </span>
              <div>
                <h3 className="font-bold mb-1">Editorial Decision</h3>
                <p className="text-sm text-muted-foreground">
                  Approve (publish), reject (with internal note), or request more information.
                </p>
              </div>
            </li>
            
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                4
              </span>
              <div>
                <h3 className="font-bold mb-1">Publication</h3>
                <p className="text-sm text-muted-foreground">
                  Approved items appear on the site with context, related issues, and sourcing.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>
      
      {/* Redaction Guide */}
      <section className="mb-12">
        <h2 className="text-3xl font-black mb-4">How to Redact Sensitive Info</h2>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="mb-4 text-sm text-muted-foreground">
            Before submitting documents, remove:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Student names (unless you're referencing yourself and want to be identified)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Staff names (unless they're public officials in their official capacity)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>ID numbers, addresses, phone numbers, email addresses</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Any medical, disciplinary, or other private information about individuals</span>
            </li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Use a black marker or digital redaction tool. If you're unsure, submit it anyway and
            note what you think should be redacted — we'll handle it.
          </p>
        </div>
      </section>
      
      {/* Contact */}
      <section>
        <h2 className="text-3xl font-black mb-4">Contact</h2>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="mb-4">
            For secure communication, use our ProtonMail:
          </p>
          <a
            href="mailto:truth@protonmail.com"
            className="inline-flex items-center gap-2 text-primary hover:underline font-mono"
          >
            truth@protonmail.com
          </a>
          <p className="mt-6 text-sm text-muted-foreground">
            For maximum security, use PGP encryption. Our public key is available on request.
          </p>
        </div>
      </section>
    </div>
  );
}
