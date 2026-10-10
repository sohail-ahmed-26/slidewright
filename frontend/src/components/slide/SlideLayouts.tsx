import React from 'react';
import { TitleWithAccent, TintCard, DarkCard, IconBadge, BigNumber, FooterBar, ImageFrame } from './SlideComponents';
import * as Icons from 'lucide-react';

export const SlideLayouts: Record<string, React.FC<any>> = {
  cover: ({ title, subtitle, orgName }) => (
    <div className="w-full h-full flex flex-col items-center justify-center p-[58px] text-center">
      <h1 className="text-[61px] font-bold text-gray-900" data-pptx="text">{title}</h1>
      <p className="text-[21px] text-muted-foreground mt-6 max-w-3xl" data-pptx="text">{subtitle}</p>
      <FooterBar orgName={orgName} pageNumber={1} />
    </div>
  ),

  two_cards: ({ title, cards, orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col p-[58px]">
      <TitleWithAccent title={title} className="mb-[32px]" />
      <div className="flex-1 grid grid-cols-2 gap-[32px]">
        {cards.map((c: any, i: number) => (
          <TintCard key={i}>
            <h2 className="text-[21px] font-semibold mb-4" data-pptx="text">{c.title}</h2>
            <p className="text-[19px] text-gray-700" data-pptx="text">{c.body}</p>
          </TintCard>
        ))}
      </div>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  icon_rows: ({ title, rows, orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col p-[58px]">
      <TitleWithAccent title={title} className="mb-[32px]" />
      <div className="flex flex-col gap-[24px] flex-1">
        {rows.map((r: any, i: number) => {
          const IconComp = (Icons as any)[r.icon] || Icons.Check;
          return (
            <div key={i} className="flex items-start gap-[24px]" data-pptx="rect">
              <IconBadge icon={r.icon} />
              <div className="flex-1">
                <h3 className="text-[21px] font-semibold" data-pptx="text">{r.title}</h3>
                <p className="text-[19px] text-gray-600 mt-1" data-pptx="text">{r.body}</p>
              </div>
            </div>
          )
        })}
      </div>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  grid_2x2: ({ title, cards, orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col p-[58px]">
      <TitleWithAccent title={title} className="mb-[32px]" />
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-[32px]">
        {cards.map((c: any, i: number) => (
          <TintCard key={i} className="justify-center items-center text-center">
            {c.icon && <IconBadge icon={c.icon} className="mb-4" />}
            <h3 className="text-[21px] font-semibold mb-2" data-pptx="text">{c.title}</h3>
            <p className="text-[19px] text-gray-600" data-pptx="text">{c.body}</p>
          </TintCard>
        ))}
      </div>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  icon_list_dark_panel: ({ title, darkPanel, list, orgName, pageNumber }) => (
    <div className="w-full h-full flex p-[58px] gap-[32px]">
      <DarkCard className="w-1/3 justify-center items-center text-center">
        {darkPanel.icon && <IconBadge icon={darkPanel.icon} className="mb-6 bg-white/10 text-white" />}
        <h2 className="text-[43px] font-bold leading-tight" data-pptx="text">{darkPanel.title}</h2>
        <p className="text-[21px] text-gray-300 mt-4" data-pptx="text">{darkPanel.subtitle}</p>
      </DarkCard>
      <div className="flex-1 flex flex-col">
        <TitleWithAccent title={title} className="mb-[32px]" />
        <div className="flex flex-col gap-[24px] flex-1">
          {list.map((item: string, i: number) => (
            <div key={i} className="flex items-center gap-[16px]">
              <Icons.ArrowRight className="w-6 h-6 text-primary shrink-0" data-pptx="icon" />
              <p className="text-[21px] text-gray-800" data-pptx="text">{item}</p>
            </div>
          ))}
        </div>
      </div>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  big_number_dark: ({ number, label, orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col bg-gray-900 text-white p-[58px]" data-pptx="rect">
      <div className="flex-1 flex items-center justify-center">
        <BigNumber number={number} label={label} className="text-white" />
      </div>
      <FooterBar orgName={orgName} pageNumber={pageNumber} className="text-gray-500" />
    </div>
  ),

  cards_3_bar: ({ title, cards, orgName, pageNumber }) => (
    <div className="w-full h-full flex flex-col p-[58px]">
      <TitleWithAccent title={title} className="mb-[32px]" />
      <div className="flex-1 grid grid-cols-3 gap-[32px]">
        {cards.map((c: any, i: number) => (
          <TintCard key={i}>
            <h3 className="text-[21px] font-semibold mb-4" data-pptx="text">{c.title}</h3>
            <p className="text-[19px] text-gray-700 flex-1" data-pptx="text">{c.body}</p>
          </TintCard>
        ))}
      </div>
      <FooterBar orgName={orgName} pageNumber={pageNumber} />
    </div>
  ),

  closing: ({ message, contact, orgName }) => (
    <div className="w-full h-full flex flex-col items-center justify-center p-[58px] bg-primary text-primary-foreground" data-pptx="rect">
      <h1 className="text-[61px] font-bold mb-6" data-pptx="text">{message}</h1>
      <p className="text-[21px] text-primary-foreground/80" data-pptx="text">{contact}</p>
      <FooterBar orgName={orgName} pageNumber={99} className="text-primary-foreground/50" />
    </div>
  )
};
