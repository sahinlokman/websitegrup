import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Globe, Book, Gamepad2, Music, Heart, Briefcase, Camera, Code, TrendingUp } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { GroupDetail } from './components/GroupDetail';
import { GroupList } from './components/GroupList';
import { CategoryPage } from './components/CategoryPage';
import { CategoriesPage } from './components/CategoriesPage';
import { TopGroupsPage } from './components/TopGroupsPage';
import ProfilePage from './pages/ProfilePage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GroupManagement } from './components/admin/GroupManagement';
import { CategoryManagement } from './components/admin/CategoryManagement';
import { UserManagement } from './components/admin/UserManagement';
import { PendingGroups } from './components/admin/PendingGroups';
import { SEOManagement } from './components/admin/SEOManagement';
import { AdminSettings } from './components/admin/AdminSettings';
import { ReportedGroups } from './components/admin/ReportedGroups';
import { AppearanceSettings } from './components/admin/AppearanceSettings';
import { PageManagement } from './components/admin/PageManagement';
import { BlogManagement } from './components/admin/BlogManagement';
import { CacheManagement } from './components/admin/CacheManagement';
import { BlogList } from './components/blog/BlogList';
import { BlogDetail } from './components/blog/BlogDetail';
import { TelegramGroup } from './types/telegram';
import { supabase } from './lib/supabase';
import { groupService, categoryService, pageService, blogService } from './services/supabaseService';
import { Page } from './types/page';
import { BlogPost } from './types/blog';

// Boş grup listesi - kullanıcı ekledikçe dolacak
const mockGroups: TelegramGroup[] = [];

// Demo gruplar - localStorage boş olduğunda gösterilecek
const demoGroups: TelegramGroup[] = [
  {
    id: 'demo-1',
    name: 'Teknoloji Sohbet',
    description: 'Teknoloji ve yazılım geliştirme üzerine sohbet ve bilgi paylaşımı',
    category: 'Teknoloji',
    members: 15420,
    link: 'https://t.me/teknoloji_sohbet_demo',
    username: 'teknoloji_sohbet_demo',
    tags: ['teknoloji', 'yazılım', 'sohbet'],
    verified: true,
    approved: true,
    featured: true,
    createdAt: new Date('2024-01-15'),
    image: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 'demo-2', 
    name: 'Kripto Para Analiz',
    description: 'Bitcoin, Ethereum ve diğer kripto paralar hakkında güncel analizler',
    category: 'Finans',
    members: 8750,
    link: 'https://t.me/kripto_analiz_demo',
    username: 'kripto_analiz_demo',
    tags: ['kripto', 'bitcoin', 'analiz'],
    verified: true,
    approved: true,
    featured: false,
    createdAt: new Date('2024-01-10'),
    image: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 'demo-3',
    name: 'Müzik Paylaşımı',
    description: 'En yeni şarkıları ve müzik önerilerini paylaştığımız grup',
    category: 'Müzik',
    members: 12300,
    link: 'https://t.me/muzik_paylasimi_demo',
    username: 'muzik_paylasimi_demo', 
    tags: ['müzik', 'şarkı', 'paylaşım'],
    verified: false,
    approved: true,
    featured: false,
    createdAt: new Date('2024-01-12'),
    image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 'demo-4',
    name: 'Oyun Dünyası',
    description: 'PC ve mobil oyunlar hakkında tartışma ve öneriler',
    category: 'Oyun',
    members: 9870,
    link: 'https://t.me/oyun_dunyasi_demo',
    username: 'oyun_dunyasi_demo',
    tags: ['oyun', 'gaming', 'pc', 'mobil'],
    verified: true,
    approved: true,
    featured: true,
    createdAt: new Date('2024-01-08'),
    image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 'demo-5',
    name: 'Fotoğrafçılık Sanatı',
    description: 'Fotoğraf çekme teknikleri ve ekipman önerileri',
    category: 'Sanat', 
    members: 6540,
    link: 'https://t.me/fotograf_sanati_demo',
    username: 'fotograf_sanati_demo',
    tags: ['fotoğraf', 'sanat', 'kamera'],
    verified: false,
    approved: true,
    featured: false,
    createdAt: new Date('2024-01-05'),
    image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=200'
  }
];

