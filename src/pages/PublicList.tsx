import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { parseGenres } from "@/components/GenreMultiSelect";
import { tGenre, tStatus } from "@/lib/displayMappings";
import { BookOpen } from "lucide-react";

interface Library {
  id: string;
  name: string;
  user_id: string;
  is_public: boolean;
}
interface Book {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  genre: string | null;
  reading_status: string;
}

export default function PublicList() {
  const { t } = useTranslation();
  const { libraryId } = useParams<{ libraryId: string }>();
  const [library, setLibrary] = useState<Library | null>(null);
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
    if (!libraryId) return;
    (async () => {
      const { data: lib } = await supabase
        .from("libraries")
        .select("id, name, user_id, is_public")
        .eq("id", libraryId)
        .maybeSingle();

      if (!lib || !lib.is_public) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setLibrary(lib as Library);

      const [{ data: prof }, { data: bs }] = await Promise.all([
        supabase
          .from("public_profiles")
          .select("username")
          .eq("user_id", lib.user_id)
          .maybeSingle(),
        supabase
          .from("books")
          .select("id, title, author, cover_url, genre, reading_status")
          .eq("library_id", lib.id)
          .eq("is_wishlist", false)
          .order("created_at", { ascending: false }),
      ]);

      setOwnerUsername(prof?.username || null);
      setBooks((bs as Book[]) || []);
      setLoading(false);
    })();
  }, [libraryId]);

  useEffect(() => {
    if (library) {
      document.title = `${library.name} · Codex`;
    }
  }, [library]);

  if (loading) {
    return (
      <div style={{ background: "#FAFAF8" }} className="min-h-screen flex items-center justify-center">
        <p style={{ fontFamily: "'Josefin Sans', sans-serif" }} className="text-sm text-neutral-500">
          A carregar…
        </p>
      </div>
    );
  }

  if (notFound || !library) {
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
        {/* Header */}
        <header className="mb-10 pb-6 border-b border-neutral-200">
          <h1
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-4xl md:text-5xl font-normal mb-2 text-neutral-900"
          >
            {library.name}
          </h1>
          <div
            style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            className="flex items-center gap-2 text-sm text-neutral-500"
          >
            {ownerUsername && <span>@{ownerUsername}</span>}
            {ownerUsername && <span>·</span>}
            <span>{books.length} {books.length === 1 ? "livro" : "livros"}</span>
          </div>
        </header>

        {/* Book list */}
        {books.length === 0 ? (
          <p
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-xl italic text-neutral-400 text-center py-16"
          >
            Esta estante está vazia.
          </p>
        ) : (
          <ul className="space-y-6">
            {books.map((b) => {
              const genres = parseGenres(b.genre);
              return (
                <li key={b.id} className="flex gap-4 pb-6 border-b border-neutral-100 last:border-b-0">
                  <div className="flex-shrink-0 w-16 h-24 bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center">
                    {b.cover_url ? (
                      <img src={b.cover_url} alt={b.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <BookOpen size={20} className="text-neutral-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      className="text-lg leading-snug text-neutral-900 mb-0.5"
                    >
                      {b.title}
                    </h2>
                    <p
                      style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                      className="text-xs text-neutral-500 mb-2"
                    >
                      {b.author || "Autor desconhecido"}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                        className="text-[10px] uppercase tracking-wider px-2 py-0.5 border border-neutral-300 text-neutral-600 rounded-full"
                      >
                        {tStatus(b.reading_status, t)}
                      </span>
                      {genres.slice(0, 3).map((g) => (
                        <span
                          key={g}
                          style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                          className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full"
                        >
                          {tGenre(g, t)}
                        </span>
                      ))}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-neutral-200 text-center">
          <Link
            to="/"
            style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            Criado com Codex
          </Link>
        </footer>
      </div>
    </div>
  );
}
