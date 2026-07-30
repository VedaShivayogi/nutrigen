import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  IoPersonCircleOutline,
  IoLogOutOutline,
  IoFlameOutline,
  IoRestaurantOutline,
  IoTrendingUpOutline,
  IoArrowBackOutline,
} from 'react-icons/io5';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import adminService from '../api/adminService';

const AdminDashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminService.isLoggedIn()) {
      navigate('/admin/login');
      return;
    }
    (async () => {
      try {
        const data = await adminService.getAllUsers();
        setUsers(data.users || []);
      } catch (err) {
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const viewUser = async (user) => {
    setSelectedUser(user);
    setHistory(null);
    setHistoryLoading(true);
    try {
      const data = await adminService.getUserHistory(user.uid);
      setHistory(data);
    } catch (err) {
      setHistory({ error: true });
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleLogout = () => {
    adminService.logout();
    navigate('/admin/login');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Every registered user, at a glance</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <IoLogOutOutline /> Logout
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User list */}
          <Card className="lg:col-span-1 max-h-[70vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Users ({users.length})
            </h2>
            <div className="space-y-2">
              {users.map((u) => (
                <button
                  key={u.uid}
                  onClick={() => viewUser(u)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                    selectedUser?.uid === u.uid
                      ? 'bg-primary text-white'
                      : 'hover:bg-primary/10 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <IoPersonCircleOutline className="h-6 w-6 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{u.name || 'Unnamed User'}</p>
                    <p className={`text-xs truncate ${selectedUser?.uid === u.uid ? 'text-white/80' : 'text-gray-400'}`}>
                      {u.email}
                    </p>
                  </div>
                </button>
              ))}
              {users.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No users registered yet.</p>
              )}
            </div>
          </Card>

          {/* Selected user's history */}
          <div className="lg:col-span-2">
            {!selectedUser && (
              <Card className="h-full flex items-center justify-center text-gray-400 py-20">
                Select a user to see their full history
              </Card>
            )}

            {selectedUser && historyLoading && (
              <Card className="flex justify-center py-20"><Spinner /></Card>
            )}

            {selectedUser && !historyLoading && history && !history.error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {history.profile?.name || selectedUser.name}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <Info label="Email" value={history.profile?.email} />
                    <Info label="Age" value={history.profile?.healthDetails?.age} />
                    <Info label="Gender" value={history.profile?.healthDetails?.gender} />
                    <Info label="Height" value={history.profile?.healthDetails?.height ? `${history.profile.healthDetails.height} cm` : ''} />
                    <Info label="Weight" value={history.profile?.healthDetails?.weight ? `${history.profile.healthDetails.weight} kg` : ''} />
                    <Info label="Diet" value={history.profile?.healthDetails?.dietPreference} />
                    <Info label="Goal" value={history.profile?.healthDetails?.goal} />
                    <Info label="Allergies" value={history.profile?.healthDetails?.allergies} />
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <IoFlameOutline className="text-secondary" /> Meal Logging Streak
                  </h3>
                  <p className="text-3xl font-bold text-accent">{history.streak || 0} days</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Last logged: {history.lastLoggedDate || 'never'}
                  </p>
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <IoTrendingUpOutline className="text-accent" /> Weight Progress Entries
                  </h3>
                  {history.progressEntries?.length ? (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                      {history.progressEntries.map((p, i) => (
                        <li key={i} className="py-2 flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">{p.date}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{p.weight} kg</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400">No weight entries logged.</p>
                  )}
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <IoRestaurantOutline className="text-primary" /> Saved Meal Plan
                  </h3>
                  {history.mealPlan ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      A 7-day meal plan is saved for this user.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">No meal plan generated yet.</p>
                  )}
                </Card>
              </motion.div>
            )}

            {selectedUser && !historyLoading && history?.error && (
              <Card className="text-red-500 py-10 text-center">
                Could not load this user's history.
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-gray-400 text-xs uppercase tracking-wide">{label}</p>
    <p className="text-gray-900 dark:text-white font-medium truncate">{value || '—'}</p>
  </div>
);

export default AdminDashboardPage;
