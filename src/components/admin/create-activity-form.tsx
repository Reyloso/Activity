"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createActivity, type CreateActivityState } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ModuleDraft = { title: string; content: string };

const initialState: CreateActivityState = { error: null };

export function CreateActivityForm() {
  const [modules, setModules] = useState<ModuleDraft[]>([{ title: "", content: "" }]);
  const [coverColor, setCoverColor] = useState("2F3C7E");
  const [state, formAction, pending] = useActionState(createActivity, initialState);

  function updateModule(index: number, field: keyof ModuleDraft, value: string) {
    setModules((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  }

  function addModule() {
    setModules((prev) => [...prev, { title: "", content: "" }]);
  }

  function removeModule(index: number) {
    setModules((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos generales</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" required maxLength={80} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" required maxLength={300} rows={3} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="coverColor">Color de portada</Label>
            <div className="flex items-center gap-2">
              <input
                id="coverColor"
                type="color"
                value={`#${coverColor}`}
                onChange={(e) => setCoverColor(e.target.value.replace("#", ""))}
                className="h-8 w-12 cursor-pointer rounded border"
              />
              <span className="text-sm text-muted-foreground">#{coverColor.toUpperCase()}</span>
            </div>
            <input type="hidden" name="coverColor" value={coverColor} />
          </div>
        </CardContent>
      </Card>

      {modules.map((module, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Módulo {index + 1}</CardTitle>
              {modules.length > 1 && (
                <Button type="button" size="sm" variant="ghost" onClick={() => removeModule(index)}>
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Input
              value={module.title}
              onChange={(e) => updateModule(index, "title", e.target.value)}
              placeholder="Título del módulo"
              required
            />
            <Textarea
              value={module.content}
              onChange={(e) => updateModule(index, "content", e.target.value)}
              placeholder="Contenido del módulo"
              rows={5}
              required
            />
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={addModule} className="w-fit gap-1.5">
        <Plus className="size-4" /> Agregar módulo
      </Button>

      <input type="hidden" name="modules" value={JSON.stringify(modules)} />

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Creando..." : "Crear actividad"}
      </Button>
    </form>
  );
}
