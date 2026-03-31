'use client';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-8 border-b border-border">
      <div className="flex-1">
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground font-medium mt-2 text-sm sm:text-base leading-relaxed">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 flex items-center w-full sm:w-auto">{action}</div>}
    </div>
  );
}
