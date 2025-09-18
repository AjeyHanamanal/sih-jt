import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Careers', href: '#' },
      { name: 'Press', href: '#' },
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'Safety', href: '#' },
      { name: 'Cancellation', href: '#' },
      { name: 'Terms of Service', href: '#' },
    ],
    discover: [
      { name: 'Destinations', href: '/destinations' },
      { name: 'Products', href: '/products' },
      { name: 'Guides', href: '#' },
      { name: 'Events', href: '#' },
    ],
    social: [
      { name: 'Facebook', href: '#', icon: 'facebook' },
      { name: 'Twitter', href: '#', icon: 'twitter' },
      { name: 'Instagram', href: '#', icon: 'instagram' },
      { name: 'YouTube', href: '#', icon: 'youtube' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <span className="ml-2 text-xl font-bold">
                Jharkhand Tourism
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Discover the rich cultural heritage and natural beauty of Jharkhand. 
              Your gateway to authentic tribal experiences and breathtaking landscapes.
            </p>
            <div className="flex space-x-4">
              {footerLinks.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={item.name}
                >
                  <span className="sr-only">{item.name}</span>
                  <div className="h-6 w-6 bg-gray-600 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors duration-200">
                    <span className="text-xs font-bold">
                      {item.name.charAt(0)}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Discover</h3>
            <ul className="space-y-2">
              {footerLinks.discover.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <MapPinIcon className="h-5 w-5 text-primary-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-gray-300">
                  Ranchi, Jharkhand, India
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <PhoneIcon className="h-5 w-5 text-primary-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-gray-300">
                  +91 123 456 7890
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="h-5 w-5 text-primary-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-300">
                  info@jharkhandtourism.com
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © {currentYear} Jharkhand Tourism Platform. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              to="#"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              to="#"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              Terms of Service
            </Link>
            <Link
              to="#"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
