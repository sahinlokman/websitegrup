import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Clock, 
  CreditCard, 
  CheckCircle, 
  Loader2,
  AlertCircle,
  TrendingUp,
  Users,
  Eye,
  Zap
} from 'lucide-react';
import { PromotionPlan, GroupPromotion, PromotionModalProps } from '../../types/promotion';
import { cryptomusApi } from '../../services/cryptomusApi';
import { useAuth } from '../../contexts/AuthContext';
import { userActivityService } from '../../services/userActivityService';

const promotionPlans: PromotionPlan[] = [
  {
    id: '1-month',
    name: '1 Aylık Öne Çıkarma',
    duration: 30,
    price: 9.99,
    features: [
      'Ana sayfada öne çıkan bölümde görünüm',
      'Kategori sayfasında üst sıralarda yer alma',
      'Özel "Öne Çıkan" rozeti',
      '30 gün boyunca aktif'
    ]
  },
  {
    id: '3-month',
    name: '3 Aylık Öne Çıkarma',
    duration: 90,
    price: 24.99,
    features: [
      'Ana sayfada öne çıkan bölümde görünüm',
      'Kategori sayfasında üst sıralarda yer alma',
      'Özel "Öne Çıkan" rozeti',
      '90 gün boyunca aktif',
      '%17 indirim'
    ],
    popular: true
  },
  {
    id: '6-month',
    name: '6 Aylık Öne Çıkarma',
    duration: 180,
    price: 44.99,
    features: [
      'Ana sayfada öne çıkan bölümde görünüm',
      'Kategori sayfasında üst sıralarda yer alma',
      'Özel "Öne Çıkan" rozeti',
      '180 gün boyunca aktif',
      '%25 indirim',
      'Öncelikli destek'
    ]
  }
];

