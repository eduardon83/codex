import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen } from "lucide-react";

interface ReadingList {
  id: string;
  name: string;
  user_id: string;
  is_public: boolean;
  creator_name: string | null;
  created_at: string;
}
interface Book {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  external_title: string | null;
  external_author: string | null;
  external_cover_url: string | null;
  isbn: string | null;
}

export default function PublicReadingList() {
  const { listId } = useParams<{ listId: string }>();
  const [list, setList] = useState<ReadingList | null>(null);
  const [ownerUsername, setOwnerUsername] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty("background-color", "#FAFAF8");
    document.body.style.backgroundColor = "#FAFAF8";
    return () => {
      document.documentElement.style.removeProperty("background-color");
      document.body.style.backgroundColor = "";
    };
  }, []);

  useEffect(() => {
    if (!listId) return;
    (async () => {
      const { data: rl } = await supabase
        .from("reading_lists")
        .select("id, name, user_id, is_public, creator_name, created_at")
        .eq("id", listId)
        .maybeSingle();

      if (!rl || !(rl as any).is_public) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setList(rl as ReadingList);

      const [{ data: prof }, { data: bs }] = await Promise.all([
        supabase
          .from("profiles")
          .select("username")
          .eq("user_id", (rl as any).user_id)
          .maybeSingle(),
        supabase
          .from("reading_list_books")
          .select("id, title, author, cover_url, external_title, external_author, external_cover_url, isbn")
          .eq("reading_list_id", (rl as any).id)
          .order("created_at"),
      ]);

      setOwnerUsername(prof?.username || null);
      setBooks((bs as Book[]) || []);
      setLoading(false);
    })();
  }, [listId]);

  useEffect(() => {
    if (list) document.title = `${list.name} · Codex`;
  }, [list]);

  if (loading) {
    return (
      <div style={{ background: "#FAFAF8" }} className="min-h-screen flex items-center justify-center">
        <p style={{ fontFamily: "'Josefin Sans', sans-serif" }} className="text-sm text-neutral-500">A carregar…</p>
      </div>
    );
  }

  if (notFound || !list) {
    return (
      <div style={{ background: "#FAFAF8" }} className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl text-neutral-900 mb-2">
          Lista não disponível
        </h1>
        <p style={{ fontFamily: "'Josefin Sans', sans-serif" }} className="text-sm text-neutral-500">
          Esta lista de leitura não existe ou é privada.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: "#FAFAF8", minHeight: "100vh" }} className="text-neutral-900">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <header className="mb-10 pb-6 border-b border-neutral-200">
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl md:text-5xl font-normal mb-2 text-neutral-900">
            {list.name}
          </h1>
          <div style={{ fontFamily: "'Josefin Sans', sans-serif" }} className="flex items-center gap-2 text-sm text-neutral-500">
            {(list.creator_name || ownerUsername) && <span>{list.creator_name || `@${ownerUsername}`}</span>}
            {(list.creator_name || ownerUsername) && <span>·</span>}
            <span>{books.length} {books.length === 1 ? "livro" : "livros"}</span>
          </div>
        </header>

        {books.length === 0 ? (
          <p style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-xl italic text-neutral-400 text-center py-16">
            Esta lista ainda não tem livros.
          </p>
        ) : (
          <ul className="space-y-6">
            {books.map((b) => {
              const title = b.title || b.external_title || "Sem título";
              const author = b.author || b.external_author || "";
              const cover = b.cover_url || b.external_cover_url;
              return (
                <li key={b.id} className="flex gap-4 pb-6 border-b border-neutral-100 last:border-b-0">
                  <div className="flex-shrink-0 w-16 h-24 bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center">
                    {cover ? (
                      <img src={cover} alt={title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <BookOpen size={20} className="text-neutral-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-lg leading-snug text-neutral-900 mb-0.5">
                      {title}
                    </h2>
                    <p style={{ fontFamily: "'Josefin Sans', sans-serif" }} className="text-xs text-neutral-500">
                      {author || "Autor desconhecido"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <footer className="mt-16 pt-6 border-t border-neutral-200 text-center">
          <Link to="/" style={{ fontFamily: "'Josefin Sans', sans-serif" }} className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors">
            Criado com Codex
          </Link>
        </footer>
      </div>
    </div>
  );
}
