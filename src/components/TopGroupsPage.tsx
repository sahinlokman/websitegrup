import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Star, 
  CheckCircle, 
  Globe, 
  Filter,
  Search,
  Trophy,
  Medal,
  Award,
  Crown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TelegramGroup } from '../types/telegram';
import { createSlug } from '../utils/slug';

interface TopGroupsPageProps {
  groups: TelegramGroup[];
  categories: Array<{ name: string; icon: any; color: string }>;
}

export const TopGroupsPage: React.FC<TopGroupsPageProps> = ({ groups, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const sortedGroups = useMemo(() => {
    let filtered = groups;

    // Sadece onaylanmış grupları göster
    filtered = filtered.filter(group => group.approved === true);

    if (selectedCategory !== 'Tümü') {
      filtered = filtered.filter(group => group.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => b.members - a.members);
  }, [groups, selectedCategory, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedGroups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGroups = sortedGroups.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const formatMembers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toLocaleString();
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.icon : Globe;
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : 'from-purple-500 to-pink-500';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    if (rank <= 10) return <Award className="w-5 h-5 text-purple-500" />;
    return null;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
    if (rank <= 10) return 'bg-gradient-to-r from-purple-500 to-purple-700 text-white';
    if (rank <= 50) return 'bg-gradient-to-r from-blue-500 to-blue-700 text-white';
    return 'bg-gray-100 text-gray-700';
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
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">En Popüler Gruplar</h1>
            <p className="text-xl text-white text-opacity-90 mb-8 max-w-2xl mx-auto">
              Üye sayısına göre en popüler Telegram gruplarını keşfedin
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">{sortedGroups.length}</div>
                <div className="text-white text-opacity-80">Toplam Grup</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {formatMembers(sortedGroups.reduce((sum, g) => sum + g.members, 0))}
                </div>
                <div className="text-white text-opacity-80">Toplam Üye</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">{categories.length - 1}</div>
                <div className="text-white text-opacity-80">Kategori</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl p-6 border border-gray-200 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
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

            {/* Category Filter */}
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.map(category => (
                  <option key={category.name} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        {sortedGroups.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-600 text-sm">
                {sortedGroups.length} gruptan {startIndex + 1}-{Math.min(endIndex, sortedGroups.length)} arası gösteriliyor
              </p>
              {totalPages > 1 && (
                <p className="text-gray-600 text-sm">
                  Sayfa {currentPage} / {totalPages}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Top 3 Podium - Only show on first page */}
        {currentPage === 1 && sortedGroups.length >= 3 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Podium</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* 2nd Place */}
              <div className="order-1 md:order-1">
                <div className="bg-white rounded-3xl p-6 border border-gray-200 text-center transform md:translate-y-4">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-gray-400 mb-2">#2</div>
                  <Link 
                    to={`/group/${createSlug(sortedGroups[1].name)}`}
                    className="font-bold text-gray-900 hover:text-purple-600 transition-colors block mb-2"
                  >
                    {sortedGroups[1].name}
                  </Link>
                  <div className="text-2xl font-bold text-gray-600 mb-2">
                    {formatMembers(sortedGroups[1].members)}
                  </div>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {sortedGroups[1].category}
                  </span>
                </div>
              </div>

              {/* 1st Place */}
              <div className="order-2 md:order-2">
                <div className="bg-white rounded-3xl p-6 border-2 border-yellow-400 text-center relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold">
                      CHAMPION
                    </div>
                  </div>
                  <div className="flex items-center justify-center mb-4 mt-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <Crown className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="text-5xl font-bold text-yellow-500 mb-2">#1</div>
                  <Link 
                    to={`/group/${createSlug(sortedGroups[0].name)}`}
                    className="font-bold text-gray-900 hover:text-purple-600 transition-colors block mb-2 text-lg"
                  >
                    {sortedGroups[0].name}
                  </Link>
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {formatMembers(sortedGroups[0].members)}
                  </div>
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                    {sortedGroups[0].category}
                  </span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="order-3 md:order-3">
                <div className="bg-white rounded-3xl p-6 border border-gray-200 text-center transform md:translate-y-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                      <Medal className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-amber-600 mb-2">#3</div>
                  <Link 
                    to={`/group/${createSlug(sortedGroups[2].name)}`}
                    className="font-bold text-gray-900 hover:text-purple-600 transition-colors block mb-2"
                  >
                    {sortedGroups[2].name}
                  </Link>
                  <div className="text-2xl font-bold text-amber-600 mb-2">
                    {formatMembers(sortedGroups[2].members)}
                  </div>
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">
                    {sortedGroups[2].category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Groups Table */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Sıra</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Grup</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Kategori</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Üye Sayısı</th>
                  <th className="py-4 px-6 text-center text-sm font-medium text-gray-700">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentGroups.map((group, index) => {
                  const rank = startIndex + index + 1;
                  const CategoryIcon = getCategoryIcon(group.category);
                  
                  return (
                    <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadgeColor(rank)}`}>
                            {rank}
                          </span>
                          {getRankIcon(rank)}
                        </div>
                      </td>
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
                            <div className={`w-10 h-10 bg-gradient-to-br ${getCategoryColor(group.category)} rounded-2xl flex items-center justify-center`}>
                              <CategoryIcon className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <Link 
                                to={`/group/${createSlug(group.name)}`}
                                className="font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                              >
                                {group.name}
                              </Link>
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
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">{formatMembers(group.members)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <a
                          href={group.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                        >
                          Katıl
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {renderPagination()}

        {sortedGroups.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Grup bulunamadı</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Arama kriterlerinize uygun grup bulunmuyor. Filtreleri değiştirmeyi deneyin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};