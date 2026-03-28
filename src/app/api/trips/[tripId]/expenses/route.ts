import { NextResponse } from "next/server";
import { getExpensesForTrip, createExpense } from "@/lib/dibotrip/db/expenses";

interface Params {
  params: Promise<{ tripId: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { tripId } = await params;
    const expenses = await getExpensesForTrip(tripId);
    return NextResponse.json({ data: expenses });
  } catch (err) {
    console.error("GET /api/trips/[tripId]/expenses", err);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { tripId } = await params;
    const body = await request.json();
    if (!body.title || body.cost === undefined || !body.category) {
      return NextResponse.json(
        { error: "title, cost, and category are required" },
        { status: 400 }
      );
    }
    const expense = await createExpense({ ...body, trip_id: tripId });
    return NextResponse.json({ data: expense }, { status: 201 });
  } catch (err) {
    console.error("POST /api/trips/[tripId]/expenses", err);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
