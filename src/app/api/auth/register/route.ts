import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";

const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { username, email, password } = parsed.data;

  // Check for existing user
  const [existingEmail, existingUsername] = await Promise.all([
    db.user.findUnique({ where: { email } }),
    db.user.findUnique({ where: { username } }),
  ]);

  if (existingEmail) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  if (existingUsername) {
    return NextResponse.json(
      { error: "Username is already taken" },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      name: username,
    },
    select: { id: true, username: true, email: true },
  });

  return NextResponse.json(user, { status: 201 });
}
