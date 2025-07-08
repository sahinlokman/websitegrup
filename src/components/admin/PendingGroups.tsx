import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  X, 
  Users, 
  ExternalLink, 
  Clock,
  AlertCircle,
  Eye,
  MessageSquare,
  User
} from 'lucide-react';
import { TelegramGroup } from '../../types/telegram';
import { UserGroup } from '../../types/userGroup';
import { useAuth } from '../../contexts/AuthContext';
import { userActivityService } from '../../services/userActivityService';
import { userGroupService } from '../../services/supabaseService';

interface PendingGroupWithUser extends PendingGroup {
  submittedByUser?: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface PendingGroup extends TelegramGroup {
  submittedBy: string;
  submittedAt: Date;
  submissionNote?: string;
}

interface PendingGroupsProps {
  onApproveGroup: (group: TelegramGroup) => void;
  onRejectGroup: (groupId: string, reason: string) => void;
}

export const PendingGroups: React.FC<PendingGroupsProps> = ({ 
  onApproveGroup, 
  onRejectGroup 
}) => {
  const [pendingGroups, setPendingGroups] = useState<PendingGroupWithUser[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<PendingGroupWithUser | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [groupToReject, setGroupToReject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Kullanıcılar tarafından eklenen bekleyen grupları yükle
  useEffect(() => {
    setIsLoading(true);
    
    // Tüm localStorage'ı tara ve bekleyen grupları bul
    const allPendingGroups: PendingGroupWithUser[] = [];
    
    // localStorage'daki tüm anahtarları al
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      // userGroups_ ile başlayan anahtarları bul
      if (key && key.startsWith('userGroups_')) {
        const userId = key.replace('userGroups_', '');
        
        try {
          const userGroupsData = localStorage.getItem(key);
          if (userGroupsData) {
            const userGroups = JSON.parse(userGroupsData);
            
            // Bekleyen grupları filtrele
            const pendingUserGroups = userGroups.filter((group: any) => group.status === 'pending');
            
            // Kullanıcı bilgilerini al
            let userInfo = null;
            try {
              const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
              userInfo = allUsers.find((u: any) => u.id === userId);
            } catch (error) {
              console.error('Error loading user info:', error);
            }
            
            // Bekleyen grupları PendingGroup formatına dönüştür
            pendingUserGroups.forEach((group: any) => {
              const pendingGroup: PendingGroupWithUser = {
                id: group.id,
                name: group.groupName,
                description: group.groupDescription,
                members: group.members,
                category: group.category,
                tags: group.tags,
                link: group.link,
                verified: false,
                featured: false,
                createdAt: new Date(),
                submittedBy: userInfo?.email || userId,
                submittedAt: new Date(group.submittedAt),
                submissionNote: group.submissionNote,
                image: group.groupImage
              };
              
              // Kullanıcı bilgisi varsa ekle
              if (userInfo) {
                pendingGroup.submittedByUser = {
                  id: userInfo.id,
                  fullName: userInfo.fullName,
                  email: userInfo.email
                };
              }
              
              allPendingGroups.push(pendingGroup);
            });
          }
        } catch (error) {
          console.error(`Error loading pending groups for user ${userId}:`, error);
        }
      }
    }
    
    // Grupları gönderim tarihine göre sırala (en yeniden en eskiye)
    allPendingGroups.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
    
    setPendingGroups(allPendingGroups);
    setIsLoading(false);
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatMembers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleApprove = async (group: PendingGroup) => {
    const approvedGroup: TelegramGroup = {
      id: group.id,
      name: group.name,
      description: group.description,
      members: group.members,
      category: group.category,
      tags: group.tags,
      link: group.link,
      verified: false,
      featured: false,
      approved: true,
      image: group.image,
      createdAt: new Date()
    };
    
    onApproveGroup(approvedGroup);
    
    // Kullanıcının gruplarını güncelle (localStorage + Supabase)
    await updateUserGroupStatus(group.id, 'approved');
    
    // Bu noktada lokal gruplar listesine ekleme ve sayaç güncelleme APP seviyesinde yapılacak.
    
    // Pending listesinden kaldır
    setPendingGroups(prev => prev.filter(g => g.id !== group.id));

    // Onaylandı aktivitesi
    if (user) {
      userActivityService.addActivity(
        user.id,
        'update',
        'group',
        {
          group_name: group.name,
          status: 'approved',
          action: 'approve'
        },
        group.id
      );
    }
  };

  const handleReject = (groupId: string) => {
    setGroupToReject(groupId);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (groupToReject && rejectReason.trim()) {      
      // Kullanıcının gruplarını güncelle (localStorage + Supabase)
      await updateUserGroupStatus(groupToReject, 'rejected', rejectReason);
      
      try {
        const rejectedCount = localStorage.getItem('rejectedGroupsCount') || '0';
        const newCount = parseInt(rejectedCount) + 1;
        localStorage.setItem('rejectedGroupsCount', newCount.toString());
        
        // Bekleyen grup sayacını azalt
        const pendingCount = localStorage.getItem('pendingGroupsCount') || '0';
        const newPendingCount = Math.max(0, parseInt(pendingCount) - 1);
        localStorage.setItem('pendingGroupsCount', newPendingCount.toString());
      } catch (error) {
        console.error('Error updating group counters:', error);
      }
      
      // Pending listesinden kaldır
      setPendingGroups(prev => prev.filter(g => g.id !== groupToReject));
      
      // Callback'i çağır
      onRejectGroup(groupToReject, rejectReason);
      
      // Modal'ı kapat
      setShowRejectModal(false);
      setGroupToReject(null);
      setRejectReason('');
    }
  };
  
  // Kullanıcının grup durumunu güncelle (localStorage + Supabase)
  const updateUserGroupStatus = async (groupId: string, newStatus: 'approved' | 'rejected', rejectionReason?: string) => {
    // 1) localStorage'daki tüm anahtarları al ve grubu bul
    let foundUserGroup: UserGroup | null = null;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      // userGroups_ ile başlayan anahtarları bul
      if (key && key.startsWith('userGroups_')) {
        try {
          const userGroupsData = localStorage.getItem(key);
          if (userGroupsData) {
            const userGroups = JSON.parse(userGroupsData);
            
            // Grubu bul
            const groupIndex = userGroups.findIndex((group: any) => group.id === groupId);
            
            if (groupIndex !== -1) {
              // Grup durumunu güncelle
              userGroups[groupIndex].status = newStatus;
              userGroups[groupIndex].reviewedAt = new Date();
              userGroups[groupIndex].reviewedBy = 'Admin';
              
              if (newStatus === 'rejected' && rejectionReason) {
                userGroups[groupIndex].rejectionReason = rejectionReason;
              }
              
              // Güncellenmiş grupları localStorage'a kaydet
              localStorage.setItem(key, JSON.stringify(userGroups));
              
              // UserGroup objesini Supabase güncellemesi için al
              foundUserGroup = userGroups[groupIndex];
              
              // Grubu bulduk ve güncelledik, döngüden çık
              break;
            }
          }
        } catch (error) {
          console.error(`Error updating group status in ${key}:`, error);
        }
      }
    }
    
    // 2) Supabase'de user_groups tablosunu güncelle
    if (foundUserGroup) {
      try {
        const success = await userGroupService.updateUserGroup(foundUserGroup);
        if (success) {
          console.log('User group status updated in Supabase:', groupId, newStatus);
        } else {
          console.error('Failed to update user group status in Supabase:', groupId);
        }
      } catch (error) {
        console.error('Error updating user group in Supabase:', error);
      }
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Onay Bekleyen Gruplar</h1>
        <p className="text-gray-600">Kullanıcılar tarafından gönderilen grupları inceleyin ve onaylayın</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {isLoading ? <span className="animate-pulse">...</span> : pendingGroups.length}
              </div>
              <div className="text-gray-600 text-sm">Bekleyen Grup</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {isLoading ? <span className="animate-pulse">...</span> : 
                  localStorage.getItem('approvedGroupsCount') ? 
                  JSON.parse(localStorage.getItem('approvedGroupsCount') || '0') : 0}
              </div>
              <div className="text-gray-600 text-sm">Bu Ay Onaylanan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Groups List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingGroups.map((group) => (
            <div key={group.id} className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                        Bekliyor
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{group.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-gray-500 text-sm">Kategori:</span>
                        <p className="font-medium text-gray-900">{group.category}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-sm">Üye Sayısı:</span>
                        <p className="font-medium text-gray-900">{formatMembers(group.members)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-sm">Gönderen:</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {group.submittedByUser?.fullName || 'Bilinmiyor'}
                            </p>
                            <p className="text-gray-500 text-xs">{group.submittedBy}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 text-sm">Gönderim Tarihi:</span>
                        <p className="font-medium text-gray-900">{formatDate(group.submittedAt)}</p>
                      </div>
                    </div>

                    {group.submissionNote && (
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 mb-4">
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5" />
                          <div>
                            <span className="text-blue-700 text-sm font-medium">Gönderim Notu:</span>
                            <p className="text-blue-600 text-sm">{group.submissionNote}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {group.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <a
                    href={group.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Grubu İncele</span>
                  </a>
                  
                  <button
                    onClick={() => setSelectedGroup(group)}
                    className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Detayları Gör</span>
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleReject(group.id)}
                    className="bg-red-100 text-red-600 px-6 py-2 rounded-2xl font-semibold hover:bg-red-200 transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Reddet</span>
                  </button>
                  
                  <button
                    onClick={() => handleApprove(group)}
                    className="bg-green-100 text-green-600 px-6 py-2 rounded-2xl font-semibold hover:bg-green-200 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Onayla</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!isLoading && pendingGroups.length === 0 && (
            <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Bekleyen grup yok</h3>
              <p className="text-gray-600">Şu anda onay bekleyen grup bulunmuyor.</p>
            </div>
          )}
        </div>
      )}

      {/* Group Detail Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Grup Detayları</h3>
              <button
                onClick={() => setSelectedGroup(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedGroup.name}</h2>
                <p className="text-gray-600">{selectedGroup.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <span className="text-gray-500 text-sm">Kategori</span>
                  <p className="font-semibold text-gray-900">{selectedGroup.category}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <span className="text-gray-500 text-sm">Üye Sayısı</span>
                  <p className="font-semibold text-gray-900">{formatMembers(selectedGroup.members)}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <span className="text-gray-500 text-sm">Gönderen</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedGroup.submittedByUser?.fullName || 'Bilinmiyor'}
                      </p>
                      <p className="text-gray-500 text-sm">{selectedGroup.submittedBy}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <span className="text-gray-500 text-sm">Gönderim Tarihi</span>
                  <p className="font-semibold text-gray-900">{formatDate(selectedGroup.submittedAt)}</p>
                </div>
              </div>

              {selectedGroup.submissionNote && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Gönderim Notu</h4>
                  <p className="text-blue-700">{selectedGroup.submissionNote}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {selectedGroup.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => handleReject(selectedGroup.id)}
                  className="flex-1 bg-red-100 text-red-600 py-3 rounded-2xl font-semibold hover:bg-red-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="w-5 h-5" />
                  <span>Reddet</span>
                </button>
                <button
                  onClick={() => handleApprove(selectedGroup)}
                  className="flex-1 bg-green-100 text-green-600 py-3 rounded-2xl font-semibold hover:bg-green-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Onayla</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Grup Reddet</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-gray-600 text-center">
                Bu grubu reddetmek istediğinizden emin misiniz? Lütfen reddetme sebebinizi belirtin.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Reddetme Sebebi
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Reddetme sebebinizi açıklayın..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reddet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};