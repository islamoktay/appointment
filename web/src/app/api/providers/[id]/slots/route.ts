import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ApiError, getAvailableSlots } from "@/lib/backend-api";
import { isValidIsoDate } from "@/lib/date-utils";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const date = request.nextUrl.searchParams.get("date") ?? undefined;

  if (!isValidIsoDate(date)) {
    return NextResponse.json(
      {
        status: 400,
        error: "BAD_REQUEST",
        message: "A valid date parameter (YYYY-MM-DD) is required.",
        path: `/api/providers/${id}/slots`,
        fieldErrors: { date: "Expected YYYY-MM-DD format" },
      },
      { status: 400 },
    );
  }

  try {
    const data = await getAvailableSlots(id, date);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        {
          status: err.status,
          error: err.error,
          message: err.message,
          path: err.path,
          fieldErrors: err.fieldErrors,
        },
        { status: err.status },
      );
    }

    return NextResponse.json(
      {
        status: 500,
        error: "INTERNAL_ERROR",
        message: "Failed to load available time slots.",
        path: `/api/providers/${id}/slots`,
        fieldErrors: {},
      },
      { status: 500 },
    );
  }
}
