import { TelegramApiResponse, TelegramGroup } from '../types/telegram';

// Telegram Bot API endpoint
const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

// Bot token'ı environment variable'dan al
const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;

export class TelegramApiError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'TelegramApiError';
  }
}

class TelegramApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${TELEGRAM_API_BASE}${BOT_TOKEN}`;
  }

  async getGroupInfo(username: string): Promise<TelegramGroup | null> {
    try {
      // Bot token kontrolü
      if (!BOT_TOKEN) {
        throw new TelegramApiError('Bot token bulunamadı. Lütfen .env dosyasında VITE_TELEGRAM_BOT_TOKEN değişkenini ayarlayın.');
      }

      // Username'i temizle (@ işaretini kaldır)
      const cleanUsername = username.replace('@', '');
      
      if (!cleanUsername.trim()) {
        throw new TelegramApiError('Lütfen geçerli bir grup kullanıcı adı girin.');
      }
      
      // Önce bot token'ının geçerli olup olmadığını kontrol et
      const isValidToken = await this.validateBotToken();
      if (!isValidToken) {
        throw new TelegramApiError('Bot token geçersiz. Lütfen geçerli bir bot token kullanın.');
      }
      
      // Telegram API'den grup bilgilerini çek
      const response = await fetch(`${this.baseUrl}/getChat?chat_id=@${cleanUsername}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new TelegramApiError('Bot token geçersiz veya süresi dolmuş.');
        } else if (response.status === 429) {
          throw new TelegramApiError('Çok fazla istek gönderildi. Lütfen bir süre bekleyin.');
        } else if (response.status >= 500) {
          throw new TelegramApiError('Telegram sunucularında geçici bir sorun var. Lütfen daha sonra tekrar deneyin.');
        }
      }
      
      const data: TelegramApiResponse = await response.json();

      if (!data.ok || !data.result) {
        // Daha spesifik hata mesajları
        if (data.description?.includes('chat not found')) {
          throw new TelegramApiError(`"${cleanUsername}" adlı grup/kanal bulunamadı. Lütfen kontrol edin:\n• Kullanıcı adının doğru yazıldığından\n• Grubun/kanalın herkese açık olduğundan\n• Grubun/kanalın gerçekten var olduğundan emin olun.`);
        } else if (data.description?.includes('Forbidden')) {
          throw new TelegramApiError(`"${cleanUsername}" grubuna/kanalına erişim izni yok. Bot bu grubun/kanalın üyesi olmalı.`);
        } else if (data.description?.includes('Bad Request')) {
          throw new TelegramApiError(`Geçersiz istek. Lütfen grup kullanıcı adını kontrol edin.`);
        } else {
          throw new TelegramApiError(data.description || 'Grup bilgileri alınamadı');
        }
      }

      const groupData = data.result;

      // Üye sayısını al
      let memberCount = 0;
      try {
        const memberCountResponse = await fetch(`${this.baseUrl}/getChatMemberCount?chat_id=@${cleanUsername}`);
        if (memberCountResponse.ok) {
          const memberCountData = await memberCountResponse.json();
          memberCount = memberCountData.ok ? memberCountData.result : 0;
        }
      } catch (error) {
        console.warn('Üye sayısı alınamadı:', error);
        // Üye sayısı alınamazsa 0 olarak devam et
      }

      // Grup fotoğrafını al
      let groupImageUrl = '';
      if (groupData.photo?.big_file_id) {
        try {
          groupImageUrl = await this.getGroupPhoto(groupData.photo.big_file_id);
        } catch (photoError) {
          console.warn('Grup fotoğrafı alınamadı:', photoError);
          // Fotoğraf alınamazsa devam et, sadece uyarı ver
          groupImageUrl = '';
        }
      }

      // TelegramGroup formatına dönüştür
      const telegramGroup: TelegramGroup = {
        id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Daha benzersiz ID oluştur
        name: groupData.title,
        description: groupData.description || 'Açıklama bulunmuyor',
        image: groupImageUrl || undefined,
        members: memberCount,
        category: 'Teknoloji', // Varsayılan kategori, kullanıcı değiştirebilir
        tags: this.extractTagsFromDescription(groupData.description || ''),
        link: `https://t.me/${cleanUsername}`,
        verified: false, // API'den verified bilgisi gelmediği için false
        featured: false,
        username: cleanUsername,
        photo: groupData.photo?.big_file_id,
        type: this.mapGroupType(groupData.type),
        createdAt: new Date()
      };

      return telegramGroup;
    } catch (error) {
      console.error('Telegram API Error:', error);
      
      // TelegramApiError'ları olduğu gibi fırlat
      if (error instanceof TelegramApiError) {
        throw error;
      }
      
      // Network hatalarını yakala
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new TelegramApiError('İnternet bağlantısı hatası. Lütfen bağlantınızı kontrol edin.');
      }
      
      // JSON parse hatalarını yakala
      if (error instanceof SyntaxError) {
        throw new TelegramApiError('Telegram API\'den geçersiz yanıt alındı. Lütfen tekrar deneyin.');
      }
      
      // Diğer hatalar için genel mesaj
      throw new TelegramApiError('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }

  // Sadece grup üye sayısını getiren method
  async getGroupMemberCount(username: string): Promise<number | null> {
    try {
      if (!BOT_TOKEN) {
        console.warn('Bot token bulunamadı');
        return null;
      }

      // Demo gruplar için API çağrısını engelle
      if (username.includes('_demo')) {
        return null;
      }

      // Username'i temizle (@ işaretini kaldır)
      const cleanUsername = username.replace('@', '');
      
      // Üye sayısını al
      const memberCountResponse = await fetch(`${this.baseUrl}/getChatMemberCount?chat_id=@${cleanUsername}`);
      
      if (!memberCountResponse.ok) {
        console.warn(`HTTP ${memberCountResponse.status}: Üye sayısı alınamadı`);
        return null;
      }
      
      const memberCountData = await memberCountResponse.json();
      
      if (!memberCountData.ok) {
        console.warn(`Üye sayısı alınamadı: ${memberCountData.description || 'Bilinmeyen hata'}`);
        return null;
      }
      
      return memberCountData.result;
    } catch (error) {
      console.error('Üye sayısı getirme hatası:', error);
      return null;
    }
  }

  private async getGroupPhoto(fileId: string): Promise<string> {
    try {
      if (!BOT_TOKEN) {
        throw new Error('Bot token bulunamadı');
      }

      // Önce dosya yolunu al
      const fileResponse = await fetch(`${this.baseUrl}/getFile?file_id=${fileId}`);
      
      if (!fileResponse.ok) {
        if (fileResponse.status === 401) {
          throw new Error('Bot token geçersiz - fotoğraf erişimi reddedildi');
        } else if (fileResponse.status === 400) {
          throw new Error('Geçersiz dosya ID');
        } else {
          throw new Error(`HTTP ${fileResponse.status}: Dosya bilgisi alınamadı`);
        }
      }
      
      const fileData = await fileResponse.json();

      if (!fileData.ok || !fileData.result?.file_path) {
        throw new Error('Dosya yolu alınamadı');
      }

      // Dosya URL'ini döndür (CORS sorununu önlemek için direkt URL kullan)
      // Telegram API'den doğrudan resim URL'i alınamıyor, bu yüzden placeholder kullan
      return `https://via.placeholder.com/200x200?text=${encodeURIComponent(fileId.substring(0, 10))}`;
    } catch (error) {
      console.error('Grup fotoğrafı alma hatası:', error);
      
      // Network hatalarını yakala
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('İnternet bağlantısı hatası - fotoğraf indirilemedi');
      }
      
      throw error;
    }
  }

  private extractTagsFromDescription(description: string): string[] {
    // Açıklamadan hashtag'leri çıkar
    const hashtagRegex = /#[\w\u00c0-\u024f\u1e00-\u1eff]+/gi;
    const hashtags = description.match(hashtagRegex) || [];
    
    // # işaretini kaldır ve benzersiz yap
    const tags = hashtags.map(tag => tag.replace('#', ''));
    
    // Açıklamadan anahtar kelimeler de çıkar
    const keywords = this.extractKeywordsFromDescription(description);
    
    // Tüm etiketleri birleştir ve benzersiz yap
    const allTags = [...tags, ...keywords];
    return [...new Set(allTags)].slice(0, 10); // Maksimum 10 etiket
  }

  private extractKeywordsFromDescription(description: string): string[] {
    // Yaygın teknoloji ve kategori anahtar kelimeleri
    const techKeywords = [
      'react', 'vue', 'angular', 'javascript', 'typescript', 'node', 'python', 'java',
      'php', 'laravel', 'django', 'flutter', 'kotlin', 'swift', 'ios', 'android',
      'web', 'mobile', 'frontend', 'backend', 'fullstack', 'devops', 'ai', 'ml',
      'blockchain', 'crypto', 'bitcoin', 'ethereum', 'nft', 'defi',
      'design', 'ui', 'ux', 'figma', 'photoshop', 'illustrator',
      'business', 'startup', 'entrepreneur', 'marketing', 'sales',
      'game', 'unity', 'unreal', 'gamedev', 'indie',
      'music', 'production', 'beat', 'mixing', 'mastering',
      'book', 'literature', 'reading', 'writing', 'author'
    ];

    const lowerDescription = description.toLowerCase();
    const foundKeywords = techKeywords.filter(keyword => 
      lowerDescription.includes(keyword)
    );

    return foundKeywords;
  }

  private mapGroupType(type: string): 'group' | 'supergroup' | 'channel' {
    switch (type) {
      case 'group':
        return 'group';
      case 'supergroup':
        return 'supergroup';
      case 'channel':
        return 'channel';
      default:
        return 'group';
    }
  }

  async validateBotToken(): Promise<boolean> {
    try {
      if (!BOT_TOKEN) {
        return false;
      }

      const response = await fetch(`${this.baseUrl}/getMe`);
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.ok;
    } catch (error) {
      console.error('Bot token doğrulama hatası:', error);
      return false;
    }
  }

  // Grup fotoğrafını önizleme için ayrı bir method
  async getGroupPhotoPreview(username: string): Promise<string | null> {
    try {
      if (!BOT_TOKEN) {
        return null;
      }

      const cleanUsername = username.replace('@', '');
      const response = await fetch(`${this.baseUrl}/getChat?chat_id=@${cleanUsername}`);
      
      if (!response.ok) {
        return null;
      }
      
      const data: TelegramApiResponse = await response.json();

      if (!data.ok || !data.result?.photo?.big_file_id) {
        return null;
      }

      return await this.getGroupPhoto(data.result.photo.big_file_id);
    } catch (error) {
      console.error('Grup fotoğrafı önizleme hatası:', error);
      return null;
    }
  }
}

export const telegramApi = new TelegramApiService();