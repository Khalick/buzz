import { X, Shield } from 'lucide-react';

interface PlatformUser {
  id: string;
  email: string | null;
  role: string;
  created_at: string;
}

interface UserManagementModalProps {
  user: PlatformUser;
  onClose: () => void;
  onUpdateRole: (role: string) => void;
}

export default function UserManagementModal({ user, onClose, onUpdateRole }: UserManagementModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0D1F16] border border-[#D4AF37]/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-[#D4AF37]/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Manage User</h2>
          <button onClick={onClose} className="text-[#E0E0E0]/50 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Account Details</p>
            <p className="text-white font-medium">{user.email || 'No email'}</p>
            <p className="text-xs text-[#E0E0E0]/50 font-mono">ID: {user.id}</p>
            <p className="text-xs text-[#E0E0E0]/50">Joined: {new Date(user.created_at).toLocaleString()}</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Change Role</p>
            
            <button 
              onClick={() => onUpdateRole('user')}
              className={`w-full flex items-center justify-between p-4 rounded-xl border ${user.role === 'user' ? 'bg-green-500/20 border-green-500/50' : 'bg-[#1B4332]/40 border-[#D4AF37]/10 hover:border-[#D4AF37]/30'} transition-colors`}
            >
              <div className="text-left">
                <p className={`font-bold ${user.role === 'user' ? 'text-green-400' : 'text-white'}`}>Standard User</p>
                <p className="text-xs text-[#E0E0E0]/60">Can view directories and claim deals.</p>
              </div>
            </button>

            <button 
              onClick={() => onUpdateRole('merchant')}
              className={`w-full flex items-center justify-between p-4 rounded-xl border ${user.role === 'merchant' ? 'bg-[#D4AF37]/20 border-[#D4AF37]/50' : 'bg-[#1B4332]/40 border-[#D4AF37]/10 hover:border-[#D4AF37]/30'} transition-colors`}
            >
              <div className="text-left">
                <p className={`font-bold ${user.role === 'merchant' ? 'text-[#D4AF37]' : 'text-white'}`}>Merchant</p>
                <p className="text-xs text-[#E0E0E0]/60">Can manage business profiles and offers.</p>
              </div>
            </button>

            <button 
              onClick={() => {
                if (confirm('Are you SURE you want to grant this user ADMIN privileges?')) {
                  onUpdateRole('admin');
                }
              }}
              className={`w-full flex items-center justify-between p-4 rounded-xl border ${user.role === 'admin' ? 'bg-red-500/20 border-red-500/50' : 'bg-[#1B4332]/40 border-[#D4AF37]/10 hover:border-[#D4AF37]/30'} transition-colors`}
            >
              <div className="text-left">
                <p className={`font-bold flex items-center gap-2 ${user.role === 'admin' ? 'text-red-400' : 'text-white'}`}>
                  System Admin <Shield size={14} />
                </p>
                <p className="text-xs text-[#E0E0E0]/60">Full access to the Master Control Portal.</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
