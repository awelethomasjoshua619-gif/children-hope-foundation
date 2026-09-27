import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Droplets, BookOpen, Utensils, Stethoscope } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const values = [
    { icon: Droplets, title: 'Clean Water First', text: 'Water-borne illness steals more childhoods than anything else. Every community we enter gets safe water before anything else.' },
    { icon: BookOpen, title: 'Education Unlocks Everything', text: 'Schools, books, uniforms and fees — we remove every barrier between a child and their classroom.' },
    { icon: Utensils, title: 'No Child Studies Hungry', text: 'School meals and emergency food relief, because hunger and learning cannot coexist.' },
    { icon: Stethoscope, title: 'Care Where They Live', text: 'Mobile clinics and community health workers bring treatment to children who would never reach a hospital.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Our Story</span>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Every African Child Deserves Hope
        </h1>
        <p className="text-slate-600 leading-relaxed">
          Children Hope Foundation exists for one reason: to make sure no child in the communities we serve is denied
          education, health, food or clean water because of poverty.
        </p>
      </div>

      {/* Mission cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {values.map((v) => (
          <div key={v.title} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <v.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">{v.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{v.text}</p>
          </div>
        ))}
      </div>

      {/* Principles band */}
      <div className="bg-blue-600 rounded-3xl p-10 md:p-14 text-white grid md:grid-cols-3 gap-8 shadow-xl shadow-blue-600/20">
        {[
          { title: 'Dignity First', text: 'We support children as people with voices and dreams, never as props for fundraising.' },
          { title: 'Local Partnership', text: 'African-led organizations design the programs. We fund, amplify and verify.' },
          { title: 'Radical Transparency', text: 'If we cannot show where a Naira went, we do not spend it.' },
        ].map((p) => (
          <div key={p.title} className="space-y-2">
            <h4 className="font-extrabold text-lg">{p.title}</h4>
            <p className="text-blue-100 text-sm leading-relaxed">{p.text}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center space-y-6">
        <h3 className="text-2xl font-black text-slate-900">Ready to change a child's story?</h3>
        <Link
          to="/campaigns"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-0.5"
        >
          Explore Causes & Donate
        </Link>
      </div>
    </div>
  );
};
