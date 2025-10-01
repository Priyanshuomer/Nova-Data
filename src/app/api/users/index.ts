import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import crypto from "crypto";



// Secret key for deterministic HMAC (keep safe!)
const SECRET_KEY = process.env.HMAC_SECRET || "REPLACE_WITH_SECURE_KEY";

/**
 * Generate 6-digit string from Aadhaar
 */
function generate6Digit(aadhaar: string, attempt: number = 0): string {
  const data = attempt === 0 ? aadhaar : `${aadhaar}:${attempt}`;
  const hash = crypto.createHmac("sha256", SECRET_KEY).update(data).digest("hex");
  // take first 12 hex chars, convert to int, modulo 1_000_000
  const num = parseInt(hash.slice(0, 12), 16) % 1_000_000;
  return num.toString().padStart(6, "0");
}

/**
 * Generate unique 6-digit code for Aadhaar
 * @param aadhaar Aadhaar number
 */
export async function getUnique6DigitCode(aadhaar: string): Promise<string> {
  let attempt = 0;
  while (true) {
    const code = generate6Digit(aadhaar, attempt);

    // Check if code exists in Prisma model (replace 'UserCode' and 'code' with your model/field)
    const existing = await prisma.user.findUnique({
      where: { id: `NOVAUSR-${code}` },
    });

    if (!existing) {
      return code; // unique code found
    }

    attempt += 1; // increment attempt to change hash
  }
}





export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const users = await prisma.user.findMany({ include: { doctors: true } });
      return res.status(200).json(users);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  } else if (req.method === "POST") {
    try {
      const { name, email, contactNumber, aadhaarNumber, aadhaarVerified, doctors } = req.body;

      // Generate unique ID
      const uniqueCode = await getUnique6DigitCode(aadhaarNumber || crypto.randomUUID());
      const id = `NOVAUSR-${uniqueCode}`;

      // Create user with doctors array
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
      });

      return res.status(201).json(user);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
