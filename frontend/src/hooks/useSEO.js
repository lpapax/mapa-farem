// frontend/src/hooks/useSEO.js
import { useEffect } from 'react';

/**
 * useSEO — sets dynamic meta tags for each page
 * @param {object} options
 * @param {string} [options.title] - Page title (appended with " | MapaFarem.cz")
 * @param {string} [options.description] - Meta description
 * @param {string} [options.canonical] - Canonical URL
 * @param {string} [options.ogImage] - Open Graph image URL
 */
export function useSEO({ title, description, canonical, ogImage } = {}) {
  useEffect(() => {
    // Title
    if (title) {
      document.title = title + ' | MapaFarem.cz';
    }

    // Meta description
    if (description) {
      let desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute('content', description);
    }

    // Canonical link
    if (canonical) {
      let can = document.querySelector('link[rel="canonical"]');
      if (can) can.setAttribute('href', canonical);
    }

    // og:title
    if (title) {
      let ogt = document.querySelector('meta[property="og:title"]');
      if (ogt) ogt.setAttribute('content', title + ' | MapaFarem.cz');
      // twitter:title
      let twt = document.querySelector('meta[name="twitter:title"]');
      if (twt) twt.setAttribute('content', title + ' | MapaFarem.cz');
    }

    // og:description
    if (description) {
      let ogd = document.querySelector('meta[property="og:description"]');
      if (ogd) ogd.setAttribute('content', description);
      let twd = document.querySelector('meta[name="twitter:description"]');
      if (twd) twd.setAttribute('content', description);
    }

    // og:url
    if (canonical) {
      let ogu = document.querySelector('meta[property="og:url"]');
      if (ogu) ogu.setAttribute('content', canonical);
    }

    // og:image
    if (ogImage) {
      let ogi = document.querySelector('meta[property="og:image"]');
      if (ogi) ogi.setAttribute('content', ogImage);
      let twi = document.querySelector('meta[name="twitter:image"]');
      if (twi) twi.setAttribute('content', ogImage);
    }

    // Cleanup: restore defaults on unmount
    return () => {
      document.title = 'MapaFarem.cz — Lokální farmy v České republice';
    };
  }, [title, description, canonical, ogImage]);
}
