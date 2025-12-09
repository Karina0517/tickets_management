"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateTicketForm, TicketPriority } from "@/types";
import ticketService from "@/services/ticketService";
import Card, { CardHeader, CardBody } from "@/components/ui/card/Card";
import Input from "@/components/ui/input/Input";
import Textarea from "@/components/ui/textarea/Textarea";
import Select from "@/components/ui/select/Select";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";

const priorityOptions = [
  { value: "low", label: "Baja - No urgente" },
  { value: "medium", label: "Media - Normal" },
  { value: "high", label: "Alta - Urgente" },
];

export default function NewTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<CreateTicketForm>({
    title: "",
    description: "",
    priority: "medium",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "El título es obligatorio";
    } else if (formData.title.trim().length < 5) {
      newErrors.title = "El título debe tener al menos 5 caracteres";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "La descripción debe tener al menos 10 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      await ticketService.createTicket(formData);
      router.push("/client");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← Volver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-gray-800">Crear Nuevo Ticket</h1>
          <p className="text-sm text-gray-600">
            Describe tu problema o solicitud de soporte
          </p>
        </CardHeader>

        <CardBody>
          {error && (
            <Alert variant="error" onClose={() => setError("")} className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Título del ticket"
              name="title"
              placeholder="Ej: Error al iniciar sesión en el sistema"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              disabled={loading}
              required
            />

            <Textarea
              label="Descripción"
              name="description"
              placeholder="Describe detalladamente tu problema o solicitud..."
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              disabled={loading}
              rows={6}
              required
            />

            <Select
              label="Prioridad"
              name="priority"
              options={priorityOptions}
              value={formData.priority}
              onChange={handleChange}
              disabled={loading}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" isLoading={loading} fullWidth>
                Crear Ticket
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}