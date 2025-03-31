import { Link } from 'wouter';
import WalletConnect from './wallet/WalletConnect';
import { useLocation } from 'wouter';

export default function Header() {
  const [location] = useLocation();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-primary mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M17.5 8.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"></path>
                  <path d="M18 16a4 4 0 0 0-8 0"></path>
                  <path d="m16.5 19 2-2"></path>
                  <path d="m18.5 17 2 2"></path>
                </svg>
              </span>
              <span className="font-bold text-xl text-primary">WeatherGuard</span>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex space-x-4">
                <Link href="/">
                  <a className={`${location === '/' ? 'text-primary-dark font-medium' : 'text-neutral-600 hover:text-primary'} transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium`}>
                    Dashboard
                  </a>
                </Link>
                <Link href="/policies">
                  <a className={`${location === '/policies' ? 'text-primary-dark font-medium' : 'text-neutral-600 hover:text-primary'} transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium`}>
                    Policies
                  </a>
                </Link>
                <Link href="/claims">
                  <a className={`${location === '/claims' ? 'text-primary-dark font-medium' : 'text-neutral-600 hover:text-primary'} transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium`}>
                    Claims
                  </a>
                </Link>
                <Link href="/weather-data">
                  <a className={`${location === '/weather-data' ? 'text-primary-dark font-medium' : 'text-neutral-600 hover:text-primary'} transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium`}>
                    Weather Data
                  </a>
                </Link>
              </div>
            </div>
          </div>
          
          <WalletConnect />
          
          <div className="md:hidden">
            <button type="button" className="text-neutral-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
