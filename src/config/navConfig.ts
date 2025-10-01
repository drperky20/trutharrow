import { Home, FileText, MessageSquare, Receipt, SquarePlus, Shield } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: typeof Home;
  isPrimary?: boolean;
  requiresAdmin?: boolean;
}

export const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Front Office',
    path: '/',
    icon: Home,
  },
  {
    id: 'issues',
    label: 'Detention Board',
    path: '/issues',
    icon: FileText,
  },
  {
    id: 'feed',
    label: 'Cafeteria',
    path: '/feed',
    icon: MessageSquare,
  },
  {
    id: 'receipts',
    label: 'Receipts',
    path: '/receipts',
    icon: Receipt,
  },
  {
    id: 'submit',
    label: 'Submit',
    path: '/submit',
    icon: SquarePlus,
    isPrimary: true,
  },
  {
    id: 'admin',
    label: 'Admin',
    path: '/admin',
    icon: Shield,
    requiresAdmin: true,
  },
];
