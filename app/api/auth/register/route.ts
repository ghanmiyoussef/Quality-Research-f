import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
  console.log("REGISTER BODY RECEIVED:", body);

  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    console.log("REGISTER VALIDATION ERROR:", parsed.error.flatten());

    return NextResponse.json(
      {
        ok: false,
        message: "Invalid data",
        errors: parsed.error.flatten(),
        received: body,
      },
      { status: 400 }
    );
  }
    

    const { fullName, email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    const db = await getDb();
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        { ok: false, message: "Email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const now = new Date();

    const result = await usersCollection.insertOne({
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "USER",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        ok: true,
        message: "User created successfully",
        user: {
          _id: result.insertedId,
          fullName: fullName.trim(),
          email: normalizedEmail,
          role: "USER",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}