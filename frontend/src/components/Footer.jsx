import { Film, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-900 border-t border-primary-800 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-accent-500 font-bold text-lg">
              <Film size={24} />
              <span>MTB</span>
            </div>
            <p className="text-gray-400 text-sm">
              Book your favorite movies online with ease and convenience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-accent-400 transition">Home</a></li>
              <li><a href="#" className="hover:text-accent-400 transition">Movies</a></li>
              <li><a href="#" className="hover:text-accent-400 transition">Theaters</a></li>
              <li><a href="#" className="hover:text-accent-400 transition">About Us</a></li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h3 className="font-bold text-white mb-4">Help & Support</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-accent-400 transition">FAQ</a></li>
              <li><a href="#" className="hover:text-accent-400 transition">Contact Us</a></li>
              <li><a href="#" className="hover:text-accent-400 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-accent-400 transition">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-accent-500" />
                <a href="mailto:info@mtb.com" className="hover:text-accent-400 transition">
                  info@mtb.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-accent-500" />
                <a href="tel:+1234567890" className="hover:text-accent-400 transition">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-accent-500 mt-1 flex-shrink-0" />
                <span>123 Movie Street, Cinema City, CC 12345</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-800 pt-8">
          <div className="text-center text-gray-400 text-sm">
            <p>&copy; {currentYear} MTB. All rights reserved. | Developed by Gaurav Rai</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
