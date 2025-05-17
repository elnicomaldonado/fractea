'use client';

import PropertyViewer from '../components/PropertyViewer';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Fractea</h1>
        <p className="text-gray-600">Fractional Real Estate Investment Platform</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border rounded-lg p-6 shadow-sm">
          <PropertyViewer propertyId={1} />
        </div>
        
        <div className="border rounded-lg p-6 shadow-sm">
          <PropertyViewer propertyId={2} />
        </div>
      </div>
    </main>
  );
} 