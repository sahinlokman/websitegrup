import React, { useState } from 'react';
import { 
  Search, 
  Edit, 
  Save, 
  X, 
  Globe, 
  FileText, 
  Hash,
  TrendingUp,
  Eye,
  CheckCircle,
  AlertCircle,
  Users,
  Grid3X3,
  Layers,
  Copy,
  RefreshCw
} from 'lucide-react';

interface SEOPage {
  id: string;
  path: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  lastUpdated: Date;
  status: 'optimized' | 'needs-attention' | 'not-optimized';
  score: number;
  type: 'static' | 'group' | 'category';
}

interface BulkSEOTemplate {
  id: string;
  name: string;
  type: 'group' | 'category';
  titleTemplate: string;
  descriptionTemplate: string;
  keywordsTemplate: string[];
  variables: string[];
}

export const SEOManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPage, setEditingPage] = useState<SEOPage | null>(null);
  const [selectedTab, setSelectedTab] = useState<'pages' | 'bulk-groups' | 'bulk-categories' | 'templates'>('pages');
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);

  // Mock SEO data
  const seoPages: SEOPage[] = [
    {
      id: '1',
      path: '/',
      title: 'Telegram Grupları - En İyi Türkçe Telegram Gruplarını Keşfedin',
      metaDescription: 'Türkiye\'nin en kapsamlı Telegram grupları dizini. Teknoloji, finans, sanat, eğitim ve daha fazla kategoride binlerce grubu keşfedin.',
      keywords: ['telegram grupları', 'türkçe telegram', 'telegram kanalları', 'teknoloji grupları'],
      ogTitle: 'Telegram Grupları - En İyi Türkçe Telegram Gruplarını Keşfedin',
      ogDescription: 'Türkiye\'nin en kapsamlı Telegram grupları dizini. Binlerce grubu keşfedin.',
      lastUpdated: new Date('2024-01-20'),
      status: 'optimized',
      score: 95,
      type: 'static'
    },
    {
      id: '2',
      path: '/categories',
      title: 'Telegram Grup Kategorileri | Telegram Grupları',
      metaDescription: 'Telegram gruplarını kategorilere göre keşfedin. Teknoloji, finans, sanat, eğitim ve daha fazla kategori.',
      keywords: ['telegram kategorileri', 'grup kategorileri', 'teknoloji grupları'],
      lastUpdated: new Date('2024-01-18'),
      status: 'needs-attention',
      score: 78,
      type: 'static'
    },
    {
      id: '3',
      path: '/category/teknoloji',
      title: 'Teknoloji Telegram Grupları | En İyi Teknoloji Kanalları',
      metaDescription: 'En iyi teknoloji Telegram gruplarını keşfedin. Yazılım, donanım, AI ve daha fazlası.',
      keywords: ['teknoloji telegram', 'yazılım grupları', 'programlama telegram'],
      lastUpdated: new Date('2024-01-15'),
      status: 'not-optimized',
      score: 65,
      type: 'category'
    },
    {
      id: '4',
      path: '/group/react-developers-tr',
      title: 'React Developers TR - Telegram Grubu | React ve JavaScript Topluluğu',
      metaDescription: 'React Developers TR Telegram grubuna katılın. React, Next.js ve modern web teknolojileri hakkında Türkçe tartışmalar.',
      keywords: ['react telegram', 'javascript grubu', 'web development türkiye'],
      lastUpdated: new Date('2024-01-12'),
      status: 'optimized',
      score: 88,
      type: 'group'
    }
  ];

  // Mock bulk templates
  const bulkTemplates: BulkSEOTemplate[] = [
    {
      id: '1',
      name: 'Grup Sayfaları Şablonu',
      type: 'group',
      titleTemplate: '{GROUP_NAME} - Telegram Grubu | {CATEGORY} Topluluğu',
      descriptionTemplate: '{GROUP_NAME} Telegram grubuna katılın. {DESCRIPTION} {MEMBER_COUNT} üyeli aktif topluluk.',
      keywordsTemplate: ['{GROUP_NAME_LOWER} telegram', '{CATEGORY_LOWER} grubu', 'telegram {CATEGORY_LOWER}'],
      variables: ['GROUP_NAME', 'CATEGORY', 'DESCRIPTION', 'MEMBER_COUNT', 'GROUP_NAME_LOWER', 'CATEGORY_LOWER']
    },
    {
      id: '2',
      name: 'Kategori Sayfaları Şablonu',
      type: 'category',
      titleTemplate: '{CATEGORY} Telegram Grupları | En İyi {CATEGORY} Kanalları',
      descriptionTemplate: 'En iyi {CATEGORY_LOWER} Telegram gruplarını keşfedin. {GROUP_COUNT} grup ve {TOTAL_MEMBERS} üye ile Türkiye\'nin en büyük {CATEGORY_LOWER} topluluğu.',
      keywordsTemplate: ['{CATEGORY_LOWER} telegram', '{CATEGORY_LOWER} grupları', 'telegram {CATEGORY_LOWER}'],
      variables: ['CATEGORY', 'CATEGORY_LOWER', 'GROUP_COUNT', 'TOTAL_MEMBERS']
    }
  ];

  const [groupTemplate, setGroupTemplate] = useState(bulkTemplates[0]);
  const [categoryTemplate, setCategoryTemplate] = useState(bulkTemplates[1]);

  const filteredPages = seoPages.filter(page =>
    page.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimized': return 'text-green-600 bg-green-100';
      case 'needs-attention': return 'text-yellow-600 bg-yellow-100';
      case 'not-optimized': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimized': return <CheckCircle className="w-4 h-4" />;
      case 'needs-attention': return <AlertCircle className="w-4 h-4" />;
      case 'not-optimized': return <X className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'group': return <Users className="w-4 h-4" />;
      case 'category': return <Grid3X3 className="w-4 h-4" />;
      case 'static': return <Globe className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const handleEditPage = (page: SEOPage) => {
    setEditingPage({ ...page });
  };

  const handleSavePage = () => {
    if (editingPage) {
      console.log('Saving page:', editingPage);
      setEditingPage(null);
    }
  };

  const handleBulkApplyTemplate = (type: 'group' | 'category') => {
    const template = type === 'group' ? groupTemplate : categoryTemplate;
    console.log('Applying bulk template:', template);
    // Burada API çağrısı yapılacak
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO Yönetimi</h1>
        <p className="text-gray-600">Sayfalarınızın SEO performansını yönetin ve optimize edin</p>
      </div>

      {/* SEO Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">2</div>
              <div className="text-gray-600 text-sm">Optimize Edilmiş</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">1</div>
              <div className="text-gray-600 text-sm">Dikkat Gerekli</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">1</div>
              <div className="text-gray-600 text-sm">Optimize Edilmemiş</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">81</div>
              <div className="text-gray-600 text-sm">Ortalama Skor</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'pages', label: 'Tüm Sayfalar', icon: Globe },
              { id: 'bulk-groups', label: 'Grup Sayfaları', icon: Users },
              { id: 'bulk-categories', label: 'Kategori Sayfaları', icon: Grid3X3 },
              { id: 'templates', label: 'Şablonlar', icon: Layers }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'pages' && (
            <div>
              {/* Search */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Sayfa ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Pages List */}
              <div className="space-y-4">
                {filteredPages.map((page) => (
                  <div key={page.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(page.type)}
                            <h3 className="font-semibold text-gray-900">{page.path}</h3>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(page.status)}`}>
                            {getStatusIcon(page.status)}
                            <span className="capitalize">{page.status.replace('-', ' ')}</span>
                          </span>
                          <div className="flex items-center space-x-1">
                            <div className={`w-3 h-3 rounded-full ${
                              page.score >= 90 ? 'bg-green-500' :
                              page.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <span className="text-sm font-medium text-gray-600">{page.score}/100</span>
                          </div>
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">{page.title}</h4>
                        <p className="text-gray-600 text-sm mb-3">{page.metaDescription}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {page.keywords.map((keyword) => (
                            <span
                              key={keyword}
                              className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                        <p className="text-gray-500 text-xs">Son güncelleme: {formatDate(page.lastUpdated)}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEditPage(page)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'bulk-groups' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Grup Sayfaları Toplu SEO Düzenleme</h3>
                <p className="text-gray-600 mb-6">
                  Tüm grup sayfaları için SEO şablonunu düzenleyin. Değişiklikler tüm grup sayfalarına uygulanacaktır.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Şablon Düzenle</h4>
                
                <div className="space-y-6">
                  {/* Title Template */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Başlık Şablonu
                    </label>
                    <input
                      type="text"
                      value={groupTemplate.titleTemplate}
                      onChange={(e) => setGroupTemplate(prev => ({ ...prev, titleTemplate: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Başlık şablonu"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Kullanılabilir değişkenler: {groupTemplate.variables.map(v => `{${v}}`).join(', ')}
                    </p>
                  </div>

                  {/* Description Template */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Açıklama Şablonu
                    </label>
                    <textarea
                      value={groupTemplate.descriptionTemplate}
                      onChange={(e) => setGroupTemplate(prev => ({ ...prev, descriptionTemplate: e.target.value }))}
                      rows={3}
                      className="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Açıklama şablonu"
                    />
                  </div>

                  {/* Keywords Template */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Anahtar Kelimeler Şablonu (virgülle ayırın)
                    </label>
                    <input
                      type="text"
                      value={groupTemplate.keywordsTemplate.join(', ')}
                      onChange={(e) => setGroupTemplate(prev => ({ 
                        ...prev, 
                        keywordsTemplate: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                      }))}
                      className="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Anahtar kelimeler şablonu"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200 mb-6">
                <h4 className="text-md font-semibold text-blue-900 mb-4">Önizleme (React Developers TR örneği)</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-blue-700 text-sm font-medium">Başlık:</span>
                    <p className="text-blue-900">React Developers TR - Telegram Grubu | Teknoloji Topluluğu</p>
                  </div>
                  <div>
                    <span className="text-blue-700 text-sm font-medium">Açıklama:</span>
                    <p className="text-blue-900">React Developers TR Telegram grubuna katılın. React, Next.js ve modern web teknolojileri hakkında Türkçe tartışmalar 15.4K üyeli aktif topluluk.</p>
                  </div>
                  <div>
                    <span className="text-blue-700 text-sm font-medium">Anahtar Kelimeler:</span>
                    <p className="text-blue-900">react developers tr telegram, teknoloji grubu, telegram teknoloji</p>
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Bu şablon <strong>156 grup sayfasına</strong> uygulanacaktır
                </div>
                <button
                  onClick={() => handleBulkApplyTemplate('group')}
                  className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Tüm Grup Sayfalarına Uygula</span>
                </button>
              </div>
            </div>
          )}

          {selectedTab === 'bulk-categories' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategori Sayfaları Toplu SEO Düzenleme</h3>
                <p className="text-gray-600 mb-6">
                  Tüm kategori sayfaları için SEO şablonunu düzenleyin. Değişiklikler tüm kategori sayfalarına uygulanacaktır.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Şablon Düzenle</h4>
                
                <div className="space-y-6">
                  {/* Title Template */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Başlık Şablonu
                    </label>
                    <input
                      type="text"
                      value={categoryTemplate.titleTemplate}
                      onChange={(e) => setCategoryTemplate(prev => ({ ...prev, titleTemplate: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Başlık şablonu"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Kullanılabilir değişkenler: {categoryTemplate.variables.map(v => `{${v}}`).join(', ')}
                    </p>
                  </div>

                  {/* Description Template */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Açıklama Şablonu
                    </label>
                    <textarea
                      value={categoryTemplate.descriptionTemplate}
                      onChange={(e) => setCategoryTemplate(prev => ({ ...prev, descriptionTemplate: e.target.value }))}
                      rows={3}
                      className="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Açıklama şablonu"
                    />
                  </div>

                  {/* Keywords Template */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Anahtar Kelimeler Şablonu (virgülle ayırın)
                    </label>
                    <input
                      type="text"
                      value={categoryTemplate.keywordsTemplate.join(', ')}
                      onChange={(e) => setCategoryTemplate(prev => ({ 
                        ...prev, 
                        keywordsTemplate: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                      }))}
                      className="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Anahtar kelimeler şablonu"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200 mb-6">
                <h4 className="text-md font-semibold text-green-900 mb-4">Önizleme (Teknoloji kategorisi örneği)</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-green-700 text-sm font-medium">Başlık:</span>
                    <p className="text-green-900">Teknoloji Telegram Grupları | En İyi Teknoloji Kanalları</p>
                  </div>
                  <div>
                    <span className="text-green-700 text-sm font-medium">Açıklama:</span>
                    <p className="text-green-900">En iyi teknoloji Telegram gruplarını keşfedin. 25 grup ve 45.2K üye ile Türkiye'nin en büyük teknoloji topluluğu.</p>
                  </div>
                  <div>
                    <span className="text-green-700 text-sm font-medium">Anahtar Kelimeler:</span>
                    <p className="text-green-900">teknoloji telegram, teknoloji grupları, telegram teknoloji</p>
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Bu şablon <strong>8 kategori sayfasına</strong> uygulanacaktır
                </div>
                <button
                  onClick={() => handleBulkApplyTemplate('category')}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Tüm Kategori Sayfalarına Uygula</span>
                </button>
              </div>
            </div>
          )}

          {selectedTab === 'templates' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Şablonları</h3>
                <p className="text-gray-600">
                  Önceden tanımlanmış SEO şablonlarını yönetin ve yeni şablonlar oluşturun.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bulkTemplates.map((template) => (
                  <div key={template.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          template.type === 'group' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {template.type === 'group' ? 'Grup Şablonu' : 'Kategori Şablonu'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-600 font-medium">Başlık:</span>
                        <p className="text-gray-900 font-mono text-xs bg-white p-2 rounded mt-1">
                          {template.titleTemplate}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">Değişkenler:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.variables.map((variable) => (
                            <span
                              key={variable}
                              className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
                            >
                              {`{${variable}}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 mx-auto">
                  <Plus className="w-5 h-5" />
                  <span>Yeni Şablon Oluştur</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingPage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">SEO Düzenle: {editingPage.path}</h3>
              <button
                onClick={() => setEditingPage(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic SEO */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Temel SEO</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Sayfa Başlığı (Title)
                    </label>
                    <input
                      type="text"
                      value={editingPage.title}
                      onChange={(e) => setEditingPage(prev => prev ? { ...prev, title: e.target.value } : null)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-gray-500 text-xs mt-1">{editingPage.title.length}/60 karakter</p>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Meta Açıklama
                    </label>
                    <textarea
                      value={editingPage.metaDescription}
                      onChange={(e) => setEditingPage(prev => prev ? { ...prev, metaDescription: e.target.value } : null)}
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-gray-500 text-xs mt-1">{editingPage.metaDescription.length}/160 karakter</p>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Anahtar Kelimeler (virgülle ayırın)
                    </label>
                    <input
                      type="text"
                      value={editingPage.keywords.join(', ')}
                      onChange={(e) => setEditingPage(prev => prev ? { 
                        ...prev, 
                        keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                      } : null)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Open Graph */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Open Graph (Sosyal Medya)</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      OG Başlık
                    </label>
                    <input
                      type="text"
                      value={editingPage.ogTitle || ''}
                      onChange={(e) => setEditingPage(prev => prev ? { ...prev, ogTitle: e.target.value } : null)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      OG Açıklama
                    </label>
                    <textarea
                      value={editingPage.ogDescription || ''}
                      onChange={(e) => setEditingPage(prev => prev ? { ...prev, ogDescription: e.target.value } : null)}
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      OG Görsel URL
                    </label>
                    <input
                      type="url"
                      value={editingPage.ogImage || ''}
                      onChange={(e) => setEditingPage(prev => prev ? { ...prev, ogImage: e.target.value } : null)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* SEO Score Preview */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">SEO Önizleme</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Başlık Uzunluğu</span>
                    <span className={`font-medium ${editingPage.title.length <= 60 ? 'text-green-600' : 'text-red-600'}`}>
                      {editingPage.title.length <= 60 ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Meta Açıklama Uzunluğu</span>
                    <span className={`font-medium ${editingPage.metaDescription.length <= 160 ? 'text-green-600' : 'text-red-600'}`}>
                      {editingPage.metaDescription.length <= 160 ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Anahtar Kelime Sayısı</span>
                    <span className={`font-medium ${editingPage.keywords.length >= 3 && editingPage.keywords.length <= 10 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {editingPage.keywords.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setEditingPage(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSavePage}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Kaydet</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};