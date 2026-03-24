import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("token");

    return NextResponse.json({
      ok: true,
      message: "Déconnexion réussie",
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Erreur lors de la déconnexion" },
      { status: 500 }
    );
  }
}