import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const courses = await prisma.course.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      description: true,
      level: true,
      durationMins: true,
      _count: { select: { modules: true } },
    },
  });

  return NextResponse.json({ courses });
}
