import type { ActivityConfig } from "@/activities/types";
import Module1Gancho from "./module-1-gancho";
import Module2UrgenteVsImportante from "./module-2-urgente-vs-importante";
import Module3MatrizEisenhower from "./module-3-matriz-eisenhower";
import Module4CuadrantesDetalle from "./module-4-cuadrantes-detalle";
import Module5Pareto from "./module-5-pareto";
import Module6EatTheFrog from "./module-6-eat-the-frog";
import Module7Errores from "./module-7-errores-comunes";
import Module8ChecklistCierre from "./module-8-checklist-cierre";
import Module9ActividadMatrizEnVivo from "./module-9-actividad-matriz-en-vivo";

export const priorizacionTareas: ActivityConfig = {
  slug: "priorizacion-tareas",
  title: "Priorización de tareas",
  description: "Urgente vs importante: cómo decidir en qué trabajar primero.",
  coverColor: "2F3C7E",
  modules: [
    { id: "gancho", title: "El problema", type: "content", Component: Module1Gancho },
    { id: "urgente-vs-importante", title: "Urgente vs. importante", type: "content", Component: Module2UrgenteVsImportante },
    { id: "matriz-eisenhower", title: "Matriz de Eisenhower", type: "content", Component: Module3MatrizEisenhower },
    { id: "cuadrantes-detalle", title: "Cuadrante por cuadrante", type: "content", Component: Module4CuadrantesDetalle },
    { id: "pareto", title: "Regla del 80/20", type: "content", Component: Module5Pareto },
    { id: "eat-the-frog", title: "Eat the frog", type: "content", Component: Module6EatTheFrog },
    { id: "errores-comunes", title: "Errores comunes", type: "content", Component: Module7Errores },
    { id: "checklist-cierre", title: "Checklist de cierre", type: "content", Component: Module8ChecklistCierre },
    { id: "matriz-en-vivo", title: "Actividad: La Matriz en Vivo", type: "interactive", Component: Module9ActividadMatrizEnVivo },
  ],
};
