'use client';

import Script from 'next/script';

export default function GoogleTagManager() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'G-2ZQ61DFQDX';

  if (!gtmId) {
    return null;
  }

  // If it's a GA4 / Google Tag (starts with G- or GT- or AW-)
  if (gtmId.startsWith('G-') || gtmId.startsWith('GT-') || gtmId.startsWith('AW-')) {
    return (
      <>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${gtmId}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gtmId}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </>
    );
  }

  // Standard Google Tag Manager (GTM-XXXXXXX)
  return (
    <>
      {/* Google Tag Manager - Script */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
        }}
      />
      {/* Google Tag Manager - NoScript (noscript) */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
}
