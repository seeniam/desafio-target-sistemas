interface BrandLogoProps {
  className?: string;
  accentColor?: string;
}

export function BrandLogo({ className = "h-5 w-5", accentColor = "#1e40af" }: BrandLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Faceta Superior: Juros / Precisão Financeira */}
      <path
        d="M12 2.8L19.2 7L12 11.2L4.8 7L12 2.8Z"
        fill="currentColor"
        fillOpacity="0.95"
      />
      <circle cx="12" cy="7" r="1.4" fill={accentColor} />

      {/* Faceta Esquerda: Estoque / Estrutura Modular */}
      <path
        d="M4.8 8.8L11 12.4V20L4.8 16.4V8.8Z"
        fill="currentColor"
        fillOpacity="0.82"
      />
      <path
        d="M4.8 12.6L11 16.2"
        stroke={accentColor}
        strokeWidth="1.25"
        strokeLinecap="round"
      />

      {/* Faceta Direita: Comercial / Escala e Comissões */}
      <path
        d="M13 12.4L19.2 8.8V16.4L13 20V12.4Z"
        fill="currentColor"
        fillOpacity="0.98"
      />
      <path
        d="M13 16.2L19.2 12.6"
        stroke={accentColor}
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}
