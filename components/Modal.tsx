"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ title, onClose, children }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-semibold text-base">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