const initialCategoriesData = [
  { name: 'Tümü', icon: Globe, color: 'from-purple-500 to-pink-500' },
  { name: 'Teknoloji', icon: Code, color: 'from-blue-500 to-cyan-500' },
  { name: 'Finans', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
  { name: 'Sanat', icon: Camera, color: 'from-pink-500 to-rose-500' },
  { name: 'İş', icon: Briefcase, color: 'from-orange-500 to-amber-500' },
  { name: 'Oyun', icon: Gamepad2, color: 'from-violet-500 to-purple-500' },
  { name: 'Müzik', icon: Music, color: 'from-red-500 to-pink-500' },
  { name: 'Eğitim', icon: Book, color: 'from-indigo-500 to-blue-500' }
];

const mockPages: Page[] = [
  {
    id: 'page-1',
    title: 'Hakkımızda',
    slug: 'hakkimizda',
    content: '# Hakkımızda\n\nTelegram Grupları, Türkiye\'nin en kapsamlı Telegram grupları dizinidir.',
    excerpt: 'Telegram Grupları hakkında bilgi edinin',
    status: 'published',
    author: 'Admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    publishedAt: new Date('2024-01-15'),
    seo: {
      metaTitle: 'Hakkımızda - Telegram Grupları',
      metaDescription: 'Telegram Grupları platformu hakkında detaylı bilgi edinin.',
      keywords: ['hakkımızda', 'telegram grupları', 'platform'],
      noIndex: false,
      noFollow: false
    },
    template: 'default'
  },
  {
    id: 'page-2',
    title: 'İletişim',
    slug: 'iletisim',
    content: '# İletişim\n\nBizimle iletişime geçmek için aşağıdaki bilgileri kullanabilirsiniz.',
    excerpt: 'Bizimle iletişime geçin',
    status: 'published',
    author: 'Admin',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-16'),
    publishedAt: new Date('2024-01-16'),
    seo: {
      metaTitle: 'İletişim - Telegram Grupları',
      metaDescription: 'Telegram Grupları ile iletişime geçin.',
      keywords: ['iletişim', 'destek', 'yardım'],
      noIndex: false,
      noFollow: false
    },
    template: 'contact'
  }
];

const mockBlogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Telegram Gruplarında Güvenlik İpuçları',
    slug: 'telegram-gruplarinda-guvenlik-ipuclari',
    content: '# Telegram Gruplarında Güvenlik İpuçları\n\nTelegram gruplarında güvenliğinizi sağlamak için dikkat etmeniz gereken önemli noktalar...\n\n## 1. Kişisel Bilgilerinizi Paylaşmayın\n\nTelegram gruplarında asla kişisel bilgilerinizi paylaşmayın. Bu bilgiler arasında:\n\n- Telefon numaranız\n- Adresiniz\n- Kredi kartı bilgileriniz\n- Şifreleriniz\n\n## 2. Şüpheli Linklere Tıklamayın\n\nBilinmeyen kaynaklardan gelen linklere tıklamaktan kaçının.',
    excerpt: 'Telegram gruplarında güvenliğinizi sağlamak için bilmeniz gereken önemli ipuçları ve dikkat edilmesi gereken noktalar.',
    featuredImage: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800',
    status: 'published',
    author: 'Admin',
    authorId: 'admin-1',
    category: 'Teknoloji',
    tags: ['güvenlik', 'telegram', 'ipuçları', 'gizlilik'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    publishedAt: new Date('2024-01-15'),
    views: 1250,
    readTime: 5,
    seo: {
      metaTitle: 'Telegram Gruplarında Güvenlik İpuçları - Telegram Grupları',
      metaDescription: 'Telegram gruplarında güvenliğinizi sağlamak için bilmeniz gereken önemli ipuçları ve dikkat edilmesi gereken noktalar.',
      keywords: ['telegram güvenlik', 'telegram ipuçları', 'online güvenlik', 'gizlilik'],
      noIndex: false,
      noFollow: false
    }
  },
  {
    id: 'blog-2',
    title: 'En İyi Telegram Bot Önerileri',
    slug: 'en-iyi-telegram-bot-onerileri',
    content: '# En İyi Telegram Bot Önerileri\n\nTelegram botları hayatınızı kolaylaştıracak harika araçlar. İşte en faydalı botlar...\n\n## Üretkenlik Botları\n\n### @todoist\nGörevlerinizi yönetmek için mükemmel bir bot.\n\n### @trello_bot\nTrello kartlarınızı Telegram\'dan yönetin.',
    excerpt: 'Hayatınızı kolaylaştıracak en faydalı Telegram botları ve kullanım alanları.',
    status: 'published',
    author: 'Admin',
    authorId: 'admin-1',
    category: 'Teknoloji',
    tags: ['telegram', 'bot', 'üretkenlik', 'araçlar'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    publishedAt: new Date('2024-01-10'),
    views: 890,
    readTime: 7,
    seo: {
      metaTitle: 'En İyi Telegram Bot Önerileri - Telegram Grupları',
      metaDescription: 'Hayatınızı kolaylaştıracak en faydalı Telegram botları ve kullanım alanları.',
      keywords: ['telegram bot', 'telegram araçları', 'üretkenlik botları'],
      noIndex: false,
      noFollow: false
    }
  },
  {
    id: 'blog-3',
    title: 'Kripto Para Gruplarında Dikkat Edilmesi Gerekenler',
    slug: 'kripto-para-gruplarinda-dikkat-edilmesi-gerekenler',
    content: '# Kripto Para Gruplarında Dikkat Edilmesi Gerekenler\n\nKripto para gruplarında dolandırıcılıktan korunmak için...',
    excerpt: 'Kripto para Telegram gruplarında dolandırıcılıktan korunmak için bilmeniz gerekenler.',
    status: 'draft',
    author: 'Admin',
    authorId: 'admin-1',
    category: 'Finans',
    tags: ['kripto', 'bitcoin', 'güvenlik', 'dolandırıcılık'],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    views: 0,
    readTime: 4,
    seo: {
      metaTitle: 'Kripto Para Gruplarında Dikkat Edilmesi Gerekenler',
      metaDescription: 'Kripto para Telegram gruplarında dolandırıcılıktan korunmak için bilmeniz gerekenler.',
      keywords: ['kripto güvenlik', 'bitcoin dolandırıcılık', 'telegram kripto'],
      noIndex: false,
      noFollow: false
    }
  }
];

export default function App() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<TelegramGroup[]>(demoGroups);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(initialCategoriesData);
  const [pages, setPages] = useState<Page[]>(mockPages);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(mockBlogPosts);

  // Yeni grup ekleme - Supabase öncelikli
  const handleGroupAdded = async (newGroup: TelegramGroup) => {
    try {
      const groupWithId = {
        ...newGroup,
        id: newGroup.id || `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        approved: newGroup.approved !== undefined ? newGroup.approved : true // Varsayılan olarak onaylanmış yap
      };

      // Supabase'e ekle
      const addedGroup = await groupService.addGroup(groupWithId);
      
      if (addedGroup) {
        // Ana listeye ekle (onaylanmış olduğu için)
        const updatedGroups = [addedGroup, ...groups];
        setGroups(updatedGroups);
        
        // localStorage'ı güncelle (önbellek olarak)
        localStorage.setItem('groups', JSON.stringify(updatedGroups));
        localStorage.setItem('publicGroups', JSON.stringify(updatedGroups));
        
        // Sayaçları güncelle
        if (addedGroup.approved === true) {
          const approvedCount = parseInt(localStorage.getItem('approvedGroupsCount') || '0') + 1;
          localStorage.setItem('approvedGroupsCount', approvedCount.toString());
        } else {
          const pendingCount = parseInt(localStorage.getItem('pendingGroupsCount') || '0') + 1;
          localStorage.setItem('pendingGroupsCount', pendingCount.toString());
        }
        
        // Başarılı ekleme bildirimi
        alert('Grup başarıyla eklendi!');
      } else {
        alert('Grup eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Error adding group to Supabase:', error);
      alert('Grup eklenirken bir hata oluştu: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleUpdateGroup = (updatedGroup: TelegramGroup) => {
    // Grubu güncelle
    
    // Supabase'de güncelle
    groupService.updateGroup(updatedGroup).then(success => {
      if (success) {
        console.log('Group updated in Supabase:', updatedGroup.id);
      }
    });
    
    const updatedGroups = groups.map(group =>
      group.id === updatedGroup.id ? updatedGroup : group
    );
    
    setGroups(updatedGroups);
    
    // Grupları localStorage'a kaydet
    try {
      // Ana grup listesini güncelle
      localStorage.setItem('groups', JSON.stringify(updatedGroups));

      // Eğer grup onaylanmışsa, public grup listesini de güncelle
      if (updatedGroup.approved === true) {
        const publicGroups = localStorage.getItem('publicGroups') || '[]';
        const parsedPublicGroups = JSON.parse(publicGroups);
        
        // Grup zaten public listede var mı kontrol et
        const groupExists = parsedPublicGroups.some((g: TelegramGroup) => g.id === updatedGroup.id);
        
        let updatedPublicGroups;
        if (groupExists) {
          // Varsa güncelle
          updatedPublicGroups = parsedPublicGroups.map((group: TelegramGroup) => 
            group.id === updatedGroup.id ? updatedGroup : group
          );
        } else {
          // Yoksa ekle
          updatedPublicGroups = [updatedGroup, ...parsedPublicGroups];
        }
        
        localStorage.setItem('publicGroups', JSON.stringify(updatedPublicGroups));
      }
    } catch (error) {
      console.error('Error saving updated groups to localStorage:', error);
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    // Grubu sil
    
    // Supabase'den sil
    groupService.deleteGroup(groupId).then(success => {
      if (success) {
        console.log('Group deleted from Supabase:', groupId);
      }
    });
    
    const filteredGroups = groups.filter(group => group.id !== groupId);
    setGroups(filteredGroups);
    
    // Grupları localStorage'a kaydet
    try {
      localStorage.setItem('groups', JSON.stringify(filteredGroups));
      
      // Public grup listesinden de sil
      const publicGroups = localStorage.getItem('publicGroups') || '[]';
      const parsedPublicGroups = JSON.parse(publicGroups);
      const updatedPublicGroups = parsedPublicGroups.filter((group: TelegramGroup) => group.id !== groupId);
      localStorage.setItem('publicGroups', JSON.stringify(updatedPublicGroups));
    } catch (error) {
      console.error('Error saving groups after deletion to localStorage:', error);
    }
  };

  const handleApproveGroup = async (group: TelegramGroup) => {
    try {
      const approvedGroup = { ...group, approved: true };
      
      // 1) Grubu ana groups tablosuna ekle (daha önce eklenmemişse)
      const addedGroup = await groupService.addGroup(approvedGroup);
      
      if (addedGroup) {
        console.log('Group added to main groups table:', addedGroup.id);
        
        // Ana listeye ekle
        const updatedGroups = [addedGroup, ...groups];
        setGroups(updatedGroups);
        
        // localStorage'ı güncelle (önbellek olarak)
        localStorage.setItem('groups', JSON.stringify(updatedGroups));
        localStorage.setItem('publicGroups', JSON.stringify(updatedGroups));
        
        // Sayaçları güncelle
        const approvedCount = parseInt(localStorage.getItem('approvedGroupsCount') || '0') + 1;
        localStorage.setItem('approvedGroupsCount', approvedCount.toString());

        const pendingCountPrev = parseInt(localStorage.getItem('pendingGroupsCount') || '0');
        const pendingCount = Math.max(0, pendingCountPrev - 1);
        localStorage.setItem('pendingGroupsCount', pendingCount.toString());
        
        console.log('Group successfully approved and added to main list');
      } else {
        console.error('Failed to add group to main groups table');
      }
    } catch (error) {
      console.error('Error approving group:', error);
    }
  };

  const handleRejectGroup = (groupId: string, reason: string) => {
    console.log('Rejected group:', groupId, 'Reason:', reason);
    
    // Reddedilen grup sayısını artır ve localStorage'a kaydet
    try {
      const rejectedCount = localStorage.getItem('rejectedGroupsCount') || '0';
      const newCount = rejectedCount ? parseInt(rejectedCount) + 1 : 1;
      localStorage.setItem('rejectedGroupsCount', newCount.toString());
    } catch (error) {
      console.error('Error updating rejected groups count:', error);
    }
    
  };

  const handleUpdateCategory = (updatedCategory: any) => {
    // Supabase'de güncelle
    categoryService.updateCategory(updatedCategory).then(success => {
      if (success) {
        console.log('Category updated in Supabase:', updatedCategory.id);
      }
    });
    
    setCategories(prev => prev.map(cat => 
      cat.name === updatedCategory.name ? { ...cat, ...updatedCategory } : cat
    ));
  };

  const handleDeleteCategory = (categoryId: string) => {
    // Supabase'den sil
    categoryService.deleteCategory(categoryId).then(success => {
      if (success) {
        console.log('Category deleted from Supabase:', categoryId);
      }
    });
    
    setCategories(prev => prev.filter(cat => cat.name !== categoryId));
  };

  const handleAddCategory = (newCategory: any) => {
    // Supabase'e ekle
    categoryService.addCategory(newCategory).then(addedCategory => {
      if (addedCategory) {
        console.log('Category added to Supabase:', addedCategory);
      }
    });
    
    const categoryWithId = {
      ...newCategory,
      id: Date.now().toString(),
      groupCount: 0
    };
    setCategories(prev => [...prev, categoryWithId]);
  };


  
  // Kullanıcı durumuna göre grupları yükle
  useEffect(() => {
    const loadGroupsBasedOnUser = async () => {
      try {
        // Sayaçları başlat (sadece bir kez)
        if (!localStorage.getItem('pendingGroupsCount')) {
          localStorage.setItem('pendingGroupsCount', '0');
        }
        if (!localStorage.getItem('approvedGroupsCount')) {
          localStorage.setItem('approvedGroupsCount', '0');
        }
        if (!localStorage.getItem('rejectedGroupsCount')) {
          localStorage.setItem('rejectedGroupsCount', '0');
        }
        
        // Supabase'den güncel grupları yükle
        const supabaseGroups = await groupService.getGroups();
        
        if (supabaseGroups && supabaseGroups.length > 0) {
          // Tüm grupları göster
          setGroups(supabaseGroups);
          
          // localStorage'ı güncelle (önbellek olarak)
          localStorage.setItem('groups', JSON.stringify(supabaseGroups));
          localStorage.setItem('publicGroups', JSON.stringify(supabaseGroups));
          
          // Sayaçları güncelle
          const approvedCount = supabaseGroups.filter(g => g.approved === true).length;
          localStorage.setItem('approvedGroupsCount', approvedCount.toString());
        } else {
          // Supabase boşsa demo grupları göster
          setGroups(demoGroups);
        }
      } catch (error) {
        console.error('Error loading groups:', error);
        setGroups(demoGroups);
      }
    };
    
    loadGroupsBasedOnUser();
  }, [user]); // user değiştiğinde yeniden yükle

  const handleUpdatePage = (updatedPage: Page) => {
    // Supabase'de güncelle
    pageService.updatePage(updatedPage).then(success => {
      if (success) {
        console.log('Page updated in Supabase:', updatedPage.id);
      }
    });
    
    setPages(prev => prev.map(page => 
      page.id === updatedPage.id ? updatedPage : page
    ));
  };

  const handleDeletePage = (pageId: string) => {
    // Supabase'den sil
    pageService.deletePage(pageId).then(success => {
      if (success) {
        console.log('Page deleted from Supabase:', pageId);
      }
    });
    
    setPages(prev => prev.filter(page => page.id !== pageId));
  };

  const handleAddPage = (newPage: Page) => {
    // Supabase'e ekle
    pageService.addPage(newPage).then(addedPage => {
      if (addedPage) {
        console.log('Page added to Supabase:', addedPage);
      }
    });
    
    setPages(prev => [newPage, ...prev]);
  };

  const handleUpdateBlogPost = (updatedPost: BlogPost) => {
    // Supabase'de güncelle
    blogService.updatePost(updatedPost).then(success => {
      if (success) {
        console.log('Blog post updated in Supabase:', updatedPost.id);
      }
    });
    
    setBlogPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  const handleDeleteBlogPost = (postId: string) => {
    // Supabase'den sil
    blogService.deletePost(postId).then(success => {
      if (success) {
        console.log('Blog post deleted from Supabase:', postId);
      }
    });
    
    setBlogPosts(prev => prev.filter(post => post.id !== postId));
  };

  const handleAddBlogPost = (newPost: BlogPost) => {
    // Supabase'e ekle
    blogService.addPost(newPost).then(addedPost => {
      if (addedPost) {
        console.log('Blog post added to Supabase:', addedPost);
      }
    });
    
    setBlogPosts(prev => [newPost, ...prev]);
  };

  // Supabase'den tüm verileri yükle (gruplar user bazlı yüklenir)
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      
      try {
        // Kategorileri yükle
        const categoriesData = await categoryService.getCategories();
        if (categoriesData.length > 0) {
          // Lucide icon bileşenlerini ekle
          const categoriesWithIcons = categoriesData.map(cat => {
            const iconComponent = (() => {
              switch (cat.icon) {
                case 'Globe': return Globe;
                case 'Code': return Code;
                case 'TrendingUp': return TrendingUp;
                case 'Camera': return Camera;
                case 'Briefcase': return Briefcase;
                case 'Gamepad2': return Gamepad2;
                case 'Music': return Music;
                case 'Book': return Book;
                case 'Heart': return Heart;
                default: return Globe;
              }
            })();
            
            return {
              ...cat,
              icon: iconComponent
            };
          });
          
          // Tümü kategorisini ekle
          const allCategory = {
            id: 'all',
            name: 'Tümü',
            icon: Globe,
            color: 'from-purple-500 to-pink-500',
            groupCount: 0
          };
          
          setCategories([allCategory, ...categoriesWithIcons]);
        }
        
        // Sayfaları yükle
        const pagesData = await pageService.getPages();
        if (pagesData.length > 0) {
          setPages(pagesData);
        }
        
        // Blog yazılarını yükle
        const postsData = await blogService.getPosts();
        if (postsData.length > 0) {
          setBlogPosts(postsData);
        }
      } catch (error) {
        console.error('Error loading initial data from Supabase:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <Layout categories={categories} onGroupAdded={handleGroupAdded}>
          <GroupList 
            groups={groups} 
            categories={categories} 
            onGroupAdded={handleGroupAdded} 
          />
        </Layout>
      } />
      <Route path="/group/:slug" element={
        <Layout categories={categories} onGroupAdded={handleGroupAdded}>
          <GroupDetail groups={groups} categories={categories} />
        </Layout>
      } />
      <Route path="/categories" element={
        <Layout categories={categories} onGroupAdded={handleGroupAdded}>
          <CategoriesPage groups={groups} categories={categories} />
        </Layout>
      } />
      <Route path="/top-100" element={
        <Layout categories={categories} onGroupAdded={handleGroupAdded}>
          <TopGroupsPage groups={groups} categories={categories} />
        </Layout>
      } />
      <Route path="/category/:categoryName" element={
        <Layout categories={categories} onGroupAdded={handleGroupAdded}>
          <CategoryPage 
            groups={groups} 
            categories={categories} 
            onGroupAdded={handleGroupAdded} 
          />
        </Layout>
      } />

      {/* Blog Routes */}
      <Route path="/blog" element={
        <Layout categories={categories} onGroupAdded={handleGroupAdded}>
          <BlogList posts={blogPosts} />
        </Layout>
      } />
      <Route path="/blog/:slug" element={
        <Layout categories={categories} onGroupAdded={handleGroupAdded}>
          <BlogDetail posts={blogPosts} />
        </Layout>
      } />

      {/* Profile Routes */}
      <Route path="/profile" element={<ProfilePage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="groups" element={
          <GroupManagement 
            groups={groups}
            onUpdateGroup={handleUpdateGroup}
            onDeleteGroup={handleDeleteGroup}
          />
        } />
        <Route path="categories" element={
          <CategoryManagement 
            categories={categories.filter(cat => cat.name !== 'Tümü').map(cat => ({
              id: cat.name,
              name: cat.name,
              icon: cat.icon.name,
              color: cat.color,
              groupCount: groups.filter(g => g.category === cat.name).length
            }))}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddCategory={handleAddCategory}
          />
        } />
        <Route path="users" element={<UserManagement />} />
        <Route path="pages" element={
          <PageManagement 
            pages={pages}
            onUpdatePage={handleUpdatePage}
            onDeletePage={handleDeletePage}
            onAddPage={handleAddPage}
          />
        } />
        <Route path="blog" element={
          <BlogManagement 
            posts={blogPosts}
            onUpdatePost={handleUpdateBlogPost}
            onDeletePost={handleDeleteBlogPost}
            onAddPost={handleAddBlogPost}
          />
        } />
        <Route path="pending" element={
          <PendingGroups 
            onApproveGroup={handleApproveGroup}
            onRejectGroup={handleRejectGroup}
          />
        } />
        <Route path="seo" element={<SEOManagement />} />
        <Route path="reports" element={<ReportedGroups groups={groups} />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="appearance" element={<AppearanceSettings />} />
        <Route path="cache" element={<CacheManagement />} />
      </Route>

      {/* Redirect /admin/* to /admin */}
      <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}