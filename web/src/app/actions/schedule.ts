"use server";

import { revalidatePath } from "next/cache";
import {
  type ActionResult,
  toActionError,
  updateProviderSchedule,
} from "@/lib/backend-api";
import type {
  ProviderScheduleResponse,
  UpdateScheduleRequest,
} from "@/types/api";

export async function updateScheduleAction(
  payload: UpdateScheduleRequest,
): Promise<ActionResult<ProviderScheduleResponse>> {
  try {
    const data = await updateProviderSchedule(payload);
    revalidatePath("/provider/schedule");
    revalidatePath("/provider/dashboard");
    return { ok: true, data };
  } catch (err) {
    return toActionError(err);
  }
}
