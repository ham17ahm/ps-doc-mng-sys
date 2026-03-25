import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'DocExtract',
  description: 'Document Information Extraction & Semantic Retrieval System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {/* Top navigation */}
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg text-gray-900 hover:text-blue-700 transition-colors"
            >
              <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                D
              </span>
              DocExtract
            </Link>
            <div className="flex items-center gap-1">
              <NavLink href="/upload">Upload</NavLink>
              <NavLink href="/search">Search</NavLink>
              <NavLink href="/documents">Documents</NavLink>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>

        {/* Footer */}
        <footer className="border-t border-gray-200 mt-16 py-6 text-center text-xs text-gray-400">
          DocExtract — Document Extraction &amp; Semantic Retrieval
        </footer>
      </body>
    </html>
  );
}

function NavLink({ href, children }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
    >
      {children}
    </Link>
  );
}
