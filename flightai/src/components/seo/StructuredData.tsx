import React from 'react';

export default function StructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://aervyn.in/#organization",
        "name": "AERVYN",
        "url": "https://aervyn.in",
        "logo": {
          "@type": "ImageObject",
          "url": "https://aervyn.in/icon.svg"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://aervyn.in/#website",
        "url": "https://aervyn.in",
        "name": "AERVYN",
        "description": "Real-Time Aviation Intelligence",
        "publisher": {
          "@id": "https://aervyn.in/#organization"
        }
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://aervyn.in/#software",
        "name": "AERVYN Flight Tracker",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Web",
        "url": "https://aervyn.in/dashboard",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      },
      {
        "@type": "WebPage",
        "@id": "https://aervyn.in/#webpage",
        "url": "https://aervyn.in",
        "name": "AERVYN | Real-Time Aviation Intelligence",
        "isPartOf": {
          "@id": "https://aervyn.in/#website"
        },
        "about": {
          "@id": "https://aervyn.in/#software"
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
