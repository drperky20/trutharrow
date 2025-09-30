export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export type PostType = 'assignment' | 'detention-slip' | 'pop-quiz' | 'announcement';

export type EvidenceType = 'pdf' | 'image' | 'url';

export type Severity = 'info' | 'alert' | 'win';

export interface Banner {
  id: string;
  title: string;
  url?: string;
  severity: Severity;
  active: boolean;
}

export interface Post {
  id: string;
  type: PostType;
  content: string;
  images?: string[];
  issue_refs: string[];
  reactions: {
    like: number;
    lol: number;
    angry: number;
  };
  status: 'pending' | 'approved' | 'rejected';
  alias: string;
  featured: boolean;
  created_at: string;
}

export interface Issue {
  id: string;
  title: string;
  slug: string;
  grade: Grade;
  summary: string;
  tags: string[];
  hero_image?: string;
  last_updated: string;
}

export interface Evidence {
  id: string;
  title: string;
  file?: string;
  external_url?: string;
  caption: string;
  issue_ref: string;
  date_of_doc: string;
  sensitivity: 'low' | 'med' | 'high';
  redacted: boolean;
  featured: boolean;
  type: EvidenceType;
}

export interface TimelineEntry {
  id: string;
  issue_ref: string;
  date: string;
  entry_type: 'post' | 'doc' | 'milestone';
  ref_id?: string;
  note: string;
}

export interface Poll {
  id: string;
  question: string;
  options: string[];
  results: Record<string, number>;
  active: boolean;
}

export interface TickerQuote {
  id: string;
  text: string;
  source_label: string;
  approved: boolean;
}
