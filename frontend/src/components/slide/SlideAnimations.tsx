import React from 'react';
import { motion } from 'framer-motion';
import { useSlideContext } from './SlideContext';

export const animFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export const animStaggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

export const animDrawLine = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1, transition: { duration: 1, ease: "easeInOut" } }
};

export function AnimFadeUp({ children, className, delay = 0, tag = 'div', style }: any) {
  const { exportMode } = useSlideContext();
  if (exportMode) {
    const Tag = tag;
    return <Tag className={className} style={style}>{children}</Tag>;
  }
  
  const MotionTag = (motion as any)[tag];
  return (
    <MotionTag
      className={className}
      style={style}
      variants={animFadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}

export function AnimStaggerContainer({ children, className, tag = 'div', style }: any) {
  const { exportMode } = useSlideContext();
  if (exportMode) {
    const Tag = tag;
    return <Tag className={className} style={style}>{children}</Tag>;
  }

  const MotionTag = (motion as any)[tag];
  return (
    <MotionTag
      className={className}
      style={style}
      variants={animStaggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {children}
    </MotionTag>
  );
}

export function AnimStaggerItem({ children, className, tag = 'div', style }: any) {
  const { exportMode } = useSlideContext();
  if (exportMode) {
    const Tag = tag;
    return <Tag className={className} style={style}>{children}</Tag>;
  }

  const MotionTag = (motion as any)[tag];
  return (
    <MotionTag
      className={className}
      style={style}
      variants={animFadeUp}
    >
      {children}
    </MotionTag>
  );
}

import { useSpring, useTransform, animate } from 'framer-motion';

export function AnimCountUp({ value, className }: { value: string, className?: string }) {
  const { exportMode } = useSlideContext();
  const safeValue = String(value || '');
  const num = parseFloat(safeValue.replace(/[^0-9.]/g, ''));
  const suffix = safeValue.replace(/[0-9.]/g, '');
  
  const nodeRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (exportMode || isNaN(num) || !nodeRef.current) return;
    
    const controls = animate(0, num, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (val) => {
        if (nodeRef.current) {
          nodeRef.current.textContent = Math.round(val).toString() + suffix;
        }
      }
    });

    return () => controls.stop();
  }, [num, suffix, exportMode]);

  if (exportMode || isNaN(num)) {
    return <span className={className} data-pptx="text">{value}</span>;
  }

  return <span ref={nodeRef} className={className} data-pptx="text">0{suffix}</span>;
}
