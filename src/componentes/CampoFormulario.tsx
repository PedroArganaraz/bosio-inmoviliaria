type CampoFormularioProps = {
  etiqueta: string;
  idCampo: string;
  error?: string;
  ayuda?: string;
  children: React.ReactNode;
};

export function CampoFormulario({ etiqueta, idCampo, error, ayuda, children }: CampoFormularioProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={idCampo} className="text-sm font-medium text-gris-700">
        {etiqueta}
      </label>
      {children}
      {ayuda && !error && <p className="text-xs text-gris-500">{ayuda}</p>}
      {error && (
        <p id={`${idCampo}-error`} role="alert" className="text-xs font-medium text-negro">
          {error}
        </p>
      )}
    </div>
  );
}
