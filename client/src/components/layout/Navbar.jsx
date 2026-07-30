import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  IoNutritionOutline,
  IoHomeOutline,
  IoCalendarOutline,
  IoSearchOutline,
  IoChatbubbleOutline,
  IoPersonOutline,
  IoLogOutOutline,
  IoMenuOutline,
  IoCloseOutline,
  IoSunnyOutline,
  IoMoonOutline,
  IoTrendingUpOutline
} from 'react-icons/io5';
import { logout } from '../../app/features/authSlice';
import Button from '../ui/Button';
import { ThemeContext } from '../../context/ThemeContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: IoHomeOutline },
    { name: 'Meal Planner', path: '/meal-planner', icon: IoCalendarOutline },
    { name: 'Insights', path: '/insights', icon: IoSearchOutline },
    { name: 'Coach', path: '/coach', icon: IoChatbubbleOutline },
    { name: 'Progress', path: '/progress', icon: IoTrendingUpOutline },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-primary/10 bg-white/90 backdrop-blur dark:bg-gray-900/90">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="group flex items-center space-x-2">
            <div className="rounded-2xl bg-gradient-to-r from-primary via-accent to-secondary p-2 shadow-md transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg">
              <IoNutritionOutline className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-xl font-bold text-transparent">
              NutriGen
            </span>
          </Link>

          {isAuthenticated && (
            <div className="hidden items-center space-x-2 md:flex">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 rounded-full px-3 py-2 transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-600 hover:bg-primary/10 hover:text-primary dark:text-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="hidden items-center space-x-3 md:flex">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 rounded-full px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-primary/10 hover:text-primary dark:text-gray-300"
                >
                  <IoPersonOutline className="h-5 w-5" />
                  <span className="font-medium">{user?.name || 'Profile'}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 dark:text-gray-300"
                >
                  <IoLogOutOutline className="h-5 w-5" />
                  Logout
                </Button>
                <button
                  onClick={toggleTheme}
                  className="mr-2 rounded-full p-2 text-gray-600 transition-colors duration-200 hover:bg-primary/10 hover:text-primary dark:text-gray-300"
                >
                  {theme === 'dark' ? <IoSunnyOutline size={20} /> : <IoMoonOutline size={20} />}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="font-medium text-gray-600 transition-colors duration-200 hover:text-primary dark:text-gray-300"
                >
                  Login
                </Link>
                <Button as={Link} to="/register" size="sm">
                  Get Started
                </Button>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-full p-2 text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 md:hidden"
          >
            {isMenuOpen ? <IoCloseOutline size={24} /> : <IoMenuOutline size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-100 py-4 dark:border-gray-700 md:hidden"
          >
            {isAuthenticated ? (
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 rounded-full px-4 py-3 transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-primary/10 hover:text-primary dark:text-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
                <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-600 transition-colors duration-200 hover:text-primary dark:text-gray-300"
                  >
                    <IoPersonOutline className="h-5 w-5" />
                    <span className="font-medium">Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center space-x-3 px-4 py-3 text-left text-gray-600 transition-colors duration-200 hover:text-red-600 dark:text-gray-300"
                  >
                    <IoLogOutOutline className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                  <button
                    onClick={toggleTheme}
                    className="flex w-full items-center space-x-3 px-4 py-3 text-left text-gray-600 transition-colors duration-200 hover:text-primary dark:text-gray-300"
                  >
                    {theme === 'dark' ? <IoSunnyOutline size={20} /> : <IoMoonOutline size={20} />}
                    <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 font-medium text-gray-600 transition-colors duration-200 hover:text-primary dark:text-gray-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-full bg-primary px-4 py-3 text-center font-medium text-white"
                >
                  Get Started
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;