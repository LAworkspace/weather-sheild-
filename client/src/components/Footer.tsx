export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <a href="#" className="text-neutral-600 hover:text-neutral-900">
              Documentation
            </a>
            <a href="https://github.com/ethereum" target="_blank" rel="noopener noreferrer" className="text-neutral-600 hover:text-neutral-900">
              GitHub
            </a>
            <a href="https://sepolia.etherscan.io/" target="_blank" rel="noopener noreferrer" className="text-neutral-600 hover:text-neutral-900">
              Smart Contracts
            </a>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-center md:text-right text-sm text-neutral-600">
              &copy; {new Date().getFullYear()} WeatherGuard DeFi. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
