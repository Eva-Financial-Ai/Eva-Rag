import React from 'react';

/**
 * Typography Demo Component
 * 
 * Showcases the Bodoni 72 Smallcaps font with various sizes and styles
 */
const TypographyDemo: React.FC = () => {
  return (
    <div className="p-8 bg-white max-w-5xl mx-auto my-8 shadow-lg rounded-lg">
      <div className="border-b border-gray-200 pb-6 mb-6">
        <h1 className="text-3xl font-bold font-bodoni mb-2">Typography Demo - Bodoni 72 Smallcaps</h1>
        <p className="text-gray-600">Showcasing our new primary typeface with various sizes and styles</p>
      </div>

      {/* Font Family Examples */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-bodoni-blue">Font Families</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Primary Font: Bodoni 72 Smallcaps</p>
            <p className="font-bodoni text-xl">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Secondary Font: Book</p>
            <p className="font-book text-xl">The quick brown fox jumps over the lazy dog</p>
          </div>
        </div>
      </div>

      {/* Font Size Examples */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-bodoni-navy">Font Sizes</h2>
        <div className="space-y-3">
          <div className="p-2 border-b border-gray-100">
            <p className="text-7xl font-bodoni">72px - Bodoni 72 Smallcaps</p>
          </div>
          <div className="p-2 border-b border-gray-100">
            <p className="text-6xl font-bodoni">60px Heading</p>
          </div>
          <div className="p-2 border-b border-gray-100">
            <p className="text-5xl font-bodoni">48px Heading</p>
          </div>
          <div className="p-2 border-b border-gray-100">
            <p className="text-4xl font-bodoni">36px Heading</p>
          </div>
          <div className="p-2 border-b border-gray-100">
            <p className="text-3xl font-bodoni">30px Heading</p>
          </div>
          <div className="p-2 border-b border-gray-100">
            <p className="text-2xl font-bodoni">24px Heading</p>
          </div>
          <div className="p-2 border-b border-gray-100">
            <p className="text-xl font-bodoni">20px Paragraph</p>
          </div>
          <div className="p-2 border-b border-gray-100">
            <p className="text-lg font-bodoni">18px Paragraph</p>
          </div>
          <div className="p-2 border-b border-gray-100">
            <p className="text-base font-bodoni">16px Base text</p>
          </div>
          <div className="p-2 border-b border-gray-100">
            <p className="text-sm font-bodoni">14px Small text</p>
          </div>
          <div className="p-2 border-b border-gray-100">
            <p className="text-xs font-bodoni">12px Extra small</p>
          </div>
        </div>
      </div>

      {/* Letter Spacing Examples */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-bodoni-pink">Letter Spacing</h2>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">0% Letter Spacing (Default)</p>
            <p className="font-bodoni text-2xl tracking-normal">THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Tight Letter Spacing (-1%)</p>
            <p className="font-bodoni text-2xl tracking-tight">THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Tighter Letter Spacing (-2.5%)</p>
            <p className="font-bodoni text-2xl tracking-tighter">THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Tightest Letter Spacing (-5%)</p>
            <p className="font-bodoni text-2xl tracking-tightest">THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Wide Letter Spacing (1%)</p>
            <p className="font-bodoni text-2xl tracking-wide">THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Wider Letter Spacing (2.5%)</p>
            <p className="font-bodoni text-2xl tracking-wider">THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Widest Letter Spacing (5%)</p>
            <p className="font-bodoni text-2xl tracking-widest">THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG</p>
          </div>
        </div>
      </div>

      {/* Line Height Examples */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-bodoni-blue">Line Height</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Tight Line Height (1.2)</p>
            <p className="font-bodoni leading-tight">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Normal Line Height (1.5)</p>
            <p className="font-bodoni leading-normal">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Relaxed Line Height (1.7)</p>
            <p className="font-bodoni leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
          </div>
        </div>
      </div>

      {/* Theme Colors */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Theme Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 rounded-lg bg-bodoni-blue text-white">
            <p className="font-bodoni text-xl">Bodoni Blue (#1432E1)</p>
            <p className="mt-2 text-white/80">Used for primary actions and highlights</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg bg-bodoni-pink">
            <p className="font-bodoni text-xl text-gray-800">Bodoni Pink (#F3A8C4)</p>
            <p className="mt-2 text-gray-700">Used for secondary elements and accents</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg bg-bodoni-navy text-white">
            <p className="font-bodoni text-xl">Bodoni Navy (#47B9FF)</p>
            <p className="mt-2 text-white/80">Used for navigation and interactive elements</p>
          </div>
        </div>
      </div>

      {/* Example UI Components */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-bodoni-pink">UI Components</h2>
        <div className="space-y-6">
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-bodoni text-2xl mb-4 text-bodoni-blue">Dashboard Header Example</h3>
            <div className="flex flex-wrap justify-between items-center">
              <div>
                <h4 className="font-bodoni text-3xl">Portfolio Overview</h4>
                <p className="text-gray-600 mt-1">Financial data for Q3 2025</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <button className="px-4 py-2 bg-bodoni-blue text-white font-bodoni rounded-md mr-2">
                  View Reports
                </button>
                <button className="px-4 py-2 border border-bodoni-navy text-bodoni-navy font-bodoni rounded-md">
                  Export Data
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-bodoni text-2xl mb-4 text-bodoni-navy">Card Component Example</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-bodoni text-xl mb-2 text-bodoni-blue">Total Assets</h4>
                <p className="font-bodoni text-3xl">$4.2M</p>
                <p className="text-green-600 text-sm mt-2">↑ 14% from last month</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-bodoni text-xl mb-2 text-bodoni-pink">Active Loans</h4>
                <p className="font-bodoni text-3xl">142</p>
                <p className="text-green-600 text-sm mt-2">↑ 7% from last month</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-bodoni text-xl mb-2 text-bodoni-navy">Loan Success Rate</h4>
                <p className="font-bodoni text-3xl">92%</p>
                <p className="text-green-600 text-sm mt-2">↑ 3% from last month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypographyDemo; 