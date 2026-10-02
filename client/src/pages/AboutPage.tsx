import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, HeartPulse, Utensils, Droplets } from 'lucide-react';

const focusAreas = [
  { icon: BookOpen, title: 'Education', description: 'Support access to learning and the resources children need to stay in school.' },
  { icon: HeartPulse, title: 'Healthcare', description: 'Help children and families access essential care and health services.' },
  { icon: Utensils, title: 'Food support', description: 'Respond to food insecurity with practical, accountable assistance.' },
  { icon: Droplets, title: 'Clean water', description: 'Back community water access projects as they are developed and published.' },
];

export const AboutPage: React.FC = () => (
  <div className="mx-auto max-w-7xl space-y-16 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
    <section className="max-w-3xl">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#99782b]">Our purpose</p>
      <h1 className="mt-4 font-serif text-4xl leading-[1.05] tracking-[-0.04em] text-[#16352f] sm:text-6xl">Children deserve the chance to thrive.</h1>
      <p className="mt-6 text-lg leading-8 text-[#5e7069]">Children Hope Foundation is focused on supporting children in Africa through education, healthcare, and food assistance. This site is being built to make each published campaign and its confirmed funding easy to follow.</p>
    </section>

    <section>
      <div className="mb-7 max-w-2xl"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#99782b]">Areas of focus</p><h2 className="mt-2 font-serif text-3xl text-[#16352f]">The work we aim to support</h2></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{focusAreas.map(({ icon: Icon, title, description }) => <article key={title} className="border border-[#d8ddd5] bg-[#fffdf8] p-6"><Icon className="h-6 w-6 text-[#98772d]" /><h3 className="mt-5 font-serif text-2xl text-[#16352f]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#5e7069]">{description}</p></article>)}</div>
    </section>

    <section className="grid gap-8 border-y border-[#d8ddd5] py-10 md:grid-cols-3">{[
      { title: 'Dignity', text: 'Treat children and communities with respect in how programs are designed and communicated.' },
      { title: 'Local context', text: 'Build campaigns around clearly described needs and the communities they are intended to serve.' },
      { title: 'Accountability', text: 'Show campaign targets and update funding totals only after payments are confirmed.' },
    ].map((item) => <div key={item.title}><h3 className="font-serif text-2xl text-[#16352f]">{item.title}</h3><p className="mt-3 text-sm leading-6 text-[#5e7069]">{item.text}</p></div>)}</section>

    <section className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"><div><h2 className="font-serif text-3xl text-[#16352f]">Want to get in touch?</h2><p className="mt-2 text-sm text-[#5e7069]">Use the contact form to send a message.</p></div><Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-[#16352f] px-6 py-3 text-sm font-bold text-white hover:bg-[#244a40]">Contact us <ArrowRight className="h-4 w-4" /></Link></section>
  </div>
);
