import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Children Hope Foundation
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Dedicated to transforming lives through clean water access, quality education, healthcare, and emergency food relief across African communities.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/campaigns" className="hover:text-white transition-colors">
                  All Causes & Campaigns
                </Link>
              </li>
              <li>
                <Link to="/transparency" className="hover:text-white transition-colors">
                  Financial Transparency
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Our Story & Mission
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Causes */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Our Focus</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>Clean Water Drilling</li>
              <li>Childhood Education</li>
              <li>Sahel Emergency Relief</li>
              <li>Mobile Health Clinics</li>
              <li>Girls' Education Scholarships</li>
            </ul>
          </div>

          {/* Col 4: Contact info */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Get in Touch</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Lagos, Nigeria & East Africa Regional HQ</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span>info@childrenhope.org</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <span>+234 (0) 800 244 5373</span>
              </li>
              <li className="flex items-center space-x-3">
                <Globe className="w-4 h-4 text-blue-500 shrink-0" />
                <span>www.childrenhope.org</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} Children Hope Foundation. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/transparency" className="hover:text-slate-400">Privacy Policy</Link>
            <Link to="/transparency" className="hover:text-slate-400">Terms of Service</Link>
            <Link to="/admin/login" className="hover:text-slate-400">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
