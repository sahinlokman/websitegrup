import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Palette, 
  Layout, 
  Type, 
  Image as ImageIcon, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Globe,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Youtube,
  X,
  MessageCircle
} from 'lucide-react';

export const AppearanceSettings: React.FC = () => {
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Header Settings
  const [headerSettings, setHeaderSettings] = useState({
    logo: '',
    showSearch: true,
    showCategories: true,
    showAddGroup: true,
    customLinks: [
      { label: 'Blog', url: '/blog', enabled: true },
      { label: 'Hakkımızda', url: '/hakkimizda', enabled: false },
      { label: 'İletişim', url: '/iletisim', enabled: false }
    ]
  });
  
  // Footer Settings
  const [footerSettings, setFooterSettings] = useState({
    showCategories: true,
    showSocialLinks: true,
    copyrightText: `© ${new Date().getFullYear()} Telegram Grupları. Tüm hakları saklıdır.`,
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com', enabled: true },
      { platform: 'twitter', url: 'https://twitter.com', enabled: true },
      { platform: 'instagram', url: 'https://instagram.com', enabled: true },
      { platform: 'linkedin', url: 'https://linkedin.com', enabled: false },
      { platform: 'github', url: 'https://github.com', enabled: false },
      { platform: 'youtube', url: 'https://youtube.com', enabled: false }
    ],
    footerLinks: [
      { label: 'Gizlilik Politikası', url: '/gizlilik', enabled: true },
      { label: 'Kullanım Şartları', url: '/kullanim-sartlari', enabled: true },
      { label: 'KVKK', url: '/kvkk', enabled: false }
    ]
  });
  
  // Appearance Settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    primaryColor: '#8b5cf6',
    secondaryColor: '#ec4899',
    fontFamily: 'Inter',
    borderRadius: 'rounded-2xl',
    darkMode: false
  });
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    try {
      const savedHeaderSettings = localStorage.getItem('adminHeaderSettings');
      const savedFooterSettings = localStorage.getItem('adminFooterSettings');
      const savedAppearanceSettings = localStorage.getItem('adminAppearanceSettings');
      
      if (savedHeaderSettings) {
        setHeaderSettings(JSON.parse(savedHeaderSettings));
      }
      
      if (savedFooterSettings) {
        setFooterSettings(JSON.parse(savedFooterSettings));
      }
      
      if (savedAppearanceSettings) {
        setAppearanceSettings(JSON.parse(savedAppearanceSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);
  
  const handleSaveSettings = () => {
    try {
      localStorage.setItem('adminHeaderSettings', JSON.stringify(headerSettings));
      localStorage.setItem('adminFooterSettings', JSON.stringify(footerSettings));
      localStorage.setItem('adminAppearanceSettings', JSON.stringify(appearanceSettings));
      
      setSuccess('Görünüm ayarları başarıyla kaydedildi');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Ayarlar kaydedilirken bir hata oluştu');
      setTimeout(() => setError(null), 3000);
    }
  };
  
  const handleHeaderToggle = (field: string) => {
    setHeaderSettings(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
  };
  
  const handleCustomLinkChange = (index: number, field: string, value: string | boolean) => {
    setHeaderSettings(prev => {
      const newLinks = [...prev.customLinks];
      newLinks[index] = { ...newLinks[index], [field]: value };
      return { ...prev, customLinks: newLinks };
    });
  };
  
  const handleAddCustomLink = () => {
    setHeaderSettings(prev => ({
      ...prev,
      customLinks: [...prev.customLinks, { label: '', url: '', enabled: true }]
    }));
  };
  
  const handleRemoveCustomLink = (index: number) => {
    setHeaderSettings(prev => ({
      ...prev,
      customLinks: prev.customLinks.filter((_, i) => i !== index)
    }));
  };
  
  const handleFooterToggle = (field: string) => {
    setFooterSettings(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
  };
  
  const handleSocialLinkChange = (index: number, field: string, value: string | boolean) => {
    setFooterSettings(prev => {
      const newLinks = [...prev.socialLinks];
      newLinks[index] = { ...newLinks[index], [field]: value };
      return { ...prev, socialLinks: newLinks };
    });
  };
  
  const handleFooterLinkChange = (index: number, field: string, value: string | boolean) => {
    setFooterSettings(prev => {
      const newLinks = [...prev.footerLinks];
      newLinks[index] = { ...newLinks[index], [field]: value };
      return { ...prev, footerLinks: newLinks };
    });
  };
  
  const handleAddFooterLink = () => {
    setFooterSettings(prev => ({
      ...prev,
      footerLinks: [...prev.footerLinks, { label: '', url: '', enabled: true }]
    }));
  };
  
  const handleRemoveFooterLink = (index: number) => {
    setFooterSettings(prev => ({
      ...prev,
      footerLinks: prev.footerLinks.filter((_, i) => i !== index)
    }));
  };
  
  const handleAppearanceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setAppearanceSettings(prev => ({ ...prev, [name]: checked }));
    } else {
      setAppearanceSettings(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'linkedin': return <Linkedin className="w-5 h-5" />;
      case 'github': return <Github className="w-5 h-5" />;
      case 'youtube': return <Youtube className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Görünüm Ayarları</h1>
        <p className="text-gray-600">Site görünümünü ve davranışını özelleştirin</p>
      </div>
      
      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700 font-medium">{success}</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="space-y-8">
            {/* Header Settings */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Header Ayarları</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="file"
                          id="logo-upload"
                          className="hidden"
                          accept="image/*"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer inline-flex items-center space-x-2"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Logo Yükle</span>
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Önerilen boyut: 48x48 piksel, PNG veya SVG formatı
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Arama Çubuğunu Göster</h3>
                      <p className="text-xs text-gray-500">Header'da arama çubuğunu göster/gizle</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={headerSettings.showSearch}
                        onChange={() => handleHeaderToggle('showSearch')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Kategorileri Göster</h3>
                      <p className="text-xs text-gray-500">Header'da kategori menüsünü göster/gizle</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={headerSettings.showCategories}
                        onChange={() => handleHeaderToggle('showCategories')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Grup Ekle Butonunu Göster</h3>
                      <p className="text-xs text-gray-500">Header'da grup ekle butonunu göster/gizle</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={headerSettings.showAddGroup}
                        onChange={() => handleHeaderToggle('showAddGroup')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Özel Menü Linkleri</h3>
                    <button
                      onClick={handleAddCustomLink}
                      className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                    >
                      + Link Ekle
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {headerSettings.customLinks.map((link, index) => (
                      <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) => handleCustomLinkChange(index, 'label', e.target.value)}
                            placeholder="Link Adı"
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                          />
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => handleCustomLinkChange(index, 'url', e.target.value)}
                            placeholder="URL (örn: /blog)"
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={link.enabled}
                              onChange={(e) => handleCustomLinkChange(index, 'enabled', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                          <button
                            onClick={() => handleRemoveCustomLink(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer Settings */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Footer Ayarları</h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Kategorileri Göster</h3>
                      <p className="text-xs text-gray-500">Footer'da kategori listesini göster/gizle</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={footerSettings.showCategories}
                        onChange={() => handleFooterToggle('showCategories')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Sosyal Medya Linklerini Göster</h3>
                      <p className="text-xs text-gray-500">Footer'da sosyal medya ikonlarını göster/gizle</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={footerSettings.showSocialLinks}
                        onChange={() => handleFooterToggle('showSocialLinks')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Telif Hakkı Metni
                  </label>
                  <input
                    type="text"
                    value={footerSettings.copyrightText}
                    onChange={(e) => setFooterSettings(prev => ({ ...prev, copyrightText: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sosyal Medya Linkleri</h3>
                  
                  <div className="space-y-4">
                    {footerSettings.socialLinks.map((link, index) => (
                      <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {getSocialIcon(link.platform)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 capitalize mb-1">{link.platform}</div>
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                            placeholder={`${link.platform} URL`}
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={link.enabled}
                            onChange={(e) => handleSocialLinkChange(index, 'enabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Footer Linkleri</h3>
                    <button
                      onClick={handleAddFooterLink}
                      className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                    >
                      + Link Ekle
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {footerSettings.footerLinks.map((link, index) => (
                      <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) => handleFooterLinkChange(index, 'label', e.target.value)}
                            placeholder="Link Adı"
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                          />
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => handleFooterLinkChange(index, 'url', e.target.value)}
                            placeholder="URL (örn: /gizlilik)"
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={link.enabled}
                              onChange={(e) => handleFooterLinkChange(index, 'enabled', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                          <button
                            onClick={() => handleRemoveFooterLink(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Appearance Settings */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tema Ayarları</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Ana Renk
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      name="primaryColor"
                      value={appearanceSettings.primaryColor}
                      onChange={handleAppearanceChange}
                      className="w-10 h-10 rounded-lg overflow-hidden"
                    />
                    <input
                      type="text"
                      name="primaryColor"
                      value={appearanceSettings.primaryColor}
                      onChange={handleAppearanceChange}
                      className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    İkincil Renk
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      name="secondaryColor"
                      value={appearanceSettings.secondaryColor}
                      onChange={handleAppearanceChange}
                      className="w-10 h-10 rounded-lg overflow-hidden"
                    />
                    <input
                      type="text"
                      name="secondaryColor"
                      value={appearanceSettings.secondaryColor}
                      onChange={handleAppearanceChange}
                      className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Font Ailesi
                  </label>
                  <select
                    name="fontFamily"
                    value={appearanceSettings.fontFamily}
                    onChange={handleAppearanceChange}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Poppins">Poppins</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Köşe Yuvarlaklığı
                  </label>
                  <select
                    name="borderRadius"
                    value={appearanceSettings.borderRadius}
                    onChange={handleAppearanceChange}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="rounded-none">Köşeli</option>
                    <option value="rounded">Hafif Yuvarlak</option>
                    <option value="rounded-md">Orta Yuvarlak</option>
                    <option value="rounded-lg">Büyük Yuvarlak</option>
                    <option value="rounded-xl">Çok Büyük Yuvarlak</option>
                    <option value="rounded-2xl">Ekstra Büyük Yuvarlak</option>
                    <option value="rounded-3xl">Ultra Büyük Yuvarlak</option>
                    <option value="rounded-full">Tam Yuvarlak</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Karanlık Mod</h3>
                    <p className="text-xs text-gray-500">Sitenin karanlık modunu etkinleştir</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="darkMode"
                      checked={appearanceSettings.darkMode}
                      onChange={(e) => handleAppearanceChange({
                        target: {
                          name: 'darkMode',
                          value: e.target.checked,
                          type: 'checkbox'
                        }
                      } as any)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Önizleme</h3>
                  
                  <div className="bg-gray-100 p-6 rounded-lg">
                    <div className="bg-white shadow rounded-lg overflow-hidden" style={{
                      fontFamily: appearanceSettings.fontFamily
                    }}>
                      {/* Header Preview */}
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r" style={{
                            backgroundImage: `linear-gradient(to right, ${appearanceSettings.primaryColor}, ${appearanceSettings.secondaryColor})`
                          }}>
                          </div>
                          <div className="font-bold">Telegram Grupları</div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                          <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                        </div>
                      </div>
                      
                      {/* Content Preview */}
                      <div className="p-4">
                        <div className="w-full h-32 bg-gray-100 rounded mb-4"></div>
                        <div className="space-y-2">
                          <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                          <div className="w-full h-4 bg-gray-200 rounded"></div>
                          <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      
                      {/* Footer Preview */}
                      <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-600">
                        {footerSettings.copyrightText}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Ayarları Kaydet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};