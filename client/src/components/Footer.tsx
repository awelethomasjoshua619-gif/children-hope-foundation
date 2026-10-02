import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { BrandMark } from './BrandMark';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#102a25] pt-16 pb-12 text-[#c3d0c9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <BrandMark size={44} />
              <span className="font-extrabold text-xl text-[#fffdf8] tracking-tight">
                Children Hope Foundation
              </span>
            </div>
            <p className="text-sm text-[#aebfb7] leading-relaxed">
              Our focus is supporting children in Africa through education, healthcare, and food assistance.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-[#fffdf8] font-bold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
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
            <h4 className="text-[#fffdf8] font-bold mb-4 text-sm uppercase tracking-wider">Our Focus</h4>
            <ul className="space-y-2.5 text-sm text-[#aebfb7]">
              <li>Education</li>
              <li>Healthcare</li>
              <li>Food support</li>
              <li>Clean water</li>
            </ul>
          </div>

          {/* Col 4: Contact info */}
          <div>
            <h4 className="text-[#fffdf8] font-bold mb-4 text-sm uppercase tracking-wider">Get in Touch</h4>
            <Link to="/contact" className="inline-flex items-center gap-2 text-sm text-[#aebfb7] hover:text-white">Use the contact form <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center text-xs text-[#82978d]">
          <p>© 2025 Children Hope Foundation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
