import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IoShieldCheckmarkOutline } from 'react-icons/io5';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import adminService from '../api/adminService';

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminService.login(username, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <div className="flex flex-col items-center mb-6">
            <div className="bg-gradient-to-r from-primary to-accent p-3 rounded-full mb-3">
              <IoShieldCheckmarkOutline className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Access</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Sign in to view all users and their history
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
