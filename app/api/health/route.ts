import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });

    return NextResponse.json({
      ok: true,
      message: "MongoDB connected",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: "MongoDB connection failed" },
      { status: 500 }
    );
  }
}