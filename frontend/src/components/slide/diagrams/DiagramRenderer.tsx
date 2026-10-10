import React from 'react';
import { DiagramSpec, DiagramNodeSchema } from '@slidewright/shared';
import * as Icons from 'lucide-react';

const renderIcon = (iconName?: string, size = 24, className = "") => {
  if (!iconName) return null;
  const Icon = (Icons as any)[iconName] || Icons.Circle;
  return <Icon size={size} className={className} data-pptx="icon" />;
};

const NodeBox = ({ x, y, width, height, node, rx = 8 }: any) => {
  const isHighlight = node.highlight;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect 
        x={0} y={0} width={width} height={height} rx={rx} 
        className={isHighlight ? "fill-primary stroke-primary" : "fill-muted stroke-border"}
        strokeWidth={2}
        data-pptx="rect"
      />
      <foreignObject x={0} y={0} width={width} height={height}>
        <div className={`w-full h-full flex flex-col items-center justify-center p-2 text-center ${isHighlight ? 'text-primary-foreground' : 'text-foreground'}`}>
          {renderIcon(node.icon, 24, "mb-2")}
          <span className="text-sm font-semibold leading-tight line-clamp-3" data-pptx="text">{node.label}</span>
        </div>
      </foreignObject>
    </g>
  );
};

const FlowDiagram = ({ spec }: { spec: DiagramSpec }) => {
  const nodes = spec.nodes.slice(0, 6);
  const count = nodes.length;
  if (count === 0) return null;
  
  const boxW = 120;
  const boxH = 80;
  const startX = 400 - (count * boxW + (count - 1) * 40) / 2;
  
  return (
    <svg viewBox="0 0 800 400" className="w-full h-full">
      {nodes.map((node, i) => {
        const x = startX + i * (boxW + 40);
        const y = 160;
        return (
          <React.Fragment key={node.id}>
            {i > 0 && (
              <g>
                <line x1={x - 40} y1={y + boxH/2} x2={x} y2={y + boxH/2} stroke="hsl(var(--border))" strokeWidth="3" markerEnd="url(#arrow)" data-pptx="line" />
              </g>
            )}
            <NodeBox x={x} y={y} width={boxW} height={boxH} node={node} rx={8} />
          </React.Fragment>
        );
      })}
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--border))" />
        </marker>
      </defs>
    </svg>
  );
};

const CycleDiagram = ({ spec }: { spec: DiagramSpec }) => {
  const nodes = spec.nodes.slice(0, 6);
  const count = nodes.length;
  if (count === 0) return null;

  const cx = 400, cy = 200, r = 120;
  const boxW = 100, boxH = 80;

  return (
    <svg viewBox="0 0 800 400" className="w-full h-full">
      {nodes.map((node, i) => {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * r - boxW/2;
        const y = cy + Math.sin(angle) * r - boxH/2;
        
        const nextAngle = ((i+1) / count) * Math.PI * 2 - Math.PI / 2;
        const nx = cx + Math.cos(nextAngle) * r;
        const ny = cy + Math.sin(nextAngle) * r;
        const cx_current = cx + Math.cos(angle) * r;
        const cy_current = cy + Math.sin(angle) * r;

        return (
          <React.Fragment key={node.id}>
            {count > 1 && (
               <path 
                 d={`M ${cx_current} ${cy_current} A ${r} ${r} 0 0 1 ${nx} ${ny}`} 
                 fill="none" 
                 stroke="hsl(var(--border))" 
                 strokeWidth="4"
                 markerEnd="url(#arrow)"
                 className="opacity-50"
                 data-pptx="line"
               />
            )}
            <NodeBox x={x} y={y} width={boxW} height={boxH} node={node} rx={100} />
          </React.Fragment>
        );
      })}
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--border))" />
        </marker>
      </defs>
    </svg>
  );
};

// Very basic hierarchy, 1 root, up to 6 children
const HierarchyDiagram = ({ spec }: { spec: DiagramSpec }) => {
  const root = spec.nodes[0];
  const children = spec.nodes.slice(1, 7);
  if (!root) return null;

  const boxW = 120, boxH = 60;
  const startX = 400 - (children.length * boxW + (children.length - 1) * 20) / 2;

  return (
    <svg viewBox="0 0 800 400" className="w-full h-full">
      <NodeBox x={400 - boxW/2} y={50} width={boxW} height={boxH} node={root} />
      {children.length > 0 && <line x1={400} y1={110} x2={400} y2={150} stroke="hsl(var(--border))" strokeWidth="2" data-pptx="line" />}
      
      {children.length > 1 && (
         <line x1={startX + boxW/2} y1={150} x2={startX + (children.length-1)*(boxW+20) + boxW/2} y2={150} stroke="hsl(var(--border))" strokeWidth="2" data-pptx="line" />
      )}
      
      {children.map((child, i) => {
        const x = startX + i * (boxW + 20);
        return (
          <React.Fragment key={child.id}>
            <line x1={x + boxW/2} y1={150} x2={x + boxW/2} y2={180} stroke="hsl(var(--border))" strokeWidth="2" data-pptx="line" />
            <NodeBox x={x} y={180} width={boxW} height={boxH} node={child} />
          </React.Fragment>
        );
      })}
    </svg>
  );
};

const VennDiagram = ({ spec }: { spec: DiagramSpec }) => {
  const n1 = spec.nodes[0], n2 = spec.nodes[1];
  if (!n1 || !n2) return null;
  return (
    <svg viewBox="0 0 800 400" className="w-full h-full">
      <circle cx={320} cy={200} r={140} className="fill-primary/20 stroke-primary" strokeWidth="2" data-pptx="rect" />
      <circle cx={480} cy={200} r={140} className="fill-muted stroke-border mix-blend-multiply" strokeWidth="2" data-pptx="rect" />
      <foreignObject x={180} y={130} width={140} height={140}>
        <div className="flex flex-col items-center justify-center text-center p-2 text-foreground font-semibold" data-pptx="text">{n1.label}</div>
      </foreignObject>
      <foreignObject x={480} y={130} width={140} height={140}>
        <div className="flex flex-col items-center justify-center text-center p-2 text-foreground font-semibold" data-pptx="text">{n2.label}</div>
      </foreignObject>
      {spec.nodes[2] && (
        <foreignObject x={330} y={130} width={140} height={140}>
          <div className="flex flex-col items-center justify-center text-center p-2 text-primary-foreground font-bold" data-pptx="text">{spec.nodes[2].label}</div>
        </foreignObject>
      )}
    </svg>
  );
};

// Generic fallback for others
const GenericList = ({ spec }: { spec: DiagramSpec }) => (
  <svg viewBox="0 0 800 400" className="w-full h-full">
    {spec.nodes.map((n, i) => (
      <NodeBox key={n.id} x={300} y={20 + i * 55} width={200} height={45} node={n} />
    ))}
  </svg>
);

export const DiagramRenderer = ({ spec }: { spec: DiagramSpec }) => {
  let content = null;
  switch (spec.type) {
    case 'flow': content = <FlowDiagram spec={spec} />; break;
    case 'cycle': content = <CycleDiagram spec={spec} />; break;
    case 'hierarchy': content = <HierarchyDiagram spec={spec} />; break;
    case 'venn': content = <VennDiagram spec={spec} />; break;
    // timeline, matrix_2x2, layers, funnel can fall back to generic list for this MVP
    default: content = <GenericList spec={spec} />; break;
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center" aria-label={spec.altText}>
      {content}
      {spec.caption && (
        <p className="mt-4 text-sm text-muted-foreground italic text-center" data-pptx="text">{spec.caption}</p>
      )}
    </div>
  );
};
