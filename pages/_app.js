/**
 * CUSTOM APP COMPONENT (_app.js)
 * 
 * Purpose: This is the root component that wraps every page in the Next.js application.
 * It's used to keep state when navigating between pages, add global CSS, and inject
 * additional data into pages.
 * 
 * Key Features:
 * - Imports global CSS styles that apply to all pages
 * - Wraps all page components with shared layout/state
 * - Persists state across page navigation
 * - Only runs once per session (not on every page change)
 * 
 * This is a standard Next.js App component. Any changes here affect all pages.
 * 
 * Learn more: https://nextjs.org/docs/advanced-features/custom-app
 */

// Import global CSS styles that apply to the entire application
import '../styles/global.css';
 
/**
 * App - The root application component
 * 
 * This component wraps every page in the application. Next.js passes two props:
 * - Component: The active page component being rendered
 * - pageProps: Props for the active page (from getStaticProps, getServerSideProps, etc.)
 * 
 * The component simply renders the active page with its props. You can add:
 * - Global providers (theme, auth, etc.)
 * - Layout components that wrap all pages
 * - Analytics tracking
 * - Error boundaries
 * 
 * @param {object} props - Props passed by Next.js
 * @param {React.Component} props.Component - The active page component
 * @param {object} props.pageProps - Props for the active page
 * @returns {JSX.Element} The rendered page component with its props
 */
export default function App({ Component, pageProps }) {
  // Render the active page component with its props
  // Google Fonts are now loaded in _document.js (the proper Next.js way)
  return <Component {...pageProps} />;
}
