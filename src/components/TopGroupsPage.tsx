import React, { useState, useMemo } from 'react';
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
  Crown
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

    return filtered.sort((a, b) => b.members - a.members).slice(0, 100);
  }, [groups, selectedCategory, searchTerm]);

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

  return (
    <div>
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

        {/* Top 3 Podium */}
        {sortedGroups.length >= 3 && (
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

        {/* Full Rankings Table */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Tam Sıralama</h2>
            <p className="text-gray-600">
              {selectedCategory === 'Tümü' ? 'Tüm kategoriler' : selectedCategory} - 
              {sortedGroups.length} grup listeleniyor
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Sıra</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Grup</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Kategori</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Üye Sayısı</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedGroups.map((group, index) => {
                  const rank = index + 1;
                  const CategoryIcon = getCategoryIcon(group.category);
                  
                  return (
                    <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getRankBadgeColor(rank)}`}>
                            {rank <= 3 ? getRankIcon(rank) : `#${rank}`}
                          </div>
                          {rank <= 10 && rank > 3 && getRankIcon(rank)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {sortedGroups.length === 0 && (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Grup bulunamadı</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Arama kriterlerinizi değiştirmeyi deneyin' : 'Bu kategoride grup bulunmuyor'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};