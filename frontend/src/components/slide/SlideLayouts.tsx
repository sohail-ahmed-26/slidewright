import React from 'react';
import { TitleWithAccent, TintCard, DarkCard, IconBadge, BigNumber, FooterBar, ImageFrame, ChipTag } from './SlideComponents';
import * as Icons from 'lucide-react';
import { AnimFadeUp, AnimStaggerContainer, AnimStaggerItem } from './SlideAnimations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { cn } from '../../lib/utils';
import { DiagramRenderer } from './diagrams';

export const SlideLayouts: Record<string, React.FC<any>> = {
  cover: ({ title, subtitle, orgName }) => (
    <div className="w-full h-full flex flex-col items-center justify-center p-[58px] text-center bg-primary text-primary-foreground" data-pptx="rect">
      <AnimFadeUp delay={0.1}>
        <h1 className="text-[61px] font-bold" data-pptx="text">{title}</h1>
      </AnimFadeUp>
      <AnimFadeUp delay={0.2}>
        <p className="text-[21px] opacity-80 mt-6 max-w-3xl" data-pptx="text">{subtitle}</p>
      </AnimFadeUp>
      <FooterBar orgName={orgName} pageNumber={1} className="text-primary-foreground/50" />
    </div>
  ),

  two_cards: ({ title, cards, orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col p-[58px]">
      <AnimFadeUp><TitleWithAccent title={title} className="mb-[32px]" /></AnimFadeUp>
      <AnimStaggerContainer className="flex-1 grid grid-cols-2 gap-[32px]">
        {cards.map((c: any, i: number) => (
          <AnimStaggerItem key={i}>
            <TintCard className="h-full">
              <h2 className="text-[21px] font-semibold mb-4" data-pptx="text">{c.title}</h2>
              <p className="text-[19px] text-gray-700" data-pptx="text">{c.body}</p>
            </TintCard>
          </AnimStaggerItem>
        ))}
      </AnimStaggerContainer>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  icon_rows: ({ title, rows, orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col p-[58px]">
      <AnimFadeUp><TitleWithAccent title={title} className="mb-[32px]" /></AnimFadeUp>
      <AnimStaggerContainer className="flex flex-col gap-[24px] flex-1">
        {rows.map((r: any, i: number) => {
          const IconComp = (Icons as any)[r.icon] || Icons.Check;
          return (
            <AnimStaggerItem key={i} className="flex items-start gap-[24px]" data-pptx="rect">
              <IconBadge icon={r.icon} />
              <div className="flex-1">
                <h3 className="text-[21px] font-semibold" data-pptx="text">{r.title}</h3>
                <p className="text-[19px] text-gray-600 mt-1" data-pptx="text">{r.body}</p>
              </div>
            </AnimStaggerItem>
          )
        })}
      </AnimStaggerContainer>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  grid_2x2: ({ title, cards, orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col p-[58px]">
      <AnimFadeUp><TitleWithAccent title={title} className="mb-[32px]" /></AnimFadeUp>
      <AnimStaggerContainer className="flex-1 grid grid-cols-2 grid-rows-2 gap-[32px]">
        {cards.map((c: any, i: number) => (
          <AnimStaggerItem key={i}>
            <TintCard className="h-full justify-center items-center text-center">
              {c.icon && <IconBadge icon={c.icon} className="mb-4" />}
              <h3 className="text-[21px] font-semibold mb-2" data-pptx="text">{c.title}</h3>
              <p className="text-[19px] text-gray-600" data-pptx="text">{c.body}</p>
            </TintCard>
          </AnimStaggerItem>
        ))}
      </AnimStaggerContainer>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  icon_list_dark_panel: ({ title, darkPanel, list, orgName, pageNumber }) => (
    <div className="w-full h-full flex p-[58px] gap-[32px]">
      <AnimFadeUp className="w-1/3">
        <DarkCard className="h-full justify-center items-center text-center">
          {darkPanel.icon && <IconBadge icon={darkPanel.icon} className="mb-6 bg-white/10 text-white" />}
          <h2 className="text-[43px] font-bold leading-tight" data-pptx="text">{darkPanel.title}</h2>
          <p className="text-[21px] text-gray-300 mt-4" data-pptx="text">{darkPanel.subtitle}</p>
        </DarkCard>
      </AnimFadeUp>
      <div className="flex-1 flex flex-col">
        <AnimFadeUp><TitleWithAccent title={title} className="mb-[32px]" /></AnimFadeUp>
        <AnimStaggerContainer className="flex flex-col gap-[24px] flex-1">
          {list.map((item: string, i: number) => (
            <AnimStaggerItem key={i} className="flex items-center gap-[16px]">
              <Icons.ArrowRight className="w-6 h-6 text-primary shrink-0" data-pptx="icon" />
              <p className="text-[21px] text-gray-800" data-pptx="text">{item}</p>
            </AnimStaggerItem>
          ))}
        </AnimStaggerContainer>
      </div>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  big_number_dark: ({ number, label, orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col bg-gray-900 text-white p-[58px]" data-pptx="rect">
      <div className="flex-1 flex items-center justify-center">
        <AnimFadeUp>
          <BigNumber number={number} label={label} className="text-white" />
        </AnimFadeUp>
      </div>
      <FooterBar orgName={orgName} pageNumber={pageNumber} className="text-gray-500" />
    </div>
  ),

  cards_3_bar: ({ title, cards, orgName, pageNumber }) => (
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

  closing: ({ message, contact, orgName }) => (
    <div className="w-full h-full flex flex-col items-center justify-center p-[58px] bg-primary text-primary-foreground" data-pptx="rect">
      <AnimFadeUp delay={0.1}>
        <h1 className="text-[61px] font-bold mb-6" data-pptx="text">{message}</h1>
      </AnimFadeUp>
      <AnimFadeUp delay={0.2}>
        <p className="text-[21px] text-primary-foreground/80" data-pptx="text">{contact}</p>
      </AnimFadeUp>
      <FooterBar orgName={orgName} pageNumber={99} className="text-primary-foreground/50" />
    </div>
  ),

  // New Layouts
  chip_grid_callout: ({ title, callout, chips, orgName, pageNumber }) => (
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

  dark_panel_points: ({ darkPanel, points, orgName, pageNumber }) => (
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

  stacked_rows_3: ({ title, rows, orgName, pageNumber }) => (
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

  stats: ({ title, stats, orgName, pageNumber }) => (
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

  timeline: ({ title, events, orgName, pageNumber }) => (
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

  process_steps: ({ title, steps, orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col p-[58px]">
      <AnimFadeUp><TitleWithAccent title={title} className="mb-[48px]" /></AnimFadeUp>
      <AnimStaggerContainer className="flex-1 flex gap-[24px]">
        {steps.map((s: any, i: number) => (
          <AnimStaggerItem key={i} className="flex-1 flex flex-col relative">
            <div className="w-16 h-16 rounded-[12px] bg-primary text-white flex items-center justify-center text-[24px] font-bold mb-6 shadow-md" data-pptx="rect">
              <span data-pptx="text">{i + 1}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="absolute top-8 left-20 right-[-12px] h-[2px] bg-primary/20" data-pptx="rect"></div>
            )}
            <h3 className="text-[21px] font-semibold mb-3" data-pptx="text">{s.title}</h3>
            <p className="text-[19px] text-gray-600" data-pptx="text">{s.body}</p>
          </AnimStaggerItem>
        ))}
      </AnimStaggerContainer>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  comparison: ({ title, left, right, orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col p-[58px]">
      <AnimFadeUp><TitleWithAccent title={title} className="mb-[32px]" /></AnimFadeUp>
      <div className="flex-1 flex gap-[32px]">
        <AnimFadeUp className="flex-1" delay={0.1}>
          <TintCard className="h-full border-t-4 border-t-gray-400">
            <h2 className="text-[24px] font-bold mb-6 text-center" data-pptx="text">{left.title}</h2>
            <div className="flex flex-col gap-[16px]">
              {left.points.map((p: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <Icons.X className="w-6 h-6 text-gray-400 shrink-0 mt-1" data-pptx="icon" />
                  <p className="text-[19px] text-gray-700" data-pptx="text">{p}</p>
                </div>
              ))}
            </div>
          </TintCard>
        </AnimFadeUp>
        <AnimFadeUp className="flex-1" delay={0.2}>
          <TintCard className="h-full border-t-4 border-t-primary bg-primary/5">
            <h2 className="text-[24px] font-bold mb-6 text-center text-primary" data-pptx="text">{right.title}</h2>
            <div className="flex flex-col gap-[16px]">
              {right.points.map((p: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <Icons.Check className="w-6 h-6 text-primary shrink-0 mt-1" data-pptx="icon" />
                  <p className="text-[19px] text-gray-900" data-pptx="text">{p}</p>
                </div>
              ))}
            </div>
          </TintCard>
        </AnimFadeUp>
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

  image_split: ({ title, text, image, imagePos = 'right', orgName, pageNumber }) => (
    <div className={cn("w-full h-full flex", imagePos === 'right' ? "flex-row" : "flex-row-reverse")}>
      <div className="w-1/2 p-[58px] flex flex-col justify-center">
        <AnimFadeUp><TitleWithAccent title={title} className="mb-[32px]" /></AnimFadeUp>
        <AnimFadeUp delay={0.1}>
          <p className="text-[21px] text-gray-700 leading-relaxed" data-pptx="text">{text}</p>
        </AnimFadeUp>
      </div>
      <div className="w-1/2 h-full p-[24px]">
        <AnimFadeUp className="w-full h-full" delay={0.2}>
          <ImageFrame src={image} alt={title} className="w-full h-full" />
        </AnimFadeUp>
      </div>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  image_overlay: ({ title, subtitle, image, orgName, pageNumber }) => (
    <div className="w-full h-full relative flex items-end p-[58px]">
      <div className="absolute inset-0 z-0">
        <ImageFrame src={image} alt={title} className="w-full h-full rounded-none border-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" data-pptx="rect"></div>
      </div>
      <AnimFadeUp className="relative z-10 w-full max-w-3xl text-white">
        <h1 className="text-[61px] font-bold leading-tight mb-4" data-pptx="text">{title}</h1>
        <p className="text-[24px] text-gray-200" data-pptx="text">{subtitle}</p>
      </AnimFadeUp>
      <FooterBar orgName={orgName} pageNumber={pageNumber} className="text-gray-400 z-10" />
    </div>
  ),

  chart: ({ title, data, dataKey, xAxisKey, orgName, pageNumber }) => (
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
