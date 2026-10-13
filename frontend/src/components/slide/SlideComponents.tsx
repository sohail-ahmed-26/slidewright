import React from 'react';
import { cn } from '../../lib/utils';
import * as Icons from 'lucide-react';
import { AnimCountUp } from './SlideAnimations';
import { useSlideContext } from './SlideContext';

export function TitleWithAccent({ title, accentText, className }: { title: string, accentText?: string, className?: string }) {
  const { theme, isDark } = useSlideContext();
  const primaryColor = theme?.primary || '#2563EB';

  let mainTitle = title || '';
  let highlighted = accentText;

  // If accentText is not provided, split the title and accent the last 1-2 words (matching reference.pptx style)
  if (!highlighted && mainTitle && mainTitle.includes(' ')) {
    const words = mainTitle.trim().split(/\s+/);
    if (words.length >= 3) {
      const accentCount = words.length >= 5 ? 2 : 1;
      highlighted = words.slice(-accentCount).join(' ');
      mainTitle = words.slice(0, -accentCount).join(' ') + ' ';
    }
  }

  return (
    <h1 
      className={cn(
        "text-[44px] font-bold tracking-tight leading-tight",
        isDark ? "text-white" : "text-slate-900",
        className
      )} 
      data-pptx="text"
    >
      {mainTitle}
      {highlighted && (
        <span style={{ color: primaryColor }}>
          {highlighted}
        </span>
      )}
    </h1>
  );
}

export function TintCard({ children, className, style }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) {
  const { theme, isDark } = useSlideContext();
  
  const bg = isDark ? 'rgba(255, 255, 255, 0.05)' : (theme?.cardBg || '#F8FAFC');
  const border = isDark ? 'rgba(255, 255, 255, 0.12)' : (theme?.cardBorder || '#E2E8F0');
  const textColor = isDark ? '#F8FAFC' : '#1E293B';

  return (
    <div 
      className={cn(
        "rounded-[18px] p-8 border shadow-sm flex flex-col transition-all",
        className
      )} 
      style={{
        backgroundColor: bg,
        borderColor: border,
        color: textColor,
        ...style
      }}
      data-pptx="rect"
    >
      {children}
    </div>
  );
}

export function DarkCard({ children, className }: { children: React.ReactNode, className?: string }) {
  const { theme } = useSlideContext();
  return (
    <div 
      className={cn("text-white rounded-[18px] p-8 flex flex-col shadow-xl border border-white/10", className)} 
      style={{ backgroundColor: theme?.darkBg || '#0F172A' }}
      data-pptx="rect"
    >
      {children}
    </div>
  );
}

export function IconBadge({ icon, className }: { icon?: string, className?: string }) {
  const { theme, isDark } = useSlideContext();
  const IconComp = (Icons as any)[icon || ''] || Icons.CheckCircle;
  const primaryColor = theme?.primary || '#2563EB';

  return (
    <div 
      className={cn("inline-flex items-center justify-center p-4 rounded-xl shadow-sm shrink-0", className)} 
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(37,99,235,0.08)',
        color: primaryColor
      }}
      data-pptx="rect"
    >
      <IconComp className="w-8 h-8" data-pptx="icon" />
    </div>
  );
}

export function ChipTag({ children, className }: { children: React.ReactNode, className?: string }) {
  const { theme } = useSlideContext();
  return (
    <span 
      className={cn("inline-flex items-center px-4 py-2 rounded-full text-[15px] font-semibold border shadow-sm", className)}
      style={{
        backgroundColor: theme?.cardBg || '#F1FAFA',
        borderColor: theme?.cardBorder || '#D7EBEB',
        color: theme?.primary || '#0C7C79'
      }}
      data-pptx="rect"
    >
      {children}
    </span>
  );
}

export function BigNumber({ number, label, className }: { number: string, label: string, className?: string }) {
  const { theme, isDark } = useSlideContext();
  const primaryColor = theme?.primary || '#2563EB';

  return (
    <div className={cn("flex flex-col items-center justify-center", className)} data-pptx="rect">
      <AnimCountUp value={number} className="text-[110px] font-extrabold leading-none tracking-tight" style={{ color: primaryColor }} />
      <div 
        className={cn("text-[20px] font-semibold mt-4 text-center", isDark ? "text-slate-300" : "text-slate-600")} 
        data-pptx="text"
      >
        {label}
      </div>
    </div>
  );
}

export function KeyMessageBar({ message, className }: { message: string, className?: string }) {
  const { theme } = useSlideContext();
  return (
    <div 
      className={cn("w-full text-white p-5 rounded-2xl flex items-center justify-center font-bold text-[20px] shadow-lg", className)} 
      style={{ backgroundColor: theme?.darkBg || theme?.primary || '#0C7C79' }}
      data-pptx="rect"
    >
      <span data-pptx="text">{message}</span>
    </div>
  );
}

export function FooterBar({ orgName, pageNumber, className }: { orgName?: string, pageNumber?: number, className?: string }) {
  const { isDark } = useSlideContext();
  return (
    <div 
      className={cn(
        "absolute bottom-[44px] left-[58px] right-[58px] flex justify-between items-center text-[15px] font-medium pt-3 border-t",
        isDark ? "text-slate-400 border-white/10" : "text-slate-500 border-slate-200/80",
        className
      )} 
      data-pptx="rect"
    >
      <span data-pptx="text">{orgName || 'Executive Presentation'}</span>
      <span data-pptx="text">{pageNumber || 1}</span>
    </div>
  );
}

export function ImageFrame({ src, alt, className }: { src: string, alt: string, className?: string }) {
  return (
    <div className={cn("rounded-[16px] overflow-hidden border border-border bg-muted flex items-center justify-center shadow-sm", className)} data-pptx="rect">
      {src ? <img src={src} alt={alt} className="w-full h-full object-cover" data-pptx="image" /> : <Icons.Image className="w-12 h-12 text-muted-foreground" data-pptx="icon" />}
    </div>
  );
}
