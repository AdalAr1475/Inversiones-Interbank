"use client";
import { useState } from "react";
import { useDialog } from "@/context/DialogContext";
export default function DialogComponent({
  title = "Título del Diálogo",
  body = "Este es el contenido del diálogo. Puedes poner aquí cualquier texto o información relevante.",
  buttonText = "Cerrar"
}: {
  title?: string;
  body?: string;
  buttonText?: string;
}) {
  const { open, setOpen } = useDialog();

  return (
    <>
      

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <p className="mb-6 text-gray-700">{body}</p>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full"
              onClick={() => setOpen(false)}
            >
              {buttonText}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
