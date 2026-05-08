import Link from "next/link";
import { ChevronRight, UserPlus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import type { AppMetadata } from "@/lib/auth/permissions";
import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Rule } from "@/components/editorial/rule";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { InviteMemberDrawer } from "@/components/domain/team/invite-member-drawer";
import { MemberActions } from "@/components/domain/team/member-actions";
import { InviteActions } from "@/components/domain/team/invite-actions";

const ROLE_LABELS: Record<string, string> = {
  atelier_owner: "Proprietário",
  atelier_member: "Membro",
  admin: "Admin",
};

export default async function EquipePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const metadata = user?.app_metadata as AppMetadata | undefined;
  const tenantId = metadata?.active_tenant_id;
  const callerRole = metadata?.active_role;
  const isOwner = callerRole === "atelier_owner" || callerRole === "admin";

  const { data: members } = await supabase
    .from("team_members")
    .select(
      "id, user_id, role, is_active, joined_at, profiles(full_name, avatar_path)",
    )
    .eq("factory_id", tenantId!)
    .order("joined_at", { ascending: true });

  const { data: invites } = await supabase
    .from("invites")
    .select("id, email, role, status, expires_at, created_at")
    .eq("factory_id", tenantId!)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <nav className="text-muted-foreground flex items-center gap-2 text-sm">
        <Link
          href="/atelier/conta"
          className="hover:text-foreground transition-colors"
        >
          Configurações
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground font-medium">Equipe</span>
      </nav>

      <Masthead
        title="Equipe"
        description="Gerencie os membros da sua fábrica"
        actions={
          isOwner ? (
            <InviteMemberDrawer>
              <Button variant="accent" leftIcon={<UserPlus />}>
                Convidar membro
              </Button>
            </InviteMemberDrawer>
          ) : undefined
        }
      />

      <div className="space-y-6">
        <div>
          <Eyebrow as="p" className="mb-3">
            Membros ativos
          </Eyebrow>
          <Plate>
            {members && members.length > 0 ? (
              <div className="divide-border divide-y">
                {members.map((member) => {
                  const profile = member.profiles as unknown as {
                    full_name: string;
                    avatar_path: string | null;
                  } | null;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <Avatar
                        alt={profile?.full_name ?? "Membro"}
                        fallback={(profile?.full_name ?? "M")
                          .charAt(0)
                          .toUpperCase()}
                        src={profile?.avatar_path ?? undefined}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {profile?.full_name ?? "Membro"}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {ROLE_LABELS[member.role] ?? member.role}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={member.is_active ? "success" : "outline"}
                          size="sm"
                        >
                          {member.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                        {isOwner && member.user_id !== user?.id && (
                          <MemberActions
                            memberId={member.id}
                            currentRole={member.role}
                            isActive={member.is_active}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground py-4 text-center text-sm">
                Nenhum membro encontrado
              </p>
            )}
          </Plate>
        </div>

        {invites && invites.length > 0 && (
          <div>
            <Eyebrow as="p" className="mb-3">
              Convites pendentes
            </Eyebrow>
            <Plate>
              <div className="divide-border divide-y">
                {invites.map((invite) => {
                  const expiresAt = new Date(invite.expires_at);
                  const isExpired = expiresAt < new Date();

                  return (
                    <div
                      key={invite.id}
                      className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full">
                        <span className="text-muted-foreground text-sm font-medium">
                          {invite.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {invite.email}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {ROLE_LABELS[invite.role] ?? invite.role}
                          {" · "}
                          {isExpired
                            ? "Expirado"
                            : `Expira em ${expiresAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isExpired ? "warning" : "info"}
                          size="sm"
                        >
                          {isExpired ? "Expirado" : "Pendente"}
                        </Badge>
                        {isOwner && (
                          <InviteActions
                            inviteId={invite.id}
                            isExpired={isExpired}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Plate>
          </div>
        )}
      </div>
    </div>
  );
}
