import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const sections = [
  { id: 'acceptance', label: 'Acceptance of Terms' },
  { id: 'description', label: 'About NutriGen AI' },
  { id: 'responsibilities', label: 'User Responsibilities' },
  { id: 'disclaimer', label: 'Nutrition Disclaimer' },
  { id: 'medical', label: 'Medical Disclaimer' },
  { id: 'ip', label: 'Intellectual Property' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'prohibited', label: 'Prohibited Uses' },
  { id: 'termination', label: 'Account Termination' },
  { id: 'changes', label: 'Changes to Terms' },
  { id: 'law', label: 'Governing Law' },
  { id: 'contact', label: 'Contact Information' },
];

const setMeta = (title, description) => {
  document.title = title;
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'description';
    document.head.appendChild(meta);
  }
  meta.content = description;
};

const TermsPage = () => {
  useEffect(() => {
    setMeta(
      'Terms of Service | NutriGen AI',
      'Read NutriGen AI Terms of Service including user responsibilities, AI disclaimers, and governing law for a secure nutrition experience.'
    );
  }, []);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-10 shadow-[0_25px_80px_rgba(15,23,42,0.35)]">
              <p className="text-sm uppercase tracking-[0.4em] text-teal-300">Terms of Service</p>
              <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
                NutriGen AI Terms of Service
              </h1>
              <p className="mt-4 max-w-3xl text-slate-300 leading-8">
                These terms govern your access to NutriGen AI. Please read carefully before using the app, generating nutrition plans, or interacting with our services.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
                <span>Last Updated: July 31, 2026</span>
                <span className="px-3 py-1 rounded-full bg-slate-900/80">Owner: Veda Shivayogi Ramagundanahalli</span>
              </div>
            </div>

            <div className="space-y-8">
              <section id="acceptance" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">Acceptance of Terms</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  By accessing or using NutriGen AI, you agree to be bound by these Terms of Service. If you do not agree, do not use this website or its services.
                </p>
              </section>

              <section id="description" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">Description of NutriGen AI</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  NutriGen AI is an online nutrition platform that delivers personalized meal planning, health insights, and AI-supported guidance. The platform is designed to support healthy eating habits and provide nutrition-related information based on user-provided details.
                </p>
              </section>

              <section id="responsibilities" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">User Responsibilities</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  Users are responsible for providing accurate information and using NutriGen AI in a manner consistent with applicable laws and good health practices. You are responsible for reviewing the recommendations before applying them to your diet or wellness routine.
                </p>
              </section>

              <section id="disclaimer" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">AI-generated Nutrition Recommendations Disclaimer</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  NutriGen AI offers recommendations generated by artificial intelligence. These suggestions are intended for informational purposes only and may not reflect individualized clinical assessment or medical diagnosis. Use the guidance responsibly and validate it against your personal health context.
                </p>
              </section>

              <section id="medical" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">Medical Disclaimer</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  NutriGen AI does not replace professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before making significant changes to your diet, exercise regimen, or health routines.
                </p>
              </section>

              <section id="ip" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">Intellectual Property</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  All content, design, trademarks, and software associated with NutriGen AI are owned by the developer and owner, Veda Shivayogi Ramagundanahalli, unless otherwise stated. You may not reproduce, modify, or distribute copyrighted content without permission.
                </p>
              </section>

              <section id="liability" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">Limitation of Liability</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  NutriGen AI is provided "as is" and "as available." The owner is not liable for any loss, injury, or damages resulting from use of the service. Your use of the platform is at your own risk.
                </p>
              </section>

              <section id="prohibited" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">Prohibited Uses</h2>
                <ul className="mt-4 list-disc list-inside text-slate-300 leading-7 space-y-2">
                  <li>Using NutriGen AI for illegal activities or harmful purposes.</li>
                  <li>Attempting to access restricted systems, data, or administrative areas without authorization.</li>
                  <li>Sharing content that is abusive, discriminatory, or violates third-party rights.</li>
                  <li>Reverse-engineering or redistributing the application code and services.</li>
                </ul>
              </section>

              <section id="termination" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">Account Termination</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  NutriGen AI reserves the right to suspend or terminate accounts that violate these Terms of Service or applicable laws. Termination decisions are made at the sole discretion of the owner.
                </p>
              </section>

              <section id="changes" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">Changes to Terms</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  We may update these terms from time to time. Continued use of NutriGen AI after changes are posted constitutes acceptance of the revised terms.
                </p>
              </section>

              <section id="law" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">Governing Law</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  These Terms are governed by the laws of India. Any disputes arising from NutriGen AI will be subject to the jurisdiction of Indian courts.
                </p>
              </section>

              <section id="contact" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">Contact Information</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  If you have questions about these Terms of Service, contact:
                </p>
                <ul className="mt-4 space-y-2 text-slate-300">
                  <li><strong>Name:</strong> Veda Shivayogi Ramagundanahalli</li>
                  <li><strong>Email:</strong> your-email@example.com</li>
                  <li><strong>GitHub:</strong> <a href="https://github.com/VedaShivayogi" target="_blank" rel="noreferrer" className="text-teal-300 hover:text-teal-200">github.com/VedaShivayogi</a></li>
                </ul>
              </section>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="sticky top-24 hidden h-fit rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-900/20 lg:block"
          >
            <h3 className="text-lg font-semibold text-white">Table of Contents</h3>
            <div className="mt-6 space-y-3 text-slate-300">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="block w-full text-left text-sm transition-colors duration-200 hover:text-white"
                >
                  {section.label}
                </button>
              ))}
            </div>
          </motion.aside>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
