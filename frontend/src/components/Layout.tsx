import React, { ReactNode } from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'Radeo | Modern E-commerce Store',
  description = 'Discover premium products on Radeo, your one-stop online shopping destination.'
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="description" content={description} />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="icon" href="/favicon.ico" />
        {/* Add structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Radeo',
              url: 'https://radeo-store.com',
            }),
          }}
        />
      </Head>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Layout;