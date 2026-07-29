import React from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

const LOADER_CSS = `
  body { background-color: #FEF3DE; }
  /* Nunca permitir paneo horizontal de la página: los carruseles tienen su
     propio scroll interno; cualquier desborde accidental queda contenido. */
  html, body, #root {
    overflow-x: hidden;
    max-width: 100vw;
  }
  #gia-loader {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    background-color: #FEF3DE;
    transition: opacity 0.35s ease;
    pointer-events: none;
  }
  #gia-loader.gia-hidden { opacity: 0; }
  .gia-loader-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 44px;
    letter-spacing: 6px;
    color: #364266;
  }
  .gia-loader-sub {
    font-family: Georgia, 'Times New Roman', serif;
    font-style: italic;
    font-size: 16px;
    color: #897863;
  }
  .gia-loader-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #C6BF81;
    animation: gia-pulse 0.9s ease-in-out infinite;
  }
  @keyframes gia-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.6); opacity: 0.5; }
  }
`;

/** Oculta el loader cuando React monta la app dentro de #root. */
const LOADER_JS = `
  (function () {
    var tries = 0;
    var timer = setInterval(function () {
      var root = document.getElementById('root');
      var loader = document.getElementById('gia-loader');
      if (!loader) { clearInterval(timer); return; }
      if ((root && root.children.length > 0) || tries++ > 600) {
        loader.classList.add('gia-hidden');
        setTimeout(function () { loader.remove(); }, 400);
        clearInterval(timer);
      }
    }, 80);
  })();
`;

/**
 * Shell HTML de la versión web: fondo crema GIA desde el primer byte y un
 * loader instantáneo (CSS puro) mientras descarga el bundle de JavaScript.
 */
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <title>Gia Gelatería</title>
        <link rel="icon" href="/favicon.ico" />
        {/* Acelera los embeds cuando llegan a cargarse */}
        <link rel="preconnect" href="https://www.instagram.com" />
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="dns-prefetch" href="https://www.instagram.com" />
        <link rel="dns-prefetch" href="https://www.google.com" />

        {/* Vista previa al compartir (WhatsApp, redes) — Open Graph */}
        <meta
          name="description"
          content="Gelato artesanal con alma clásica y sabor inolvidable. Entre el cielo y GIA… me quedo aquí. ✨"
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Gia Gelatería" />
        <meta property="og:title" content="Gia Gelatería — Auténtico Gelato Artesanal" />
        <meta
          property="og:description"
          content="Gelato artesanal con alma clásica y sabor inolvidable. Entre el cielo y GIA… me quedo aquí. ✨"
        />
        <meta property="og:url" content="https://giagelateria.com/" />
        <meta property="og:image" content="https://giagelateria.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="es_CO" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Gia Gelatería — Auténtico Gelato Artesanal" />
        <meta
          name="twitter:description"
          content="Gelato artesanal con alma clásica y sabor inolvidable. Entre el cielo y GIA… me quedo aquí. ✨"
        />
        <meta name="twitter:image" content="https://giagelateria.com/og-image.jpg" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: LOADER_CSS }} />
      </head>
      <body>
        <div id="gia-loader">
          <div className="gia-loader-title">GIA</div>
          <div className="gia-loader-sub">Gelatería</div>
          <div className="gia-loader-dot" />
        </div>
        {children}
        <script dangerouslySetInnerHTML={{ __html: LOADER_JS }} />
      </body>
    </html>
  );
}
