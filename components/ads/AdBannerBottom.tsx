'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdBannerBottomProps {
  slot: string;
}

export default function AdBannerBottom({ slot }: AdBannerBottomProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const adContainer = document.querySelector(`ins[data-ad-slot="${slot}"]`);
        if (adContainer && adContainer.clientWidth > 0) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [slot]);

  return (
    <div
      className="ad-container overflow-hidden max-w-full"
      style={{ contain: 'layout inline-size' }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', maxWidth: '100%', width: '100%' }}
        data-ad-client="ca-pub-4828862970866548"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
