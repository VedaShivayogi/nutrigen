import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

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

const ContactPage = () => {
  useEffect(() => {
    setMeta(
      'Contact | NutriGen AI',
      'Contact NutriGen AI for support, feedback, or questions about AI-powered nutrition planning and privacy details.'
    );
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-10 shadow-[0_25px_80px_rgba(15,23,42,0.35)]"
        >
          <p className="text-sm uppercase tracking-[0.4em] text-cyan-300">Contact</p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Get in Touch with NutriGen AI
          </h1>
          <p className="mt-4 max-w-3xl text-slate-300 leading-8">
            Have questions or feedback? Reach out to the owner and developer of NutriGen AI for support, partnership inquiries, or privacy-related requests.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="grid gap-8 lg:grid-cols-2"
        >
          <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
            <h2 className="text-2xl font-semibold text-white">Contact Information</h2>
            <p className="mt-4 text-slate-300 leading-7">
              Please use the contact details below for any questions related to NutriGen AI, terms, privacy, or technical support.
            </p>
            <div className="mt-6 space-y-4 text-slate-300">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Name</h3>
                <p className="mt-2 text-lg font-medium text-white">Veda Shivayogi Ramagundanahalli</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Email</h3>
                <p className="mt-2 text-lg font-medium text-teal-300">your-email@example.com</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">GitHub</h3>
                <a
                  href="https://github.com/VedaShivayogi"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block text-lg font-medium text-cyan-300 hover:text-cyan-200"
                >
                  github.com/VedaShivayogi
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-900/20">
            <h2 className="text-2xl font-semibold text-white">Support Topics</h2>
            <ul className="mt-6 space-y-4 text-slate-300 leading-7">
              <li>
                <span className="font-semibold text-white">Terms and Policy:</span> Questions about the legal terms or privacy policy.
              </li>
              <li>
                <span className="font-semibold text-white">Technical Support:</span> Help with logging in, meal planner access, or account issues.
              </li>
              <li>
                <span className="font-semibold text-white">Feedback:</span> Share ideas for improving the AI nutrition experience.
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;
