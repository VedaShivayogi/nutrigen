import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const sections = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'collect', label: 'Information We Collect' },
  { id: 'use', label: 'How We Use Information' },
  { id: 'ai-processing', label: 'AI Processing Notice' },
  { id: 'storage', label: 'Data Storage and Security' },
  { id: 'cookies', label: 'Cookies and Analytics' },
  { id: 'third-party', label: 'Third-party Services' },
  { id: 'rights', label: 'User Rights' },
  { id: 'children', label: "Children's Privacy" },
  { id: 'changes', label: 'Changes to Privacy Policy' },
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

const PrivacyPage = () => {
  useEffect(() => {
    setMeta(
      'Privacy Policy | NutriGen AI',
      'Review the NutriGen AI Privacy Policy, including what information is collected, how it is used, and how user data is protected.'
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
              <p className="text-sm uppercase tracking-[0.4em] text-cyan-300">Privacy Policy</p>
              <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
                NutriGen AI Privacy Policy
              </h1>
              <p className="mt-4 max-w-3xl text-slate-300 leading-8">
                This Privacy Policy explains how NutriGen AI collects, uses, stores, and protects your personal information.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
                <span>Last Updated: July 31, 2026</span>
                <span className="px-3 py-1 rounded-full bg-slate-900/80">Owner: Veda Shivayogi Ramagundanahalli</span>
              </div>
            </div>

            <div className="space-y-8">
              <section id="introduction" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">Introduction</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  NutriGen AI is committed to protecting your privacy. This policy applies to all users of the app and explains how we handle the personal data you share with us.
                </p>
              </section>

              <section id="collect" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">Information We Collect</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  When you use NutriGen AI, we collect information that helps us personalize your nutrition experience.
                </p>
                <ul className="mt-4 list-disc list-inside text-slate-300 leading-7 space-y-2">
                  <li>Name</li>
                  <li>Email</li>
                  <li>Age</li>
                  <li>Height</li>
                  <li>Weight</li>
                  <li>Gender</li>
                  <li>Health information voluntarily provided</li>
                  <li>Uploaded images (if any)</li>
                </ul>
              </section>

              <section id="use" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">How We Use Information</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  We use your data to generate personalized meal plans, improve recommendations, communicate with you, and maintain the app. Your data also helps us analyze usage patterns and enhance the NutriGen AI experience.
                </p>
              </section>

              <section id="ai-processing" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">AI Processing Notice</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  Some user-provided information may be processed by AI systems to produce nutrition recommendations. AI outputs are generated automatically and should be reviewed before acting on them.
                </p>
              </section>

              <section id="storage" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">Data Storage and Security</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  We store your data securely and make reasonable efforts to protect it from unauthorized access. However, no system is completely secure, and we cannot guarantee absolute protection.
                </p>
              </section>

              <section id="cookies" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">Cookies and Analytics</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  NutriGen AI may use cookies and analytics tools to understand how users interact with the site and to improve performance. These technologies do not capture sensitive personal details unless you provide them directly.
                </p>
              </section>

              <section id="third-party" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">Third-party Services</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  We may work with third-party providers to support functionality, analytics, and infrastructure. These providers may receive limited data only as needed to deliver their services.
                </p>
              </section>

              <section id="rights" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">User Rights</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  You may request access to or correction of your personal information. You can also ask us to delete your data, where permitted by law. Contact us for assistance.
                </p>
              </section>

              <section id="children" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">Children's Privacy</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  NutriGen AI is not intended for children under 13. We do not knowingly collect personal information from minors without parental consent.
                </p>
              </section>

              <section id="changes" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">Changes to Privacy Policy</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  We may update this policy from time to time. Continued use of NutriGen AI after updates means you accept the revised policy.
                </p>
              </section>

              <section id="contact" className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
                <h2 className="text-2xl font-semibold text-white">Contact Information</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  If you have questions about this Privacy Policy, contact:
                </p>
                <ul className="mt-4 space-y-2 text-slate-300">
                  <li><strong>Name:</strong> Veda Shivayogi Ramagundanahalli</li>
                  <li><strong>Email:</strong> your-email@example.com</li>
                  <li><strong>GitHub:</strong> <a href="https://github.com/VedaShivayogi" target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200">github.com/VedaShivayogi</a></li>
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

export default PrivacyPage;
