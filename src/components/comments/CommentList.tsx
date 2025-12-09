"use client";

import { ICommentResponse } from "@/types";

interface CommentListProps {
  comments: ICommentResponse[];
  currentUserId: string;
}

export default function CommentList({ comments, currentUserId }: CommentListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay comentarios aún. ¡Sé el primero en comentar!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const isOwn = comment.author === currentUserId;
        const isAgent = comment.authorRole === "agent";

        return (
          <div
            key={comment._id}
            className={`p-4 rounded-lg ${
              isAgent
                ? "bg-blue-50 border-l-4 border-blue-500"
                : "bg-gray-50 border-l-4 border-gray-300"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">
                  {comment.authorName}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isAgent
                      ? "bg-blue-200 text-blue-800"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {isAgent ? "Agente" : "Cliente"}
                </span>
                {isOwn && (
                  <span className="text-xs text-gray-500">(Tú)</span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{comment.message}</p>
          </div>
        );
      })}
    </div>
  );
}