import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({
  lessonId: z.string().min(1),
  completed: z.boolean(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { lessonId, completed } = parsed.data;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: { include: { course: true } },
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const enrolled = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.userId,
        courseId: lesson.module.courseId,
      },
    },
  });

  if (!enrolled) {
    return NextResponse.json(
      { error: "Enroll in this course before tracking progress." },
      { status: 403 },
    );
  }

  if (completed) {
    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId: session.userId, lessonId },
      },
      create: {
        userId: session.userId,
        lessonId,
        completedAt: new Date(),
      },
      update: { completedAt: new Date() },
    });
  } else {
    await prisma.lessonProgress.deleteMany({
      where: { userId: session.userId, lessonId },
    });
  }

  return NextResponse.json({ ok: true });
}
