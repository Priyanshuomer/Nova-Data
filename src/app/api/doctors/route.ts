import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import parser from "../../../../lib/multer";
import crypto from "crypto";

// Disable body parser for file uploads
export const config = {
  api: { bodyParser: false },
};

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
    const existing = await prisma.doctor.findUnique({ where: { id: `NOVADOC-${code}` } });
    if (!existing) return code;
    attempt += 1;
  }
}

// Helper for multer
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise<void>((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve();
    });
  });
}

type ResponseData = {
  doctor?: any;
  doctors?: any[];
  fileUrls?: string[];
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    if (req.method === "POST") {
      // Upload multiple files
      await runMiddleware(req, res, parser.array("documents"));

      // @ts-ignore
      const data = req.body;

      const uniqueCode = await getUnique6DigitCode(data?.aadhaarNumber || crypto.randomUUID());
      const id = `NOVADOC-${uniqueCode}`;

      // @ts-ignore
      const files = req.files as Express.Multer.File[];
      const fileUrls = files?.map((file) => file.path) || [];

      // Convert dates
      if (data.dateOfBirth) data.dateOfBirth = new Date(data.dateOfBirth);
      if (data.registrationValidTill) data.registrationValidTill = new Date(data.registrationValidTill);
      if (data.verificationDate) data.verificationDate = new Date(data.verificationDate);

      // Convert booleans
      const booleanFields = [
        "mbbsVerified","pgDegree","superSpecialization","internshipComplete",
        "fellowshipCert","affiliationLetterUploaded","experienceCertUploaded",
        "practiceLicenseUploaded","noPendingCases","ethicsCompliance",
        "indemnityInsurance","policeVerification","onboardingAgreement",
        "consentGoogleMeet","eSignEnabled","chequeVerified",
        "docsCollected","validatedNMC","backgroundCheck","committeeApproved"
      ];
      for (const field of booleanFields) {
        if (data[field] !== undefined) data[field] = data[field] === "true" || data[field] === true;
      }

      const doctor = await prisma.doctor.create({
        data: {
          id,
          ...data,
          docxUrl: fileUrls,
          affiliationLetterUploaded: data.affiliationLetterUploaded || fileUrls.length > 0,
        },
      });

      return res.status(201).json({ doctor, fileUrls });
    }

    if (req.method === "GET") {
      const doctors = await prisma.doctor.findMany({ include: { user: true } });
      return res.status(200).json({ doctors });
    }

    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
