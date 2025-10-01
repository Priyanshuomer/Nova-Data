import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid or missing user ID" });
  }

  try {
    if (req.method === "GET") {
      const user = await prisma.user.findUnique({
        where: { id },
        include: { doctors: true },
      });

      if (!user) return res.status(404).json({ error: "User not found" });
      return res.status(200).json(user);
    }

    if (req.method === "PUT") {
      // Only include defined fields from body
      const updateData: Record<string, any> = {};
      for (const key in req.body) {
        if (req.body[key] !== undefined) updateData[key] = req.body[key];
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
      });

      return res.status(200).json(updatedUser);
    }

    if (req.method === "DELETE") {
      await prisma.user.delete({ where: { id } });
      return res.status(200).json({ message: "User deleted" });
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
