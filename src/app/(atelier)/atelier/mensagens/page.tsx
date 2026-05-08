import { redirect } from "next/navigation";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import { Masthead } from "@/components/editorial/masthead";
import { listMyConversations } from "@/lib/actions/conversations";
import { MessagingLayout } from "@/components/domain/messaging/messaging-layout";
import { ConversationListSkeleton } from "@/components/domain/messaging/conversation-list";

export const metadata = {
  title: "Mensagens — Atelier | MOBIO",
};

async function MessagingContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const conversations = await listMyConversations();

  return (
    <MessagingLayout
      conversations={conversations}
      currentUserId={user.id}
      shellPrefix="atelier"
    />
  );
}

export default function AtelierMensagensPage() {
  return (
    <div className="space-y-6">
      <Masthead title="Mensagens" />
      <Suspense fallback={<ConversationListSkeleton />}>
        <MessagingContent />
      </Suspense>
    </div>
  );
}
