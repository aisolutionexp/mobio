import { createClient } from "@/lib/supabase/server";
import { AcceptFactoryInviteForm } from "@/components/domain/factory/accept-factory-invite-form";

export default async function AcceptFactoryInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: invitation } = await supabase
    .from("factory_invitations")
    .select(
      "id, retailer_email, retailer_name, status, expires_at, terms_snapshot, factories(name), profiles!factory_invitations_invited_by_fkey(full_name)",
    )
    .eq("token", token)
    .single();

  const isExpired = invitation
    ? new Date(invitation.expires_at) < new Date()
    : false;

  if (!invitation || invitation.status !== "pending" || isExpired) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-4 px-4 text-center">
          <h1 className="font-heading text-2xl font-bold">
            Convite inválido ou expirado
          </h1>
          <p className="text-muted-foreground">
            Este convite não é válido. Solicite um novo convite ao fabricante.
          </p>
        </div>
      </div>
    );
  }

  const factoryName = (
    invitation.factories as unknown as { name: string } | null
  )?.name;

  const invitedByName = (
    invitation.profiles as unknown as { full_name: string } | null
  )?.full_name;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 px-4">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold">
            Autorização comercial
          </h1>
          <p className="text-muted-foreground mt-2">
            {factoryName ? (
              <>
                <strong>{factoryName}</strong> convidou você para ser um lojista
                autorizado.
              </>
            ) : (
              "Você foi convidado para ser um lojista autorizado."
            )}
          </p>
          {invitedByName && (
            <p className="text-muted-foreground mt-1 text-sm">
              Convidado por {invitedByName}
            </p>
          )}
        </div>

        {invitation.terms_snapshot && (
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-heading mb-2 text-sm font-semibold">
              Política comercial
            </h3>
            <pre className="text-muted-foreground max-h-40 overflow-y-auto text-xs whitespace-pre-wrap">
              {JSON.stringify(invitation.terms_snapshot, null, 2)}
            </pre>
          </div>
        )}

        <AcceptFactoryInviteForm
          token={token}
          retailerEmail={invitation.retailer_email}
        />
      </div>
    </div>
  );
}
