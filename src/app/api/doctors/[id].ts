import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import parser from "../../../../lib/multer";

// Disable body parser
export const config = { api: { bodyParser: false } };

type ResponseData = {
  doctor?: any;
  fileUrl?: string | null;
  message?: string;
  error?: string;
};

// Helper to handle multer with promises
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise<void>((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      resolve();
    });
  });
}

// GET a single doctor
export async function GET(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const { searchParams } = new URL(req.url || "", `http://${req.headers.host}`);
  const id = searchParams.get("id");

  if (!id) return res.status(400).json({ error: "Invalid doctor ID" });

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: { user: { select: { id: true } } },
    });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    return res.status(200).json({ doctor });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// PUT update doctor
export async function PUT(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const { searchParams } = new URL(req.url || "", `http://${req.headers.host}`);
  const id = searchParams.get("id");

  if (!id) return res.status(400).json({ error: "Invalid doctor ID" });

  try {
    await runMiddleware(req, res, parser.single("document"));

    // @ts-ignore
    const data = req.body;
    // @ts-ignore
    const fileUrl: string | null = req.file?.path || null;

    const updateData: any = {};
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) updateData[key] = data[key];
    });

    if (fileUrl) {
      updateData.affiliationLetterUploaded = true;
      updateData.docxUrl = { push: fileUrl };
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({ doctor: updatedDoctor, fileUrl });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// DELETE doctor
export async function DELETE(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const { searchParams } = new URL(req.url || "", `http://${req.headers.host}`);
  const id = searchParams.get("id");

  if (!id) return res.status(400).json({ error: "Invalid doctor ID" });

  try {
    await prisma.doctor.delete({ where: { id } });
    return res.status(200).json({ message: "Doctor deleted" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
