"use client";

import { useState } from "react";
import Textarea from "@/components/ui/textarea/Textarea";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";

interface CommentFormProps {
  ticketId: string;
  onSubmit: (message: string) => Promise<void>;
  disabled?: boolean;
}

export default function CommentForm({
  ticketId,
  onSubmit,
  disabled = false,
}: CommentFormProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError("El mensaje no puede estar vacío");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSubmit(message.trim());
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar comentario");
    } finally {
      setLoading(false);
    }
  };

  if (disabled) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-500">
        Este ticket está cerrado. No se pueden agregar más comentarios.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Textarea
        placeholder="Escribe tu comentario aquí..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={loading}
        rows={4}
      />

      <div className="flex justify-end">
        <Button type="submit" isLoading={loading} disabled={!message.trim()}>
          Enviar Comentario
        </Button>
      </div>
    </form>
  );
}