import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Hash, ExternalLink, Globe, TrendingUp, MessageCircle, CheckCircle, Star, Clock, Flag, AlertCircle } from 'lucide-react';
import { TelegramGroup } from '../types/telegram';
import { telegramApi } from '../services/telegramApi';
import { reportService } from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';
import { findGroupBySlug, createSlug } from '../utils/slug';

interface GroupDetailProps {
  groups: TelegramGroup[];
  categories: Array<{ name: string; icon: any; color: string }>;
}

export const GroupDetail: React.FC<GroupDetailProps> = ({ groups, categories }) => {
  const { slug } = useParams<{ slug: string }>();
  const group = slug ? findGroupBySlug(groups, slug) : null;
  const { user, isAuthenticated } = useAuth();
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  if (!group) {
    return <Navigate to="/" replace />;
  }
  
  useEffect(() => {
    const fetchMemberCount = async () => {
      if (!group.username) return;
      
      setIsLoadingMembers(true);
      setMemberError(null);
      
      try {
        const username = group.username || group.link.split('/').pop() || '';
        if (!username) return;
        
        const memberCountData = await telegramApi.getGroupMemberCount(username);
        if (memberCountData !== null) {
          setMemberCount(memberCountData);
        }
      } catch (error) {
        console.error('Error fetching member count:', error);
        setMemberError(error instanceof Error ? error.message : 'Failed to fetch member count');
      } finally {
        setIsLoadingMembers(false);
      }
    };
    
    fetchMemberCount();
  }, [group]);

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.icon : Globe;
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : 'from-purple-500 to-pink-500';
  };

  const formatMembers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toLocaleString();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Ranking hesaplama fonksiyonları
  const calculateGlobalRank = (currentGroup: TelegramGroup, allGroups: TelegramGroup[]): number => {
    const currentMembers = memberCount !== null ? memberCount : currentGroup.members;
    const sortedGroups = [...allGroups].sort((a, b) => b.members - a.members);
    return sortedGroups.findIndex(g => g.id === currentGroup.id) + 1;
  };

  const calculateCategoryRank = (currentGroup: TelegramGroup, allGroups: TelegramGroup[]): number => {
    const currentMembers = memberCount !== null ? memberCount : currentGroup.members;
    const categoryGroups = allGroups.filter(g => g.category === currentGroup.category);
    const sortedCategoryGroups = [...categoryGroups].sort((a, b) => b.members - a.members);
    return sortedCategoryGroups.findIndex(g => g.id === currentGroup.id) + 1;
  };

  const globalRank = calculateGlobalRank(group, groups);
  const categoryRank = calculateCategoryRank(group, groups);
  const CategoryIcon = getCategoryIcon(group.category);


  const handleReport = () => {
    if (!isAuthenticated) {
      alert('Lütfen önce giriş yapın');
      return;
    }
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!reportReason.trim()) {
      setReportError('Lütfen bir neden belirtin');
      return;
    }

    try {
      await reportService.reportGroup({
        groupId: group.id,
        userId: user?.id || 'anonymous',
        reason: reportReason,
        groupName: group.name,
        reportedAt: new Date()
      });
      
      setReportSuccess(true);
      setReportError(null);
      
      // Reset and close after 3 seconds
      setTimeout(() => {
        setShowReportModal(false);
        setReportReason('');
        setReportSuccess(false);
      }, 3000);
    } catch (error) {
      setReportError('Rapor gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              to="/"
              className="flex items-center justify-center w-8 h-8 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </Link>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-purple-600 transition-colors">Ana Sayfa</Link>
              <span>/</span>
              <Link to="/categories" className="hover:text-purple-600 transition-colors">Kategoriler</Link>
              <span>/</span>
              <Link 
                to={`/category/${group.category.toLowerCase()}`} 
                className="hover:text-purple-600 transition-colors"
              >
                {group.category}
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{group.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Group Info */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sticky top-8">
              {/* Group Avatar */}
              <div className="text-center mb-6">
                {group.image ? (
                  <div className="w-24 h-24 rounded-3xl overflow-hidden mx-auto mb-4 border-4 border-white shadow-lg">
                    <img
                      src={group.image}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                <div className={`w-24 h-24 bg-gradient-to-br ${getCategoryColor(group.category)} rounded-3xl flex items-center justify-center mx-auto mb-4`}>
                  <CategoryIcon className="w-12 h-12 text-white" />
                </div>
                )}
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <h2 className="text-xl font-bold text-gray-900">{group.name}</h2>
                  {group.verified && (
                    <CheckCircle className="w-6 h-6 text-blue-500" />
                  )}
                </div>
                <p className="text-gray-600 text-sm">@{group.username || group.name.toLowerCase().replace(/\s+/g, '')}</p>
              </div>

              {/* Join Button */}
              <a
                href={group.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-semibold text-center flex items-center justify-center space-x-2 hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 mb-6"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Kanala Görüntüle</span>
              </a>

              {/* Member Count */}
              <div className="flex items-center justify-center space-x-2 text-gray-600 mb-6">
                <Users className="w-5 h-5" />
                {isLoadingMembers ? (
                  <span className="font-semibold">Yükleniyor...</span>
                ) : memberCount !== null ? (
                  <span className="font-semibold">{formatMembers(memberCount)}</span>
                ) : (
                  <span className="font-semibold">{formatMembers(group.members)}</span>
                )}
              </div>

              {/* Last Update */}
              <div className="text-center text-gray-500 text-sm mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Güncellendi: {formatDate(group.createdAt)} </span>
                </div>
              </div>

              {/* View Count and Report Button */}
              <div className="flex flex-col items-center space-y-2">
                <div className="text-center text-gray-500 text-sm">
                  <span>{Math.floor(Math.random() * 1000) + 100} görüntüleme</span>
                </div>
                <button 
                  onClick={handleReport}
                  className="flex items-center space-x-1 text-red-500 hover:text-red-700 text-sm transition-colors"
                >
                  <Flag className="w-4 h-4" />
                  <span>Bildir</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Stats and Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600 text-sm">Global Rank</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">#{globalRank}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600 text-sm">Category Rank</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">#{categoryRank}</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Açıklama</h3>
              <p className="text-gray-700 leading-relaxed mb-6">{group.description}</p>
              
              {/* Tags */}
              {group.tags.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Etiketler</h4>
                  <div className="flex flex-wrap gap-2">
                    {group.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                      >
                        <Hash className="w-3 h-3" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Similar Groups Section */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Benzer Gruplar</h3>
                <Link 
                  to={`/category/${group.category.toLowerCase()}`}
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1"
                >
                  <span>Tümünü Gör</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups
                  .filter(g => g.category === group.category && g.id !== group.id)
                  .slice(0, 6)
                  .map((similarGroup) => {
                    const SimilarCategoryIcon = getCategoryIcon(similarGroup.category);
                    
                    return (
                      <Link
                        key={similarGroup.id}
                        to={`/group/${createSlug(similarGroup.name)}`}
                        className="group bg-gray-50 rounded-2xl p-4 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 transform hover:scale-105"
                      >
                        <div className="flex items-start space-x-3">
                          {/* Group Image or Icon */}
                          {similarGroup.image ? (
                            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                              <img
                                src={similarGroup.image}
                                alt={similarGroup.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className={`w-12 h-12 bg-gradient-to-br ${getCategoryColor(similarGroup.category)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                              <SimilarCategoryIcon className="w-6 h-6 text-white" />
                            </div>
                          )}
                          
                          {/* Group Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1 mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-purple-600 transition-colors">
                                {similarGroup.name}
                              </h4>
                              {similarGroup.verified && (
                                <CheckCircle className="w-3 h-3 text-blue-500 flex-shrink-0" />
                              )}
                              {similarGroup.featured && (
                                <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                              )}
                            </div>
                            
                            <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                              {similarGroup.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1 text-gray-500">
                                <Users className="w-3 h-3" />
                                <span className="text-xs font-medium">{formatMembers(similarGroup.members)}</span>
                              </div>
                              
                              {/* Tags */}
                              <div className="flex gap-1">
                                {similarGroup.tags.slice(0, 1).map((tag: string) => (
                                  <span
                                    key={tag}
                                    className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
              </div>

              {/* No Similar Groups Message */}
              {groups.filter(g => g.category === group.category && g.id !== group.id).length === 0 && (
                <div className="text-center py-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${getCategoryColor(group.category)} rounded-full flex items-center justify-center mx-auto mb-4 opacity-50`}>
                    <CategoryIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {group.category} kategorisinde başka grup bulunamadı
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Bu kategoride henüz başka grup eklenmemiş
                  </p>
                  <Link
                    to="/categories"
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                  >
                    Diğer kategorileri keşfet
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Grubu Bildir</h3>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                  setReportSuccess(false);
                  setReportError(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {reportSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Bildiriminiz Alındı</h4>
                <p className="text-gray-600">Bildiriminiz için teşekkür ederiz. En kısa sürede incelenecektir.</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Bu grubu neden bildirmek istediğinizi lütfen belirtin. Bildiriminiz gizli tutulacak ve yöneticilerimiz tarafından incelenecektir.
                </p>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Bildirim Nedeni
                  </label>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Lütfen bildirim nedeninizi açıklayın..."
                  />
                </div>
                
                {reportError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-700 text-sm">{reportError}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowReportModal(false);
                      setReportReason('');
                      setReportError(null);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={submitReport}
                    className="flex-1 bg-red-500 text-white py-2 rounded-xl font-medium hover:bg-red-600 transition-colors"
                  >
                    Bildir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// X icon for the modal close button
const X = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 6 6 18"></path>
    <path d="m6 6 12 12"></path>
  </svg>
);