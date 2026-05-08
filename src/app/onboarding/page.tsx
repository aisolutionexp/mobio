import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  resolveShell,
  SHELL_HOME,
  type AppMetadata,
} from "@/lib/auth/permissions";
import { getOnboardingStep } from "@/lib/actions/onboarding";
import { WelcomeStep } from "@/components/domain/onboarding/welcome-step";
import { ProfileStep } from "@/components/domain/onboarding/profile-step";
import { PreferencesStep } from "@/components/domain/onboarding/preferences-step";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const step = await getOnboardingStep();
  const metadata = user.app_metadata as AppMetadata | undefined;

  if (step === "completed") {
    const shell = resolveShell(metadata);
    redirect(shell ? SHELL_HOME[shell] : "/entrar");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg py-12">
        <div className="mb-8 text-center">
          <span className="font-heading text-2xl font-bold tracking-wider">
            MOBIO
          </span>
        </div>

        {step === "pending" && <WelcomeStep />}
        {step === "profile" && <ProfileStep />}
        {step === "preferences" && <PreferencesStep />}

        <div className="mt-8 flex justify-center gap-2">
          {["pending", "profile", "preferences"].map((s, i) => (
            <div
              key={s}
              className={`h-1.5 w-8 rounded-full ${
                i <= ["pending", "profile", "preferences"].indexOf(step)
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
