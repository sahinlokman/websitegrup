import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { promotionService } from '../services/supabaseService';
import { GroupPromotion } from '../types/promotion';
import { Calendar, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft, Shield, LogOut, Star } from 'lucide-react';

export default function ProfilePromotionsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<GroupPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (user && user.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadPromotions();
    }
  }, [user]);

  const loadPromotions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userPromotions = await promotionService.getPromotions(user.id);
      setPromotions(userPromotions);
    } catch (error) {
      console.error('Error loading promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Home Button */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <div className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center group-hover:border-blue-300 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-medium">Ana Sayfaya Dön</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Çıkış Yap</span>
            </button>
          
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <Shield className="w-5 h-5" />
              <span className="font-medium">Yönetici Paneli</span>
            </Link>
          )}
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Öne Çıkarmalarım</h1>
          <p className="mt-2 text-gray-600">
            Grup öne çıkarma kampanyalarınızı yönetin ve takip edin
          </p>
        </div>

        {promotions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Henüz Öne Çıkarma Yok
            </h3>
            <p className="text-gray-600 mb-6">
              Gruplarınız için henüz öne çıkarma oluşturmadınız.
            </p>
            <Link to="/profile/groups" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span>İlk Öne Çıkarmayı Oluştur</span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {promotions.map((promotion) => (
              <div
                key={promotion.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(promotion.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Promotion #{promotion.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Plan: {promotion.planId}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      promotion.status
                    )}`}
                  >
                    {promotion.status.charAt(0).toUpperCase() + promotion.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Başlangıç Tarihi</p>
                      <p className="font-medium">{formatDate(promotion.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Bitiş Tarihi</p>
                      <p className="font-medium">{formatDate(promotion.endDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Tutar</p>
                      <p className="font-medium">
                        {formatCurrency(promotion.amount, promotion.currency)}
                      </p>
                    </div>
                  </div>
                </div>

                {promotion.paymentId && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Ödeme ID: <span className="font-mono">{promotion.paymentId}</span>
                    </p>
                  </div>
                )}

                <div className="mt-4 flex justify-end space-x-3">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    Detayları Görüntüle
                  </button>
                  {promotion.status === 'active' && (
                    <button className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                      Öne Çıkarmayı İptal Et
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}