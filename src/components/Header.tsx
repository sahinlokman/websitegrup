import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Home, Plus, Search, User, Menu, LogIn, UserPlus, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { LoginModal } from './auth/LoginModal';
import { RegisterModal } from './auth/RegisterModal';
import { AddGroupModal } from './AddGroupModal';
import { PenTool, Shield } from 'lucide-react';

interface HeaderProps {
  categories?: Array<{ name: string; icon: any; color: string }>;
  onGroupAdded?: (group: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ categories = [], onGroupAdded }) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [headerSettings, setHeaderSettings] = useState({
    logo: '',
    showSearch: true,
    showCategories: true,
    showAddGroup: true,
    customLinks: []
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Load header settings from localStorage
  useEffect(() => {
    try {
      const savedHeaderSettings = localStorage.getItem('adminHeaderSettings');
      if (savedHeaderSettings) {
        setHeaderSettings(JSON.parse(savedHeaderSettings));
      }
    } catch (error) {
      console.error('Error loading header settings:', error);
    }
  }, []);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  useEffect(() => {
    // Check if user is admin
    if (user && user.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const handleAddGroupClick = () => {
    if (isAuthenticated) {
      setShowAddGroupModal(true);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleGroupAdded = (group: any) => {
    if (onGroupAdded) {
      onGroupAdded(group);
    }
    setShowAddGroupModal(false);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">Telegram Grupları</h1>
              <p className="text-xs text-gray-600">En iyi Türkçe grupları keşfedin</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Ana Sayfa</span>
            </Link>
            
            <Link
              to="/categories"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/categories') 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Kategoriler</span>
            </Link>
            
            <Link
              to="/top-100"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/top-100') 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Top 100</span>
            </Link>
          </nav>

          {/* Add Group Button */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleAddGroupClick}
              className={`${headerSettings.showAddGroup ? 'flex' : 'hidden'} bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full font-semibold items-center space-x-2 hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105`}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Grup Ekle</span>
            </button>

            {/* Custom Links */}
            {headerSettings.customLinks && headerSettings.customLinks.filter(link => link.enabled).map((link, index) => (
              <Link
                key={index}
                to={link.url}
                className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span>{link.label}</span>
              </Link>
            ))}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors relative"
              >
                <User className="w-4 h-4 text-gray-600" />
                <span className="hidden sm:inline text-gray-700 font-medium">
                  {user?.fullName || 'Kullanıcı'}
                </span>
                {isAdmin && (
                  <Shield className="w-3 h-3 text-blue-500 absolute -top-1 -right-1" />
                )}
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Giriş</span>
                </button>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Üye Ol</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="flex items-center justify-around py-2">
            <Link
              to="/"
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive('/') 
                  ? 'text-purple-700' 
                  : 'text-gray-600'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Ana Sayfa</span>
            </Link>
            
            <Link
              to="/categories"
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive('/categories') 
                  ? 'text-purple-700' 
                  : 'text-gray-600'
              }`}
            >
              <Search className="w-5 h-5" />
              <span>Kategoriler</span>
            </Link>
            
            <Link
              to="/top-100"
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive('/top-100') 
                  ? 'text-purple-700' 
                  : 'text-gray-600'
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span>Top 100</span>
            </Link>
            
            {/* Admin Panel Link (Mobile) */}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-gray-600"
              >
                <Shield className="w-5 h-5" />
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>
      </div>
      </header>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />

      <AddGroupModal
        isOpen={showAddGroupModal}
        onClose={() => setShowAddGroupModal(false)}
        onGroupAdded={handleGroupAdded}
        categories={categories}
      />
    </>
  );
};