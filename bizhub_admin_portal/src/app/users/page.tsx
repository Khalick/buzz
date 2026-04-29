"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users as UsersIcon, Shield, Search, SearchX, CheckCircle, AlertTriangle, UserX, UserCheck } from 'lucide-react';
import UserManagementModal from '@/components/UserManagementModal';

interface PlatformUser {
  id: string;
  email: string | null;
  role: string;
  created_at: string;
  suspended?: boolean; // If this column exists
}

export default function UsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch users from public.users table created by the trigger
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || u.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update user role.');
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-outfit">Platform Users</h1>
          <p className="text-[#E0E0E0]/70 text-sm">Manage all registered accounts, change roles, and handle basic support.</p>
        </div>
        <div className="bg-[#1B4332]/40 border border-[#D4AF37]/20 p-4 rounded-xl flex items-center gap-4">
          <div>
            <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider mb-1">Total Users</p>
            <p className="text-2xl font-black text-white">{users.length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1B4332]/40 border border-[#D4AF37]/10 p-4 rounded-xl flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by email or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#0D1F16] border border-[#D4AF37]/20 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]/50"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-[#0D1F16] border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50"
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="merchant">Merchant</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Main Table */}
      <div className="bg-[#1B4332]/20 border border-[#D4AF37]/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D4AF37]"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <SearchX className="h-12 w-12 text-[#E0E0E0]/30 mb-4" />
            <p className="text-[#E0E0E0]/50 font-medium text-lg">No users found matching your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#D4AF37]/10 bg-[#0D1F16]/50">
                  <th className="px-6 py-4 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">User ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#D4AF37] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/10">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#1B4332]/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center font-bold text-[#D4AF37]">
                          {user.email?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="font-semibold text-white">{user.email || 'No email provided'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#E0E0E0]/50 font-mono">
                      {user.id.substring(0, 8)}...{user.id.substring(user.id.length - 4)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                        user.role === 'admin' 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                          : user.role === 'merchant'
                            ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                            : 'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}>
                        {user.role === 'admin' && <Shield size={12} />}
                        {user.role === 'merchant' && <UsersIcon size={12} />}
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#E0E0E0]/70">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-sm font-semibold text-[#D4AF37] hover:text-white transition-colors bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 px-4 py-2 rounded-lg"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedUser && (
        <UserManagementModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onUpdateRole={(role) => {
            handleUpdateRole(selectedUser.id, role);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
