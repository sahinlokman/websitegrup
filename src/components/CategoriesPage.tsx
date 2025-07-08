import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Star } from 'lucide-react';
import { TelegramGroup } from '../types/telegram';

interface CategoriesPageProps {
  groups: TelegramGroup[];
  categories: Array<{ name: string; icon: any; color: string }>;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ groups, categories }) => {
  // Kategori istatistiklerini hesapla
  const getCategoryStats = (categoryName: string) => {
    // Sadece onaylanmış grupları dahil et
    const categoryGroups = groups.filter(g => g.category === categoryName && g.approved === true);
    const totalMembers = categoryGroups.reduce((sum, g) => sum + g.members, 0);
    const featuredCount = categoryGroups.filter(g => g.featured).length;
    
    return {
      groupCount: categoryGroups.length,
      totalMembers,
      featuredCount,
      avgMembers: categoryGroups.length > 0 ? Math.round(totalMembers / categoryGroups.length) : 0
    };
  };

  const formatMembers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Tümü kategorisini hariç tut
  const displayCategories = categories.filter(cat => cat.name !== 'Tümü');

  return (
    <div>
      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayCategories.map((category) => {
            const Icon = category.icon;
            const stats = getCategoryStats(category.name);
            
            return (
              <Link
                key={category.name}
                to={`/category/${category.name.toLowerCase()}`}
                className="group bg-white rounded-3xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {/* Category Header */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-500 text-sm">{stats.groupCount} grup mevcut</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 text-sm">Toplam Üye</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatMembers(stats.totalMembers)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 text-sm">Ort. Üye</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatMembers(stats.avgMembers)}
                    </div>
                  </div>
                </div>

                {/* Featured Groups Count */}
                {stats.featuredCount > 0 && (
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-3">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-yellow-700 text-sm font-medium">
                      {stats.featuredCount} öne çıkan grup
                    </span>
                  </div>
                )}

                {/* Popular Tags Preview */}
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {groups
                      .filter(g => g.category === category.name)
                      .flatMap(g => g.tags)
                      .reduce((acc: string[], tag) => {
                        if (!acc.includes(tag) && acc.length < 3) {
                          acc.push(tag);
                        }
                        return acc;
                      }, [])
                      .map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Hover Effect Arrow */}
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-purple-600 font-semibold group-hover:text-purple-700 transition-colors">
                    Grupları Görüntüle
                  </span>
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <svg className="w-3 h-3 text-purple-600 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Popular Categories Section */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">En Popüler Kategoriler</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              En çok grup ve üyeye sahip kategorileri keşfedin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayCategories
              .map(cat => ({
                ...cat,
                stats: getCategoryStats(cat.name)
              }))
              .sort((a, b) => b.stats.totalMembers - a.stats.totalMembers)
              .slice(0, 3)
              .map((category, index) => {
                const Icon = category.icon;
                const medals = ['🥇', '🥈', '🥉'];
                
                return (
                  <Link
                    key={category.name}
                    to={`/category/${category.name.toLowerCase()}`}
                    className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">{medals[index]}</span>
                      <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-gray-500 text-sm">{category.stats.groupCount} grup</p>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {formatMembers(category.stats.totalMembers)}
                      </div>
                      <div className="text-gray-600 text-sm">toplam üye</div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};