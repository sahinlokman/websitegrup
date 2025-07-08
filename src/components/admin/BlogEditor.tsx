import React, { useState, useRef } from 'react';
import { 
  Save, 
  X, 
  Eye, 
  Settings, 
  Image as ImageIcon,
  Upload,
  Bold,
  Italic,
  Underline,
  List,
  Link,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Search,
  Globe,
  FileText,
  Tag,
  Calendar,
  User,
  Clock,
  BarChart3
} from 'lucide-react';
import { BlogPost, BlogFormData } from '../../types/blog';

interface BlogEditorProps {
  post?: BlogPost | null;
  onSave: (postData: BlogFormData) => void;
  onCancel: () => void;
  categories: string[];
}

export const BlogEditor: React.FC<BlogEditorProps> = ({ post, onSave, onCancel, categories }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content');
  const [formData, setFormData] = useState<BlogFormData>({
    title: post?.title || '',
    slug: post?.slug || '',
    content: post?.content || '',
    excerpt: post?.excerpt || '',
    status: post?.status || 'draft',
    featuredImage: post?.featuredImage || '',
    category: post?.category || categories[0] || 'Genel',
    tags: post?.tags || [],
    seo: {
      metaTitle: post?.seo.metaTitle || '',
      metaDescription: post?.seo.metaDescription || '',
      keywords: post?.seo.keywords || [],
      ogTitle: post?.seo.ogTitle || '',
      ogDescription: post?.seo.ogDescription || '',
      ogImage: post?.seo.ogImage || '',
      canonicalUrl: post?.seo.canonicalUrl || '',
      noIndex: post?.seo.noIndex || false,
      noFollow: post?.seo.noFollow || false
    }
  });
  const [showPreview, setShowPreview] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSEOChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value
      }
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    handleInputChange('title', title);
    if (!post) { // Yeni yazı ise slug'ı otomatik oluştur
      handleInputChange('slug', generateSlug(title));
    }
    if (!formData.seo.metaTitle) {
      handleSEOChange('metaTitle', title);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.seo.keywords.includes(keywordInput.trim())) {
      handleSEOChange('keywords', [...formData.seo.keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    handleSEOChange('keywords', formData.seo.keywords.filter(k => k !== keyword));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    handleInputChange('tags', formData.tags.filter(t => t !== tag));
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const newText = before + selectedText + after;
    
    const newContent = 
      textarea.value.substring(0, start) + 
      newText + 
      textarea.value.substring(end);
    
    handleInputChange('content', newContent);
    
    // Cursor pozisyonunu ayarla
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Görsel boyutu 5MB\'dan küçük olmalıdır');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        handleInputChange('featuredImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateReadTime = (content: string): number => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('Blog başlığı gereklidir');
      return;
    }
    if (!formData.slug.trim()) {
      alert('Blog slug\'ı gereklidir');
      return;
    }
    if (!formData.content.trim()) {
      alert('Blog içeriği gereklidir');
      return;
    }

    onSave(formData);
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertText('**', '**'), title: 'Kalın' },
    { icon: Italic, action: () => insertText('*', '*'), title: 'İtalik' },
    { icon: Underline, action: () => insertText('<u>', '</u>'), title: 'Altı Çizili' },
    { icon: Heading1, action: () => insertText('# '), title: 'Başlık 1' },
    { icon: Heading2, action: () => insertText('## '), title: 'Başlık 2' },
    { icon: Heading3, action: () => insertText('### '), title: 'Başlık 3' },
    { icon: List, action: () => insertText('- '), title: 'Liste' },
    { icon: Quote, action: () => insertText('> '), title: 'Alıntı' },
    { icon: Code, action: () => insertText('`', '`'), title: 'Kod' },
    { icon: Link, action: () => insertText('[', '](url)'), title: 'Link' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {post ? 'Blog Yazısı Düzenle' : 'Yeni Blog Yazısı'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Eye className="w-5 h-5" />
                <span>Önizleme</span>
              </button>

              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="draft">Taslak</option>
                <option value="published">Yayınla</option>
                <option value="private">Özel</option>
              </select>

              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-t-2xl border border-gray-200 border-b-0">
              <div className="flex space-x-8 px-6">
                {[
                  { id: 'content', label: 'İçerik', icon: FileText },
                  { id: 'seo', label: 'SEO', icon: Search },
                  { id: 'settings', label: 'Ayarlar', icon: Settings }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-b-2xl border border-gray-200 p-6">
              {activeTab === 'content' && (
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Blog Başlığı *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full text-2xl font-bold bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
                      placeholder="Blog başlığını girin..."
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      URL Slug *
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">{window.location.origin}/blog/</span>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="blog-url"
                      />
                    </div>
                  </div>

                  {/* Content Editor */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      İçerik *
                    </label>
                    
                    {/* Toolbar */}
                    <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-2 flex flex-wrap gap-1">
                      {toolbarButtons.map((button, index) => {
                        const Icon = button.icon;
                        return (
                          <button
                            key={index}
                            onClick={button.action}
                            title={button.title}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Icon className="w-4 h-4" />
                          </button>
                        );
                      })}
                    </div>

                    {/* Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                      {/* Editor */}
                      <div className="border-l border-r border-b border-gray-300 lg:border-r-0">
                        <textarea
                          ref={contentRef}
                          value={formData.content}
                          onChange={(e) => handleInputChange('content', e.target.value)}
                          className="w-full h-96 p-4 border-none outline-none resize-none font-mono text-sm"
                          placeholder="Blog içeriğini yazın... (Markdown desteklenir)"
                        />
                      </div>

                      {/* Preview */}
                      {showPreview && (
                        <div className="border-r border-b border-gray-300 bg-gray-50">
                          <div className="p-4 h-96 overflow-y-auto">
                            <div 
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ 
                                __html: formData.content
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                  .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                                  .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                                  .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                                  .replace(/^- (.*$)/gm, '<li>$1</li>')
                                  .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
                                  .replace(/`(.*?)`/g, '<code>$1</code>')
                                  .replace(/\n/g, '<br>')
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Özet
                    </label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Blog özeti (opsiyonel)"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Etiketler
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Etiket ekle"
                      />
                      <button
                        onClick={addTag}
                        className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        Ekle
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                        >
                          <span>#{tag}</span>
                          <button
                            onClick={() => removeTag(tag)}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-blue-900 font-medium mb-2">SEO Önizleme</h3>
                    <div className="space-y-2">
                      <div className="text-blue-600 text-lg font-medium">
                        {formData.seo.metaTitle || formData.title || 'Blog Başlığı'}
                      </div>
                      <div className="text-green-600 text-sm">
                        {window.location.origin}/blog/{formData.slug}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {formData.seo.metaDescription || formData.excerpt || 'Meta açıklama...'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Meta Başlık
                    </label>
                    <input
                      type="text"
                      value={formData.seo.metaTitle}
                      onChange={(e) => handleSEOChange('metaTitle', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="SEO başlığı"
                    />
                    <p className="text-gray-500 text-xs mt-1">{formData.seo.metaTitle.length}/60 karakter</p>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Meta Açıklama
                    </label>
                    <textarea
                      value={formData.seo.metaDescription}
                      onChange={(e) => handleSEOChange('metaDescription', e.target.value)}
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="SEO açıklaması"
                    />
                    <p className="text-gray-500 text-xs mt-1">{formData.seo.metaDescription.length}/160 karakter</p>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Anahtar Kelimeler
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                        className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Anahtar kelime ekle"
                      />
                      <button
                        onClick={addKeyword}
                        className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        Ekle
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.seo.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                        >
                          <span>{keyword}</span>
                          <button
                            onClick={() => removeKeyword(keyword)}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Open Graph */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Open Graph (Sosyal Medya)</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          OG Başlık
                        </label>
                        <input
                          type="text"
                          value={formData.seo.ogTitle}
                          onChange={(e) => handleSEOChange('ogTitle', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Sosyal medya başlığı"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          OG Açıklama
                        </label>
                        <textarea
                          value={formData.seo.ogDescription}
                          onChange={(e) => handleSEOChange('ogDescription', e.target.value)}
                          rows={3}
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Sosyal medya açıklaması"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Kategori
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Öne Çıkan Görsel
                    </label>
                    {formData.featuredImage ? (
                      <div className="relative">
                        <img
                          src={formData.featuredImage}
                          alt="Öne çıkan görsel"
                          className="w-full h-48 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          onClick={() => handleInputChange('featuredImage', '')}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="featured-image-upload"
                        />
                        <label
                          htmlFor="featured-image-upload"
                          className="cursor-pointer flex flex-col items-center space-y-3"
                        >
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Upload className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Görsel yüklemek için tıklayın</p>
                            <p className="text-gray-500 text-sm">PNG, JPG, GIF (Max 5MB)</p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Yayın Durumu
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="draft">Taslak</option>
                      <option value="published">Yayında</option>
                      <option value="private">Özel</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog Bilgileri</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-600 text-sm">Durum</p>
                    <p className="font-medium text-gray-900 capitalize">{formData.status}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-600 text-sm">URL</p>
                    <p className="font-medium text-gray-900 text-sm break-all">
                      /blog/{formData.slug || 'blog-url'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Tag className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-600 text-sm">Kategori</p>
                    <p className="font-medium text-gray-900">{formData.category}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-600 text-sm">Okuma Süresi</p>
                    <p className="font-medium text-gray-900">{calculateReadTime(formData.content)} dk</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-600 text-sm">Kelime Sayısı</p>
                    <p className="font-medium text-gray-900">{formData.content.split(' ').length}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Kaydet</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};