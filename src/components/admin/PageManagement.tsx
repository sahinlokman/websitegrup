import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Globe,
  FileText,
  Calendar,
  User,
  Settings,
  ExternalLink,
  Copy,
  MoreVertical
} from 'lucide-react';
import { Page } from '../../types/page';
import { PageEditor } from './PageEditor';

interface PageManagementProps {
  pages: Page[];
  onUpdatePage: (page: Page) => void;
  onDeletePage: (pageId: string) => void;
  onAddPage: (page: Page) => void;
}

export const PageManagement: React.FC<PageManagementProps> = ({
  pages,
  onUpdatePage,
  onDeletePage,
  onAddPage
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'private'>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleNewPage = () => {
    setEditingPage(null);
    setShowEditor(true);
  };

  const handleEditPage = (page: Page) => {
    setEditingPage(page);
    setShowEditor(true);
  };

  const handleSavePage = (pageData: any) => {
    if (editingPage) {
      const updatedPage: Page = {
        ...editingPage,
        ...pageData,
        updatedAt: new Date()
      };
      onUpdatePage(updatedPage);
    } else {
      const newPage: Page = {
        id: `page-${Date.now()}`,
        ...pageData,
        author: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: pageData.status === 'published' ? new Date() : undefined
      };
      onAddPage(newPage);
    }
    setShowEditor(false);
    setEditingPage(null);
  };

  const handleDeletePage = (pageId: string) => {
    if (confirm('Bu sayfayı silmek istediğinizden emin misiniz?')) {
      onDeletePage(pageId);
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedPages.length === 0) return;
    
    switch (action) {
      case 'delete':
        if (confirm(`${selectedPages.length} sayfayı silmek istediğinizden emin misiniz?`)) {
          selectedPages.forEach(pageId => onDeletePage(pageId));
          setSelectedPages([]);
        }
        break;
      case 'publish':
        selectedPages.forEach(pageId => {
          const page = pages.find(p => p.id === pageId);
          if (page) {
            onUpdatePage({
              ...page,
              status: 'published',
              publishedAt: new Date(),
              updatedAt: new Date()
            });
          }
        });
        setSelectedPages([]);
        break;
      case 'draft':
        selectedPages.forEach(pageId => {
          const page = pages.find(p => p.id === pageId);
          if (page) {
            onUpdatePage({
              ...page,
              status: 'draft',
              updatedAt: new Date()
            });
          }
        });
        setSelectedPages([]);
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-yellow-100 text-yellow-700';
      case 'private': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Yayında';
      case 'draft': return 'Taslak';
      case 'private': return 'Özel';
      default: return 'Bilinmiyor';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const copyPageUrl = (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    // Toast notification burada gösterilebilir
  };

  if (showEditor) {
    return (
      <PageEditor
        page={editingPage}
        onSave={handleSavePage}
        onCancel={() => {
          setShowEditor(false);
          setEditingPage(null);
        }}
      />
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sayfa Yönetimi</h1>
        <p className="text-gray-600">Web sitesi sayfalarını oluşturun, düzenleyin ve yönetin</p>
      </div>

      {/* Header Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Sayfa ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="published">Yayında</option>
                <option value="draft">Taslak</option>
                <option value="private">Özel</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedPages.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedPages.length} seçili</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkAction(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="bg-gray-50 border border-gray-300 rounded-2xl px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Toplu İşlem</option>
                  <option value="publish">Yayınla</option>
                  <option value="draft">Taslağa Çevir</option>
                  <option value="delete">Sil</option>
                </select>
              </div>
            )}

            {/* Add Page Button */}
            <button
              onClick={handleNewPage}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Yeni Sayfa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6">
                  <input
                    type="checkbox"
                    checked={selectedPages.length === filteredPages.length && filteredPages.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPages(filteredPages.map(p => p.id));
                      } else {
                        setSelectedPages([]);
                      }
                    }}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Sayfa</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Durum</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Yazar</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Tarih</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedPages.includes(page.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPages(prev => [...prev, page.id]);
                        } else {
                          setSelectedPages(prev => prev.filter(id => id !== page.id));
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-start space-x-3">
                      {page.featuredImage ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                          <img
                            src={page.featuredImage}
                            alt={page.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{page.title}</h3>
                        <p className="text-gray-600 text-sm truncate">/{page.slug}</p>
                        {page.excerpt && (
                          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{page.excerpt}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(page.status)}`}>
                      {getStatusText(page.status)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 text-sm">{page.author}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div className="text-gray-900">{formatDate(page.updatedAt)}</div>
                      {page.publishedAt && (
                        <div className="text-gray-500 text-xs">
                          Yayın: {formatDate(page.publishedAt)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditPage(page)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Düzenle"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      {page.status === 'published' && (
                        <button
                          onClick={() => window.open(`/${page.slug}`, '_blank')}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          title="Görüntüle"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => copyPageUrl(page.slug)}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        title="URL Kopyala"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeletePage(page.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPages.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sayfa bulunamadı</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Arama kriterlerinizi değiştirmeyi deneyin' : 'Henüz sayfa eklenmemiş'}
            </p>
            <button
              onClick={handleNewPage}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>İlk Sayfayı Oluştur</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};