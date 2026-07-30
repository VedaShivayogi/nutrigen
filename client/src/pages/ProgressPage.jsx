import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  IoTrendingUpOutline,
  IoAddCircleOutline,
  IoWaterOutline,
  IoBarbellOutline,
  IoFlameOutline,
  IoCheckmarkCircle,
} from 'react-icons/io5';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import progressService from '../api/progressService';
import activityService from '../api/activityService';

const WATER_GOAL_ML = 2500;
const WATER_QUICK_ADDS = [250, 500, 750];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
};

const ProgressPage = () => {
  // Weight state
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // Water state
  const [waterToday, setWaterToday] = useState(0);
  const [waterLoading, setWaterLoading] = useState(true);
  const [waterBusy, setWaterBusy] = useState(false);

  // Exercise state
  const [exerciseEntries, setExerciseEntries] = useState([]);
  const [exerciseLoading, setExerciseLoading] = useState(true);
  const [exerciseSaving, setExerciseSaving] = useState(false);
  const [activity, setActivity] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await progressService.getHistory();
      setEntries(data.entries || []);
    } catch (err) {
      setError('Could not load your progress history yet.');
    } finally {
      setLoading(false);
    }
  };

  const loadWater = async () => {
    try {
      setWaterLoading(true);
      const data = await activityService.getWaterHistory();
      setWaterToday(data.todayTotal || 0);
    } catch (err) {
      // fail quietly, water card just shows 0
    } finally {
      setWaterLoading(false);
    }
  };

  const loadExercise = async () => {
    try {
      setExerciseLoading(true);
      const data = await activityService.getExerciseHistory();
      setExerciseEntries(data.entries || []);
    } catch (err) {
      // fail quietly
    } finally {
      setExerciseLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    loadWater();
    loadExercise();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight) return;
    try {
      setSaving(true);
      setError('');
      await progressService.logEntry(parseFloat(weight), note);
      setWeight('');
      setNote('');
      await loadHistory();
    } catch (err) {
      setError('Could not save that entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddWater = async (amountMl) => {
    try {
      setWaterBusy(true);
      setWaterToday((prev) => prev + amountMl); // optimistic
      await activityService.logWater(amountMl);
    } catch (err) {
      setWaterToday((prev) => Math.max(0, prev - amountMl)); // revert on failure
    } finally {
      setWaterBusy(false);
    }
  };

  const handleLogExercise = async (e) => {
    e.preventDefault();
    if (!activity || !duration) return;
    try {
      setExerciseSaving(true);
      await activityService.logExercise(
        activity,
        parseInt(duration, 10),
        calories ? parseInt(calories, 10) : null
      );
      setActivity('');
      setDuration('');
      setCalories('');
      await loadExercise();
    } catch (err) {
      // keep form values so the user can retry
    } finally {
      setExerciseSaving(false);
    }
  };

  const firstWeight = entries[0]?.weight;
  const latestWeight = entries[entries.length - 1]?.weight;
  const delta = firstWeight != null && latestWeight != null ? (latestWeight - firstWeight).toFixed(1) : null;

  const waterPct = Math.min(100, Math.round((waterToday / WATER_GOAL_ML) * 100));
  const todayMinutes = exerciseEntries
    .filter((e) => e.date === new Date().toISOString().split('T')[0])
    .reduce((sum, e) => sum + (e.duration_minutes || 0), 0);

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 py-8 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <IoTrendingUpOutline className="text-accent" />
          Progress Tracker
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Log your weight, water, and workouts to see your trends over time.
        </p>
      </motion.div>

      {/* Weight tracker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="md:col-span-1">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <IoAddCircleOutline className="text-primary" /> Log Today's Weight
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Weight (kg)"
                type="number"
                step="0.1"
                min="0"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 68.5"
              />
              <Input
                label="Note (optional)"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="How are you feeling?"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" loading={saving} className="w-full">
                Save Entry
              </Button>
            </form>

            {delta !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">Change since first entry</p>
                <p className={`text-2xl font-bold ${delta <= 0 ? 'text-accent' : 'text-secondary'}`}>
                  {delta > 0 ? '+' : ''}{delta} kg
                </p>
              </motion.div>
            )}
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-2">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Weight Trend
            </h2>
            {loading ? (
              <div className="flex justify-center py-16"><Spinner /></div>
            ) : entries.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 py-16 text-center">
                No entries yet — log your first weight to start your trend line.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={entries}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#22C55E"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Water + Exercise tracker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Water */}
        <motion.div variants={itemVariants}>
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <IoWaterOutline className="text-blue-500" /> Water Intake
            </h2>

            {waterLoading ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : (
              <>
                <div className="flex items-end justify-between mb-2">
                  <motion.span
                    key={waterToday}
                    initial={{ scale: 1.15, opacity: 0.6 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className="text-3xl font-bold text-blue-500"
                  >
                    {waterToday} ml
                  </motion.span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    of {WATER_GOAL_ML} ml goal
                  </span>
                </div>

                <div className="w-full h-3 bg-blue-100 dark:bg-gray-700 rounded-full overflow-hidden mb-5">
                  <motion.div
                    className="h-full bg-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${waterPct}%` }}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                  />
                </div>

                {waterPct >= 100 && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1 text-sm text-accent font-medium mb-4"
                  >
                    <IoCheckmarkCircle /> Daily goal reached — nice work!
                  </motion.p>
                )}

                <div className="flex gap-3 flex-wrap">
                  {WATER_QUICK_ADDS.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      disabled={waterBusy}
                      onClick={() => handleAddWater(amount)}
                    >
                      + {amount} ml
                    </Button>
                  ))}
                </div>
              </>
            )}
          </Card>
        </motion.div>

        {/* Exercise */}
        <motion.div variants={itemVariants}>
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <IoBarbellOutline className="text-secondary" /> Exercise Log
            </h2>

            <form onSubmit={handleLogExercise} className="space-y-3 mb-5">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Activity"
                  type="text"
                  required
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="e.g. Running"
                />
                <Input
                  label="Minutes"
                  type="number"
                  min="1"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="30"
                />
              </div>
              <Input
                label="Calories burned (optional)"
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="e.g. 250"
              />
              <Button type="submit" loading={exerciseSaving} variant="secondary" className="w-full">
                Log Workout
              </Button>
            </form>

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>Today's activity</span>
              <span className="font-semibold text-gray-900 dark:text-white">{todayMinutes} min</span>
            </div>

            {exerciseLoading ? (
              <div className="flex justify-center py-6"><Spinner /></div>
            ) : exerciseEntries.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-6">
                No workouts logged yet.
              </p>
            ) : (
              <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {exerciseEntries.map((entry) => (
                    <motion.li
                      key={entry.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{entry.activity}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{entry.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-900 dark:text-white">{entry.duration_minutes} min</p>
                        {entry.calories_est != null && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-end">
                            <IoFlameOutline className="text-secondary" /> {entry.calories_est} kcal
                          </p>
                        )}
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProgressPage;
