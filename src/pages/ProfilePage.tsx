import React, { useState, useEffect } from 'react';
import { 
  User, 
  Users, 
  TrendingUp, 
  Settings, 
  Shield, 
  Plus,
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertCircle,
  Calendar,
  MessageSquare,
  ExternalLink,
  Trash2,
  Star,
  ArrowLeft,
  LogOut,
  Mail,
  UserPlus,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  Save,
  DollarSign,
  Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserGroup } from '../types/userGroup';
import { GroupPromotion } from '../types/promotion';
import { AddGroupModal } from '../components/AddGroupModal';
import { PromotionModal } from '../components/promotion/PromotionModal';
import { userActivityService } from '../services/userActivityService';

const ProfilePage: React.FC = () => {
  const { user, logout, updateProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // User groups state
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Promotions state
  const [promotions, setPromotions] = useState<GroupPromotion[]>([]);
  const [loadingPromotions, setLoadingPromotions] = useState(true);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotingGroupId, setPromotingGroupId] = useState<string | null>(null);
  
  // Settings state
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
  const [settingsTab, setSettingsTab] = useState<'profile' | 'password' | 'account'>('profile');
  
  // Stats
  const [stats, setStats] = useState({
    totalGroups: 0,
    approvedGroups: 0,
    pendingGroups: 0,
    rejectedGroups: 0,
    totalMembers: 0,
    featuredGroups: 0,
    totalPromotions: 0,
    activePromotions: 0,
    totalSpent: 0
  });
  
  // Activities
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
    
    // Set form data
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || ''
    });
  }, [user]);
  
  // Load user groups
  useEffect(() => {
    if (user) {
      loadUserGroups();
      loadUserPromotions();
      loadUserStats();
      loadUserActivities();
    }
  }, [user]);
  
  // Check URL for active tab
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['overview', 'groups', 'promotions', 'settings'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location]);

  const loadUserGroups = async () => {
    if (!user) return;
    
    setLoadingGroups(true);
    try {
      // Kullanıcının gruplarını localStorage'dan al veya boş array kullan
      const savedGroups = localStorage.getItem(`userGroups_${user.id}`);
      if (savedGroups) {
        const parsedGroups = JSON.parse(savedGroups);
        // Date string'leri Date objelerine çevir
        const formattedGroups = parsedGroups.map((group: any) => ({
          ...group,
          submittedAt: new Date(group.submittedAt),
          reviewedAt: group.reviewedAt ? new Date(group.reviewedAt) : undefined
        }));
        setUserGroups(formattedGroups);
      } else {
        // Yeni kullanıcı için boş array
        setUserGroups([]);
      }
    } catch (error) {
      console.error('Error loading user groups:', error);
      setUserGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };
  
  const loadUserPromotions = async () => {
    if (!user) return;
    
    setLoadingPromotions(true);
    try {
      // Kullanıcının promosyonlarını localStorage'dan al veya boş array kullan
      const savedPromotions = localStorage.getItem(`userPromotions_${user.id}`);
      if (savedPromotions) {
        const parsedPromotions = JSON.parse(savedPromotions);
        // Date string'leri Date objelerine çevir
        const formattedPromotions = parsedPromotions.map((promo: any) => ({
          ...promo,
          startDate: new Date(promo.startDate),
          endDate: new Date(promo.endDate)
        }));
        setPromotions(formattedPromotions);
      } else {
        setPromotions([]);
      }
    } catch (error) {
      console.error('Error loading user promotions:', error);
      setPromotions([]);
    } finally {
      setLoadingPromotions(false);
    }
  };
  
  const loadUserStats = () => {
    if (!user) return;
    
    try {
      // Calculate stats from groups and promotions
      const totalGroups = userGroups.length;
      const approvedGroups = userGroups.filter(g => g.status === 'approved').length;
      const pendingGroups = userGroups.filter(g => g.status === 'pending').length;
      const rejectedGroups = userGroups.filter(g => g.status === 'rejected').length;
      
      // Calculate total members from approved groups
      const totalMembers = userGroups
        .filter(g => g.status === 'approved')
        .reduce((sum, g) => sum + g.members, 0);
      
      // Count featured groups
      const featuredGroups = 0; // This would need to be calculated from actual data
      
      // Calculate promotion stats
      const totalPromotions = promotions.length;
      const activePromotions = promotions.filter(p => 
        p.status === 'active' && new Date(p.endDate) > new Date()
      ).length;
      const totalSpent = promotions.reduce((sum, p) => sum + p.amount, 0);
      
      setStats({
        totalGroups,
        approvedGroups,
        pendingGroups,
        rejectedGroups,
        totalMembers,
        featuredGroups,
        totalPromotions,
        activePromotions,
        totalSpent
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };
  
  const loadUserActivities = async () => {
    if (!user) return;
    
    setActivityLoading(true);
    try {
      // Get user activities from local service
      const activities = await userActivityService.getUserActivities(user.id);
      setRecentActivities(activities);
    } catch (error) {
      console.error('Error loading activities:', error);
      setRecentActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleGroupAdded = (newGroup: any) => {
    // Create a UserGroup object from the new group
    const userGroup: UserGroup = {
      id: newGroup.id,
      userId: user!.id,
      groupName: newGroup.name,
      groupDescription: newGroup.description,
      groupUsername: newGroup.username || newGroup.name.toLowerCase().replace(/\s+/g, ''),
      groupImage: newGroup.image,
      category: newGroup.category,
      tags: newGroup.tags,
      link: newGroup.link,
      members: newGroup.members,
      status: 'pending',
      submittedAt: new Date(),
      submissionNote: 'Telegram API ile eklendi'
    };
    
    // Add to state
    setUserGroups([userGroup, ...userGroups]);
    
    // Close modal
    setShowAddGroupModal(false);
    
    // Update stats
    loadUserStats();
  };
  
  const handlePromoteGroup = (groupId: string) => {
    setPromotingGroupId(groupId);
    setShowPromotionModal(true);
  };

  const handlePromotionSuccess = (promotion: GroupPromotion) => {
    const updatedPromotions = [...promotions, promotion];
    setPromotions(updatedPromotions);
    
    // localStorage'a kaydet
    try {
      localStorage.setItem(`userPromotions_${user!.id}`, JSON.stringify(updatedPromotions));
    } catch (error) {
      console.error('Error saving user promotions:', error);
    }
    
    setShowPromotionModal(false);
    setPromotingGroupId(null);
    
    // Update stats
    loadUserStats();
  };
  
  const handleResubmit = (group: UserGroup) => {
    const updatedGroup = {
      ...group,
      status: 'pending' as const,
      submittedAt: new Date(),
      reviewedAt: undefined,
      rejectionReason: undefined,
      reviewedBy: undefined
    };
    
    const updatedGroups = userGroups.map(g => g.id === group.id ? updatedGroup : g);
    setUserGroups(updatedGroups);
    
    // localStorage'a kaydet
    try {
      localStorage.setItem(`userGroups_${user!.id}`, JSON.stringify(updatedGroups));
    } catch (error) {
      console.error('Error saving user groups:', error);
    }
    
    // Update stats
    loadUserStats();
  };
  
  const handleDeleteGroup = (groupId: string) => {
    if (confirm('Bu grubu silmek istediğinizden emin misiniz?')) {
      const updatedGroups = userGroups.filter(g => g.id !== groupId);
      setUserGroups(updatedGroups);
      
      // localStorage'a kaydet
      try {
        localStorage.setItem(`userGroups_${user!.id}`, JSON.stringify(updatedGroups));
      } catch (error) {
        console.error('Error saving user groups:', error);
      }
      
      // Update stats
      loadUserStats();
    }
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
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Onaylandı';
      case 'rejected':
        return 'Reddedildi';
      case 'pending':
        return 'İnceleniyor';
      default:
        return 'Bilinmiyor';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay} gün önce`;
    } else if (diffHour > 0) {
      return `${diffHour} saat önce`;
    } else if (diffMin > 0) {
      return `${diffMin} dakika önce`;
    } else {
      return 'Az önce';
    }
  };
  
  const formatActivity = (activity: any) => {
    const actionType = activity.action_type;
    const entityType = activity.entity_type;
    const details = activity.action_details || {};
    
    let actionText = '';
    let iconType = '';
    
    if (entityType === 'group') {
      const groupName = details.group_name || 'Bir grup';
      
      if (actionType === 'create') {
        actionText = `${groupName} eklendi`;
        iconType = 'success';
      } else if (actionType === 'update') {
        if (details.status === 'pending') {
          actionText = `${groupName} incelemeye gönderildi`;
          iconType = 'warning';
        } else if (details.status === 'approved') {
          actionText = `${groupName} onaylandı`;
          iconType = 'success';
        } else if (details.status === 'rejected') {
          actionText = `${groupName} reddedildi`;
          iconType = 'error';
        } else {
          actionText = `${groupName} güncellendi`;
          iconType = 'info';
        }
      }
    } else if (entityType === 'promotion') {
      const groupId = details.group_id || '';
      const amount = details.amount || 0;
      
      actionText = `Grup öne çıkarma satın alındı (${amount} USD)`;
      iconType = 'success';
    } else if (entityType === 'user' && actionType === 'login') {
      actionText = 'Giriş yapıldı';
      iconType = 'info';
    }
    
    return {
      text: actionText,
      type: iconType,
      time: formatTimeAgo(new Date(activity.created_at))
    };
  };
  
  const getGroupPromotion = (groupId: string): GroupPromotion | undefined => {
    return promotions.find(p => p.groupId === groupId && p.status === 'active');
  };

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

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: User, hash: '#overview' },
    { id: 'groups', label: 'Gruplarım', icon: Users, hash: '#groups' },
    { id: 'promotions', label: 'Öne Çıkarma', icon: TrendingUp, hash: '#promotions' },
    { id: 'settings', label: 'Ayarlar', icon: Settings, hash: '#settings' },
  ];

  // Mock categories for AddGroupModal
  const categories = [
    { name: 'Teknoloji', icon: () => null, color: 'from-blue-500 to-cyan-500' },
    { name: 'Finans', icon: () => null, color: 'from-green-500 to-emerald-500' },
    { name: 'Sanat', icon: () => null, color: 'from-pink-500 to-rose-500' },
    { name: 'İş', icon: () => null, color: 'from-orange-500 to-amber-500' },
    { name: 'Oyun', icon: () => null, color: 'from-violet-500 to-purple-500' },
    { name: 'Müzik', icon: () => null, color: 'from-red-500 to-pink-500' },
    { name: 'Eğitim', icon: () => null, color: 'from-indigo-500 to-blue-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Home Button */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <div className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center group-hover:border-blue-300 transition-colors">
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
                <div className="flex items-center justify-center sm:justify-start space-x-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.fullName}</h1>
                  {user.role === 'admin' && (
                    <Shield className="w-6 h-6 text-blue-500" />
                  )}
                </div>
                <p className="text-gray-600 text-base sm:text-lg">@{user.username}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                  user.role === 'admin' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {user.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-3xl border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <a
                    key={tab.id}
                    href={tab.hash}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab(tab.id);
                      window.history.replaceState(null, '', tab.hash);
                    }}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Genel Bakış</h2>
                
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-2xl p-4 sm:p-6">
                    <div className="flex items-center space-x-3 mb-2 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.totalGroups}</div>
                        <div className="text-blue-600 text-xs sm:text-sm">Toplam Grup</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white rounded-lg p-2">
                        <div className="text-sm font-bold text-blue-600">{stats.approvedGroups}</div>
                        <div className="text-blue-600 text-xs">Onaylı</div>
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <div className="text-sm font-bold text-yellow-600">{stats.pendingGroups}</div>
                        <div className="text-yellow-600 text-xs">Bekleyen</div>
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <div className="text-sm font-bold text-red-600">{stats.rejectedGroups}</div>
                        <div className="text-red-600 text-xs">Reddedilen</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-2xl p-4 sm:p-6">
                    <div className="flex items-center space-x-3 mb-2 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.featuredGroups}</div>
                        <div className="text-green-600 text-xs sm:text-sm">Öne Çıkan</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-sm font-bold text-green-600">{stats.activePromotions}/{stats.totalPromotions}</div>
                      <div className="text-green-600 text-xs">Aktif/Toplam Promosyon</div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-2xl p-4 sm:p-6">
                    <div className="flex items-center space-x-3 mb-2 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-xl sm:text-2xl font-bold text-purple-600">
                          {stats.totalMembers > 1000 
                            ? `${(stats.totalMembers / 1000).toFixed(1)}K` 
                            : stats.totalMembers}
                        </div>
                        <div className="text-purple-600 text-xs sm:text-sm">Toplam Üye</div>
                      </div>
                    </div>
                    {stats.totalSpent > 0 && (
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-sm font-bold text-purple-600">
                          {formatCurrency(stats.totalSpent)}
                        </div>
                        <div className="text-purple-600 text-xs">Toplam Harcama</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Account Info and Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Hesap Bilgileri</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Ad Soyad</p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{user.fullName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">E-posta</p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base break-all">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Üyelik Tarihi</p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{formatDate(user.createdAt)}</p>
                        </div>
                      </div>
                      {user.lastLogin && (
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600">Son Giriş</p>
                            <p className="font-medium text-gray-900 text-sm sm:text-base">{formatDate(user.lastLogin)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                      Son Aktiviteleriniz
                    </h3>
                    {activityLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                      </div>
                    ) : recentActivities.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivities.map((activity) => {
                          const formattedActivity = formatActivity(activity);
                          return (
                            <div key={activity.id} className="flex items-center space-x-3 p-3 bg-white rounded-xl">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                formattedActivity.type === 'success' ? 'bg-green-100' :
                                formattedActivity.type === 'warning' ? 'bg-yellow-100' :
                                formattedActivity.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                              }`}>
                                <Users className={`w-4 h-4 ${
                                  formattedActivity.type === 'success' ? 'text-green-600' :
                                  formattedActivity.type === 'warning' ? 'text-yellow-600' :
                                  formattedActivity.type === 'error' ? 'text-red-600' : 'text-blue-600'
                                }`} />
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-900">{formattedActivity.text}</p>
                                <p className="text-xs text-gray-500">{formattedActivity.time}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500 text-sm">Henüz aktivite kaydınız bulunmuyor</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Groups Tab */}
            {activeTab === 'groups' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Gruplarım</h2>
                  <button
                    onClick={() => setShowAddGroupModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Yeni Grup Ekle</span>
                  </button>
                </div>
                
                {loadingGroups ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : userGroups.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz grup gönderilmedi</h3>
                    <p className="text-gray-600 mb-6">İlk Telegram grubunuzu inceleme için göndererek başlayın.</p>
                    <button 
                      onClick={() => setShowAddGroupModal(true)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Grup Ekle</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userGroups.map((group) => (
                      <div
                        key={group.id}
                        className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-200"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0 mb-4">
                          <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                            {group.groupImage ? (
                              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-gray-200 flex-shrink-0">
                                <img
                                  src={group.groupImage}
                                  alt={group.groupName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-base sm:text-lg font-bold text-gray-900 truncate">{group.groupName}</h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(group.status)}`}>
                                  {getStatusIcon(group.status)}
                                  <span>{getStatusText(group.status)}</span>
                                </span>
                              </div>
                              
                              <p className="text-gray-600 text-sm mb-3">{group.groupDescription}</p>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-3">
                                <div>
                                  <span className="text-gray-500 text-xs">Kategori</span>
                                  <p className="font-medium text-gray-900 text-xs sm:text-sm">{group.category}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 text-xs">Üye Sayısı</span>
                                  <p className="font-medium text-gray-900 text-xs sm:text-sm">{group.members.toLocaleString()}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 text-xs">Gönderim Tarihi</span>
                                  <p className="font-medium text-gray-900 text-xs sm:text-sm">{formatDate(group.submittedAt)}</p>
                                </div>
                                {group.reviewedAt && (
                                  <div>
                                    <span className="text-gray-500 text-xs">İnceleme Tarihi</span>
                                    <p className="font-medium text-gray-900 text-xs sm:text-sm">{formatDate(group.reviewedAt)}</p>
                                  </div>
                                )}
                              </div>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-2 mb-3">
                                {group.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs whitespace-nowrap"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>

                              {/* Promotion Status */}
                              {(() => {
                                const promotion = getGroupPromotion(group.id);
                                if (promotion) {
                                  const daysLeft = Math.ceil((promotion.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                  return (
                                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-3 mb-3">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Star className="w-4 h-4 text-yellow-500" />
                                        <span className="text-yellow-700 text-sm font-medium">Öne Çıkarılmış</span>
                                      </div>
                                      <p className="text-yellow-600 text-xs">
                                        {daysLeft > 0 ? `${daysLeft} gün kaldı` : 'Bugün sona eriyor'}
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              })()}

                              {/* Rejection Reason */}
                              {group.status === 'rejected' && group.rejectionReason && (
                                <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-3 mb-3">
                                  <div className="flex items-start space-x-2">
                                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <span className="text-red-700 text-sm font-medium">Reddetme Sebebi:</span>
                                      <p className="text-red-600 text-sm mt-1">{group.rejectionReason}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Submission Note */}
                              {group.submissionNote && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl sm:rounded-2xl p-3">
                                  <div className="flex items-start space-x-2">
                                    <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <span className="text-blue-700 text-sm font-medium">Gönderim Notu:</span>
                                      <p className="text-blue-600 text-sm mt-1">{group.submissionNote}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-end space-x-2 sm:ml-4">
                            {group.status === 'approved' && (
                              <button
                                onClick={() => handlePromoteGroup(group.id)}
                                className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors flex-shrink-0"
                                title="Öne Çıkar"
                              >
                                <TrendingUp className="w-4 h-4" />
                              </button>
                            )}

                            <a
                              href={group.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex-shrink-0"
                              title="Grubu Görüntüle"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>

                            {group.status === 'rejected' && (
                              <button
                                onClick={() => handleResubmit(group)}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors flex-shrink-0"
                                title="Yeniden Gönder"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}

                            {group.status === 'pending' && (
                              <button
                                onClick={() => handleDeleteGroup(group.id)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex-shrink-0"
                                title="Sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Promotions Tab */}
            {activeTab === 'promotions' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Öne Çıkarmalarım</h2>
                  <Link
                    to="#groups"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('groups');
                      window.history.replaceState(null, '', '#groups');
                    }}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                  >
                    <Star className="w-5 h-5" />
                    <span>Grup Öne Çıkar</span>
                  </Link>
                </div>
                
                {loadingPromotions ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : promotions.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz öne çıkarma yapmadınız</h3>
                    <p className="text-gray-600 mb-6">Gruplarınızı öne çıkararak daha fazla görünürlük kazanın.</p>
                    <Link
                      to="#groups"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab('groups');
                        window.history.replaceState(null, '', '#groups');
                      }}
                      className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <Star className="w-5 h-5" />
                      <span>İlk Öne Çıkarmayı Yap</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {promotions.map((promotion) => {
                      const daysLeft = Math.ceil((promotion.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      const isActive = promotion.status === 'active' && daysLeft > 0;
                      
                      return (
                        <div
                          key={promotion.id}
                          className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0 mb-4">
                            <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                                isActive 
                                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                                  : 'bg-gray-300'
                              }`}>
                                <Star className={`w-8 h-8 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                                    {userGroups.find(g => g.id === promotion.groupId)?.groupName || 'Grup'}
                                  </h4>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    isActive 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {isActive ? 'Aktif' : 'Süresi Dolmuş'}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4">
                                  <div>
                                    <span className="text-gray-500 text-xs">Başlangıç</span>
                                    <p className="font-medium text-gray-900 text-xs sm:text-sm">{formatDate(promotion.startDate)}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 text-xs">Bitiş</span>
                                    <p className="font-medium text-gray-900 text-xs sm:text-sm">{formatDate(promotion.endDate)}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 text-xs">Ücret</span>
                                    <p className="font-medium text-gray-900 text-xs sm:text-sm">{formatCurrency(promotion.amount)}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 text-xs">Kalan Süre</span>
                                    <p className="font-medium text-gray-900 text-xs sm:text-sm">
                                      {isActive ? `${daysLeft} gün` : 'Süresi dolmuş'}
                                    </p>
                                  </div>
                                </div>

                                {/* Progress Bar for Active Promotions */}
                                {isActive && (
                                  <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-gray-600 text-xs">İlerleme</span>
                                      <span className="text-gray-600 text-xs">
                                        {Math.round(((new Date().getTime() - promotion.startDate.getTime()) / (promotion.endDate.getTime() - promotion.startDate.getTime())) * 100)}%
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                                        style={{
                                          width: `${Math.round(((new Date().getTime() - promotion.startDate.getTime()) / (promotion.endDate.getTime() - promotion.startDate.getTime())) * 100)}%`
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Benefits */}
                                <div className="bg-white rounded-xl p-4">
                                  <h5 className="font-medium text-gray-900 mb-3">Avantajlar</h5>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="flex items-center space-x-2">
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                      <span className="text-gray-700 text-xs sm:text-sm">Ana sayfada öne çıkan</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                      <span className="text-gray-700 text-xs sm:text-sm">Kategori başında</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                      <span className="text-gray-700 text-xs sm:text-sm">Özel rozet</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                      <span className="text-gray-700 text-xs sm:text-sm">Daha fazla görünüm</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Performance Metrics */}
                            <div className="lg:ml-6 text-center lg:text-right">
                              <div className="bg-white rounded-xl p-4 min-w-[120px] mx-auto lg:mx-0">
                                <div className="text-center">
                                  <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">+{Math.floor(Math.random() * 300) + 100}%</div>
                                  <div className="text-purple-600 text-xs sm:text-sm">Görünüm Artışı</div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <div className="flex items-center justify-center space-x-1">
                                    <Eye className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600 text-xs sm:text-sm">{Math.floor(Math.random() * 5000) + 1000}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            
            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Hesap Ayarları</h2>
                
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
                        onClick={() => setSettingsTab(tab.id as any)}
                        className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                          settingsTab === tab.id
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
                {settingsTab === 'profile' && (
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
                {settingsTab === 'password' && (
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
                {settingsTab === 'account' && (
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
            )}
          </div>
        </div>
      </div>
      
      {/* Add Group Modal */}
      <AddGroupModal
        isOpen={showAddGroupModal}
        onClose={() => setShowAddGroupModal(false)}
        onGroupAdded={handleGroupAdded}
        categories={categories}
      />
      
      {/* Promotion Modal */}
      {showPromotionModal && promotingGroupId && (
        <PromotionModal
          isOpen={showPromotionModal}
          onClose={() => {
            setShowPromotionModal(false);
            setPromotingGroupId(null);
          }}
          groupId={promotingGroupId}
          groupName={userGroups.find(g => g.id === promotingGroupId)?.groupName || ''}
          onPromotionSuccess={handlePromotionSuccess}
        />
      )}
    </div>
  );
};

export default ProfilePage;