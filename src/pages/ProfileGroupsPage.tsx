import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userGroupService } from '../services/supabaseService';
import { UserGroup, GroupSubmissionData } from '../types/userGroup';
import { Users, Calendar, Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft, Shield, LogOut, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AddGroupModal } from '../components/AddGroupModal';

export const ProfileGroupsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);

  // Mock categories for AddGroupModal
  const categories = [
    { name: 'Teknoloji', icon: () => null, color: 'from-blue-500 to-cyan-500' },
    { name: 'Finans', icon: () => null, color: 'from-green-500 to-emerald-500' },
    { name: 'Sanat', icon: () => null, color: 'from-pink-500 to-rose-500' },
    { name: 'İş', icon: () => null, color: 'from-orange-500 to-amber-500' },
    { name: 'Oyun', icon: () => null, color: 'from-violet-500 to-purple-500' },
    { name: 'Müzik', icon: () => null, color: 'from-red-500 to-pink-500' },
    { name: 'Eğitim', icon: () => null, color: 'from-indigo-500 to-blue-500' }
  ];

  useEffect(() => {
    // Check if user is admin
    if (user && user.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserGroups();
    }
  }, [user]);

  const loadUserGroups = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const groups = await userGroupService.getUserGroups(user.id);
      setUserGroups(groups);
    } catch (error) {
      console.error('Error loading user groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGroupAdded = (newGroup: any) => {
    // Create a UserGroup object from the new group
    const userGroup: UserGroup = {
      id: newGroup.id,
      userId: user!.id,
      groupName: newGroup.name,
      groupDescription: newGroup.description,
      groupUsername: newGroup.username || newGroup.name.toLowerCase().replace(/\s+/g, ''),
      groupImage: newGroup.image,
      category: newGroup.category,
      tags: newGroup.tags,
      link: newGroup.link,
      members: newGroup.members,
      status: 'pending',
      submittedAt: new Date(),
      submissionNote: 'Telegram API ile eklendi'
    };
    
    // Add to state
    setUserGroups([userGroup, ...userGroups]);
    
    // Close modal
    setShowAddGroupModal(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lütfen giriş yapın</h2>
          <p className="text-gray-600">Gruplarınızı görüntülemek için giriş yapmanız gerekiyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Home Button */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <div className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center group-hover:border-blue-300 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-medium">Yönetici Paneli</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="ml-4 flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Çıkış Yap</span>
            </button>
          </div>
          
          <div>
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium">Admin Panel</span>
              </Link>
            )}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gruplarım</h1>
              <p className="text-gray-600">Gönderdiğiniz Telegram gruplarını yönetin</p>
            </div>
            <button
              onClick={() => setShowAddGroupModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Yeni Grup Ekle</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : userGroups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz grup gönderilmedi</h3>
            <p className="text-gray-600 mb-6">İlk Telegram grubunuzu inceleme için göndererek başlayın.</p>
            <button 
              onClick={() => setShowAddGroupModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Grup Ekle</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {group.groupImage && (
                  <img
                    src={group.groupImage}
                    alt={group.groupName}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {group.groupName}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(group.status)}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {group.groupDescription}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-2" />
                      {group.members.toLocaleString()} members
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      Gönderildi: {group.submittedAt.toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}>
                      {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {group.category}
                    </span>
                  </div>
                  
                  {group.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        <strong>Reddedilme nedeni:</strong> {group.rejectionReason}
                      </p>
                    </div>
                  )}
                  
                  {group.submissionNote && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Not:</strong> {group.submissionNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add Group Modal */}
      <AddGroupModal
        isOpen={showAddGroupModal}
        onClose={() => setShowAddGroupModal(false)}
        onGroupAdded={handleGroupAdded}
        categories={categories}
      />
    </div>
  );
};