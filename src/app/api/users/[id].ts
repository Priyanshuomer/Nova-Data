import prisma from "../../../../lib/prisma";

type ResponseData = {
  user?: any;
  message?: string;
  error?: string;
};

// GET user by ID
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return new Response(JSON.stringify({ error: "Invalid or missing user ID" }), { status: 400 });

  try {
    const user = await prisma.user.findUnique({ where: { id }, include: { doctors: true } });
    if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

    return new Response(JSON.stringify({ user }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// PUT update user
export async function PUT(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return new Response(JSON.stringify({ error: "Invalid or missing user ID" }), { status: 400 });

  try {
    const body = await req.json();
    const updateData: Record<string, any> = {};
    for (const key in body) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }

    if (Object.keys(updateData).length === 0)
      return new Response(JSON.stringify({ error: "No fields to update" }), { status: 400 });

    const updatedUser = await prisma.user.update({ where: { id }, data: updateData });
    return new Response(JSON.stringify({ user: updatedUser }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// DELETE user
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return new Response(JSON.stringify({ error: "Invalid or missing user ID" }), { status: 400 });

  try {
    await prisma.user.delete({ where: { id } });
    return new Response(JSON.stringify({ message: "User deleted" }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
