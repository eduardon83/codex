import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Search, Shield, Ban, Trash2, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { resolveAvatarSrc } from '@/lib/avatars';

interface AdminUser {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  location: string | null;
  avatar_url: string | null;
  bio: string | null;
  profile_completed: boolean;
  suspended: boolean;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
  book_count: number;
  library_count: number;
  last_sign_in_at: string | null;
  roles: AppRole[];
}

type AppRole = 'admin' | 'teacher' | 'school_admin' | 'entity' | 'global_admin' | 'moderator' | 'user';
type SortKey = 'name' | 'email' | 'created_at' | 'book_count' | 'library_count';

const roleLabels: Record<AppRole, string> = {
  admin: 'Admin',
  teacher: 'Teacher',
  school_admin: 'School admin',
  entity: 'Entity',
  global_admin: 'Global admin',
  moderator: 'Moderator',
  user: 'User',
};

const assignableRoles: AppRole[] = ['teacher', 'school_admin', 'entity', 'moderator', 'user', 'global_admin', 'admin'];

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<{ action: string; userId: string; name: string } | null>(null);
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [profileView, setProfileView] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    const { data, error } = await supabase.rpc('admin_get_users');
    if (!error && data) {
      const baseUsers = data as unknown as AdminUser[];
      const { data: rolesData } = await supabase
        .from('user_roles' as any)
        .select('user_id, role');
      const rolesByUser = new Map<string, AppRole[]>();
      ((rolesData as any[]) || []).forEach((row) => {
        const roles = rolesByUser.get(row.user_id) || [];
        roles.push(row.role as AppRole);
        rolesByUser.set(row.user_id, roles);
      });
      setUsers(baseUsers.map((adminUser) => ({
        ...adminUser,
        roles: Array.from(new Set([...(rolesByUser.get(adminUser.user_id) || []), ...(adminUser.is_admin ? ['admin' as AppRole] : [])])),
      })));
    }
    setLoading(false);
  };

  const callAdminAction = async (action: string, userId: string, details?: string, role?: AppRole) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-actions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ action, user_id: userId, role, details }),
      }
    );
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Action failed');
    }
    return res.json();
  };

  const handleAction = async (action: string, userId: string) => {
    setActionLoading(true);
    try {
      await callAdminAction(action, userId);
      toast.success('Action completed', { description: `${action.replace('_', ' ')} successful.` });
      await loadUsers();
      setSelected(prev => { const n = new Set(prev); n.delete(userId); return n; });
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    }
    setActionLoading(false);
    setConfirmAction(null);
    setBulkAction(null);
  };

  const handleRoleToggle = async (targetUser: AdminUser, role: AppRole) => {
    const hasRole = targetUser.roles.includes(role);
    setActionLoading(true);
    try {
      await callAdminAction(hasRole ? 'remove_role' : 'assign_role', targetUser.user_id, undefined, role);
      toast.success(hasRole ? 'Role removed' : 'Role assigned', { description: `${roleLabels[role]} updated.` });
      await loadUsers();
    } catch (err: any) {
      toast.error('Error', { description: err.message });
    }
    setActionLoading(false);
  };

  const handleBulk = async (action: string) => {
    setActionLoading(true);
    for (const userId of selected) {
      if (userId === currentUser?.id) continue;
      try {
        await callAdminAction(action, userId);
      } catch {}
    }
    toast.success('Bulk action completed');
    setSelected(new Set());
    await loadUsers();
    setActionLoading(false);
    setBulkAction(null);
  };

  const filteredUsers = useMemo(() => {
    let list = users;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        (u.first_name?.toLowerCase().includes(q)) ||
        (u.last_name?.toLowerCase().includes(q)) ||
        (u.email?.toLowerCase().includes(q)) ||
        (u.username?.toLowerCase().includes(q))
      );
    }
    list = [...list].sort((a, b) => {
      let av: any, bv: any;
      switch (sortKey) {
        case 'name': av = `${a.first_name} ${a.last_name}`; bv = `${b.first_name} ${b.last_name}`; break;
        case 'email': av = a.email; bv = b.email; break;
        case 'created_at': av = a.created_at; bv = b.created_at; break;
        case 'book_count': av = a.book_count; bv = b.book_count; break;
        case 'library_count': av = a.library_count; bv = b.library_count; break;
      }
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });
    return list;
  }, [users, search, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return null;
    return sortAsc ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />;
  };

  const initials = (u: AdminUser) => {
    const f = u.first_name?.[0] || '';
    const l = u.last_name?.[0] || '';
    return (f + l).toUpperCase() || '?';
  };

  const allSelected = filteredUsers.length > 0 && filteredUsers.every(u => selected.has(u.user_id));

  if (loading) return <p className="text-muted-foreground text-sm font-['Josefin_Sans']">Loading users…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['Cormorant_Garamond'] text-3xl font-semibold text-foreground">Users</h2>
        <p className="text-muted-foreground text-sm font-['Josefin_Sans'] mt-1">{users.length} registered users</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or username…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-['Josefin_Sans']">{selected.size} selected</span>
            <Button size="sm" variant="outline" onClick={() => setBulkAction('suspend_user')} disabled={actionLoading}>
              <Ban className="w-3 h-3 mr-1" /> Suspend
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setBulkAction('delete_user')} disabled={actionLoading}>
              <Trash2 className="w-3 h-3 mr-1" /> Delete
            </Button>
          </div>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => {
                    if (checked) setSelected(new Set(filteredUsers.map(u => u.user_id)));
                    else setSelected(new Set());
                  }}
                />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('name')}>
                <span className="text-[11px] uppercase tracking-wider font-['Josefin_Sans']">User<SortIcon k="name" /></span>
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('email')}>
                <span className="text-[11px] uppercase tracking-wider font-['Josefin_Sans']">Email<SortIcon k="email" /></span>
              </TableHead>
              <TableHead>
                <span className="text-[11px] uppercase tracking-wider font-['Josefin_Sans']">Location</span>
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('created_at')}>
                <span className="text-[11px] uppercase tracking-wider font-['Josefin_Sans']">Joined<SortIcon k="created_at" /></span>
              </TableHead>
              <TableHead className="cursor-pointer select-none text-center" onClick={() => toggleSort('book_count')}>
                <span className="text-[11px] uppercase tracking-wider font-['Josefin_Sans']">Books<SortIcon k="book_count" /></span>
              </TableHead>
              <TableHead className="cursor-pointer select-none text-center" onClick={() => toggleSort('library_count')}>
                <span className="text-[11px] uppercase tracking-wider font-['Josefin_Sans']">Libs<SortIcon k="library_count" /></span>
              </TableHead>
              <TableHead>
                <span className="text-[11px] uppercase tracking-wider font-['Josefin_Sans']">Status</span>
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u.user_id}>
                <TableCell>
                  <Checkbox
                    checked={selected.has(u.user_id)}
                    onCheckedChange={(checked) => {
                      const n = new Set(selected);
                      if (checked) n.add(u.user_id); else n.delete(u.user_id);
                      setSelected(n);
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={resolveAvatarSrc(u.avatar_url)} />
                      <AvatarFallback className="text-xs">{initials(u)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium font-['Josefin_Sans']">
                        {u.first_name} {u.last_name}
                      </p>
                      {u.username && <p className="text-xs text-muted-foreground">@{u.username}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.location || '—'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-center text-sm">{u.book_count}</TableCell>
                <TableCell className="text-center text-sm">{u.library_count}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {u.roles.map((role) => (
                      <Badge key={role} variant="secondary" className="text-[10px]">{roleLabels[role]}</Badge>
                    ))}
                    {u.suspended && <Badge variant="destructive" className="text-[10px]">Suspended</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-8 h-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setProfileView(u)}>
                        <Eye className="w-3 h-3 mr-2" /> View Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {u.suspended ? (
                        <DropdownMenuItem onClick={() => handleAction('unsuspend_user', u.user_id)}>
                          Unsuspend
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => setConfirmAction({ action: 'suspend_user', userId: u.user_id, name: `${u.first_name} ${u.last_name}` })}
                          disabled={u.user_id === currentUser?.id}
                        >
                          <Ban className="w-3 h-3 mr-2" /> Suspend
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Shield className="w-3 h-3 mr-2" /> Roles
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {assignableRoles.map((role) => (
                            <DropdownMenuCheckboxItem
                              key={role}
                              checked={u.roles.includes(role)}
                              disabled={actionLoading || (u.user_id === currentUser?.id && role === 'admin')}
                              onCheckedChange={() => handleRoleToggle(u, role)}
                            >
                              {roleLabels[role]}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setConfirmAction({ action: 'delete_user', userId: u.user_id, name: `${u.first_name} ${u.last_name}` })}
                        disabled={u.user_id === currentUser?.id}
                      >
                        <Trash2 className="w-3 h-3 mr-2" /> Delete Account
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Confirm dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-['Cormorant_Garamond']">
              {confirmAction?.action === 'delete_user' ? 'Delete Account' :
               confirmAction?.action === 'suspend_user' ? 'Suspend Account' : 'Remove Admin'}
            </DialogTitle>
            <DialogDescription className="font-['Josefin_Sans'] text-sm">
              {confirmAction?.action === 'delete_user'
                ? `This will permanently delete all data for ${confirmAction.name}. This cannot be undone.`
                : confirmAction?.action === 'suspend_user'
                ? `${confirmAction.name} will see an "account suspended" screen on login.`
                : `${confirmAction?.name} will lose admin privileges.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button
              variant={confirmAction?.action === 'delete_user' ? 'destructive' : 'default'}
              onClick={() => confirmAction && handleAction(confirmAction.action, confirmAction.userId)}
              disabled={actionLoading}
            >
              {actionLoading ? '…' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk confirm dialog */}
      <Dialog open={!!bulkAction} onOpenChange={() => setBulkAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-['Cormorant_Garamond']">
              {bulkAction === 'delete_user' ? 'Bulk Delete' : 'Bulk Suspend'}
            </DialogTitle>
            <DialogDescription className="font-['Josefin_Sans'] text-sm">
              This will {bulkAction === 'delete_user' ? 'permanently delete' : 'suspend'} {selected.size} users. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkAction(null)}>Cancel</Button>
            <Button
              variant={bulkAction === 'delete_user' ? 'destructive' : 'default'}
              onClick={() => bulkAction && handleBulk(bulkAction)}
              disabled={actionLoading}
            >
              {actionLoading ? '…' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile view sheet */}
      <Sheet open={!!profileView} onOpenChange={() => setProfileView(null)}>
        <SheetContent className="overflow-y-auto">
          {profileView && (
            <>
              <SheetHeader>
                <SheetTitle className="font-['Cormorant_Garamond']">User Profile</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={resolveAvatarSrc(profileView.avatar_url)} />
                    <AvatarFallback className="text-lg">{initials(profileView)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-['Cormorant_Garamond'] text-xl font-semibold">
                      {profileView.first_name} {profileView.last_name}
                    </p>
                    {profileView.username && (
                      <p className="text-sm text-muted-foreground">@{profileView.username}</p>
                    )}
                  </div>
                </div>
                {[
                  ['Email', profileView.email],
                  ['Location', profileView.location],
                  ['Bio', profileView.bio],
                  ['Books', profileView.book_count],
                  ['Libraries', profileView.library_count],
                  ['Joined', new Date(profileView.created_at).toLocaleDateString()],
                  ['Last Active', profileView.last_sign_in_at ? new Date(profileView.last_sign_in_at).toLocaleDateString() : 'Never'],
                  ['Status', profileView.suspended ? 'Suspended' : 'Active'],
                  ['Roles', profileView.roles.map((role) => roleLabels[role]).join(', ') || '—'],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <p className="text-[11px] uppercase tracking-wider font-['Josefin_Sans'] text-muted-foreground">{label}</p>
                    <p className="text-sm font-['Josefin_Sans'] text-foreground mt-0.5">{value || '—'}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