export const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
  onPromotionSuccess
}) => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PromotionPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'payment' | 'processing' | 'success'>('select');

  const handlePlanSelect = (plan: PromotionPlan) => {
    setSelectedPlan(plan);
    setStep('payment');
  };

  const handlePromotionSuccess = (promotion: GroupPromotion) => {
    onPromotionSuccess(promotion);
    
    // localStorage'a kaydet
    try {
      const savedPromotions = localStorage.getItem(`userPromotions_${user!.id}`);
      let promotions = [];
      
      if (savedPromotions) {
        promotions = JSON.parse(savedPromotions);
      }
      
      promotions.push(promotion);
      localStorage.setItem(`userPromotions_${user!.id}`, JSON.stringify(promotions));
    } catch (error) {
      console.error('Error saving promotion to localStorage:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan || !user) return;

    setIsProcessing(true);
    setError(null);

    try {
      const orderId = `promotion_${groupId}_${Date.now()}`;
      
      const paymentData = {
        amount: selectedPlan.price.toString(),
        currency: 'USD',
        order_id: orderId,
        url_return: `${window.location.origin}/payment/success`,
        url_callback: `${window.location.origin}/api/payment/callback`,
        lifetime: 3600, // 1 saat
        to_currency: 'USDT'
      };

      const paymentResponse = await cryptomusApi.createPayment(paymentData);
      
      if (paymentResponse.result?.url) {
        setPaymentUrl(paymentResponse.result.url);
        setStep('processing');
        
        // Ödeme durumunu kontrol et (demo amaçlı)
        setTimeout(async () => {
          try {
            const success = await cryptomusApi.simulatePaymentSuccess(orderId);
            
            if (success) {
              // Başarılı ödeme sonrası grup öne çıkarma
              const promotion: GroupPromotion = {
                id: `promo_${Date.now()}`,
                groupId,
                userId: user.id,
                planId: selectedPlan.id,
                startDate: new Date(),
                endDate: new Date(Date.now() + selectedPlan.duration * 24 * 60 * 60 * 1000),
                status: 'active',
                paymentId: paymentResponse.result?.uuid,
                amount: selectedPlan.price,
                currency: 'USD'
              };

              // Record activity
              userActivityService.addActivity(
                user.id,
                'create',
                'promotion',
                {
                  group_id: groupId,
                  group_name: groupName,
                  plan_id: selectedPlan.id,
                  amount: selectedPlan.price,
                  currency: 'USD'
                },
                promotion.id
              );

              handlePromotionSuccess(promotion);
              setStep('success');
            } else {
              setError('Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.');
              setStep('select');
            }
          } catch (err) {
            setError('Ödeme durumu kontrol edilemedi.');
            setStep('select');
          }
        }, 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ödeme işlemi başlatılamadı');
      setStep('select');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const calculateSavings = (plan: PromotionPlan) => {
    const monthlyPrice = 9.99;
    const totalMonthlyPrice = (plan.duration / 30) * monthlyPrice;
    const savings = totalMonthlyPrice - plan.price;
    return savings > 0 ? savings : 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 max-w-4xl w-full border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Grubu Öne Çıkar</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              <span className="font-medium">{groupName}</span> grubunu öne çıkarın
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 'select' && (
          <div>
            {/* Benefits Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Öne Çıkarmanın Avantajları</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Daha Fazla Görünüm</p>
                    <p className="text-gray-600 text-xs">%300'e kadar artış</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Yeni Üyeler</p>
                    <p className="text-gray-600 text-xs">Hızlı büyüme</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Eye className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Üst Sıralarda</p>
                    <p className="text-gray-600 text-xs">Kategori başında</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Özel Rozet</p>
                    <p className="text-gray-600 text-xs">Güvenilirlik</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {promotionPlans.map((plan) => {
                const savings = calculateSavings(plan);
                
                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white border-2 rounded-3xl p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                      plan.popular 
                        ? 'border-purple-500 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                          En Popüler
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                          : 'bg-gray-100'
                      }`}>
                        <Star className={`w-8 h-8 ${plan.popular ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {formatPrice(plan.price)}
                      </div>
                      {savings > 0 && (
                        <p className="text-green-600 text-sm font-medium">
                          {formatPrice(savings)} tasarruf
                        </p>
                      )}
                      <p className="text-gray-500 text-sm">{plan.duration} gün</p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button className={`w-full py-3 rounded-2xl font-semibold transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}>
                      Seç
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 'payment' && selectedPlan && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Ödeme Onayı</h4>
              <p className="text-gray-600">Seçiminizi onaylayın ve ödemeye geçin</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium text-gray-900">{selectedPlan.name}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">Süre:</span>
                <span className="font-medium text-gray-900">{selectedPlan.duration} gün</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">Grup:</span>
                <span className="font-medium text-gray-900">{groupName}</span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">Toplam:</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {formatPrice(selectedPlan.price)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-blue-900 font-medium text-sm">Cryptomus ile Güvenli Ödeme</p>
                  <p className="text-blue-700 text-xs mt-1">
                    Kripto para ile güvenli ödeme. USDT, BTC, ETH ve daha fazla coin kabul edilir.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setStep('select')}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Geri
              </button>
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>İşleniyor...</span>
                  </>
                ) : (
                  <span>Ödemeye Geç</span>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-4">Ödeme İşleniyor</h4>
            <p className="text-gray-600 mb-6">
              Ödemeniz Cryptomus üzerinden işleniyor. Lütfen bekleyin...
            </p>
            {paymentUrl && (
              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-blue-600 transition-colors"
              >
                <CreditCard className="w-5 h-5" />
                <span>Ödeme Sayfasını Aç</span>
              </a>
            )}
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-4">Ödeme Başarılı!</h4>
            <p className="text-gray-600 mb-6">
              <span className="font-medium">{groupName}</span> grubunuz başarıyla öne çıkarıldı.
              {selectedPlan && ` ${selectedPlan.duration} gün boyunca aktif olacak.`}
            </p>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
            >
              Tamam
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};