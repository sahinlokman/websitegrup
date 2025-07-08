import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Users, 
  User,
  Mail, 
  Calendar, 
  Shield, 
  Eye, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { createSlug } from '../../utils/slug';
import { User as UserType } from '../../types/user';
import { UserGroup } from '../../types/userGroup';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/supabaseService';

interface UserWithGroups extends UserType {
  groups: UserGroup[];
}

export const UserManagement: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<UserWithGroups[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'groups'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Admin kontrolü
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    loadUsers();
  }, []);



  const loadUsers = async () => {
    setIsLoading(true);
    try {
      console.log('Loading users from Supabase...');
      
      // Supabase'den kullanıcıları yükle
      const supabaseUsers = await authService.getUsers();
      console.log('Supabase users:', supabaseUsers);
      
      // Eğer Supabase boşsa, demo kullanıcıları ekle
      if (supabaseUsers.length === 0) {
        console.log('No users found in Supabase, adding demo users...');
        await addDemoUsers();
        // Demo kullanıcıları ekledikten sonra tekrar yükle
        const updatedUsers = await authService.getUsers();
        console.log('Users after adding demo data:', updatedUsers);
        setUsers(updatedUsers.map(user => ({ ...user, groups: [] })));
      } else {
        // Her kullanıcı için grupları yükle
        const usersWithGroups: UserWithGroups[] = supabaseUsers.map(user => {
          const userGroups = loadUserGroups(user.id);
          return {
            ...user,
            groups: userGroups
          };
        });
        
        console.log('Users with groups:', usersWithGroups);
        setUsers(usersWithGroups);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addDemoUsers = async () => {
    try {
      // Demo kullanıcıları Supabase'e ekle
      const demoUsers = [
        {
          username: 'admin',
          email: 'admin@telegramgruplari.com',
          fullName: 'Site Yöneticisi',
          password: 'pass46',
          confirmPassword: 'pass46'
        },
        {
          username: 'demo',
          email: 'demo@example.com',
          fullName: 'Demo Kullanıcı',
          password: 'demo123',
          confirmPassword: 'demo123'
        },
        {
          username: 'testuser',
          email: 'test@example.com',
          fullName: 'Test Kullanıcı',
          password: 'test123',
          confirmPassword: 'test123'
        }
      ];

      for (const userData of demoUsers) {
        try {
          await authService.register(userData);
          console.log(`Created demo user: ${userData.username}`);
        } catch (error) {
          console.log(`Demo user ${userData.username} already exists or error:`, error);
        }
      }
    } catch (error) {
      console.error('Error adding demo users:', error);
    }
  };

  const loadUserGroups = (userId: string): UserGroup[] => {
    try {
      const savedGroups = localStorage.getItem(`userGroups_${userId}`);
      console.log(`Loading groups for user ${userId}:`, savedGroups);
      if (savedGroups) {
        const parsedGroups = JSON.parse(savedGroups);
        
        // Date string'leri Date objelerine çevir
        return parsedGroups.map((group: any) => ({
          ...group,
          submittedAt: new Date(group.submittedAt),
          reviewedAt: group.reviewedAt ? new Date(group.reviewedAt) : undefined
        }));
      }
      console.log(`No groups found for user ${userId}`);
      return [];
    } catch (error) {
      console.error(`Error loading groups for user ${userId}:`, error);
      return [];
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        const success = await authService.deleteUser(userId);
        if (success) {
          // State'i güncelle
          setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
          alert('Kullanıcı başarıyla silindi!');
        } else {
          alert('Kullanıcı silinirken bir hata oluştu!');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Kullanıcı silinirken bir hata oluştu!');
      }
    }
  };

  const handleToggleUserRole = async (userId: string, currentRole: 'admin' | 'user') => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      
      const success = await authService.updateUserRole(userId, newRole);
      if (success) {
        // State'i güncelle
        setUsers(prevUsers => prevUsers.map(user => {
          if (user.id === userId) {
            return {
              ...user,
              role: newRole
            };
          }
          return user;
        }));
        
        alert(`Kullanıcı rolü ${newRole === 'admin' ? 'Yönetici' : 'Kullanıcı'} olarak güncellendi!`);
      } else {
        alert('Kullanıcı rolü güncellenirken bir hata oluştu!');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Kullanıcı rolü güncellenirken bir hata oluştu!');
    }
  };

  const toggleExpand = (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
    }
  };

  const formatDate = (date: Date) => {
    // Check if the date is valid
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Bilinmiyor';
    }
    
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Onaylandı';
      case 'rejected':
        return 'Reddedildi';
      case 'pending':
        return 'İnceleniyor';
      default:
        return 'Bilinmiyor';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortDirection === 'asc' 
          ? a.fullName.localeCompare(b.fullName)
          : b.fullName.localeCompare(a.fullName);
      } else if (sortBy === 'date') {
        return sortDirection === 'asc'
          ? a.createdAt.getTime() - b.createdAt.getTime()
          : b.createdAt.getTime() - a.createdAt.getTime();
      } else if (sortBy === 'groups') {
        return sortDirection === 'asc'
          ? a.groups.length - b.groups.length
          : b.groups.length - a.groups.length;
      }
      return 0;
    });

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const refreshData = async () => {
    await loadUsers();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kullanıcı Yönetimi</h1>
        <p className="text-gray-600">Kayıtlı kullanıcıları ve gruplarını yönetin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{users.length}</div>
              <div className="text-gray-600 text-sm">Toplam Kullanıcı</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {users.filter(user => user.role === 'admin').length}
              </div>
              <div className="text-gray-600 text-sm">Yöneticiler</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {users.reduce((total, user) => total + user.groups.length, 0)}
              </div>
              <div className="text-gray-600 text-sm">Toplam Grup</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Role Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'user')}
                className="bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tüm Roller</option>
                <option value="admin">Yöneticiler</option>
                <option value="user">Kullanıcılar</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'groups')}
                className="bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="date">Kayıt Tarihi</option>
                <option value="name">İsim</option>
                <option value="groups">Grup Sayısı</option>
              </select>
              <button
                onClick={toggleSortDirection}
                className="p-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-100"
              >
                {sortDirection === 'asc' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={refreshData}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Yenile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <div key={user.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* User Header */}
                <div 
                  className="p-6 flex flex-col md:flex-row md:items-center md:justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(user.id)}
                >
                  <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                        {user.role === 'admin' && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                            Yönetici
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>@{user.username}</span>
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{user.groups.length}</div>
                      <div className="text-xs text-gray-500">Grup</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">{formatDate(user.createdAt)}</div>
                      <div className="text-xs text-gray-500">Kayıt Tarihi</div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(user.id);
                      }}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {expandedUser === user.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    
                  </div>
                </div>
                
                {/* User Details */}
                {expandedUser === user.id && (
                  <div className="border-t border-gray-200 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* User Info */}
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-4">Kullanıcı Bilgileri</h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <User className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Ad Soyad</p>
                              <p className="font-medium text-gray-900">{user.fullName}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">E-posta</p>
                              <p className="font-medium text-gray-900">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Kayıt Tarihi</p>
                              <p className="font-medium text-gray-900">{formatDate(user.createdAt)}</p>
                            </div>
                          </div>
                          {user.lastLogin && (
                            <div className="flex items-center space-x-3">
                              <Calendar className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">Son Giriş</p>
                                <p className="font-medium text-gray-900">{formatDate(user.lastLogin)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* User Groups */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">Kullanıcı Grupları</h4>
                          <div className="text-sm text-gray-500">Toplam: {user.groups.length} grup</div>
                        </div>
                        
                        {user.groups.length > 0 ? (
                          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                            {user.groups.map(group => (
                              <div key={group.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h5 className="font-medium text-gray-900">{group.groupName}</h5>
                                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(group.status)}`}>
                                        {getStatusText(group.status)}
                                      </span>
                                    </div>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">{group.groupDescription}</p>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                      <span>{group.category}</span>
                                      <span>{group.members.toLocaleString()} üye</span>
                                      <span>{formatDate(group.submittedAt)}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 ml-4">
                                    <a
                                      href={group.link}
                                      target="_blank"
                                      rel="noopener noreferrer" 
                                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                      title="Grubu Görüntüle"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                    {group.status === 'approved' && (
                                      <Link
                                        to={`/group/${createSlug(group.groupName)}`}
                                        target="_blank"
                                        className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                                        title="Grup Sayfasını Görüntüle"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-xl p-6 text-center">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-600">Bu kullanıcının henüz grubu yok</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* User Actions */}
                    <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-3">
                      <button
                        onClick={() => handleToggleUserRole(user.id, user.role)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium ${
                          user.role === 'admin'
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        } transition-colors`}
                      >
                        {user.role === 'admin' ? 'Yönetici Yetkisini Kaldır' : 'Yönetici Yap'}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200 transition-colors flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Kullanıcıyı Sil</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Kullanıcı bulunamadı</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Arama kriterlerinizi değiştirmeyi deneyin' : 'Henüz kayıtlı kullanıcı bulunmuyor'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};