import { motion } from 'framer-motion';

interface OwlLoaderProps {
  size?: number;
  inline?: boolean;
}

export default function OwlLoader({ size = 48, inline = false }: OwlLoaderProps) {
  const half = size / 2;
  const scale = size / 48;

  const svg = (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="hsl(var(--accent))"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Body */}
      <circle cx="24" cy="22" r="13" />
      {/* Eyes */}
      <circle cx="20" cy="20" r="3.5" />
      <circle cx="28" cy="20" r="3.5" />
      <circle cx="20" cy="20" r="1.2" />
      <circle cx="28" cy="20" r="1.2" />
      {/* Beak */}
      <path d="M22 25 L24 28 L26 25" />
      {/* Ears */}
      <path d="M11 16 L8 8" />
      <path d="M37 16 L40 8" />
      {/* Feet */}
      <path d="M19 35 L24 42 L29 35" />
      {/* Left wing (animated) */}
      <motion.path
        d="M11 22 L4 16"
        animate={{ rotate: [-20, 20, -20] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '11px 22px' }}
      />
      {/* Right wing (static) */}
      <path d="M37 22 L44 18" />
    </motion.svg>
  );

  if (inline) {
    return <span className="inline-flex items-center justify-center">{svg}</span>;
  }

  return (
    <div className="flex items-center justify-center w-full py-16">
      {svg}
    </div>
  );
}
