import { ReactNode } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Download, ScrollText, ArrowLeft, FileText, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/content', label: 'Conteúdo', icon: FileText },
  { path: '/admin/backups', label: 'Backups', icon: Database },
  { path: '/admin/export', label: 'Export', icon: Download },
  { path: '/admin/audit', label: 'Audit Log', icon: ScrollText },
];

interface Props {
  children: ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <h1 className="font-['Cormorant_Garamond'] text-xl font-semibold text-foreground">
            Bibliotheca
          </h1>
          <p className="text-xs text-muted-foreground font-['Josefin_Sans'] uppercase tracking-wider mt-1">
            Admin
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-["Josefin_Sans"] transition-colors',
                isActive(item.path, item.exact)
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-['Josefin_Sans'] text-muted-foreground hover:text-foreground hover:bg-muted/50 w-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
