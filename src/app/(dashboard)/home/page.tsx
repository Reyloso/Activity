import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  const firstName = session?.user.name?.split(" ")[0] ?? "";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Bienvenido{firstName ? `, ${firstName}` : ""}</h1>
      <p className="text-muted-foreground leading-relaxed">
        Activity Milio fue construido para fortalecer las habilidades de nuestro equipo y ayudarnos
        a convertirnos, semana a semana, en un equipo de alto rendimiento. Cada actividad combina
        contenido corto con una dinámica práctica para que no se quede solo en la teoría, sino que
        se convierta en algo que ponemos en práctica desde el primer día.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        Más que enseñar herramientas sueltas, esta plataforma busca que entendamos los principios y
        la cultura de un equipo de alto rendimiento, y que los conectemos con nuestra propia cultura
        como equipo: cómo trabajamos hoy, qué queremos seguir fortaleciendo y hacia dónde vamos
        juntos.
      </p>
    </div>
  );
}
