"use client";

type InterruptorProps = {
  etiqueta: string;
  activo: boolean;
  onCambiar: (activo: boolean) => void;
  disabled?: boolean;
};

export function Interruptor({ etiqueta, activo, onCambiar, disabled = false }: InterruptorProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      onClick={() => onCambiar(!activo)}
      disabled={disabled}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center disabled:opacity-50"
    >
      <span
        className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
          activo ? "bg-negro" : "bg-gris-300"
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-blanco transition-transform ${
            activo ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
