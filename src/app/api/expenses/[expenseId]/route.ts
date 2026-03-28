import { NextResponse } from "next/server";
import { getExpense, updateExpense, deleteExpense } from "@/lib/dibotrip/db/expenses";

interface Params {
  params: Promise<{ expenseId: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { expenseId } = await params;
    const expense = await getExpense(expenseId);
    if (!expense) return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    return NextResponse.json({ data: expense });
  } catch (err) {
    console.error("GET /api/expenses/[expenseId]", err);
    return NextResponse.json({ error: "Failed to fetch expense" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { expenseId } = await params;
    const body = await request.json();
    const expense = await updateExpense(expenseId, body);
    if (!expense) return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    return NextResponse.json({ data: expense });
  } catch (err) {
    console.error("PUT /api/expenses/[expenseId]", err);
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { expenseId } = await params;
    const existing = await getExpense(expenseId);
    if (!existing) return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    await deleteExpense(expenseId);
    return NextResponse.json({ data: { id: expenseId } });
  } catch (err) {
    console.error("DELETE /api/expenses/[expenseId]", err);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
