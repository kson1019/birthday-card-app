import { NextResponse } from "next/server";
import { getBooking, updateBooking, deleteBooking } from "@/lib/dibotrip/db/bookings";

interface Params {
  params: Promise<{ bookingId: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { bookingId } = await params;
    const booking = await getBooking(bookingId);
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    return NextResponse.json({ data: booking });
  } catch (err) {
    console.error("GET /api/bookings/[bookingId]", err);
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { bookingId } = await params;
    const body = await request.json();
    const booking = await updateBooking(bookingId, body);
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    return NextResponse.json({ data: booking });
  } catch (err) {
    console.error("PUT /api/bookings/[bookingId]", err);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { bookingId } = await params;
    const existing = await getBooking(bookingId);
    if (!existing) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    await deleteBooking(bookingId);
    return NextResponse.json({ data: { id: bookingId } });
  } catch (err) {
    console.error("DELETE /api/bookings/[bookingId]", err);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
