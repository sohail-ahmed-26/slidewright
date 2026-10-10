import React from 'react';
import { cn } from '../../lib/utils';
import * as Icons from 'lucide-react';

export function TitleWithAccent({ title, accentText, className }: { title: string, accentText?: string, className?: string }) {
  return (
    <h1 className={cn("text-[43px] font-semibold leading-tight", className)} data-pptx="text">
      {title} {accentText && <span className="text-primary">{accentText}</span>}
    </h1>
  );
}

export function TintCard({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("bg-muted rounded-[12px] p-6 border border-border flex flex-col", className)} data-pptx="rect">
      {children}
    </div>
  );
}

export function DarkCard({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("bg-gray-900 text-white rounded-[12px] p-6 flex flex-col", className)} data-pptx="rect">
      {children}
    </div>
  );
}

export function IconBadge({ icon, className }: { icon: string, className?: string }) {
  const IconComp = (Icons as any)[icon] || Icons.CheckCircle;
  return (
    <div className={cn("inline-flex items-center justify-center bg-primary/10 text-primary p-3 rounded-[12px]", className)} data-pptx="rect">
      <IconComp className="w-8 h-8" data-pptx="icon" />
    </div>
  );
}

export function ChipTag({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-3 py-1 rounded-full bg-accent text-accent-foreground text-[16px] font-medium border", className)} data-pptx="rect">
      {children}
    </span>
  );
}

export function BigNumber({ number, label, className }: { number: string, label: string, className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)} data-pptx="rect">
      <span className="text-[120px] font-bold text-primary leading-none" data-pptx="text">{number}</span>
      <span className="text-[21px] font-medium text-muted-foreground mt-2" data-pptx="text">{label}</span>
    </div>
  );
}

export function KeyMessageBar({ message, className }: { message: string, className?: string }) {
  return (
    <div className={cn("w-full bg-primary text-primary-foreground p-4 flex items-center justify-center font-medium text-[21px]", className)} data-pptx="rect">
      <span data-pptx="text">{message}</span>
    </div>
  );
}

export function FooterBar({ orgName, pageNumber, className }: { orgName: string, pageNumber: number, className?: string }) {
  return (
    <div className={cn("absolute bottom-[58px] left-[58px] right-[58px] flex justify-between items-center text-[16px] text-gray-400", className)} data-pptx="rect">
      <span data-pptx="text">{orgName}</span>
      <span data-pptx="text">{pageNumber}</span>
    </div>
  );
}

export function ImageFrame({ src, alt, className }: { src: string, alt: string, className?: string }) {
  return (
    <div className={cn("rounded-[12px] overflow-hidden border border-border bg-muted flex items-center justify-center", className)} data-pptx="rect">
      {src ? <img src={src} alt={alt} className="w-full h-full object-cover" data-pptx="image" /> : <Icons.Image className="w-12 h-12 text-muted-foreground" data-pptx="icon" />}
    </div>
  );
}
