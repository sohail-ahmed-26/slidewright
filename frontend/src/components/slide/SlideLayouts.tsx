import React from 'react';
import { TitleWithAccent, TintCard, DarkCard, IconBadge, BigNumber, FooterBar, ImageFrame, ChipTag } from './SlideComponents';
import * as Icons from 'lucide-react';
import { AnimFadeUp, AnimStaggerContainer, AnimStaggerItem } from './SlideAnimations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { cn } from '../../lib/utils';
import { DiagramRenderer } from './diagrams';
import { getTopicVisual, getCuratedTopicFallback } from '@slidewright/shared';

function isRTLText(text: string): boolean {
  if (!text) return false;
  return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

export const SlideLayouts: Record<string, React.FC<any>> = {
  cover: ({ title, subtitle, orgName, date, image }) => {
    const isRtl = isRTLText(title || '') || isRTLText(subtitle || '');
    const dynamicVisual = getTopicVisual(title || 'Executive Presentation');
    const heroImage = image || dynamicVisual.imageUrl;
    return (
      <div className={cn("w-full h-full flex bg-[#070F26] text-white relative overflow-hidden", isRtl && "text-right")} dir={isRtl ? "rtl" : "ltr"} data-pptx="rect">
        {/* Left Side Content (58%) */}
        <div className="w-[58%] h-full flex flex-col justify-between p-[58px] z-10">
          <div>
            <AnimFadeUp>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/20 border border-primary/30 text-[#38BDF8] text-xs font-semibold tracking-wider uppercase mb-8">
                <Icons.Layers className="w-3.5 h-3.5" />
                <span>Executive Presentation</span>
              </div>
            </AnimFadeUp>
            <AnimFadeUp delay={0.1}>
              <h1 className="text-[52px] font-bold tracking-tight leading-[1.15] mb-6 text-white" data-pptx="text">
                {title}
              </h1>
            </AnimFadeUp>
            {subtitle && (
              <AnimFadeUp delay={0.2}>
                <p className="text-[21px] text-[#9AAAD0] leading-relaxed max-w-lg" data-pptx="text">
                  {subtitle}
                </p>
              </AnimFadeUp>
            )}
          </div>

          <AnimFadeUp delay={0.3} className="flex items-center justify-between border-t border-white/10 pt-6">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-[#6B7D9E]">Presented By</span>
              <span className="text-[17px] font-semibold text-white mt-0.5">{orgName || 'Slidewright AI'}</span>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase tracking-wider text-[#6B7D9E]">Date</span>
              <span className="text-[15px] text-[#9AAAD0] block mt-0.5">{date || 'October 2026'}</span>
            </div>
          </AnimFadeUp>
        </div>

        {/* Right Side Visual Mask (42%) */}
        <div className="w-[42%] h-full relative overflow-hidden">
          <div 
            className="w-full h-full relative"
            style={{
              clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)'
            }}
          >
            <img 
              src={heroImage} 
              alt={title} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getCuratedTopicFallback(title || '');
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070F26] via-transparent to-[#070F26]/30 pointer-events-none" />
            <div className="absolute inset-0 bg-[#2F6BFF]/15 mix-blend-color pointer-events-none" />
          </div>
          <div 
            className="absolute inset-0 border-l-2 border-[#38BDF8]/60 pointer-events-none"
            style={{
              transform: 'skewX(-9deg) translateX(30px)'
            }}
          />
        </div>
      </div>
    );
  },

  agenda: ({ title, subtitle, items = [], cards = [], steps = [], orgName, pageNumber }: any) => {
    const isRtl = isRTLText(title || '');
    const rawList = (Array.isArray(items) && items.length > 0) 
      ? items 
      : (Array.isArray(cards) && cards.length > 0 ? cards : (Array.isArray(steps) ? steps : []));
    const safeList = rawList.slice(0, 4);
    return (
      <div className={cn("w-full h-full flex flex-col p-[58px]", isRtl && "text-right")} dir={isRtl ? "rtl" : "ltr"}>
        <AnimFadeUp>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary mb-2">
            <Icons.Compass className="w-3.5 h-3.5" />
            <span>Executive Agenda & Roadmap</span>
          </div>
          <TitleWithAccent title={title || "What We Will Cover"} className="mb-2" />
          {subtitle && <p className="text-[18px] text-slate-500 mb-4" data-pptx="text">{subtitle}</p>}
        </AnimFadeUp>
        <div className="flex-1 flex gap-[24px] items-stretch w-full justify-between mt-4">
          {safeList.map((item: any, i: number) => {
            const itemTitle = typeof item === 'object' ? (item.title || item.heading || `Pillar ${i + 1}`) : `Topic ${i + 1}`;
            const itemBody = typeof item === 'object' ? (item.body || item.text || item.description || '') : String(item);
            return (
              <div key={i} className="flex-1 min-w-0 flex flex-col">
                <TintCard className="flex-1 flex flex-col p-7 border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-[20px] font-black mb-4 shrink-0" data-pptx="rect">
                    <span data-pptx="text">{`0${i + 1}`}</span>
                  </div>
                  <h3 className="text-[20px] font-bold mb-3 text-slate-900" data-pptx="text">{itemTitle}</h3>
                  <p className="text-[16px] text-slate-600 leading-relaxed flex-1" data-pptx="text">{itemBody}</p>
                </TintCard>
              </div>
            );
          })}
        </div>
        <FooterBar orgName={orgName} pageNumber={pageNumber} />
      </div>
    );
  },

  title_body: ({ title, body, points = [], orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col p-[58px] bg-white text-gray-900" data-pptx="rect">
      <AnimFadeUp><TitleWithAccent title={title} className="mb-[32px]" /></AnimFadeUp>
      <AnimFadeUp delay={0.1} className="flex-1 max-w-4xl">
        {body && <p className="text-[22px] text-gray-700 leading-relaxed mb-6" data-pptx="text">{body}</p>}
        {Array.isArray(points) && points.length > 0 && (
          <div className="flex flex-col gap-4 mt-4">
            {points.map((pt: string, idx: number) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-primary mt-3 shrink-0" />
                <p className="text-[20px] text-gray-800" data-pptx="text">{pt}</p>
              </div>
            ))}
          </div>
        )}
      </AnimFadeUp>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  two_cards: ({ title, cards = [], orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col p-[58px]">
      <AnimFadeUp><TitleWithAccent title={title} className="mb-[32px]" /></AnimFadeUp>
      <AnimStaggerContainer className="flex-1 grid grid-cols-2 gap-[32px]">
        {cards.map((c: any, i: number) => {
          const cardTitle = typeof c === 'object' && c !== null ? (c.title || c.heading || c.name || '') : '';
          const cardBody = typeof c === 'object' && c !== null ? (c.body || c.text || c.sentence || c.content || '') : String(c || '');
          return (
            <AnimStaggerItem key={i}>
              <TintCard className="h-full">
                {cardTitle && <h2 className="text-[21px] font-semibold mb-4" data-pptx="text">{cardTitle}</h2>}
                <p className="text-[19px] text-gray-700 leading-relaxed" data-pptx="text">{cardBody}</p>
              </TintCard>
            </AnimStaggerItem>
          );
        })}
      </AnimStaggerContainer>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  icon_rows: ({ title, rows = [], orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col p-[58px]">
      <AnimFadeUp><TitleWithAccent title={title} className="mb-[32px]" /></AnimFadeUp>
      <AnimStaggerContainer className="flex flex-col gap-[24px] flex-1">
        {rows.map((r: any, i: number) => {
          const rowTitle = typeof r === 'object' && r !== null ? (r.title || r.heading || r.name || '') : '';
          const rowBody = typeof r === 'object' && r !== null ? (r.body || r.sentence || r.text || r.content || '') : String(r || '');
          const iconName = typeof r === 'object' && r !== null ? r.icon : undefined;
          return (
            <AnimStaggerItem key={i} className="flex items-start gap-[24px]" data-pptx="rect">
              <IconBadge icon={iconName} />
              <div className="flex-1">
                {rowTitle && <h3 className="text-[21px] font-semibold" data-pptx="text">{rowTitle}</h3>}
                <p className="text-[19px] text-gray-600 mt-1 leading-relaxed" data-pptx="text">{rowBody}</p>
              </div>
            </AnimStaggerItem>
          );
        })}
      </AnimStaggerContainer>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  grid_2x2: ({ title, cards = [], orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col p-[58px]">
      <AnimFadeUp><TitleWithAccent title={title} className="mb-[32px]" /></AnimFadeUp>
      <AnimStaggerContainer className="flex-1 grid grid-cols-2 grid-rows-2 gap-[32px]">
        {cards.map((c: any, i: number) => {
          const cardTitle = typeof c === 'object' && c !== null ? (c.title || c.heading || c.name || '') : '';
          const cardBody = typeof c === 'object' && c !== null ? (c.body || c.sentence || c.text || c.content || '') : String(c || '');
          const iconName = typeof c === 'object' && c !== null ? c.icon : undefined;
          return (
            <AnimStaggerItem key={i}>
              <TintCard className="h-full justify-center items-center text-center">
                {iconName && <IconBadge icon={iconName} className="mb-4" />}
                {cardTitle && <h3 className="text-[21px] font-semibold mb-2" data-pptx="text">{cardTitle}</h3>}
                <p className="text-[19px] text-gray-600 leading-relaxed" data-pptx="text">{cardBody}</p>
              </TintCard>
            </AnimStaggerItem>
          );
        })}
      </AnimStaggerContainer>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  icon_list_dark_panel: ({ title, darkPanel = { title: '', subtitle: '' }, list = [], orgName, pageNumber }) => (
    <div className="w-full h-full flex p-[58px] gap-[32px]">
      <AnimFadeUp className="w-1/3">
        <DarkCard className="h-full justify-center items-center text-center">
          {darkPanel?.icon && <IconBadge icon={darkPanel.icon} className="mb-6 bg-white/10 text-white" />}
          <h2 className="text-[43px] font-bold leading-tight" data-pptx="text">{darkPanel?.title || ''}</h2>
          <p className="text-[21px] text-gray-300 mt-4 leading-relaxed" data-pptx="text">{darkPanel?.subtitle || ''}</p>
        </DarkCard>
      </AnimFadeUp>
      <div className="flex-1 flex flex-col">
        <AnimFadeUp><TitleWithAccent title={title} className="mb-[32px]" /></AnimFadeUp>
        <AnimStaggerContainer className="flex flex-col gap-[20px] flex-1">
          {list.map((item: any, i: number) => {
            const isObj = typeof item === 'object' && item !== null;
            const heading = isObj ? (item.heading || item.title || item.name) : null;
            const text = isObj ? (item.sentence || item.text || item.body || item.content || '') : String(item || '');
            return (
              <AnimStaggerItem key={i} className="flex items-start gap-[16px]">
                <Icons.CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" data-pptx="icon" />
                <div>
                  {heading && <h4 className="font-semibold text-[20px] text-gray-900 leading-tight mb-1">{heading}</h4>}
                  <p className="text-[19px] text-gray-800 leading-relaxed" data-pptx="text">{text}</p>
                </div>
              </AnimStaggerItem>
            );
          })}
        </AnimStaggerContainer>
      </div>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  big_number_dark: ({ title, number, label, baseline, subtext, takeaways = [], body, orgName, pageNumber }: any) => {
    const isRtl = isRTLText(title || '') || isRTLText(label || '');
    const displayTakeaways = Array.isArray(takeaways) && takeaways.length > 0 
      ? takeaways 
      : (body ? [body] : [
          "Drives immediate enterprise performance gains across distributed workloads.",
          "Minimizes processing bottlenecks while elevating operational consistency.",
          "Scales seamlessly to high-throughput production environments."
        ]);
    return (
      <div className={cn("w-full h-full flex flex-col bg-gradient-to-br from-[#070F26] via-[#0B1528] to-[#111C38] text-white p-[58px] relative overflow-hidden", isRtl && "text-right")} dir={isRtl ? "rtl" : "ltr"} data-pptx="rect">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <AnimFadeUp>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded bg-primary/20 border border-primary/40 text-primary-foreground text-xs font-semibold tracking-wider uppercase">
              Executive Impact Metric
            </span>
          </div>
          <TitleWithAccent title={title || "Strategic Performance Indicator"} className="mb-[36px] text-white" />
        </AnimFadeUp>

        <div className="flex-1 grid grid-cols-12 gap-[32px] items-stretch">
          {/* Left Hero KPI Showcase */}
          <AnimFadeUp className="col-span-5" delay={0.1}>
            <div className="h-full rounded-2xl bg-white/5 border border-white/10 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden backdrop-blur-sm shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
              <span className="text-[72px] font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-primary to-[#60A5FA] leading-none mb-4" data-pptx="text">
                {number || "75%"}
              </span>
              <h3 className="text-[22px] font-bold text-white mb-2" data-pptx="text">
                {label || "Improved Diagnostic Accuracy"}
              </h3>
              <p className="text-[15px] text-[#9AAAD0] max-w-xs leading-relaxed" data-pptx="text">
                {baseline || subtext || "Verified against standard enterprise baseline benchmarks"}
              </p>
            </div>
          </AnimFadeUp>

          {/* Right Strategic Drivers */}
          <AnimFadeUp className="col-span-7" delay={0.2}>
            <div className="h-full rounded-2xl bg-white/5 border border-white/10 p-8 flex flex-col justify-between backdrop-blur-sm shadow-2xl">
              <div>
                <h4 className="text-[18px] font-bold text-primary mb-6 flex items-center gap-2">
                  <Icons.TrendingUp className="w-5 h-5 text-primary" />
                  <span>Strategic Impact & Context</span>
                </h4>
                <div className="space-y-4">
                  {displayTakeaways.slice(0, 3).map((item: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-4 p-3.5 rounded-xl bg-white/5 border border-white/5">
                      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                        <Icons.Check className="w-3.5 h-3.5 text-[#38BDF8]" />
                      </div>
                      <p className="text-[16px] text-gray-200 leading-relaxed" data-pptx="text">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#6B7D9E]">
                <span>CONFIDENTIAL & EXECUTIVE USE</span>
                <span>ENTERPRISE METRIC VERIFICATION</span>
              </div>
            </div>
          </AnimFadeUp>
        </div>

        <FooterBar orgName={orgName} pageNumber={pageNumber} className="text-[#64748B]" />
      </div>
    );
  },

  cards_3_bar: ({ title, cards = [], orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col p-[58px]">
      <AnimFadeUp><TitleWithAccent title={title} className="mb-[32px]" /></AnimFadeUp>
      <AnimStaggerContainer className="flex-1 grid grid-cols-3 gap-[32px]">
        {cards.map((c: any, i: number) => (
          <AnimStaggerItem key={i}>
            <TintCard className="h-full">
              <h3 className="text-[21px] font-semibold mb-4" data-pptx="text">{c.title}</h3>
              <p className="text-[19px] text-gray-700 flex-1" data-pptx="text">{c.body}</p>
            </TintCard>
          </AnimStaggerItem>
        ))}
      </AnimStaggerContainer>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  closing: ({ message, title, subtitle, contact, orgName }: any) => {
    const displayTitle = message || title || 'Thank You';
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-[58px] bg-gradient-to-br from-[#060D1F] via-[#0B1838] to-[#122452] text-white text-center relative overflow-hidden" data-pptx="rect">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl flex flex-col items-center">
          <AnimFadeUp delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-primary-foreground text-sm font-medium mb-8">
              <Icons.Sparkles className="w-4 h-4 text-[#38BDF8]" />
              <span>Next Steps & Inquiries</span>
            </div>
            <h1 className="text-[52px] font-bold tracking-tight leading-tight mb-4 text-white" data-pptx="text">{displayTitle}</h1>
            {subtitle && <p className="text-[20px] text-[#9AAAD0] mb-8 max-w-2xl leading-relaxed">{subtitle}</p>}
          </AnimFadeUp>

          {contact && (
            <AnimFadeUp delay={0.2}>
              <div className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl text-[20px] font-medium">
                <Icons.Mail className="w-5 h-5 text-[#38BDF8]" />
                <span data-pptx="text">{contact}</span>
              </div>
            </AnimFadeUp>
          )}
        </div>

        <FooterBar orgName={orgName} pageNumber={99} className="text-white/40" />
      </div>
    );
  },

  // New Layouts
  chip_grid_callout: ({ title, callout = { title: '', body: '' }, chips = [], orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col p-[58px]">
      <AnimFadeUp><TitleWithAccent title={title} className="mb-[32px]" /></AnimFadeUp>
      <div className="flex-1 flex gap-[32px]">
        <AnimFadeUp className="w-1/3">
          <TintCard className="h-full justify-center">
            <h3 className="text-[21px] font-semibold mb-4 text-primary" data-pptx="text">{callout.title}</h3>
            <p className="text-[19px] text-gray-700" data-pptx="text">{callout.body}</p>
          </TintCard>
        </AnimFadeUp>
        <AnimStaggerContainer className="flex-1 flex flex-wrap gap-[16px] content-start">
          {chips.map((c: string, i: number) => (
            <AnimStaggerItem key={i}>
              <ChipTag>{c}</ChipTag>
            </AnimStaggerItem>
          ))}
        </AnimStaggerContainer>
      </div>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  big_circle_text: ({ title, text, circleText, orgName, pageNumber }) => (
    <div className="w-full h-full flex p-[58px] gap-[32px] items-center">
      <div className="flex-1">
        <AnimFadeUp><TitleWithAccent title={title} className="mb-[32px]" /></AnimFadeUp>
        <AnimFadeUp delay={0.1}>
          <p className="text-[21px] text-gray-700 leading-relaxed" data-pptx="text">{text}</p>
        </AnimFadeUp>
      </div>
      <AnimFadeUp className="w-[400px] h-[400px] rounded-full bg-primary flex items-center justify-center p-[40px] text-center shadow-xl border-4 border-primary/20" delay={0.2}>
        <div data-pptx="rect" className="w-full h-full rounded-full flex flex-col items-center justify-center">
          <h2 className="text-[43px] font-bold text-primary-foreground leading-tight" data-pptx="text">{circleText}</h2>
        </div>
      </AnimFadeUp>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  dark_panel_points: ({ darkPanel = { title: '', subtitle: '' }, points = [], orgName, pageNumber }) => (
    <div className="w-full h-full flex">
      <AnimFadeUp className="w-1/3 h-full bg-gray-900 text-white p-[58px] flex flex-col justify-center">
        <div data-pptx="rect" className="w-full h-full flex flex-col justify-center">
          <h2 className="text-[43px] font-bold leading-tight mb-4" data-pptx="text">{darkPanel.title}</h2>
          <p className="text-[21px] text-gray-300" data-pptx="text">{darkPanel.subtitle}</p>
        </div>
      </AnimFadeUp>
      <div className="w-2/3 h-full p-[58px] flex flex-col justify-center">
        <AnimStaggerContainer className="flex flex-col gap-[32px]">
          {points.map((p: any, i: number) => (
            <AnimStaggerItem key={i} className="flex gap-[24px]">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-[21px]" data-pptx="rect">
                <span data-pptx="text">{i + 1}</span>
              </div>
              <div>
                <h3 className="text-[21px] font-semibold" data-pptx="text">{p.title}</h3>
                <p className="text-[19px] text-gray-600 mt-2" data-pptx="text">{p.body}</p>
              </div>
            </AnimStaggerItem>
          ))}
        </AnimStaggerContainer>
      </div>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  stacked_rows_3: ({ title, rows = [], orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col p-[58px]">
      <AnimFadeUp><TitleWithAccent title={title} className="mb-[32px]" /></AnimFadeUp>
      <AnimStaggerContainer className="flex-1 flex flex-col gap-[24px]">
        {rows.map((r: any, i: number) => (
          <AnimStaggerItem key={i}>
            <TintCard className="flex flex-row items-center gap-[24px] p-[24px]">
              {r.icon && <IconBadge icon={r.icon} className="shrink-0" />}
              <div className="flex-1">
                <h3 className="text-[21px] font-semibold" data-pptx="text">{r.title}</h3>
              </div>
              <div className="w-2/3">
                <p className="text-[19px] text-gray-700" data-pptx="text">{r.body}</p>
              </div>
            </TintCard>
          </AnimStaggerItem>
        ))}
      </AnimStaggerContainer>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  stats: ({ title, stats = [], orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col p-[58px]">
      <AnimFadeUp><TitleWithAccent title={title} className="mb-[48px]" /></AnimFadeUp>
      <AnimStaggerContainer className="flex-1 flex items-center justify-around">
        {stats.map((s: any, i: number) => (
          <AnimStaggerItem key={i} className="text-center">
            <BigNumber number={s.number} label={s.label} />
            {s.subtext && <p className="text-[16px] text-gray-500 mt-4" data-pptx="text">{s.subtext}</p>}
          </AnimStaggerItem>
        ))}
      </AnimStaggerContainer>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  timeline: ({ title, events = [], orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col p-[58px]">
      <AnimFadeUp><TitleWithAccent title={title} className="mb-[48px]" /></AnimFadeUp>
      <div className="flex-1 relative flex items-center">
        <div className="absolute top-1/2 left-0 w-full h-[4px] bg-muted -translate-y-1/2" data-pptx="rect"></div>
        <AnimStaggerContainer className="w-full flex justify-between relative z-10">
          {events.map((e: any, i: number) => (
            <AnimStaggerItem key={i} className="flex flex-col items-center w-[200px] text-center">
              <div className="mb-4">
                <h4 className="text-[16px] font-bold text-primary uppercase" data-pptx="text">{e.date}</h4>
              </div>
              <div className="w-[24px] h-[24px] rounded-full bg-primary border-4 border-white shadow-sm mb-4" data-pptx="rect"></div>
              <div>
                <h3 className="text-[19px] font-semibold mb-2" data-pptx="text">{e.title}</h3>
                <p className="text-[16px] text-gray-600" data-pptx="text">{e.body}</p>
              </div>
            </AnimStaggerItem>
          ))}
        </AnimStaggerContainer>
      </div>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  process_steps: ({ title, steps = [], orgName, pageNumber }: any) => {
    const isRtl = isRTLText(title || '');
    const safeSteps = Array.isArray(steps) ? steps.slice(0, 4) : [];
    return (
      <div className={cn("w-full h-full flex flex-col p-[58px]", isRtl && "text-right")} dir={isRtl ? "rtl" : "ltr"}>
        <AnimFadeUp><TitleWithAccent title={title || "Implementation Process"} className="mb-[36px]" /></AnimFadeUp>
        <div className="flex-1 flex gap-[24px] items-stretch w-full justify-between">
          {safeSteps.map((s: any, i: number) => (
            <div key={i} className="flex-1 min-w-0 flex flex-col">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center text-[19px] font-bold shadow-md" data-pptx="rect">
                  <span data-pptx="text">{i + 1}</span>
                </div>
              </div>
              <TintCard className="flex-1 flex flex-col border-t-4 border-t-primary p-6">
                <h3 className="text-[19px] font-bold mb-3 text-center text-slate-900" data-pptx="text">{s.title || `Phase ${i + 1}`}</h3>
                <p className="text-[16px] text-slate-600 leading-relaxed text-left flex-1" data-pptx="text">{s.body}</p>
              </TintCard>
            </div>
          ))}
        </div>
        <FooterBar orgName={orgName} pageNumber={pageNumber} />
      </div>
    );
  },

  comparison: ({ title, left = { title: '', points: [] }, right = { title: '', points: [] }, orgName, pageNumber }: any) => (
    <div className="w-full h-full flex flex-col p-[58px]">
      <AnimFadeUp><TitleWithAccent title={title || "Comparative Analysis"} className="mb-[32px]" /></AnimFadeUp>
      <div className="flex-1 flex gap-[32px] w-full items-stretch">
        <div className="flex-1 min-w-0 flex flex-col">
          <TintCard className="h-full border-t-4 border-t-slate-400 p-8 flex flex-col">
            <h2 className="text-[24px] font-bold mb-6 text-center text-slate-800" data-pptx="text">{left?.title || 'Option A'}</h2>
            <div className="flex flex-col gap-[16px] flex-1">
              {(left?.points || []).map((p: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <Icons.X className="w-6 h-6 text-slate-400 shrink-0 mt-0.5" data-pptx="icon" />
                  <p className="text-[18px] text-slate-700 leading-relaxed" data-pptx="text">{p}</p>
                </div>
              ))}
            </div>
          </TintCard>
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <TintCard className="h-full border-t-4 border-t-primary p-8 flex flex-col shadow-md">
            <h2 className="text-[24px] font-bold mb-6 text-center text-primary" data-pptx="text">{right?.title || 'Option B'}</h2>
            <div className="flex flex-col gap-[16px] flex-1">
              {(right?.points || []).map((p: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <Icons.Check className="w-6 h-6 text-primary shrink-0 mt-0.5" data-pptx="icon" />
                  <p className="text-[18px] text-slate-900 leading-relaxed font-medium" data-pptx="text">{p}</p>
                </div>
              ))}
            </div>
          </TintCard>
        </div>
      </div>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  quote: ({ quote, author, role, orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col items-center justify-center p-[58px] text-center">
      <AnimFadeUp>
        <Icons.Quote className="w-16 h-16 text-primary/40 mb-8 mx-auto" data-pptx="icon" />
      </AnimFadeUp>
      <AnimFadeUp delay={0.1}>
        <h2 className="text-[43px] font-serif font-medium leading-tight text-gray-900 max-w-4xl" data-pptx="text">"{quote}"</h2>
      </AnimFadeUp>
      <AnimFadeUp delay={0.2}>
        <div className="mt-8">
          <p className="text-[21px] font-bold text-gray-900" data-pptx="text">{author}</p>
          <p className="text-[19px] text-gray-500 mt-1" data-pptx="text">{role}</p>
        </div>
      </AnimFadeUp>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  image_split: ({ title, text, image, imagePos = 'right', orgName, pageNumber }: any) => {
    const splitImg = image || getTopicVisual(title || 'Strategic Visual').imageUrl;
    return (
      <div className={cn("w-full h-full flex", imagePos === 'right' ? "flex-row" : "flex-row-reverse")}>
        <div className="w-1/2 p-[58px] flex flex-col justify-center">
          <AnimFadeUp><TitleWithAccent title={title} className="mb-[32px]" /></AnimFadeUp>
          <AnimFadeUp delay={0.1}>
            <p className="text-[21px] text-gray-700 leading-relaxed" data-pptx="text">{text}</p>
          </AnimFadeUp>
        </div>
        <div className="w-1/2 h-full p-[24px]">
          <AnimFadeUp className="w-full h-full" delay={0.2}>
            <ImageFrame src={splitImg} alt={title} className="w-full h-full" />
          </AnimFadeUp>
        </div>
        <FooterBar orgName={orgName} pageNumber={pageNumber} />
      </div>
    );
  },

  image_overlay: ({ title, subtitle, image, orgName, pageNumber }: any) => {
    const overlayImg = image || getTopicVisual(title || 'Strategic Visual').imageUrl;
    return (
      <div className="w-full h-full relative flex items-end p-[58px]">
        <div className="absolute inset-0 z-0">
          <ImageFrame src={overlayImg} alt={title} className="w-full h-full rounded-none border-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" data-pptx="rect"></div>
        </div>
        <AnimFadeUp className="relative z-10 w-full max-w-3xl text-white">
          <h1 className="text-[61px] font-bold leading-tight mb-4" data-pptx="text">{title}</h1>
          <p className="text-[24px] text-gray-200" data-pptx="text">{subtitle}</p>
        </AnimFadeUp>
        <FooterBar orgName={orgName} pageNumber={pageNumber} className="text-gray-400 z-10" />
      </div>
    );
  },

  chart: ({ title, data = [], dataKey, xAxisKey, orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col p-[58px]">
      <AnimFadeUp><TitleWithAccent title={title} className="mb-[32px]" /></AnimFadeUp>
      <AnimFadeUp className="flex-1 w-full" delay={0.1}>
        <div data-pptx="rect" className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fontSize: 16, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 16, fill: 'hsl(var(--muted-foreground))' }} dx={-10} />
              <Bar dataKey={dataKey} radius={[8, 8, 0, 0]}>
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                ))}
                <LabelList dataKey={dataKey} position="top" fill="hsl(var(--primary))" fontSize={16} fontWeight="bold" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AnimFadeUp>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  diagram: ({ title, description, diagramSpec, orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col p-[58px]">
      <AnimFadeUp><TitleWithAccent title={title} className="mb-[16px]" /></AnimFadeUp>
      {description && <AnimFadeUp delay={0.1}><p className="text-[19px] text-gray-600 mb-[32px]" data-pptx="text">{description}</p></AnimFadeUp>}
      <AnimFadeUp className="flex-1" delay={0.2}>
        {diagramSpec ? (
          <DiagramRenderer spec={diagramSpec} />
        ) : (
          <div className="w-full h-full border-2 border-dashed border-border rounded-[12px] bg-muted/50 flex flex-col items-center justify-center text-muted-foreground" data-pptx="rect">
            <Icons.GitMerge className="w-16 h-16 mb-4 opacity-50" data-pptx="icon" />
            <p className="text-[19px] font-medium" data-pptx="text">Diagram Placeholder</p>
          </div>
        )}
      </AnimFadeUp>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  )
};
