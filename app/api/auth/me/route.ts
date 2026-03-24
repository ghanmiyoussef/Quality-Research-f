import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { ok: false, message: "Non authentifié" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    const db = await getDb();
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(payload.sub) },
      {
        projection: {
          passwordHash: 0,
        },
      }
    );

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      user,
    });
  } catch (error) {
    console.error("ME ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Session invalide ou expirée" },
      { status: 401 }
    );
  }
}