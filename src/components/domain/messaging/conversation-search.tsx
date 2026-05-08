"use client";

import { useCallback, useState, useTransition } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { searchMessages } from "@/lib/actions/conversations";

interface SearchResult {
  id: string;
  body: string;
  conversation_id: string;
  created_at: string;
  sender_user_id: string;
}

interface ConversationSearchProps {
  conversationId?: string;
  onResultClick?: (messageId: string) => void;
}

export function ConversationSearch({
  conversationId,
  onResultClick,
}: ConversationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearch = useCallback(() => {
    if (query.length < 2 || !conversationId) return;

    startTransition(async () => {
      const result = await searchMessages({
        query,
        conversation_id: conversationId,
      });
      if (result.success) {
        setResults(result.data);
      } else {
        setResults([]);
      }
      setSearched(true);
    });
  }, [query, conversationId]);

  function formatTime(iso: string) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  }

  return (
    <div className="space-y-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="relative"
      >
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar mensagens..."
          className="pl-9"
        />
      </form>

      {isPending && (
        <p className="text-muted-foreground px-1 text-sm">Buscando...</p>
      )}

      {searched && !isPending && results.length === 0 && (
        <p className="text-muted-foreground px-1 text-sm">
          Nenhuma mensagem encontrada
        </p>
      )}

      {results.length > 0 && (
        <div className="max-h-60 space-y-1 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onResultClick?.(r.id)}
              className="hover:bg-muted w-full rounded-md px-3 py-2 text-left text-sm transition-colors"
            >
              <p className="line-clamp-2">{r.body}</p>
              <p className="text-muted-foreground text-xs">
                {formatTime(r.created_at)}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
