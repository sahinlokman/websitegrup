import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Plus, 
  CheckSquare, 
  TrendingUp, 
  Clock, 
  Star, 
  Flag,
  AlertCircle,
  Eye,
  RefreshCw,
  UserCog,
} from 'lucide-react';

interface DashboardStats {
  totalGroups: number;
  pendingGroups: number;
  totalMembers: number;
  featuredGroups: number;
  todayViews: number;
  weeklyGrowth: number;
}

// Cache temizleme fonksiyonu
const clearCache = () => {
  try {
    // LocalStorage'daki tüm cache verilerini temizle
    // Kullanıcı verilerini ve grupları koruyarak sadece cache'i temizle
    const keysToKeep = ['user', 'allUsers'];
    const groupsData = localStorage.getItem('groups');
    const publicGroupsData = localStorage.getItem('publicGroups');
    const pendingCount = localStorage.getItem('pendingGroupsCount');
    const approvedCount = localStorage.getItem('approvedGroupsCount');
    const rejectedCount = localStorage.getItem('rejectedGroupsCount');
    
    // Kullanıcı gruplarını sakla
    const userGroupsKeys: string[] = [];
    const userGroupsData: Record<string, string> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('userGroups_')) {
        userGroupsKeys.push(key);
        userGroupsData[key] = localStorage.getItem(key) || '';
      }
    }
    
    // Kullanıcı promosyonlarını sakla
    const userPromotionsKeys: string[] = [];
    const userPromotionsData: Record<string, string> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('userPromotions_')) {
        userPromotionsKeys.push(key);
        userPromotionsData[key] = localStorage.getItem(key) || '';
      }
    }
    
    // LocalStorage'ı temizle
    localStorage.clear();
    
    // Önemli verileri geri yükle
    keysToKeep.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) localStorage.setItem(key, value);
    });
    
    // Grup verilerini geri yükle
    if (groupsData) localStorage.setItem('groups', groupsData);
    if (publicGroupsData) localStorage.setItem('publicGroups', publicGroupsData);
    if (pendingCount) localStorage.setItem('pendingGroupsCount', pendingCount);
    if (approvedCount) localStorage.setItem('approvedGroupsCount', approvedCount);
    if (rejectedCount) localStorage.setItem('rejectedGroupsCount', rejectedCount);
    
    // Kullanıcı gruplarını geri yükle
    userGroupsKeys.forEach(key => {
      localStorage.setItem(key, userGroupsData[key]);
    });
    
    // Kullanıcı promosyonlarını geri yükle
    userPromotionsKeys.forEach(key => {
      localStorage.setItem(key, userPromotionsData[key]);
    });
    
    // Tarayıcı önbelleğini temizle (sadece uygulama verilerini)
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.startsWith('app-cache-')) {
            caches.delete(cacheName);
          }
        });
      });
    }
    
    // Sayfa yenileme olayını tetikle
    window.dispatchEvent(new Event('storage'));
    
    // Başarılı mesajı göster
    alert('Önbellek başarıyla temizlendi!');
    
    // Sayfayı yenile
    window.location.reload();
  } catch (error) {
    console.error('Cache temizleme hatası:', error);
    alert('Önbellek temizlenirken bir hata oluştu!');
  }
};
export const AdminDashboard: React.FC = () => {
  // Mock data - gerçek uygulamada API'den gelecek
  const [stats, setStats] = useState<DashboardStats>({
    totalGroups: 0,
    pendingGroups: 0,
    totalMembers: 0,
    featuredGroups: 0,
    todayViews: 0,
    weeklyGrowth: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, action: 'Yeni grup eklendi', group: 'React Developers TR', time: '2 saat önce', type: 'success' as const },
    { id: 2, action: 'Grup onay bekliyor', group: 'Vue.js Türkiye', time: '4 saat önce', type: 'warning' as const },
    { id: 3, action: 'SEO güncellendi', group: 'Ana Sayfa', time: '6 saat önce', type: 'info' as const },
    { id: 4, action: 'Grup reddedildi', group: 'Spam Group', time: '1 gün önce', type: 'error' as const },
  ]);
  
  useEffect(() => {
    // İstatistikleri hesapla
    const calculateStats = () => {
      // Sayaçları localStorage'dan al
      const approvedCount = localStorage.getItem('approvedGroupsCount');
      const rejectedCount = localStorage.getItem('rejectedGroupsCount');
      
      setIsLoading(true);
      
      // Toplam grup sayısı
      let totalGroups = 0;
      let totalMembers = 0;
      let featuredGroups = 0;
      
      // localStorage'dan grupları al
      try {
        const savedGroups = localStorage.getItem('groups');
        if (savedGroups) {
          const groups = JSON.parse(savedGroups);
          totalGroups = groups.length;
          totalMembers = groups.reduce((sum: number, group: any) => sum + group.members, 0);
          featuredGroups = groups.filter((group: any) => group.featured).length;
        }
      } catch (error) {
        console.error('Error loading groups for stats:', error);
      }
      
      // Bekleyen grup sayısını gerçek verilerden hesapla (PendingGroups.tsx ile aynı mantık)
      let pendingGroups = 0;
      
      try {
        // localStorage'daki tüm anahtarları al ve bekleyen grupları say
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          
          // userGroups_ ile başlayan anahtarları bul
          if (key && key.startsWith('userGroups_')) {
            try {
              const userGroupsData = localStorage.getItem(key);
              if (userGroupsData) {
                const userGroups = JSON.parse(userGroupsData);
                
                // Bekleyen grupları say
                const pendingUserGroups = userGroups.filter((group: any) => group.status === 'pending');
                pendingGroups += pendingUserGroups.length;
              }
            } catch (error) {
              console.error(`Error loading pending groups from ${key}:`, error);
            }
          }
        }
      } catch (error) {
        console.error('Error calculating pending groups count:', error);
      }
      
      // Rastgele görüntüleme ve büyüme değerleri (gerçek uygulamada API'den gelecek)
      const todayViews = Math.floor(Math.random() * 2000) + 500;
      const weeklyGrowth = parseFloat((Math.random() * 20 + 5).toFixed(1));
      
      setStats({
        totalGroups,
        pendingGroups,
        totalMembers,
        featuredGroups,
        todayViews,
        weeklyGrowth
      });
      
      setIsLoading(false);
    };
    
    calculateStats();
    
    // Sayaçları düzenli olarak güncelle
    const interval = setInterval(calculateStats, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    // Son aktiviteleri güncelle
    const updateRecentActivities = () => {
      // Gerçek uygulamada API'den gelecek
      // Şimdilik rastgele aktiviteler oluştur
      const activities: Array<{ id: number; action: string; group: string; time: string; type: 'success' | 'warning' | 'info' | 'error' }> = [];
      
      // Bekleyen gruplardan aktivite oluştur
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('userGroups_')) {
          try {
            const userGroupsData = localStorage.getItem(key);
            if (userGroupsData) {
              const userGroups = JSON.parse(userGroupsData);
              
              // Son 5 grubu al
              const recentGroups = userGroups
                .filter((group: any) => group.status === 'pending')
                .sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                .slice(0, 5);
              
              recentGroups.forEach((group: any, index: number) => {
                const submittedDate = new Date(group.submittedAt);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - submittedDate.getTime());
                const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
                
                let timeText;
                if (diffHours < 1) {
                  timeText = 'Az önce';
                } else if (diffHours < 24) {
                  timeText = `${diffHours} saat önce`;
                } else {
                  const diffDays = Math.floor(diffHours / 24);
                  timeText = `${diffDays} gün önce`;
                }
                
                activities.push({
                  id: Date.now() + index,
                  action: 'Grup onay bekliyor',
                  group: group.groupName,
                  time: timeText,
                  type: 'warning' as const
                });
              });
            }
          } catch (error) {
            console.error(`Error loading recent activities from ${key}:`, error);
          }
        }
      }
      
      // Aktiviteleri en yeniden en eskiye sırala ve ilk 4'ünü al
      if (activities.length > 0) {
        setRecentActivities(activities.slice(0, 4));
      }
    };
    
    updateRecentActivities();
    
    // Aktiviteleri düzenli olarak güncelle
    const interval = setInterval(updateRecentActivities, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gösterge Paneli</h1>
        <p className="text-gray-600">Telegram Grupları yönetim paneline hoş geldiniz</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-green-500 text-sm font-medium">
              {isLoading ? <span className="animate-pulse">...</span> : `+${stats.weeklyGrowth}%`}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {isLoading ? <span className="animate-pulse">...</span> : stats.totalGroups}
          </div>
          <div className="text-gray-600 text-sm">Toplam Grup</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            {stats.pendingGroups > 0 && (
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                Bekliyor
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {isLoading ? <span className="animate-pulse">...</span> : stats.pendingGroups}
          </div>
          <div className="text-gray-600 text-sm">Onay Bekleyen</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {isLoading ? <span className="animate-pulse">...</span> : formatNumber(stats.totalMembers)}
          </div>
          <div className="text-gray-600 text-sm">Toplam Üye</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {isLoading ? <span className="animate-pulse">...</span> : formatNumber(stats.todayViews)}
          </div>
          <div className="text-gray-600 text-sm">Bugünkü Görüntüleme</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Hızlı İşlemler</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/admin/add-group"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-3">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <span className="text-blue-700 font-medium text-sm">Grup Ekle</span>
            </Link>

            <Link 
              to="/admin/groups"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl hover:from-indigo-100 hover:to-indigo-200 transition-all duration-300 transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-700 font-medium text-sm">Grupları Yönet</span>
            </Link>

            <Link
              to="/admin/reports"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl hover:from-red-100 hover:to-red-200 transition-all duration-300 transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center mb-3">
                <Flag className="w-6 h-6 text-white" />
              </div>
              <span className="text-red-700 font-medium text-sm">Bildirilen Gruplar</span>
            </Link>

            <Link
              to="/admin/pending"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl hover:from-yellow-100 hover:to-yellow-200 transition-all duration-300 transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center mb-3">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-yellow-700 font-medium text-sm">Onaylar</span>
            </Link>

            <Link 
              to="/admin/users"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl hover:from-green-100 hover:to-green-200 transition-all duration-300 transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center mb-3">
                <UserCog className="w-6 h-6 text-white" />
              </div>
              <span className="text-indigo-700 font-medium text-sm">Kullanıcılar</span>
            </Link>

            <Link
              to="/admin/seo"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-purple-700 font-medium text-sm">SEO Yönet</span>
            </Link>
          </div>
        </div>

        {/* Cache Clear Button */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Önbellek Yönetimi</h2>
              <p className="text-gray-600 mb-4 md:mb-0">Sistem önbelleğini temizleyerek performansı artırın ve veri tutarlılığını sağlayın</p>
            </div>
            <button
              onClick={clearCache}
              className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-red-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Önbelleği Temizle</span>
            </button>
          </div>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-sm text-blue-700">
            <p><strong>Not:</strong> Önbellek temizleme işlemi, sistem performansını iyileştirebilir ve veri tutarsızlıklarını giderebilir. Bu işlem:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Geçici verileri temizler</li>
              <li>Kullanıcı hesaplarını ve grup verilerini <strong>korur</strong></li>
              <li>Tarayıcı önbelleğini yeniler</li>
              <li>Sayfayı otomatik olarak yeniden yükler</li>
            </ul>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Son Aktiviteler</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-2xl">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'success' ? 'bg-green-100' :
                  activity.type === 'warning' ? 'bg-yellow-100' :
                  activity.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {activity.type === 'success' && <CheckSquare className="w-5 h-5 text-green-600" />}
                  {activity.type === 'warning' && <Clock className="w-5 h-5 text-yellow-600" />}
                  {activity.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                  {activity.type === 'info' && <TrendingUp className="w-5 h-5 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium text-sm">{activity.action}</p>
                  <p className="text-gray-600 text-sm">{activity.group}</p>
                </div>
                <div className="text-gray-500 text-xs">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Groups */}
      <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Öne Çıkan Gruplar</h2>
          <Link to="/admin/groups" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Tümünü Gör
          </Link>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Öne çıkan gruplar burada görünecek</p>
        </div>
      </div>
    </div>
  );
};