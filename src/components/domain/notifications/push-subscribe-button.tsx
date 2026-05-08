"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  subscribeToPush,
  unsubscribeFromPush,
  listMyPushSubscriptions,
} from "@/lib/actions/push-subscriptions";
import { toast } from "sonner";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
}

export function PushSubscribeButton() {
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >(() => {
    if (typeof window === "undefined") return "default";
    if (!("Notification" in window) || !("serviceWorker" in navigator))
      return "unsupported";
    return Notification.permission;
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (permission !== "granted") return;

    listMyPushSubscriptions()
      .then((subs) => {
        const activeSub = subs.find((s) => s.is_active);
        if (activeSub) {
          setIsSubscribed(true);
          setActiveSubId(activeSub.id);
        }
      })
      .catch(() => {});
  }, [permission]);

  const handleSubscribe = useCallback(async () => {
    if (!vapidKey) {
      toast.error("Notificações push não configuradas");
      return;
    }

    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        toast.error("Permissão de notificação negada");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
          .buffer as ArrayBuffer,
      });

      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        toast.error("Erro ao obter dados da assinatura");
        return;
      }

      const result = await subscribeToPush({
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
        user_agent: navigator.userAgent,
      });

      if (result.success) {
        setIsSubscribed(true);
        setActiveSubId(result.data.id);
        toast.success("Notificações ativadas");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Erro ao ativar notificações");
    } finally {
      setLoading(false);
    }
  }, [vapidKey]);

  const handleUnsubscribe = useCallback(async () => {
    if (!activeSubId) return;

    setLoading(true);
    try {
      const result = await unsubscribeFromPush(activeSubId);
      if (result.success) {
        setIsSubscribed(false);
        setActiveSubId(null);
        toast.success("Notificações desativadas");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Erro ao desativar notificações");
    } finally {
      setLoading(false);
    }
  }, [activeSubId]);

  if (permission === "unsupported") return null;

  if (permission === "denied") {
    return (
      <Button variant="outline" disabled className="gap-2">
        <BellOff className="size-4" />
        Notificações bloqueadas
      </Button>
    );
  }

  if (isSubscribed) {
    return (
      <Button
        variant="outline"
        onClick={handleUnsubscribe}
        disabled={loading}
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <BellOff className="size-4" />
        )}
        Desativar notificações
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleSubscribe}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Bell className="size-4" />
      )}
      Ativar notificações
    </Button>
  );
}
