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

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      const doctor = await prisma.doctor.findUnique({ 
        where: { id: id as string }, 
        include: { user: { select: { id: true } } } // Only include user IDs
      });
      if (!doctor) return res.status(404).json({ error: "Doctor not found" });
      return res.status(200).json({ doctor });
    }

    if (req.method === "PUT") {
      await runMiddleware(req, res, parser.single("document"));

      // @ts-ignore
      const data = req.body;
      // @ts-ignore
      const fileUrl: string | null = req.file?.path || null;

      // Build update object dynamically
      const updateData: any = {};
      if (data.fullName) updateData.fullName = data.fullName;
      if (data.currentPracticeAddress) updateData.currentPracticeAddress = data.currentPracticeAddress;
      if (data.contactNumber) updateData.contactNumber = data.contactNumber;
      if (fileUrl) updateData.affiliationLetterUploaded = true;
      if (fileUrl) updateData.docxUrl = { push: fileUrl }; // append new file URL to array

      const updatedDoctor = await prisma.doctor.update({
        where: { id: id as string },
        data: updateData,
      });

      return res.status(200).json({ doctor: updatedDoctor, fileUrl });
    }

    if (req.method === "DELETE") {
      await prisma.doctor.delete({ where: { id: id as string } });
      return res.status(200).json({ message: "Doctor deleted" });
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
