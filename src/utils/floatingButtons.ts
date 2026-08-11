import { CSSProperties } from 'react';
import { SiteContent, FloatingButtonCorner } from '../lib/firebase';

export interface ButtonPositionInfo {
  corner: FloatingButtonCorner;
  style: CSSProperties;
  isFloating: boolean;
}

export function computeFloatingPositions(siteContent?: SiteContent) {
  const mascotCorner: FloatingButtonCorner = siteContent?.mascotPosition || 'bottom-right';
  const cartCorner: FloatingButtonCorner = siteContent?.cartPosition || 'top-right';
  const whatsappCorner: FloatingButtonCorner = siteContent?.whatsappPosition || 'top-right';

  const corners: Record<FloatingButtonCorner, string[]> = {
    'bottom-right': [],
    'bottom-left': [],
    'top-left': [],
    'top-right': [],
  };

  corners[mascotCorner].push('mascot');
  
  if (cartCorner !== 'top-right') {
    corners[cartCorner].push('cart');
  }
  
  if (whatsappCorner !== 'top-right') {
    corners[whatsappCorner].push('whatsapp');
  }

  const result: Record<string, ButtonPositionInfo> = {
    mascot: { corner: mascotCorner, style: {}, isFloating: true },
    cart: { corner: cartCorner, style: {}, isFloating: cartCorner !== 'top-right' },
    whatsapp: { corner: whatsappCorner, style: {}, isFloating: whatsappCorner !== 'top-right' },
  };

  (Object.keys(corners) as FloatingButtonCorner[]).forEach((corner) => {
    const list = corners[corner];
    list.forEach((btnKey, idx) => {
      let style: CSSProperties = { position: 'fixed', zIndex: 70 };
      
      if (corner === 'bottom-right') {
        style = { ...style, bottom: `${24 + idx * 72}px`, right: '24px' };
      } else if (corner === 'bottom-left') {
        style = { ...style, bottom: `${24 + idx * 72}px`, left: '24px' };
      } else if (corner === 'top-left') {
        style = { ...style, top: `${88 + idx * 64}px`, left: '24px' };
      } else if (corner === 'top-right') {
        style = { ...style, top: `${88 + idx * 64}px`, right: '24px' };
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
