"use server";

import { revalidatePath } from "next/cache";
import {
  type ActionResult,
  cancelAppointment,
  completeAppointment,
  createAppointment,
  startAppointment,
  toActionError,
} from "@/lib/backend-api";
import type {
  AppointmentResponse,
  CreateAppointmentRequest,
} from "@/types/api";

export async function bookAppointmentAction(
  payload: CreateAppointmentRequest,
): Promise<ActionResult<AppointmentResponse>> {
  try {
    const data = await createAppointment(payload);
    revalidatePath("/my-bookings");
    revalidatePath(`/providers/${payload.providerId}`);
    return { ok: true, data };
  } catch (err) {
    return toActionError(err);
  }
}

export async function startAppointmentAction(
  appointmentId: string,
): Promise<ActionResult<AppointmentResponse>> {
  try {
    const data = await startAppointment(appointmentId);
    revalidatePath("/provider/dashboard");
    return { ok: true, data };
  } catch (err) {
    return toActionError(err);
  }
}

export async function completeAppointmentAction(
  appointmentId: string,
): Promise<ActionResult<AppointmentResponse>> {
  try {
    const data = await completeAppointment(appointmentId);
    revalidatePath("/provider/dashboard");
    return { ok: true, data };
  } catch (err) {
    return toActionError(err);
  }
}

export async function cancelAppointmentAction(
  appointmentId: string,
): Promise<ActionResult<AppointmentResponse>> {
  try {
    const data = await cancelAppointment(appointmentId);
    revalidatePath("/provider/dashboard");
    revalidatePath("/my-bookings");
    return { ok: true, data };
  } catch (err) {
    return toActionError(err);
  }
}
