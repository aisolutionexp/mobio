"use server";

import { sendPushToUser } from "./push";

export async function notifyPushFireAndForget(
  userId: string,
  payload: { title: string; body: string; url?: string },
): Promise<void> {
  try {
    await sendPushToUser(userId, payload);
  } catch {
    // fire-and-forget: push failure should never block the main action
  }
}
