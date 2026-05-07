import { createClient } from "@/lib/supabase/server";
import { AcceptInviteForm } from "@/components/domain/team/accept-invite-form";

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: invite } = await supabase
    .from("invites")
    .select("id, email, role, status, expires_at, factories(name)")
    .eq("token", token)
    .single();

  const isExpired = invite ? new Date(invite.expires_at) < new Date() : false;

  if (!invite || invite.status !== "pending" || isExpired) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-4 px-4 text-center">
          <h1 className="font-heading text-2xl font-bold">
            Convite inválido ou expirado
          </h1>
          <p className="text-muted-foreground">
            Este convite não é válido. Solicite um novo convite ao proprietário.
          </p>
        </div>
      </div>
    );
  }

  const factoryName = (invite.factories as unknown as { name: string } | null)
    ?.name;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 px-4">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold">Aceitar convite</h1>
          <p className="text-muted-foreground mt-2">
            Você foi convidado para fazer parte
            {factoryName ? ` de ${factoryName}` : " de uma fábrica"} no MOBIO.
          </p>
        </div>

        <AcceptInviteForm token={token} email={invite.email} />
      </div>
    </div>
  );
}
