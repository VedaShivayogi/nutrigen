import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IoNutritionOutline,
  IoCalendarOutline,
  IoSearchOutline,
  IoChatbubbleOutline,
  IoCheckmarkCircleOutline,
  IoArrowForwardOutline,
  IoStatsChartOutline,
  IoShieldCheckmarkOutline,
  IoFlashOutline,
  IoSparklesOutline,
  IoLeafOutline,
  IoHappyOutline,
  IoPulseOutline
} from 'react-icons/io5';
import Button from '../components/ui/Button';

const LandingPage = () => {
  const features = [
    {
      icon: IoCalendarOutline,
      title: 'Bright meal plans',
      description: 'Turn your goals into cheerful weekly plans with simple recipes and grocery help.',
      color: 'from-primary to-primary-light'
    },
    {
      icon: IoSearchOutline,
      title: 'Friendly insights',
      description: 'Learn what is in your food with quick, easy-to-read nutrition breakdowns.',
      color: 'from-secondary to-secondary-light'
    },
    {
      icon: IoChatbubbleOutline,
      title: 'A caring coach',
      description: 'Ask questions anytime and get warm, practical support that feels like a helpful buddy.',
      color: 'from-primary-light to-secondary'
    }
  ];

  const benefits = [
    { icon: IoCheckmarkCircleOutline, text: 'Personal plans that feel easy and encouraging' },
    { icon: IoCheckmarkCircleOutline, text: 'Simple nutrition tips you can use every day' },
    { icon: IoCheckmarkCircleOutline, text: 'Smart advice that adapts to your routine' },
    { icon: IoCheckmarkCircleOutline, text: 'A calm, joyful experience from first click to daily use' }
  ];

  const stats = [
    { icon: IoStatsChartOutline, number: '10,000+', label: 'Foods checked' },
    { icon: IoShieldCheckmarkOutline, number: '99.9%', label: 'Helpful accuracy' },
    { icon: IoFlashOutline, number: '<1s', label: 'Fast replies' },
    { icon: IoNutritionOutline, number: '24/7', label: 'Support vibe' }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(96,181,255,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(255,145,73,0.16),_transparent_25%),linear-gradient(135deg,_#fffdf8_0%,_#f7fbff_45%,_#fff5eb_100%)] transition-colors duration-300">
      <section className="relative overflow-hidden pt-20 pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.7)_0%,_transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-7"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-2 text-sm font-medium text-primary shadow-sm">
                <IoSparklesOutline className="h-4 w-4" />
                Friendly AI nutrition buddy
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-gray-900">
                  Eat better,
                  <span className="block bg-gradient-to-r from-primary via-primary-dark to-secondary bg-clip-text text-transparent">
                    smile more
                  </span>
                </h1>
                <p className="max-w-2xl text-lg sm:text-xl text-gray-600 leading-relaxed">
                  NutriGen makes healthy eating feel fun, simple, and warm with personalized meal ideas, quick nutrition insight, and a coach that really gets you.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button as={Link} to="/register" size="lg" className="text-lg px-7 py-4">
                  Start my plan
                  <IoArrowForwardOutline className="ml-1" />
                </Button>
                <Button as={Link} to="/login" variant="outline" size="lg" className="text-lg px-7 py-4">
                  Meet the coach
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="bubble-pill"><IoLeafOutline className="h-4 w-4" /> Fresh ideas</span>
                <span className="bubble-pill"><IoHappyOutline className="h-4 w-4" /> Easy habits</span>
                <span className="bubble-pill"><IoPulseOutline className="h-4 w-4" /> Smart support</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="rounded-[2rem] border border-primary/20 bg-white/80 p-5 shadow-[0_25px_80px_-20px_rgba(96,181,255,0.4)] backdrop-blur"
            >
              <div className="rounded-[1.5rem] bg-gradient-to-br from-primary/10 via-white to-secondary/10 p-6">
                <div className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Today’s vibe</p>
                    <p className="text-lg font-bold text-gray-900">Balanced and bright</p>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <IoNutritionOutline className="h-7 w-7" />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-gray-100 bg-white p-4">
                    <p className="text-sm text-gray-500">Meal plan</p>
                    <p className="mt-1 text-xl font-bold text-gray-900">3 easy swaps</p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-white p-4">
                    <p className="text-sm text-gray-500">Coach tip</p>
                    <p className="mt-1 text-xl font-bold text-gray-900">Hydrate first</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Daily goal progress</span>
                    <span className="font-semibold text-primary">82%</span>
                  </div>
                  <div className="mt-3 h-2.5 rounded-full bg-white">
                    <div className="h-2.5 w-[82%] rounded-full bg-gradient-to-r from-primary to-secondary" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="rounded-2xl border border-white/70 bg-white/70 p-4 text-center shadow-sm"
                >
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-xl font-bold text-gray-900">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              A little help for every step
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-gray-600">
              Everything is designed to feel welcoming, not overwhelming.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  viewport={{ once: true, margin: '-80px' }}
                  className="h-full"
                >
                  <div className="soft-card h-full rounded-[1.75rem] p-7 text-center">
                    <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r ${feature.color} text-white shadow-lg`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                    <p className="mt-3 text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] items-center rounded-[2rem] border border-primary/15 bg-white/80 p-8 shadow-[0_20px_60px_-20px_rgba(96,181,255,0.25)]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900">
                Why it feels so easy
              </h2>
              <p className="mt-3 text-lg text-gray-600">
                The experience is built to feel calm, clear, and encouraging from your very first step.
              </p>
              <div className="mt-6 space-y-3">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className="flex items-center gap-3 rounded-2xl bg-primary/5 px-4 py-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="text-gray-700">{benefit.text}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="rounded-[1.75rem] border border-secondary/20 bg-gradient-to-br from-secondary/10 to-primary/10 p-6"
            >
              <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Your daily snapshot</p>
                <div className="mt-4 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                    <span>Calories</span>
                    <span className="font-semibold text-gray-900">245 kcal</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                    <span>Protein</span>
                    <span className="font-semibold text-gray-900">18.5g</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                    <span>Hydration</span>
                    <span className="font-semibold text-gray-900">2.1L</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 pb-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="rounded-[2rem] bg-gradient-to-r from-primary to-secondary p-8 text-white shadow-[0_20px_60px_-20px_rgba(96,181,255,0.5)]"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">Ready for a happier routine?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-white/90">
              Create a plan that feels good, looks friendly, and keeps you motivated every day.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button as={Link} to="/register" variant="outline" size="lg" className="bg-white text-primary border-white hover:bg-gray-50">
                Start free
                <IoArrowForwardOutline className="ml-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;