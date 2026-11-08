import { motion } from "framer-motion";
import { Fragment, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { useApp, type Bi } from "../context";

export const WRAP = "container mx-auto px-6 md:px-12 lg:px-20 xl:px-28";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(WRAP, className)}>{children}</div>;
}

/** Eight-point Islamic star built from eight dental-crown arcs, inside a geometric circle. */
export function StarMark({
  className,
  onDark,
  accent = true,
}: {
  className?: string;
  onDark?: boolean;
  accent?: boolean;
}) {
  const petal = onDark ? "#F4F5F7" : "#2A2F5C";
  const ring = onDark ? "#C5C9D1" : "#2A2F5C";
  return (
    <svg viewBox="-32 -32 64 64" className={className} aria-hidden="true" focusable="false">
      <circle r="30" fill="none" stroke={ring} strokeWidth="1.4" />
      {Array.from({ length: 8 }).map((_, i) => (
        <path
          key={i}
          transform={`rotate(${i * 45})`}
          d="M-4.2 -7 C-9 -15 -4.6 -24.5 0 -26.5 C4.6 -24.5 9 -15 4.2 -7 Q0 -4.6 -4.2 -7Z"
          fill={accent && i % 2 === 1 ? "#4F8A8B" : petal}
        />
      ))}
      <circle r="3.4" fill={onDark ? "#2A2F5C" : "#F4F5F7"} />
      <circle r="1.6" fill="#4F8A8B" />
    </svg>
  );
}

export function Logo({
  onDark,
  branch,
  className,
  compact,
}: {
  onDark?: boolean;
  branch?: Bi;
  className?: string;
  compact?: boolean;
}) {
  const { t } = useApp();
  return (
    <div className={cn("flex items-center gap-3 min-w-0", className)}>
      <StarMark className={cn("shrink-0", compact ? "h-9 w-9" : "h-10 w-10 lg:h-11 lg:w-11")} onDark={onDark} />
      <div className="min-w-0 leading-none">
        <div className={cn("font-display truncate text-[22px] lg:text-2xl", onDark ? "text-zirc" : "text-ind")} style={{ lineHeight: 1.25 }}>
          {t({ ar: "إتقان", en: "Itqan" })}
        </div>
        <div className={cn("truncate text-[11px] font-ui", onDark ? "text-silver" : "text-soft")} style={{ lineHeight: 1.4 }}>
          {t({ ar: "عيادات طب الأسنان", en: "Dental Clinics" })}
        </div>
        {branch && (
          <div className="mt-0.5 truncate text-[11px] font-ui text-turq" style={{ lineHeight: 1.4 }}>
            {t(branch)}
          </div>
        )}
      </div>
    </div>
  );
}

/** Signature word: colour contrast + a precise 1px zirconia-silver rule beneath. */
export function Em({ children }: { children: ReactNode }) {
  return <span className="inline-block border-b border-silver pb-[1px] text-turq">{children}</span>;
}

/** Renders "text with [[signature word]] markers". */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\[\[.*?\]\])/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("[[") ? <Em key={i}>{p.slice(2, -2)}</Em> : <Fragment key={i}>{p}</Fragment>,
      )}
    </>
  );
}

export function Eyebrow({ index, children, onDark }: { index?: string; children: ReactNode; onDark?: boolean }) {
  return (
    <div className={cn("mb-4 flex items-center gap-3 text-[13px] font-ui", onDark ? "text-silver" : "text-soft")}>
      {index && <span className="num text-turq">{index}</span>}
      <span aria-hidden className="h-px w-8 bg-turq" />
      <span>{children}</span>
    </div>
  );
}

export function SectionHead({
  index,
  eyebrow,
  title,
  lead,
  onDark,
  className,
}: {
  index?: string;
  eyebrow: Bi;
  title: Bi;
  lead?: Bi;
  onDark?: boolean;
  className?: string;
}) {
  const { t } = useApp();
  return (
    <Reveal className={cn("max-w-3xl", className)}>
      <Eyebrow index={index} onDark={onDark}>
        {t(eyebrow)}
      </Eyebrow>
      <h2 className={cn("font-display text-[28px] sm:text-4xl lg:text-[44px]", onDark ? "text-zirc" : "text-night")}>
        <Rich text={t(title)} />
      </h2>
      {lead && (
        <p className={cn("mt-5 max-w-2xl text-base lg:text-lg", onDark ? "text-silver" : "text-soft")}>{t(lead)}</p>
      )}
    </Reveal>
  );
}

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "ghost" | "light" | "outline-light";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  ariaLabel?: string;
};

export function Button({ children, onClick, href, variant = "primary", className, type = "button", disabled, ariaLabel }: BtnProps) {
  const cls = cn(
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-6 text-[15px] font-ui transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
    variant === "primary" && "bg-ind text-zirc hover:bg-ind-hover",
    variant === "light" && "bg-zirc text-ind hover:bg-mist",
    variant === "ghost" && "border border-silver bg-transparent text-ind hover:border-ind hover:bg-mist",
    variant === "outline-light" && "border border-silver/60 bg-transparent text-zirc hover:border-zirc hover:bg-zirc/10",
    className,
  );
  if (href)
    return (
      <a href={href} className={cls} aria-label={ariaLabel}>
        {children}
      </a>
    );
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-turq/60 px-2.5 py-0.5 text-xs font-ui text-turq",
        className,
      )}
      style={{ lineHeight: 1.6 }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-turq" />
      {children}
    </span>
  );
}

export function Img({
  asset,
  className,
  eager,
}: {
  asset: { src: string; alt: Bi; width: number; height: number; onError: (e: React.SyntheticEvent<HTMLImageElement>) => void };
  className?: string;
  eager?: boolean;
}) {
  const { t } = useApp();
  return (
    <img
      src={asset.src}
      alt={t(asset.alt)}
      width={asset.width}
      height={asset.height}
      onError={asset.onError}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={className}
    />
  );
}
