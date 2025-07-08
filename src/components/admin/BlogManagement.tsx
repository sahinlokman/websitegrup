import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  User,
  Tag,
  BarChart3,
  Clock,
  Globe,
  Copy,
  ExternalLink,
  FileText
} from 'lucide-react';
import { BlogPost } from '../../types/blog';
import { BlogEditor } from './BlogEditor';

interface BlogManagementProps {
  posts: BlogPost[];
  onUpdatePost: (post: BlogPost) => void;
  onDeletePost: (postId: string) => void;
  onAddPost: (post: BlogPost) => void;
}

export const BlogManagement: React.FC<BlogManagementProps> = ({
  posts,
  onUpdatePost,
  onDeletePost,
  onAddPost
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'private'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);

  const categories = ['Teknoloji', 'Finans', 'Sanat', 'İş', 'Oyun', 'Müzik', 'Eğitim', 'Genel'];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleNewPost = () => {
    setEditingPost(null);
    setShowEditor(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setShowEditor(true);
  };

  const handleSavePost = (postData: any) => {
    if (editingPost) {
      const updatedPost: BlogPost = {
        ...editingPost,
        ...postData,
        updatedAt: new Date(),
        readTime: calculateReadTime(postData.content)
      };
      onUpdatePost(updatedPost);
    } else {
      const newPost: BlogPost = {
        id: `post-${Date.now()}`,
        ...postData,
        authorId: 'admin-1',
        author: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: postData.status === 'published' ? new Date() : undefined,
        views: 0,
        readTime: calculateReadTime(postData.content)
      };
      onAddPost(newPost);
    }
    setShowEditor(false);
    setEditingPost(null);
  };

  const calculateReadTime = (content: string): number => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  const handleDeletePost = (postId: string) => {
    if (confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) {
      onDeletePost(postId);
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedPosts.length === 0) return;
    
    switch (action) {
      case 'delete':
        if (confirm(`${selectedPosts.length} yazıyı silmek istediğinizden emin misiniz?`)) {
          selectedPosts.forEach(postId => onDeletePost(postId));
          setSelectedPosts([]);
        }
        break;
      case 'publish':
        selectedPosts.forEach(postId => {
          const post = posts.find(p => p.id === postId);
          if (post) {
            onUpdatePost({
              ...post,
              status: 'published',
              publishedAt: new Date(),
              updatedAt: new Date()
            });
          }
        });
        setSelectedPosts([]);
        break;
      case 'draft':
        selectedPosts.forEach(postId => {
          const post = posts.find(p => p.id === postId);
          if (post) {
            onUpdatePost({
              ...post,
              status: 'draft',
              updatedAt: new Date()
            });
          }
        });
        setSelectedPosts([]);
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

  const copyPostUrl = (slug: string) => {
    const url = `${window.location.origin}/blog/${slug}`;
    navigator.clipboard.writeText(url);
  };

  if (showEditor) {
    return (
      <BlogEditor
        post={editingPost}
        onSave={handleSavePost}
        onCancel={() => {
          setShowEditor(false);
          setEditingPost(null);
        }}
        categories={categories}
      />
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Yönetimi</h1>
        <p className="text-gray-600">Blog yazılarını oluşturun, düzenleyin ve yönetin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
              <div className="text-gray-600 text-sm">Toplam Yazı</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {posts.filter(p => p.status === 'published').length}
              </div>
              <div className="text-gray-600 text-sm">Yayında</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {posts.filter(p => p.status === 'draft').length}
              </div>
              <div className="text-gray-600 text-sm">Taslak</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {posts.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
              </div>
              <div className="text-gray-600 text-sm">Toplam Görüntüleme</div>
            </div>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Blog yazısı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Filters */}
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

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Bulk Actions */}
            {selectedPosts.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedPosts.length} seçili</span>
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

            {/* Add Post Button */}
            <button
              onClick={handleNewPost}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Yeni Yazı</span>
            </button>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6">
                  <input
                    type="checkbox"
                    checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPosts(filteredPosts.map(p => p.id));
                      } else {
                        setSelectedPosts([]);
                      }
                    }}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Yazı</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Kategori</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Durum</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Görüntüleme</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Tarih</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPosts(prev => [...prev, post.id]);
                        } else {
                          setSelectedPosts(prev => prev.filter(id => id !== post.id));
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-start space-x-3">
                      {post.featuredImage ? (
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
                        <p className="text-gray-600 text-sm truncate">/blog/{post.slug}</p>
                        {post.excerpt && (
                          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{post.excerpt}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-500 text-xs">{post.readTime} dk okuma</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {post.category}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(post.status)}`}>
                      {getStatusText(post.status)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 font-medium">{post.views.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div className="text-gray-900">{formatDate(post.updatedAt)}</div>
                      {post.publishedAt && (
                        <div className="text-gray-500 text-xs">
                          Yayın: {formatDate(post.publishedAt)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditPost(post)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Düzenle"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      {post.status === 'published' && (
                        <button
                          onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          title="Görüntüle"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => copyPostUrl(post.slug)}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        title="URL Kopyala"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeletePost(post.id)}
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

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Blog yazısı bulunamadı</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Arama kriterlerinizi değiştirmeyi deneyin' : 'Henüz blog yazısı eklenmemiş'}
            </p>
            <button
              onClick={handleNewPost}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>İlk Blog Yazısını Oluştur</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};