import React, { useState } from 'react';
import { 
  RefreshCw, 
  Database, 
  HardDrive, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Clock,
  BarChart
} from 'lucide-react';

export const CacheManagement: React.FC = () => {
  const [isClearing, setIsClearing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastCleared, setLastCleared] = useState<string | null>(
    localStorage.getItem('lastCacheCleared') || null
  );

  // Cache temizleme fonksiyonu
  const clearCache = async () => {
    setIsClearing(true);
    setSuccess(null);
    setError(null);
    
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
      
      // Simüle edilmiş bir gecikme (gerçek uygulamada bu olmayacak)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
      
      // Son temizleme zamanını kaydet
      const now = new Date().toISOString();
      localStorage.setItem('lastCacheCleared', now);
      setLastCleared(now);
      
      // Sayfa yenileme olayını tetikle
      window.dispatchEvent(new Event('storage'));
      
      // Başarılı mesajı göster
      setSuccess('Önbellek başarıyla temizlendi!');
    } catch (error) {
      console.error('Cache temizleme hatası:', error);
      setError('Önbellek temizlenirken bir hata oluştu!');
    } finally {
      setIsClearing(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Geçersiz tarih';
    }
  };

  // Tahmini cache boyutu (gerçek uygulamada daha doğru bir hesaplama yapılabilir)
  const estimateCacheSize = () => {
    try {
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || '';
          totalSize += key.length + value.length;
        }
      }
      
      // Byte'ı uygun birime çevir
      if (totalSize < 1024) {
        return `${totalSize} B`;
      } else if (totalSize < 1024 * 1024) {
        return `${(totalSize / 1024).toFixed(2)} KB`;
      } else {
        return `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
      }
    } catch (error) {
      return 'Hesaplanamadı';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Önbellek Yönetimi</h1>
        <p className="text-gray-600">Sistem önbelleğini temizleyerek performansı artırın ve veri tutarlılığını sağlayın</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{estimateCacheSize()}</div>
              <div className="text-gray-600 text-sm">Tahmini Önbellek Boyutu</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <HardDrive className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{localStorage.length}</div>
              <div className="text-gray-600 text-sm">Depolanan Öğe Sayısı</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {lastCleared ? formatDate(lastCleared) : 'Hiç temizlenmedi'}
              </div>
              <div className="text-gray-600 text-sm">Son Temizleme</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Önbellek Temizleme</h2>
            <p className="text-gray-600 max-w-2xl">
              Önbellek temizleme işlemi, sistem performansını iyileştirebilir ve veri tutarsızlıklarını giderebilir. 
              Bu işlem geçici verileri temizler ancak kullanıcı hesaplarını ve grup verilerini korur.
            </p>
          </div>
          
          <button
            onClick={clearCache}
            disabled={isClearing}
            className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-red-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
          >
            {isClearing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Temizleniyor...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                <span>Önbelleği Temizle</span>
              </>
            )}
          </button>
        </div>
        
        {/* Success/Error Message */}
        {success && (
          <div className="mt-6 flex items-center space-x-2 bg-green-50 border border-green-200 rounded-2xl p-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700">{success}</span>
          </div>
        )}
        
        {error && (
          <div className="mt-6 flex items-center space-x-2 bg-red-50 border border-red-200 rounded-2xl p-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}
      </div>

      {/* Cache Details */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Önbellek Detayları</h2>
        
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Temizlenen Veriler</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <span className="text-gray-700">Geçici uygulama verileri</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <span className="text-gray-700">Tarayıcı önbelleğindeki uygulama verileri</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <span className="text-gray-700">Oturum verileri (kullanıcı bilgileri hariç)</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Korunan Veriler</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <span className="text-gray-700">Kullanıcı hesapları ve profil bilgileri</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <span className="text-gray-700">Grup verileri ve istatistikler</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <span className="text-gray-700">Kullanıcı grupları ve promosyonlar</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <BarChart className="w-6 h-6 text-blue-500 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Performans İpucu</h3>
                <p className="text-blue-700">
                  Düzenli önbellek temizleme, uygulamanın daha hızlı çalışmasını sağlar ve veri tutarsızlıklarını önler. 
                  Özellikle yoğun kullanım dönemlerinde veya yeni özellikler ekledikten sonra önbelleği temizlemeniz önerilir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};