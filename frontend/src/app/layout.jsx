import './globals.css';

export const metadata = {
  title: 'Fractea - Fractional Real Estate Investment',
  description: 'Invest in real estate properties with fractional ownership',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
} 