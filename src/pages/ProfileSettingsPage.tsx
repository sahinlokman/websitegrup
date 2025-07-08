import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  Users, 
  TrendingUp,
  Settings, 
  Shield, 
  Mail,
  UserPlus,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Save,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ProfileSettingsPage: React.FC = () => {
  const { user, updateProfile, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'account'>('profile');

  useEffect(() => {
    // Check if user is admin
    if (user && user.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Giriş Yapmanız Gerekiyor</h2>
          <p className="text-gray-600">Bu sayfayı görüntülemek için giriş yapmalısınız.</p>
        </div>
      </div>
    );
  }

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
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
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError('Profil güncellenirken bir hata oluştu');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Lütfen tüm şifre alanlarını doldurun');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır');
      return;
    }

    // Simulated password update
    setTimeout(() => {
      setSuccess('Şifre başarıyla güncellendi');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSuccess(null), 3000);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (date: Date) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Home Button */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors group"
            >
              <div className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center group-hover:border-purple-300 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-medium">Ana Sayfaya Dön</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Çıkış Yap</span>
            </button>
          
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium">Yönetici Paneli</span>
              </Link>
            )}
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6 md:mb-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.fullName}</h1>
                  {user.role === 'admin' && (
                    <Shield className="w-6 h-6 text-blue-500" />
                  )}
                </div>
                <p className="text-gray-600 text-base sm:text-lg">@{user.username}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-3xl border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
              {[
                { path: '/profile', label: 'Genel Bakış', icon: User },
                { path: '/profile/groups', label: 'Gruplarım', icon: Users },
                { path: '/profile/promotions', label: 'Öne Çıkarma', icon: TrendingUp },
                { path: '/profile/settings', label: 'Ayarlar', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      isActive(tab.path)
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Hesap Ayarları</h2>

            {/* Settings Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-2xl p-1 mb-8 w-full overflow-x-auto">
              {[
                { id: 'profile', label: 'Profil Bilgileri', icon: User },
                { id: 'password', label: 'Şifre Değiştir', icon: Lock },
                { id: 'account', label: 'Hesap Bilgileri', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                );
              })}
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

            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleProfileSubmit} className="space-y-6">
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
                        disabled={isLoading}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        placeholder="Ad ve soyadınızı girin"
                      />
                    </div>
                  </div>

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
                        disabled={isLoading}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        placeholder="E-posta adresinizi girin"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 sm:px-8 py-3 rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Kaydediliyor...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Değişiklikleri Kaydet</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Password Settings */}
            {activeTab === 'password' && (
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Mevcut Şifre
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Mevcut şifrenizi girin"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Yeni Şifre
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Yeni şifrenizi girin"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Yeni Şifre Tekrar
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Yeni şifrenizi tekrar girin"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 sm:px-8 py-3 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Lock className="w-5 h-5" />
                    <span>Şifreyi Güncelle</span>
                  </button>
                </form>
              </div>
            )}

            {/* Account Information */}
            {activeTab === 'account' && (
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Hesap Bilgileri</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-200 space-y-1 sm:space-y-0">
                      <span className="text-gray-600">Kullanıcı Adı</span>
                      <span className="font-medium text-gray-900 break-all">@{user.username}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-200 space-y-1 sm:space-y-0">
                      <span className="text-gray-600">Hesap Türü</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === 'admin' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-200 space-y-1 sm:space-y-0">
                      <span className="text-gray-600">Üyelik Tarihi</span>
                      <span className="font-medium text-gray-900 text-sm sm:text-base">{formatDate(user.createdAt)}</span>
                    </div>
                    {user.lastLogin && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 space-y-1 sm:space-y-0">
                        <span className="text-gray-600">Son Giriş</span>
                        <span className="font-medium text-gray-900 text-sm sm:text-base">{formatDate(user.lastLogin)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-red-900 mb-4">Tehlikeli Bölge</h3>
                  <p className="text-red-700 text-xs sm:text-sm mb-4">
                    Aşağıdaki işlemler geri alınamaz. Lütfen dikkatli olun.
                  </p>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 text-white px-4 sm:px-6 py-3 rounded-2xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Hesaptan Çıkış Yap</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;