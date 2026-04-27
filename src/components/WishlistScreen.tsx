import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { fetchBookByISBN } from '@/lib/isbn';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Heart, X, Loader2, Share2, HandCoins, CalendarDays, MoreVertical } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppToast } from '@/components/ToastNotification';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import HelpButton from '@/components/tutorial/HelpButton';
import { resolveAvatarSrc } from '@/lib/avatars';
import AddToPlanSheet, { PlanBookPayload } from '@/components/AddToPlanSheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import AddBookScreen from '@/components/AddBookScreen';

interface WishlistItem {
  id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  cover_url: string | null;
}

interface LoanRequest {
  id: string;
  requester_user_id: string;
  book_id: string;
  book_title: string;
  book_author: string | null;
  book_cover_url: string | null;
  book_isbn: string | null;
  status: string;
  created_at: string;
  requester_username?: string | null;
  requester_avatar_url?: string | null;
}

export default function WishlistScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useAppToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isbn, setIsbn] = useState('');
  const [manualText, setManualText] = useState('');
  const [loading, setLoading] = useState(false);
  const [libraryId, setLibraryId] = useState('');
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [dueDates, setDueDates] = useState<Record<string, Date | undefined>>({});
  const [dueDateEnabled, setDueDateEnabled] = useState<Record<string, boolean>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [planBook, setPlanBook] = useState<PlanBookPayload | null>(null);
  const [showPlanSheet, setShowPlanSheet] = useState(false);

  useEffect(() => {
    if (user) {
      loadWishlist();
      loadLoanRequests();
      supabase.from('libraries').select('id').eq('user_id', user.id).limit(1).single().then(({ data }) => {
        if (data) setLibraryId(data.id);
      });
    }
  }, [user]);

  const loadWishlist = async () => {
    const { data } = await supabase
      .from('books')
      .select('id, title, author, isbn, cover_url')
      .eq('user_id', user!.id)
      .eq('is_wishlist', true)
      .order('created_at', { ascending: false });
    setItems((data as WishlistItem[]) || []);
  };

  const loadLoanRequests = async () => {
    const { data } = await supabase
      .from('loan_requests' as any)
      .select('*')
      .eq('owner_user_id', user!.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      // Fetch requester usernames
      const requesterIds = [...new Set((data as any[]).map((r: any) => r.requester_user_id))];
      const { data: profiles } = await supabase
        .from('public_profiles' as any)
        .select('user_id, username, avatar_url')
        .in('user_id', requesterIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      setLoanRequests(
        (data as any[]).map((r: any) => ({
          ...r,
          requester_username: profileMap.get(r.requester_user_id)?.username || null,
          requester_avatar_url: profileMap.get(r.requester_user_id)?.avatar_url || null,
        }))
      );
    } else {
      setLoanRequests([]);
    }
  };

  const addByISBN = async () => {
    if (!isbn.trim() || !libraryId) return;
    setLoading(true);
    const bookData = await fetchBookByISBN(isbn.trim());
    if (bookData) {
      await supabase.from('books').insert({
        library_id: libraryId,
        user_id: user!.id,
        title: bookData.title,
        author: bookData.author || null,
        isbn: bookData.isbn,
        cover_url: bookData.cover_url || null,
        is_wishlist: true,
      });
    } else {
      await supabase.from('books').insert({
        library_id: libraryId,
        user_id: user!.id,
        title: isbn.trim(),
        is_wishlist: true,
      });
    }
    setIsbn('');
    loadWishlist();
    setLoading(false);
  };

  const addManual = async () => {
    if (!manualText.trim() || !libraryId) return;
    setLoading(true);
    const parts = manualText.split(',').map(s => s.trim());
    await supabase.from('books').insert({
      library_id: libraryId,
      user_id: user!.id,
      title: parts[0] || manualText.trim(),
      author: parts[1] || null,
      isbn: parts[2] || null,
      is_wishlist: true,
    });
    setManualText('');
    loadWishlist();
    setLoading(false);
  };

  const removeItem = async (id: string) => {
    await supabase.from('books').delete().eq('id', id);
    loadWishlist();
  };

  const openAddToPlan = (item: WishlistItem) => {
    setPlanBook({ book_id: item.id, title: item.title, author: item.author, isbn: item.isbn, cover_url: item.cover_url });
    setShowPlanSheet(true);
  };

  const goCreatePlan = () => {
    window.dispatchEvent(new Event('folium-open-planos'));
  };

  const shareWishlist = () => {
    const text = items.map(i => `${i.title}${i.author ? ` — ${i.author}` : ''}${i.isbn ? ` (${i.isbn})` : ''}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-wishlist.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const acceptLoanRequest = async (request: LoanRequest) => {
    setProcessingId(request.id);
    const hasDueDate = dueDateEnabled[request.id] && dueDates[request.id];
    const dueDate = hasDueDate ? dueDates[request.id]!.toISOString() : null;

    // Create a loan record
    await supabase.from('loans').insert({
      book_id: request.book_id,
      lender_id: user!.id,
      borrower_user_id: request.requester_user_id,
      borrower_name: request.requester_username || 'User',
      loan_due_date: dueDate,
      loan_notifications_enabled: !!dueDate,
    });

    // Update the request status
    await supabase.from('loan_requests' as any).update({ status: 'accepted', due_date: dueDate }).eq('id', request.id);

    showToast(t('wishlist.loanAccepted', { title: request.book_title }));
    loadLoanRequests();
    setProcessingId(null);
  };

  const declineRequest = async (requestId: string) => {
    await supabase.from('loan_requests' as any).update({ status: 'declined' }).eq('id', requestId);
    loadLoanRequests();
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center justify-end mb-4 gap-2">
        {items.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button data-tutorial="wishlist-share" onClick={shareWishlist} aria-label={t('wishlist.shareWishlist')} className="text-muted-foreground hover:text-foreground transition-colors">
                <Share2 size={18} aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{t('wishlist.shareWishlist')}</TooltipContent>
          </Tooltip>
        )}
        <HelpButton screen="wishlist" />
      </div>

      <div data-tutorial="wishlist-add" className="space-y-3 mb-6">
        <div className="flex gap-2">
          <Input
            aria-label={t('wishlist.scanOrEnterIsbn')}
            placeholder={t('wishlist.scanOrEnterIsbn')}
            value={isbn}
            onChange={e => setIsbn(e.target.value)}
            className="bg-background border-border text-sm"
            onKeyDown={e => e.key === 'Enter' && addByISBN()}
          />
          <Button onClick={addByISBN} disabled={loading} variant="outline" size="sm">
            {loading ? <Loader2 size={14} className="animate-spin" aria-label={t('app.loading')} /> : t('wishlist.add')}
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            aria-label={t('wishlist.bookNameAuthorIsbn')}
            placeholder={t('wishlist.bookNameAuthorIsbn')}
            value={manualText}
            onChange={e => setManualText(e.target.value)}
            className="bg-background border-border text-sm"
            onKeyDown={e => e.key === 'Enter' && addManual()}
          />
          <Button onClick={addManual} disabled={loading} variant="outline" size="sm">{t('wishlist.add')}</Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={32} className="mx-auto text-muted-foreground mb-3" strokeWidth={1} />
          <p className="text-muted-foreground text-sm">{t('wishlist.emptyTitle')}</p>
          <p className="text-muted-foreground text-xs mt-1">{t('wishlist.emptySubtitle')}</p>
        </div>
      ) : (
        <div className="space-y-0">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 py-3 border-b border-border">
              {item.cover_url ? (
                <img src={item.cover_url} alt="" aria-hidden="true" className="w-8 h-12 object-cover rounded-sm" />
              ) : (
                <div className="w-8 h-12 bg-secondary rounded-sm" aria-hidden="true" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{item.title}</p>
                {item.author && <p className="text-xs text-muted-foreground truncate">{item.author}</p>}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button aria-label={`Opções: ${item.title}`} className="text-muted-foreground hover:text-foreground transition-colors">
                    <MoreVertical size={15} aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openAddToPlan(item)}>Adicionar ao plano</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => removeItem(item.id)}>{t('wishlist.removeItem')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {/* Loan Requests Section */}
      {loanRequests.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <HandCoins size={18} className="text-accent" />
            <h3 className="font-serif text-lg text-foreground">{t('wishlist.loanRequestsTitle')}</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">{t('wishlist.loanRequestsSubtitle')}</p>

          <div className="space-y-4">
            {loanRequests.map(request => (
              <div key={request.id} className="border border-border rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-3">
                  {request.book_cover_url ? (
                    <img src={request.book_cover_url} alt="" className="w-10 h-14 object-cover rounded-sm" />
                  ) : (
                    <div className="w-10 h-14 bg-secondary rounded-sm" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{request.book_title}</p>
                    {request.book_author && <p className="text-xs text-muted-foreground truncate">{request.book_author}</p>}
                    <p className="text-xs text-accent mt-0.5">
                      <img src={resolveAvatarSrc(request.requester_avatar_url)} alt="" className="mr-1 inline h-4 w-4 rounded-full border border-border object-cover align-middle" />
                      {t('wishlist.requestedBy', { username: request.requester_username ? `@${request.requester_username}` : t('wishlist.aUser') })}
                    </p>
                  </div>
                </div>

                {/* Due date toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">{t('wishlist.setDueDate')}</label>
                  <Switch
                    checked={dueDateEnabled[request.id] || false}
                    onCheckedChange={(checked) => setDueDateEnabled(prev => ({ ...prev, [request.id]: checked }))}
                  />
                </div>

                {dueDateEnabled[request.id] && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left text-xs",
                          !dueDates[request.id] && "text-muted-foreground"
                        )}
                      >
                        <CalendarDays size={14} className="mr-2" />
                        {dueDates[request.id]
                          ? format(dueDates[request.id]!, 'PPP')
                          : t('wishlist.selectDueDate')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDates[request.id]}
                        onSelect={(date) => setDueDates(prev => ({ ...prev, [request.id]: date || undefined }))}
                        disabled={(date) => date < new Date()}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => declineRequest(request.id)}
                    disabled={processingId === request.id}
                  >
                    {t('wishlist.decline')}
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs gap-1.5"
                    onClick={() => acceptLoanRequest(request)}
                    disabled={processingId === request.id || (dueDateEnabled[request.id] && !dueDates[request.id])}
                  >
                    <HandCoins size={12} />
                    {t('wishlist.acceptLoan')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <AddToPlanSheet
        book={planBook}
        open={showPlanSheet}
        onOpenChange={setShowPlanSheet}
        onNoActivePlan={() => toast('Não tens um plano activo.', { action: { label: 'Criar plano →', onClick: goCreatePlan } })}
      />
    </div>
  );
}
