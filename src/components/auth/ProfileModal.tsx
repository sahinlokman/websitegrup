import React, { useState } from 'react';
import { X, User, Mail, UserPlus, Loader2, AlertCircle, CheckCircle, Settings, Shield, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { MyGroupsModal } from './MyGroupsModal';
import { LogOut } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: Array<{ name: string; icon: any; color: string }>;
  onGroupAdded?: (group: any) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  categories = [],
  onGroupAdded 
}) => {
  const { user, updateProfile, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showMyGroups, setShowMyGroups] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (user && user.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.fullName.trim() || !formData.email.trim()) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    const updateSuccess = await updateProfile({
      fullName: formData.fullName,
      email: formData.email
    });

    if (updateSuccess) {
      setSuccess('Profil başarıyla güncellendi');
      setIsEditing(false);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError('Profil güncellenirken bir hata oluştu');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const formatDate = (date: Date) => {
    // Date objesi geçerli mi kontrol et
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Bilinmiyor';
    }
    
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Profil</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Avatar */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-white" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <h4 className="text-xl font-bold text-gray-900">{user.fullName}</h4>
            {user.role === 'admin' && (
              <Shield className="w-5 h-5 text-blue-500" />
            )}
          </div>
          <p className="text-gray-600">@{user.username}</p>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
            user.role === 'admin' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {user.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
          </span>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700 text-sm">{success}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Ad Soyad
            </label>
            <div className="relative">
              <UserPlus className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={!isEditing || isLoading}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                placeholder="Ad ve soyadınızı girin"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              E-posta
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing || isLoading}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                placeholder="E-posta adresinizi girin"
              />
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <h4 className="text-gray-900 font-medium text-sm mb-3">Hesap Bilgileri</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Kullanıcı Adı:</span>
                <span className="font-medium">@{user.username}</span>
              </div>
              <div className="flex justify-between">
                <span>Üyelik Tarihi:</span>
                <span className="font-medium">{formatDate(user.createdAt)}</span>
              </div>
              {user.lastLogin && (
                <div className="flex justify-between">
                  <span>Son Giriş:</span>
                  <span className="font-medium">{formatDate(user.lastLogin)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isEditing ? (
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      fullName: user.fullName,
                      email: user.email
                    });
                    setError(null);
                    setSuccess(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <span>Kaydet</span>
                  )}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Settings className="w-5 h-5" />
                <span>Profili Düzenle</span>
              </button>
            )}

            {/* My Groups Button */}
            <button
              type="button"
              onClick={() => setShowMyGroups(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Users className="w-5 h-5" />
              <span>Gruplarım</span>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full bg-red-100 text-red-700 py-3 rounded-2xl font-semibold hover:bg-red-200 transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Çıkış Yap</span>
            </button>

            {/* Admin Panel Button - Only show for admin users */}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={onClose}
                onClick={onClose}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-2xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Shield className="w-5 h-5" />
                <span>Yönetici Paneli</span>
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* My Groups Modal */}
      <MyGroupsModal
        isOpen={showMyGroups}
        onClose={() => setShowMyGroups(false)}
        categories={categories}
        onGroupAdded={onGroupAdded || (() => {})}
      />
    </div>
  );
};