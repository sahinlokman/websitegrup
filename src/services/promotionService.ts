import { GroupPromotion, PromotionPlan } from '../types/promotion';

class PromotionService {
  private promotions: GroupPromotion[] = [];

  // Grup öne çıkarma işlemi
  async promoteGroup(promotion: GroupPromotion): Promise<boolean> {
    try {
      // Gerçek uygulamada API'ye gönderilecek
      this.promotions.push(promotion);
      
      // Local storage'a kaydet (demo amaçlı)
      localStorage.setItem('groupPromotions', JSON.stringify(this.promotions));
      
      return true;
    } catch (error) {
      console.error('Promotion error:', error);
      return false;
    }
  }

  // Aktif öne çıkarmaları getir
  getActivePromotions(userId: string): GroupPromotion[] {
    const saved = localStorage.getItem('groupPromotions');
    if (saved) {
      try {
        const promotions = JSON.parse(saved) as GroupPromotion[];
        return promotions.filter(p => 
          p.userId === userId && 
          p.status === 'active' && 
          new Date(p.endDate) > new Date()
        );
      } catch {
        return [];
      }
    }
    return [];
  }

  // Süresi dolan öne çıkarmaları kontrol et
  checkExpiredPromotions(): void {
    const saved = localStorage.getItem('groupPromotions');
    if (saved) {
      try {
        const promotions = JSON.parse(saved) as GroupPromotion[];
        const updated = promotions.map(p => {
          if (p.status === 'active' && new Date(p.endDate) <= new Date()) {
            return { ...p, status: 'expired' as const };
          }
          return p;
        });
        
        localStorage.setItem('groupPromotions', JSON.stringify(updated));
        this.promotions = updated;
      } catch (error) {
        console.error('Error checking expired promotions:', error);
      }
    }
  }

  // Grup öne çıkarma durumunu kontrol et
  isGroupPromoted(groupId: string): boolean {
    const saved = localStorage.getItem('groupPromotions');
    if (saved) {
      try {
        const promotions = JSON.parse(saved) as GroupPromotion[];
        return promotions.some(p => 
          p.groupId === groupId && 
          p.status === 'active' && 
          new Date(p.endDate) > new Date()
        );
      } catch {
        return false;
      }
    }
    return false;
  }

  // Öne çıkarma istatistikleri
  getPromotionStats(userId: string): {
    totalPromotions: number;
    activePromotions: number;
    totalSpent: number;
  } {
    const saved = localStorage.getItem('groupPromotions');
    if (saved) {
      try {
        const promotions = JSON.parse(saved) as GroupPromotion[];
        const userPromotions = promotions.filter(p => p.userId === userId);
        
        return {
          totalPromotions: userPromotions.length,
          activePromotions: userPromotions.filter(p => 
            p.status === 'active' && new Date(p.endDate) > new Date()
          ).length,
          totalSpent: userPromotions.reduce((sum, p) => sum + p.amount, 0)
        };
      } catch {
        return { totalPromotions: 0, activePromotions: 0, totalSpent: 0 };
      }
    }
    return { totalPromotions: 0, activePromotions: 0, totalSpent: 0 };
  }
}

export const promotionService = new PromotionService();