import { Link } from 'react-router-dom';
export const Footer = () => {
  return <footer className="border-t border-primary/30 bg-background-soft py-8 mt-16">
      <div className="container px-4">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            TruthArrow
          </h3>
          
          
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <Link to="/issues" className="hover:text-primary transition-colors">
            Issues
          </Link>
          <Link to="/feed" className="hover:text-primary transition-colors">
            Feed
          </Link>
          <Link to="/receipts" className="hover:text-primary transition-colors">
            Receipts
          </Link>
          <Link to="/submit" className="hover:text-primary transition-colors">
            Submit
          </Link>
          <Link to="/about" className="hover:text-primary transition-colors">
            Yearbook
          </Link>
          <a href="mailto:truth@protonmail.com" className="hover:text-primary transition-colors">
            Safety
          </a>
        </div>
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p className="font-semibold text-primary">Truth doesn't graduate.</p>
          
        </div>
      </div>
    </footer>;
};