import { Award } from "lucide-react";

export function CertificatePreview({
  fullName,
  activityTitle,
  date,
}: {
  fullName: string;
  activityTitle: string;
  date: string;
}) {
  return (
    <div className="flex aspect-[3/2] w-full overflow-hidden rounded-lg border shadow-sm">
      <div className="flex w-[28%] flex-col items-center justify-between bg-white px-4 py-6">
        <div className="flex size-12 items-center justify-center rounded-full bg-[#14214f]">
          <Award className="size-6 text-white" />
        </div>
        <div className="rounded border border-dashed border-slate-300 px-3 py-2 text-center">
          <p className="text-[9px] font-bold leading-tight tracking-wide text-[#14214f]">ACTIVITY</p>
          <p className="text-[9px] font-bold leading-tight tracking-wide text-[#14214f]">MILIO</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold tracking-wide text-[#14214f]">MILIO PAY</p>
          <p className="mt-0.5 text-[7px] text-slate-400">Equipo de alto rendimiento</p>
        </div>
        <div className="flex w-full flex-col items-center gap-1">
          <p className="font-serif text-[11px] text-[#14214f]">Reinaldo López S.</p>
          <div className="h-px w-2/3 bg-slate-300" />
          <p className="text-[7px] uppercase tracking-wide text-slate-400">Tech Lead Milio</p>
        </div>
      </div>
      <div
        className="relative flex flex-1 flex-col justify-between overflow-hidden px-8 py-6"
        style={{
          background: "linear-gradient(to bottom, #14214f 0%, #14214f 72%, #e1e8ff 85%, #f6f9ff 93%, #f9fafb 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-10 [background:radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_85%_15%,white,transparent_30%)]" />
        <div className="relative text-white">
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#e1e8ff]">
            Activity Milio · Capacitación interna
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight">CERTIFICADO</p>
        </div>
        <div className="relative text-white">
          <p className="font-serif text-xl">{fullName}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-[#e1e8ff]">Otorgado el {date}</p>
        </div>
        <p className="relative text-[9px] leading-relaxed text-[#14214f]">
          Habiendo completado la actividad &quot;{activityTitle}&quot;, se otorga el presente certificado de
          aprobación dentro del programa de capacitación interna de Milio Pay.
        </p>
      </div>
    </div>
  );
}
