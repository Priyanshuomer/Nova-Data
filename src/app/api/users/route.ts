import crypto from "crypto";
import prisma from "../../../../lib/prisma";

// Secret key for deterministic HMAC (keep safe!)
const SECRET_KEY = process.env.HMAC_SECRET || "REPLACE_WITH_SECURE_KEY";

// Generate 6-digit string from Aadhaar
function generate6Digit(aadhaar: string, attempt: number = 0): string {
  const data = attempt === 0 ? aadhaar : `${aadhaar}:${attempt}`;
  const hash = crypto.createHmac("sha256", SECRET_KEY).update(data).digest("hex");
  const num = parseInt(hash.slice(0, 12), 16) % 1_000_000;
  return num.toString().padStart(6, "0");
}

// Generate unique 6-digit code for Aadhaar
async function getUnique6DigitCode(aadhaar: string): Promise<string> {
  let attempt = 0;
  while (true) {
    const code = generate6Digit(aadhaar, attempt);
    const existing = await prisma.user.findUnique({ where: { id: `NOVAUSR-${code}` } });
    if (!existing) return code;
    attempt += 1;
  }
}

// GET /api/users
export async function GET() {
  try {
    const users = await prisma.user.findMany({ include: { doctors: true } });
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// POST /api/users
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, contactNumber, aadhaarNumber, aadhaarVerified, doctors } = body;

    // Generate unique ID
    const uniqueCode = await getUnique6DigitCode(aadhaarNumber || crypto.randomUUID());
    const id = `NOVAUSR-${uniqueCode}`;

    const user = await prisma.user.create({
      data: {
        id,
        name,
        email,
        contactNumber,
        aadhaarNumber,
        aadhaarVerified,
        doctors: {
          connect: Array.isArray(doctors)
            ? doctors.map((doctorId: string) => ({ id: doctorId }))
            : [],
        },
      },
      include: { doctors: true },
    });

    return new Response(JSON.stringify(user), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
