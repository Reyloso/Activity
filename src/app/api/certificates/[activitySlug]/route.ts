import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getActivityConfig } from "@/activities/registry";
import { generateCertificatePdf } from "@/lib/certificate-pdf";

export async function GET(_req: Request, { params }: RouteContext<"/api/certificates/[activitySlug]">) {
  const { activitySlug } = await params;
  const session = await auth();
  if (!session?.user.id) return new NextResponse("No autenticado", { status: 401 });

  const config = getActivityConfig(activitySlug);
  if (!config) return new NextResponse("Actividad no encontrada", { status: 404 });

  const enrollment = await db.enrollment.findUnique({
    where: { userId_activitySlug: { userId: session.user.id, activitySlug } },
  });
  if (!enrollment?.completedAt) return new NextResponse("Actividad no completada", { status: 403 });

  const user = await db.user.findUniqueOrThrow({ where: { id: session.user.id } });

  const pdf = await generateCertificatePdf({
    fullName: `${user.name} ${user.lastName}`,
    activityTitle: config.title,
    date: enrollment.completedAt.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificado-${activitySlug}.pdf"`,
    },
  });
}
