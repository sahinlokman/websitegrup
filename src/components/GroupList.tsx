import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, Plus, Filter, MessageCircle, Star, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { AddGroupModal } from './AddGroupModal';
import { TelegramGroup } from '../types/telegram';
import { promotionService } from '../services/promotionService';
import { telegramApi } from '../services/telegramApi';
import { createSlug } from '../utils/slug';

interface GroupListProps {
  groups: TelegramGroup[];
  categories: Array<{ name: string; icon: any; color: string }>;
  onGroupAdded: (group: TelegramGroup) => void;
}

export const GroupList: React.FC<GroupListProps> = ({ groups, categories, onGroupAdded }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [showAddForm, setShowAddForm] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [loadingGroups, setLoadingGroups] = useState<Record<string, boolean>>({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Süresi dolan öne çıkarmaları kontrol et
  React.useEffect(() => {
    promotionService.checkExpiredPromotions();
  }, []);
  
  // Grup üye sayılarını güncelle
  useEffect(() => {
    const updateMemberCounts = async () => {
      // Her seferinde en fazla 5 grup için güncelleme yap (API rate limit'i aşmamak için)
      const groupsToUpdate = groups.slice(0, 5);
      
      for (const group of groupsToUpdate) {
        if (!group.username) continue;
        
        setLoadingGroups(prev => ({ ...prev, [group.id]: true }));
        
        try {
          const username = group.username || group.link.split('/').pop() || '';
          if (!username) continue;
          
          const count = await telegramApi.getGroupMemberCount(username);
          if (count !== null) {
            setMemberCounts(prev => ({ ...prev, [group.id]: count }));
          }
        } catch (error) {
          console.error(`Error updating member count for ${group.name}:`, error);
        } finally {
          setLoadingGroups(prev => ({ ...prev, [group.id]: false }));
        }
      }
    };
    
    updateMemberCounts();
  }, [groups]);

  const filteredGroups = useMemo(() => {
    let filtered = groups;

    // Sadece onaylanmış grupları göster
    filtered = filtered.filter(group => group.approved === true);

    if (selectedCategory !== 'Tümü') {
      filtered = filtered.filter(group => group.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.members - a.members;
      }
      if (sortBy === 'members') return b.members - a.members;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    return filtered;
  }, [searchTerm, selectedCategory, sortBy, groups]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGroups = filteredGroups.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  const formatMembers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.icon : Globe;
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : 'from-purple-500 to-pink-500';
  };

  // Pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    const visiblePages = getVisiblePages();

    return (
      <div className="flex items-center justify-center space-x-2 mt-12">
        {/* Previous button */}
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Önceki
        </button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-500">...</span>
              ) : (
                <button
                  onClick={() => setCurrentPage(page as number)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Sonraki
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 hidden md:block">
        <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Grup ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              />
            </div>


            {/* Sort */}
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="featured">Öne Çıkanlar</option>
                <option value="members">Üye Sayısı</option>
                <option value="name">İsim</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 hidden md:block">Kategoriler</h2>
          <Link 
            to="/categories"
            className="text-purple-600 hover:text-purple-700 font-medium text-sm items-center space-x-1 hidden md:flex"
          >
            <span>Tümünü Gör</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => {
            const Icon = category.icon;
            
            return (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex items-center space-x-1 sm:space-x-2 px-3 py-2 sm:px-6 sm:py-3 rounded-full font-medium text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category.name
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Info */}
      {filteredGroups.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">
              {filteredGroups.length} gruptan {startIndex + 1}-{Math.min(endIndex, filteredGroups.length)} arası gösteriliyor
            </p>
            {totalPages > 1 && (
              <p className="text-gray-600 text-sm">
                Sayfa {currentPage} / {totalPages}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Groups Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentGroups.map((group) => {
            const CategoryIcon = getCategoryIcon(group.category);
            const isPromoted = promotionService.isGroupPromoted(group.id);
            
            return (
              <div
                key={group.id}
                className="group bg-white rounded-3xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {/* Grup Görseli */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {group.image ? (
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-gray-200">
                        <img
                          src={group.image}
                          alt={group.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className={`w-12 h-12 bg-gradient-to-br ${getCategoryColor(group.category)} rounded-2xl flex items-center justify-center`}>
                        <CategoryIcon className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Link 
                          to={`/group/${createSlug(group.name)}`}
                          className="font-bold text-gray-900 truncate hover:text-purple-600 transition-colors"
                        >
                          {group.name}
                        </Link>
                        {group.verified && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm">{group.category}</p>
                    </div>
                  </div>
                  {(group.featured || isPromoted) && (
                    <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      <Star className="w-3 h-3" />
                      <span>Öne Çıkan</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{group.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {loadingGroups[group.id] ? (
                        "Yükleniyor..."
                      ) : memberCounts[group.id] ? (
                        `${formatMembers(memberCounts[group.id])} üye`
                      ) : (
                        `${formatMembers(group.members)} üye`
                      )}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {group.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href={group.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-2xl font-semibold text-center block hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform group-hover:scale-105"
                >
                  Gruba Katıl
                </a>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {renderPagination()}

        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Grup bulunamadı</h3>
            <p className="text-gray-600">Arama kriterlerinizi değiştirmeyi deneyin</p>
          </div>
        )}
      </div>

      {/* Add Group Modal */}
      <AddGroupModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onGroupAdded={onGroupAdded}
        categories={categories}
      />
    </div>
  );
};