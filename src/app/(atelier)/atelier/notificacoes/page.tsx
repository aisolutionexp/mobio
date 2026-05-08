import { createClient } from "@/lib/supabase/server";
import { Masthead } from "@/components/editorial/masthead";
import { NotificationList } from "@/components/domain/notifications/notification-list";
import { listMyNotifications } from "@/lib/actions/notifications";

export default async function AtelierNotificacoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const notifications = await listMyNotifications();

  return (
    <div className="space-y-6">
      <Masthead title="Notificações" />
      <NotificationList initialNotifications={notifications} userId={user.id} />
    </div>
  );
}
