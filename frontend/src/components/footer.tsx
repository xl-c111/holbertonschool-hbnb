import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">HBnB</h3>
            <p className="text-sm text-gray-600">
              Curated stays for design-conscious travelers.
            </p>
          </div>

          {/* Hosting */}
          <div>
            <h4 className="font-medium mb-3">Hosting</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/host" className="text-gray-600 hover:text-black transition">
                  Become a Host
                </Link>
              </li>
              <li>
                <Link to="/host" className="text-gray-600 hover:text-black transition">
                  List Your Property
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-medium mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:support@hbnb.com" className="text-gray-600 hover:text-black transition">
                  Contact Us
                </a>
              </li>
              <li>
                <Link to="/cancellation-policy" className="text-gray-600 hover:text-black transition">
                  Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-medium mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-black transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-black transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} HBnB. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>Built with React & Flask</span>
            <span>•</span>
            <span>Deployed on AWS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
