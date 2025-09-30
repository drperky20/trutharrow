import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background-soft py-8 mt-16">
      <div className="container px-4">
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <Link to="/issues" className="hover:text-foreground transition-colors">
            Issues
          </Link>
          <Link to="/feed" className="hover:text-foreground transition-colors">
            Feed
          </Link>
          <Link to="/receipts" className="hover:text-foreground transition-colors">
            Receipts
          </Link>
          <Link to="/submit" className="hover:text-foreground transition-colors">
            Submit
          </Link>
          <Link to="/about" className="hover:text-foreground transition-colors">
            Yearbook
          </Link>
          <a 
            href="mailto:truth@protonmail.com" 
            className="hover:text-foreground transition-colors"
          >
            Safety
          </a>
        </div>
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>Truth doesn't graduate.</p>
        </div>
      </div>
    </footer>
  );
};
