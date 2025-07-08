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
  User
} from 'lucide-react';
import { Page, PageFormData } from '../../types/page';

interface PageEditorProps {
  page?: Page | null;
  onSave: (pageData: PageFormData) => void;
  onCancel: () => void;
}

export const PageEditor: React.FC<PageEditorProps> = ({ page, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content');
  const [formData, setFormData] = useState<PageFormData>({
    title: page?.title || '',
    slug: page?.slug || '',
    content: page?.content || '',
    excerpt: page?.excerpt || '',
    status: page?.status || 'draft',
    featuredImage: page?.featuredImage || '',
    template: page?.template || 'default',
    seo: {
      metaTitle: page?.seo.metaTitle || '',
      metaDescription: page?.seo.metaDescription || '',
      keywords: page?.seo.keywords || [],
      ogTitle: page?.seo.ogTitle || '',
      ogDescription: page?.seo.ogDescription || '',
      ogImage: page?.seo.ogImage || '',
      canonicalUrl: page?.seo.canonicalUrl || '',
      noIndex: page?.seo.noIndex || false,
      noFollow: page?.seo.noFollow || false
    }
  });
  const [showPreview, setShowPreview] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
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
    if (!page) { // Yeni sayfa ise slug'ı otomatik oluştur
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

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('Sayfa başlığı gereklidir');
      return;
    }
    if (!formData.slug.trim()) {
      alert('Sayfa slug\'ı gereklidir');
      return;
    }
    if (!formData.content.trim()) {
      alert('Sayfa içeriği gereklidir');
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
                {page ? 'Sayfa Düzenle' : 'Yeni Sayfa'}
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
                      Sayfa Başlığı *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full text-2xl font-bold bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
                      placeholder="Sayfa başlığını girin..."
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      URL Slug *
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">{window.location.origin}/</span>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="sayfa-url"
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
                          placeholder="Sayfa içeriğini yazın... (Markdown desteklenir)"
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
                      placeholder="Sayfa özeti (opsiyonel)"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-blue-900 font-medium mb-2">SEO Önizleme</h3>
                    <div className="space-y-2">
                      <div className="text-blue-600 text-lg font-medium">
                        {formData.seo.metaTitle || formData.title || 'Sayfa Başlığı'}
                      </div>
                      <div className="text-green-600 text-sm">
                        {window.location.origin}/{formData.slug}
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

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      value={formData.seo.canonicalUrl}
                      onChange={(e) => handleSEOChange('canonicalUrl', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://example.com/canonical-url"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.seo.noIndex}
                        onChange={(e) => handleSEOChange('noIndex', e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-gray-700 text-sm">No Index</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.seo.noFollow}
                        onChange={(e) => handleSEOChange('noFollow', e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-gray-700 text-sm">No Follow</span>
                    </label>
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

                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          OG Görsel URL
                        </label>
                        <input
                          type="url"
                          value={formData.seo.ogImage}
                          onChange={(e) => handleSEOChange('ogImage', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="https://example.com/image.jpg"
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
                      Sayfa Şablonu
                    </label>
                    <select
                      value={formData.template}
                      onChange={(e) => handleInputChange('template', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="default">Varsayılan</option>
                      <option value="landing">Landing Page</option>
                      <option value="blog">Blog</option>
                      <option value="contact">İletişim</option>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sayfa Bilgileri</h3>
              
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
                      /{formData.slug || 'sayfa-url'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-600 text-sm">Şablon</p>
                    <p className="font-medium text-gray-900 capitalize">{formData.template}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Tag className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-600 text-sm">Anahtar Kelimeler</p>
                    <p className="font-medium text-gray-900">{formData.seo.keywords.length}</p>
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