import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Edit,
  Eye,
  Trash2, 
  Star, 
  Users, 
  ExternalLink,
  CheckCircle,
  X,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  AlertTriangle,
  CheckSquare,
  Plus
} from 'lucide-react';
import { TelegramGroup } from '../../types/telegram';
import { telegramApi, TelegramApiError } from '../../services/telegramApi';
import { Link } from 'react-router-dom';
import { createSlug } from '../../utils/slug';
import { AddGroupModal } from '../AddGroupModal';
import { useNavigate } from 'react-router-dom';

interface GroupManagementProps {
  groups: TelegramGroup[];
  onUpdateGroup: (group: TelegramGroup) => void;
  onDeleteGroup: (groupId: string) => void;
}

export const GroupManagement: React.FC<GroupManagementProps> = ({ 
  groups, 
  onUpdateGroup, 
  onDeleteGroup 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [sortBy, setSortBy] = useState('name');
  const [editingGroup, setEditingGroup] = useState<TelegramGroup | null>(null);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [updateProgress, setUpdateProgress] = useState({ current: 0, total: 0 });
  const [updateResults, setUpdateResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  }>({ success: 0, failed: 0, errors: [] });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);

  const categories = ['Tümü', 'Teknoloji', 'Finans', 'Sanat', 'İş', 'Oyun', 'Müzik', 'Eğitim'];

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tümü' || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'members') return b.members - a.members;
    if (sortBy === 'category') return a.category.localeCompare(b.category);
    return 0;
  });

  const formatMembers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleToggleFeatured = (group: TelegramGroup) => {
    onUpdateGroup({ ...group, featured: !group.featured });
  };

  const handleEditGroup = (group: TelegramGroup) => {
    setEditingGroup(group);
  };
    
  const handleSaveEdit = (updatedGroup: TelegramGroup) => {
    onUpdateGroup(updatedGroup);
    setEditingGroup(null);
    
    // Public grupları da güncelle
    try {
      const publicGroups = localStorage.getItem('publicGroups') || '[]';
      const parsedPublicGroups = JSON.parse(publicGroups);
      
      // Eğer grup onaylanmışsa ve public listede varsa güncelle
      if (updatedGroup.approved) {
        // Grup zaten public listede var mı kontrol et
        const groupExists = parsedPublicGroups.some((g: TelegramGroup) => g.id === updatedGroup.id);
        
        if (groupExists) {
          // Varsa güncelle
          const updatedPublicGroups = parsedPublicGroups.map((g: TelegramGroup) => 
            g.id === updatedGroup.id ? updatedGroup : g
          );
          localStorage.setItem('publicGroups', JSON.stringify(updatedPublicGroups));
        } else {
          // Yoksa ekle
          const updatedPublicGroups = [updatedGroup, ...parsedPublicGroups];
          localStorage.setItem('publicGroups', JSON.stringify(updatedPublicGroups));
        }
      } else {
        // Eğer onay kaldırıldıysa, public listeden çıkar
        const updatedPublicGroups = parsedPublicGroups.filter((g: TelegramGroup) => g.id !== updatedGroup.id);
        localStorage.setItem('publicGroups', JSON.stringify(updatedPublicGroups));
      }
    } catch (error) {
      console.error('Error updating public groups:', error);
    }
  };


  const handleBulkUpdate = async () => {
    setIsUpdatingAll(true);
    setUpdateProgress({ current: 0, total: groups.length });
    setUpdateResults({ success: 0, failed: 0, errors: [] as string[] });
    setShowUpdateModal(true);

    let results = { success: 0, failed: 0, errors: [] as string[] };

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      setUpdateProgress({ current: i + 1, total: groups.length });

      try {
        // Grup username'ini çıkar
        const username = group.username || group.link.split('/').pop() || group.name.toLowerCase().replace(/\s+/g, '');
        
        // Sadece üye sayısını güncelle
        const memberCount = await telegramApi.getGroupMemberCount(username);
        if (memberCount !== null) {
          // Üye sayısını güncelle
          onUpdateGroup({
            ...group,
            members: memberCount
          });
          results.success += 1;
        }
        else {
          // Tam grup bilgilerini almayı dene
          try {
            const updatedGroupInfo = await telegramApi.getGroupInfo(username);
            
            if (updatedGroupInfo) {
              // Sadece üye sayısını ve diğer güncellenebilir bilgileri güncelle (ID'yi koruyarak)
              const updatedGroup: TelegramGroup = {
                ...group,
                description: updatedGroupInfo.description || group.description,
                image: updatedGroupInfo.image || group.image,
                createdAt: group.createdAt
              };
              
              onUpdateGroup(updatedGroup);
              results.success += 1;
            } else {
              results.failed += 1;
              results.errors.push(`${group.name}: Grup bilgileri alınamadı`);
            }
          } catch (error) {
            results.failed += 1;
            if (error instanceof TelegramApiError) {
              results.errors.push(`${group.name}: ${error.message}`);
            } else {
              results.errors.push(`${group.name}: Bilinmeyen hata`);
            }
          }
        }
      } catch (error) {
        results.failed += 1;
        if (error instanceof TelegramApiError) {
          results.errors.push(`${group.name}: ${error.message}`);
        } else {
          results.errors.push(`${group.name}: Bilinmeyen hata`);
        }
      }

      // API rate limiting için kısa bir bekleme
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setUpdateResults(results);
    setIsUpdatingAll(false);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setUpdateProgress({ current: 0, total: 0 });
    setUpdateResults({ success: 0, failed: 0, errors: [] });
  };

  const getCategoryIcon = (category: string) => {
    // This function should return appropriate icons for categories
    return '📱'; // placeholder
  };

  const getCategoryColor = (category: string) => {
    // This function should return appropriate colors for categories
    return 'blue'; // placeholder
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Grup Yönetimi</h1>
        <p className="text-gray-600">Mevcut grupları yönetin, düzenleyin ve silin</p>
        
        <button
          onClick={() => setShowAddGroupModal(true)}
          className="mt-4 bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Grup Ekle</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Grup ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="name">İsme Göre</option>
              <option value="members">Üye Sayısına Göre</option>
              <option value="category">Kategoriye Göre</option>
            </select>
          </div>
        </div>
        
        {/* Bulk Update Button */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Toplu Güncelleme</h3>
              <p className="text-gray-600 text-sm">Tüm grupların Telegram verilerini (üye sayısı, açıklama, görsel) güncelleyin</p>
            </div>
            <button
              onClick={handleBulkUpdate}
              disabled={isUpdatingAll}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isUpdatingAll ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Güncelleniyor...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Tüm Grupları Güncelle</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Groups Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Grup</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Kategori</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Üye Sayısı</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Durum</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredGroups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      {group.image ? (
                        <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-gray-200">
                          <img
                            src={group.image}
                            alt={group.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{group.name}</h3>
                          {group.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <p className="text-gray-600 text-sm truncate max-w-xs">{group.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {group.category}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-gray-900">{formatMembers(group.members)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {group.featured && (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>Öne Çıkan</span>
                        </span>
                      )}
                      {group.verified && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          Doğrulanmış
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleFeatured(group)}
                        className={`p-2 rounded-lg transition-colors ${
                          group.featured 
                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={group.featured ? 'Öne çıkandan kaldır' : 'Öne çıkar'}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleEditGroup(group)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Düzenle"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                     <Link
                       to={`/group/${createSlug(group.name)}`}
                       target="_blank"
                       className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                       title="Grup Sayfasını Görüntüle"
                     >
                       <Eye className="w-4 h-4" />
                     </Link>
                     
                      <a
                        href={group.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                        title="Grubu görüntüle"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      
                      <button
                        onClick={() => onDeleteGroup(group.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Grup bulunamadı</h3>
            <p className="text-gray-600">Arama kriterlerinizi değiştirmeyi deneyin</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingGroup && (
        <EditGroupModal 
          group={editingGroup}
          onSave={handleSaveEdit}
          onClose={() => setEditingGroup(null)}
        />
      )}

      {/* Bulk Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Toplu Güncelleme</h3>
              {!isUpdatingAll && (
                <button
                  onClick={closeUpdateModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>

            {isUpdatingAll ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <RefreshCw className="w-10 h-10 text-white animate-spin" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">Gruplar Güncelleniyor</h4>
                <p className="text-gray-600 mb-6">
                  {updateProgress.current} / {updateProgress.total} grup işlendi
                </p>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${updateProgress.total > 0 ? (updateProgress.current / updateProgress.total) * 100 : 0}%`
                    }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-green-50 rounded-2xl p-4">
                    <div className="text-2xl font-bold text-green-600">{updateResults.success}</div>
                    <div className="text-green-600 text-sm">Başarılı</div>
                  </div>
                  <div className="bg-red-50 rounded-2xl p-4">
                    <div className="text-2xl font-bold text-red-600">{updateResults.failed}</div>
                    <div className="text-red-600 text-sm">Başarısız</div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckSquare className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Güncelleme Tamamlandı!</h4>
                  <p className="text-gray-600">Tüm grupların verileri güncellendi.</p>
                </div>

                {/* Results Summary */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-50 rounded-2xl p-4 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-700 font-medium">Başarılı</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{updateResults.success}</div>
                  </div>
                  <div className="bg-red-50 rounded-2xl p-4 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <span className="text-red-700 font-medium">Başarısız</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">{updateResults.failed}</div>
                  </div>
                </div>

                {/* Error Details */}
                {updateResults.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                    <h5 className="text-red-900 font-medium mb-3">Hata Detayları:</h5>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {updateResults.errors.map((error, index) => (
                        <div key={index} className="text-red-700 text-sm bg-white rounded-lg p-2">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={closeUpdateModal}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                >
                  Tamam
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Add Group Modal */}
      {showAddGroupModal && (
        <AddGroupModal
          isOpen={showAddGroupModal}
          onClose={() => setShowAddGroupModal(false)}
          onGroupAdded={(group) => {
            onUpdateGroup(group);
            setShowAddGroupModal(false);
          }}
          categories={categories.filter(cat => cat !== 'Tümü').map(cat => ({
            name: cat,
            icon: getCategoryIcon(cat),
            color: getCategoryColor(cat)
          }))}
        />
      )}
    </div>
  );
};

interface EditGroupModalProps {
  group: TelegramGroup;
  onSave: (group: TelegramGroup) => void;
  onClose: () => void;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({ group, onSave, onClose }) => {
  const [editedGroup, setEditedGroup] = useState<TelegramGroup>(group);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(group.image || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Eğer yeni görsel yüklendiyse, onu grup verisine ekle
    const updatedGroup = {
      ...editedGroup,
      image: imagePreview
    };
    onSave(updatedGroup);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Görsel boyutu 5MB\'dan küçük olmalıdır');
        return;
      }

      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        alert('Lütfen geçerli bir görsel dosyası seçin');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setImageFile(null);
    setEditedGroup(prev => ({ ...prev, image: undefined }));
  };
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Grup Düzenle</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grup Görseli */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Grup Görseli
            </label>
            
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Grup görseli önizleme"
                  className="w-full h-48 object-cover rounded-2xl border border-gray-300"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  {imageFile ? 'Yeni görsel' : 'Mevcut görsel'}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload-edit"
                />
                <label
                  htmlFor="image-upload-edit"
                  className="cursor-pointer flex flex-col items-center space-y-3"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Görsel yüklemek için tıklayın</p>
                    <p className="text-gray-500 text-sm">PNG, JPG, GIF (Max 5MB)</p>
                  </div>
                </label>
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Grup Adı
            </label>
            <input
              type="text"
              value={editedGroup.name}
              onChange={(e) => setEditedGroup(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Açıklama
            </label>
            <textarea
              value={editedGroup.description}
              onChange={(e) => setEditedGroup(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Kategori
              </label>
              <select
                value={editedGroup.category}
                onChange={(e) => setEditedGroup(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Teknoloji">Teknoloji</option>
                <option value="Finans">Finans</option>
                <option value="Sanat">Sanat</option>
                <option value="İş">İş</option>
                <option value="Oyun">Oyun</option>
                <option value="Müzik">Müzik</option>
                <option value="Eğitim">Eğitim</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Üye Sayısı
              </label>
              <input
                type="number"
                value={editedGroup.members}
                onChange={(e) => setEditedGroup(prev => ({ ...prev, members: parseInt(e.target.value) || 0 }))}
                className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Telegram Linki
            </label>
            <input
              type="url"
              value={editedGroup.link}
              onChange={(e) => setEditedGroup(prev => ({ ...prev, link: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={editedGroup.featured}
                onChange={(e) => setEditedGroup(prev => ({ ...prev, featured: e.target.checked }))}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-gray-700 text-sm">Öne Çıkan</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={editedGroup.verified}
                onChange={(e) => setEditedGroup(prev => ({ ...prev, verified: e.target.checked }))}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-gray-700 text-sm">Doğrulanmış</span>
            </label>
          </div>

          {/* Önizleme */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Grup Önizleme</h4>
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="flex items-start space-x-3 mb-3">
                {imagePreview ? (
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-gray-200 flex-shrink-0">
                    <img
                      src={imagePreview}
                      alt={editedGroup.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {editedGroup.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h5 className="font-bold text-gray-900">{editedGroup.name}</h5>
                    {editedGroup.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                    {editedGroup.featured && (
                      <Star className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">{editedGroup.category}</p>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{editedGroup.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="text-gray-500 text-sm">
                  {editedGroup.members.toLocaleString()} üye
                </div>
                <div className="flex items-center space-x-2">
                  {editedGroup.featured && (
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                      Öne Çıkan
                    </span>
                  )}
                  {editedGroup.verified && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                      Doğrulanmış
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};