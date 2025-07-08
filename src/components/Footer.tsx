import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Heart, Github, Twitter, Mail, ExternalLink } from 'lucide-react';
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [footerSettings, setFooterSettings] = useState({
    showCategories: true,
    showSocialLinks: true,
    copyrightText: `© ${currentYear} Telegram Grupları. Tüm hakları saklıdır.`,
    socialLinks: [
      { platform: 'facebook', url: 'https://facebook.com', enabled: true },
      { platform: 'twitter', url: 'https://twitter.com', enabled: true },
      { platform: 'instagram', url: 'https://instagram.com', enabled: true },
      { platform: 'linkedin', url: 'https://linkedin.com', enabled: false },
      { platform: 'github', url: 'https://github.com', enabled: false },
      { platform: 'youtube', url: 'https://youtube.com', enabled: false }
    ],
    footerLinks: []
  });
  
  // Load footer settings from localStorage
  useEffect(() => {
    try {
      const savedFooterSettings = localStorage.getItem('adminFooterSettings');
      if (savedFooterSettings) {
        setFooterSettings(JSON.parse(savedFooterSettings));
      }
    } catch (error) {
      console.error('Error loading footer settings:', error);
    }
  }, []);
  
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'linkedin': return <Linkedin className="w-5 h-5" />;
      case 'github': return <Github className="w-5 h-5" />;
      case 'youtube': return <Youtube className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo ve Açıklama */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Telegram Grupları</h3>
                <p className="text-sm text-gray-600">En iyi Türkçe grupları keşfedin</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Türkiye'nin en kapsamlı Telegram grupları dizini. Teknoloji, finans, sanat, eğitim ve 
              daha fazla kategoride binlerce grubu keşfedin. Topluluklar arası bağlantı kurun ve 
              ilgi alanlarınıza uygun grupları bulun.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="mailto:info@telegramgrupları.com"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-purple-600 text-sm transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-600 hover:text-purple-600 text-sm transition-colors">
                  Kategoriler
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-purple-600 text-sm transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-purple-600 text-sm transition-colors">
                  İletişim
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-purple-600 text-sm transition-colors">
                  Gizlilik Politikası
                </Link>
              </li>
            </ul>
          </div>

          {/* Kategoriler */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">Popüler Kategoriler</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/?category=Teknoloji" className="text-gray-600 hover:text-purple-600 text-sm transition-colors">
                  Teknoloji
                </Link>
              </li>
              <li>
                <Link to="/?category=Finans" className="text-gray-600 hover:text-purple-600 text-sm transition-colors">
                  Finans
                </Link>
              </li>
              <li>
                <Link to="/?category=Eğitim" className="text-gray-600 hover:text-purple-600 text-sm transition-colors">
                  Eğitim
                </Link>
              </li>
              <li>
                <Link to="/?category=Sanat" className="text-gray-600 hover:text-purple-600 text-sm transition-colors">
                  Sanat
                </Link>
              </li>
              <li>
                <Link to="/?category=İş" className="text-gray-600 hover:text-purple-600 text-sm transition-colors">
                  İş & Kariyer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Alt Kısım */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center flex-wrap space-x-2 text-sm text-gray-600 mb-4 md:mb-0">
              <span>{footerSettings.copyrightText}</span>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4 text-red-500" />
                <span>ile yapıldı</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              {footerSettings.footerLinks && footerSettings.footerLinks.filter(link => link.enabled).map((link, index) => (
                <Link 
                  key={index}
                  to={link.url} 
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
          <p className="text-blue-700 text-xs leading-relaxed">
            <strong>Yasal Uyarı:</strong> Bu site Telegram ile resmi olarak bağlantılı değildir. 
            Listelenen gruplar topluluk tarafından paylaşılmıştır. Grup içeriklerinden site yönetimi sorumlu değildir. 
            Şüpheli veya zararlı içerik tespit ettiğinizde lütfen bize bildirin.
          </p>
        </div>
      </div>
      
      {/* Social Links */}
      {footerSettings.showSocialLinks && (
        <div className="border-t border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
            <div className="flex space-x-6">
              {footerSettings.socialLinks && footerSettings.socialLinks.filter(link => link.enabled).map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={link.platform}
                >
                  {getSocialIcon(link.platform)}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};