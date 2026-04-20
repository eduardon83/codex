import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export interface RequestableBook {
  availability_id: string;
  book_id: string;
  owner_user_id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  isbn: string | null;
}

interface Props {
  book: RequestableBook | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent?: () => void;
}

const MAX_LEN = 140;

export default function LoanRequestModal({ book, open, onOpenChange, onSent }: Props) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (open) setMessage(''); }, [open]);

  const send = async () => {
    if (!user || !book) return;
    if (book.owner_user_id === user.id) {
      toast.error('Não podes pedir o teu próprio livro.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('loan_requests' as any).insert({
      requester_user_id: user.id,
      owner_user_id: book.owner_user_id,
      book_id: book.book_id,
      book_title: book.title,
      book_author: book.author,
      book_cover_url: book.cover_url,
      book_isbn: book.isbn,
      status: 'pending',
      message: message.trim() || null,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success('Pedido enviado.');
    onOpenChange(false);
    onSent?.();
  };

  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-['Cormorant_Garamond'] text-2xl">Pedir emprestado</DialogTitle>
          <DialogDescription>O dono recebe um pedido. Combinam a entrega na escola.</DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 p-3 border border-border rounded-md bg-card">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} className="w-14 h-20 object-cover rounded" />
          ) : (
            <div className="w-14 h-20 bg-secondary rounded flex items-center justify-center">
              <BookOpen size={20} className="text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground line-clamp-2">{book.title}</p>
            {book.author && <p className="text-xs text-muted-foreground">{book.author}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Mensagem (opcional)</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX_LEN))}
            placeholder="Olá! Posso pedir-te este livro emprestado?"
            rows={3}
            className="resize-none"
          />
          <p className="text-[10px] text-muted-foreground text-right">{message.length}/{MAX_LEN}</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={send} disabled={submitting}>
            {submitting ? 'A enviar…' : 'Enviar pedido'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
