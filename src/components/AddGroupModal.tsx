import React, { useState } from 'react';
import { Plus, Loader2, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { telegramApi } from '../services/telegramApi';
import { TelegramGroup, AddGroupFormData } from '../types/telegram';
import { UserGroup } from '../types/userGroup';
import { useAuth } from '../contexts/AuthContext'; 
import { userActivityService } from '../services/userActivityService';
import { userGroupService, groupService } from '../services/supabaseService';

interface AddGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupAdded: (group: TelegramGroup) => void;
  categories: Array<{ name: string; icon: any; color: string }>;
}

export const AddGroupModal: React.FC<AddGroupModalProps> = ({
  isOpen,
  onClose,
  onGroupAdded,
  categories
}) => {
  const [formData, setFormData] = useState<AddGroupFormData>({
    username: '',
    category: 'Teknoloji',
    customTags: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewGroup, setPreviewGroup] = useState<TelegramGroup | null>(null);
  const auth = useAuth();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value;
    setFormData(prev => ({ ...prev, username }));
    setError(null);
    setSuccess(null);
    setPreviewGroup(null);
  };

  const fetchGroupPreview = async () => {
    if (!formData.username.trim()) {
      setError('Lütfen bir grup username\'i girin');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setPreviewGroup(null);

    try {
      const groupInfo = await telegramApi.getGroupInfo(formData.username);
      if (groupInfo) {
        setPreviewGroup(groupInfo);
        setSuccess('Grup bilgileri başarıyla alındı!');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Grup bilgileri alınamadı';
      setError(errorMessage);
      setPreviewGroup(null);
      
      // Hata türüne göre ek bilgi ver
      if (errorMessage.includes('bulunamadı')) {
        console.info('Grup bulunamadı - kullanıcı rehberi:', {
          username: formData.username,
          suggestions: [
            'Kullanıcı adının doğru yazıldığından emin olun',
            'Grubun herkese açık olduğunu kontrol edin',
            'Grubun gerçekten var olduğunu doğrulayın'
          ]
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kullanıcı bilgilerini al
    const currentUser = auth.user;
    if (!previewGroup) {
      setError('Önce grup bilgilerini çekin ve kontrol edin');
      return;
    }

    // Kategori ve özel etiketleri güncelle
    const updatedGroup: TelegramGroup = {
      ...previewGroup,
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: formData.category,
      tags: [
        ...previewGroup.tags,
        ...(formData.customTags || [])
      ].filter((tag, index, arr) => arr.indexOf(tag) === index), // Benzersiz yap
      approved: currentUser?.role === 'admin', // Admin tarafından eklendiyse otomatik olarak onayla
      featured: false,
      userId: currentUser?.id,
    };

    // Kullanıcının gruplarını ve sayaçları localStorage'a kaydet
    if (currentUser) {
      try {
        // 1) Grubu Supabase'e kaydet (hem groups hem user_groups tablosuna)
        const userGroup: UserGroup = {
          id: updatedGroup.id,
          userId: currentUser.id,
          groupName: updatedGroup.name,
          groupDescription: updatedGroup.description,
          groupUsername: updatedGroup.username || updatedGroup.name.toLowerCase().replace(/\s+/g, ''),
          groupImage: updatedGroup.image,
          category: updatedGroup.category,
          tags: updatedGroup.tags,
          link: updatedGroup.link,
          members: updatedGroup.members,
          status: currentUser.role === 'admin' ? 'approved' : 'pending',
          submittedAt: new Date(),
          submissionNote: 'Kullanıcı tarafından eklendi'
        };

        // Supabase'e user_groups tablosuna kaydet
        const addedUserGroup = await userGroupService.addUserGroup(userGroup);
        if (!addedUserGroup) {
          setError('Grup Supabase\'e kaydedilemedi. Lütfen tekrar deneyin.');
          return;
        }

        // Eğer admin ise, ana groups tablosuna da kaydet
        if (currentUser.role === 'admin') {
          const addedGroup = await groupService.addGroup(updatedGroup);
          if (!addedGroup) {
            setError('Grup ana listeye eklenemedi. Lütfen tekrar deneyin.');
            return;
          }
        }

        // 2) Kullanıcı bazlı localStorage kaydı
        const savedUserGroups = localStorage.getItem(`userGroups_${currentUser.id}`);
        let userGroups: UserGroup[] = savedUserGroups ? JSON.parse(savedUserGroups) : [];

        // En başa ekle
        userGroups.unshift(userGroup);
        localStorage.setItem(`userGroups_${currentUser.id}`, JSON.stringify(userGroups));

        // 3) Bekleyen grup sayacını artır (sadece normal kullanıcılar için)
        if (currentUser.role !== 'admin') {
          try {
            const pendingCount = localStorage.getItem('pendingGroupsCount') || '0';
            const newCount = parseInt(pendingCount) + 1;
            localStorage.setItem('pendingGroupsCount', newCount.toString());
          } catch (error) {
            console.error('Error updating pending groups count:', error);
          }
        }

        // 4) Yalnızca admin kullanıcıları genel grup listesine ekler
        if (currentUser.role === 'admin') {
          try {
            const savedGroups = localStorage.getItem('groups');
            const publicGroups = localStorage.getItem('publicGroups') || '[]';
            let allGroups: TelegramGroup[] = savedGroups ? JSON.parse(savedGroups) : [];
            let allPublicGroups: TelegramGroup[] = publicGroups ? JSON.parse(publicGroups) : [];

            // Yeni grubu ekle
            allGroups.unshift(updatedGroup);
            allPublicGroups.unshift(updatedGroup);

            localStorage.setItem('groups', JSON.stringify(allGroups));
            localStorage.setItem('publicGroups', JSON.stringify(allPublicGroups));
          } catch (error) {
            console.error('Error saving group to localStorage:', error);
          }
        }

        // 5) Activity kaydı
        userActivityService.addActivity(
          currentUser.id,
          'create',
          'group',
          {
            group_name: updatedGroup.name,
            status: currentUser.role === 'admin' ? 'approved' : 'pending'
          },
          updatedGroup.id
        );

        // 6) UI güncelleme callback'i (ProfilePage gibi bileşenler için)
        onGroupAdded(updatedGroup);

        // 7) Başarı mesajı
        setSuccess('Grup başarıyla eklendi!');

        // 8) Formu sıfırla
        setTimeout(() => {
          setFormData({
            username: '',
            category: 'Teknoloji',
            customTags: []
          });
          setPreviewGroup(null);
          setError(null);
          setSuccess(null);
          onClose();
        }, 1500);

      } catch (error) {
        console.error('Error handling group submit:', error);
        setError('Grup eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, customTags: tags }));
  };

  if (!isOpen) return null;

  // Tümü kategorisini hariç tut
  const availableCategories = categories.filter(cat => cat.name !== 'Tümü');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Telegram Grubu Ekle</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Plus className="w-6 h-6 transform rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Telegram Username
            </label>
            <div className="flex space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.username}
                  onChange={handleUsernameChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="grupadi (@ olmadan)"
                />
              </div>
              <button
                type="button"
                onClick={fetchGroupPreview}
                disabled={isLoading || !formData.username.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>Bilgileri Çek</span>
                )}
              </button>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-2xl p-4">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-2xl p-4">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700">{success}</span>
            </div>
          )}

          {/* Group Preview */}
          {previewGroup && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h4 className="text-gray-900 font-semibold mb-3">Grup Önizleme</h4>
              
              {/* Group Preview Card */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-4">
                <div className="flex items-start space-x-3 mb-3">
                  {previewGroup.image ? (
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-gray-200 flex-shrink-0">
                      <img
                        src={previewGroup.image}
                        alt={previewGroup.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">
                        {previewGroup.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-bold text-gray-900 truncate">{previewGroup.name}</h5>
                      {previewGroup.verified && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">{formData.category}</p>
                  </div>
                </div>
                
                {previewGroup.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{previewGroup.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="text-gray-500 text-sm">
                    {previewGroup.members ? `${previewGroup.members.toLocaleString()} üye` : '0 üye'}
                  </div>
                  {previewGroup.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {previewGroup.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Technical Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Grup Adı:</span>
                  <span className="text-gray-900 font-medium">{previewGroup.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Üye Sayısı:</span>
                  <span className="text-gray-900 font-medium">{previewGroup.members.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tip:</span>
                  <span className="text-gray-900 font-medium capitalize">{previewGroup.type}</span>
                </div>
                {previewGroup.image && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Grup Görseli:</span>
                    <div className="flex items-center space-x-1 text-green-600">
                      <ImageIcon className="w-4 h-4" />
                      <span className="text-xs">Mevcut</span>
                    </div>
                  </div>
                )}
                {previewGroup.tags.length > 0 && (
                  <div>
                    <span className="text-gray-600">Otomatik Etiketler:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {previewGroup.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Category Selection */}
          {previewGroup && (
            <>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Kategori *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  {availableCategories.map(category => (
                    <option key={category.name} value={category.name} className="bg-white">
                      {category.name}
                    </option>
                  ))}
                </select>
                <p className="text-gray-500 text-xs mt-1">
                  Grubun hangi kategoriye ait olduğunu seçin
                </p>
              </div>

              {/* Custom Tags */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Ek Etiketler (virgülle ayırın)
                </label>
                <input
                  type="text"
                  onChange={handleTagsChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="react, javascript, frontend"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Grubun daha kolay bulunması için ek etiketler ekleyebilirsiniz
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-2xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                Grubu Ekle
              </button>
            </>
          )}
        </form>

        {/* Bot Token Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-center">
          <p className="text-blue-700 text-sm">
            <strong>Otomatik Bilgi Çekme:</strong> Grup adı, açıklama, üye sayısı ve görsel otomatik olarak Telegram'dan çekilir.
          </p>
          <p className="text-blue-600 text-xs mt-2">
            Sadece kategori seçimi ve ek etiketler sizin kontrolünüzdedir.
          </p>
        </div>
      </div>
    </div>
  );
};