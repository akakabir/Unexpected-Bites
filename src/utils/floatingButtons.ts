import { CSSProperties } from 'react';
import { SiteContent, FloatingButtonCorner } from '../lib/firebase';

export interface ButtonPositionInfo {
  corner: FloatingButtonCorner;
  style: CSSProperties;
  isFloating: boolean;
}

export function computeFloatingPositions(siteContent?: SiteContent) {
  const mascotCorner = siteContent?.mascotPosition || 'bottom-right';
  const cartCorner = siteContent?.cartPosition || 'top-right';
  const whatsappCorner = siteContent?.whatsappPosition || 'top-right';
  const stackDirection = siteContent?.floatingButtonsStack || 'vertical';
  const offsetPreset = siteContent?.floatingButtonsOffset || 'standard';

  const baseOffset = offsetPreset === 'compact' ? 12 : offsetPreset === 'high' ? 44 : 24;
  const topBaseOffset = offsetPreset === 'compact' ? 72 : offsetPreset === 'high' ? 104 : 88;
  const gap = stackDirection === 'horizontal' ? 68 : 72;

  const corners: Record<FloatingButtonCorner, string[]> = {
    'bottom-right': [],
    'bottom-left': [],
    'top-left': [],
    'top-right': [],
  };

  if (mascotCorner !== 'hidden' && corners[mascotCorner as FloatingButtonCorner]) {
    corners[mascotCorner as FloatingButtonCorner].push('mascot');
  }
  
  if (cartCorner !== 'top-right' && cartCorner !== 'hidden' && corners[cartCorner as FloatingButtonCorner]) {
    corners[cartCorner as FloatingButtonCorner].push('cart');
  }
  
  if (whatsappCorner !== 'top-right' && whatsappCorner !== 'hidden' && corners[whatsappCorner as FloatingButtonCorner]) {
    corners[whatsappCorner as FloatingButtonCorner].push('whatsapp');
  }

  const result: Record<string, ButtonPositionInfo> = {
    mascot: { corner: mascotCorner as FloatingButtonCorner, style: mascotCorner === 'hidden' ? { display: 'none' } : {}, isFloating: mascotCorner !== 'hidden' },
    cart: { corner: cartCorner as FloatingButtonCorner, style: cartCorner === 'hidden' ? { display: 'none' } : {}, isFloating: cartCorner !== 'top-right' && cartCorner !== 'hidden' },
    whatsapp: { corner: whatsappCorner as FloatingButtonCorner, style: whatsappCorner === 'hidden' ? { display: 'none' } : {}, isFloating: whatsappCorner !== 'top-right' && whatsappCorner !== 'hidden' },
  };

  (Object.keys(corners) as FloatingButtonCorner[]).forEach((corner) => {
    const list = corners[corner];
    list.forEach((btnKey, idx) => {
      let style: CSSProperties = { position: 'fixed', zIndex: 70 };
      
      if (stackDirection === 'horizontal') {
        if (corner === 'bottom-right') {
          style = { ...style, bottom: `${baseOffset}px`, right: `${baseOffset + idx * gap}px` };
        } else if (corner === 'bottom-left') {
          style = { ...style, bottom: `${baseOffset}px`, left: `${baseOffset + idx * gap}px` };
        } else if (corner === 'top-left') {
          style = { ...style, top: `${topBaseOffset}px`, left: `${baseOffset + idx * gap}px` };
        } else if (corner === 'top-right') {
          style = { ...style, top: `${topBaseOffset}px`, right: `${baseOffset + idx * gap}px` };
        }
      } else {
        // Vertical stack
        if (corner === 'bottom-right') {
          style = { ...style, bottom: `${baseOffset + idx * gap}px`, right: `${baseOffset}px` };
        } else if (corner === 'bottom-left') {
          style = { ...style, bottom: `${baseOffset + idx * gap}px`, left: `${baseOffset}px` };
        } else if (corner === 'top-left') {
          style = { ...style, top: `${topBaseOffset + idx * (gap - 8)}px`, left: `${baseOffset}px` };
        } else if (corner === 'top-right') {
          style = { ...style, top: `${topBaseOffset + idx * (gap - 8)}px`, right: `${baseOffset}px` };
        }
      }
      
      result[btnKey] = {
        corner,
        style,
        isFloating: btnKey === 'mascot' || corner !== 'top-right',
      };
    });
  });

  return result;
}
