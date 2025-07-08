import React, { useState } from 'react';
import { Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Flag,
  Plus, 
  CheckSquare, 
  Search, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield,
  Grid3X3,
  FileText,
  PenTool,
  RefreshCw,
  UserCog,
  Palette
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  
  // Admin kontrolü
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Gösterge Paneli', exact: true },
    { path: '/admin/groups', icon: Users, label: 'Grup Yönetimi' },
    { path: '/admin/categories', icon: Grid3X3, label: 'Kategori Yönetimi' },
    { path: '/admin/users', icon: UserCog, label: 'Kullanıcı Yönetimi' },
    { path: '/admin/pages', icon: FileText, label: 'Sayfa Yönetimi' },
    { path: '/admin/blog', icon: PenTool, label: 'Blog Yönetimi' },
    { path: '/admin/pending', icon: CheckSquare, label: 'Bekleyen Gruplar' },
    { path: '/admin/seo', icon: Search, label: 'SEO Yönetimi' },
    { path: '/admin/reports', icon: Flag, label: 'Bildirilen Gruplar' },
    { path: '/admin/cache', icon: RefreshCw, label: 'Önbellek Yönetimi' },
    { path: '/admin/settings', icon: Settings, label: 'Site Ayarları' },
    { path: '/admin/appearance', icon: Palette, label: 'Görünüm Ayarları' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Yönetici Paneli</h1>
              <p className="text-xs text-gray-600">{user.fullName}</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <Link
            to="/"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Siteye Dön</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Hoş geldiniz, <span className="font-medium text-gray-900">{user.fullName}</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};