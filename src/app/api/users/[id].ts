import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "GET") {
    const user = await prisma.user.findUnique({ where: { id: id as string }, include: { doctors: true } });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.status(200).json(user);
  } else if (req.method === "PUT") {
   try {
  const updateData: Record<string, any> = {};

  // Loop over req.body keys and only include defined values
  for (const key in req.body) {
    if (req.body[key] !== undefined) {
      updateData[key] = req.body[key];
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: id as string },
    data: updateData,
  });

  return res.status(200).json(updatedUser);
} catch (err: any) {
  return res.status(500).json({ error: err.message });
}

  } else if (req.method === "DELETE") {
    try {
      await prisma.user.delete({ where: { id: id as string } });
      return res.status(200).json({ message: "User deleted" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
