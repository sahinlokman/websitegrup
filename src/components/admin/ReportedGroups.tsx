import React, { useState, useEffect } from 'react';
import { 
  Flag, 
  User, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ExternalLink, 
  MessageSquare, 
  Trash2,
  Eye,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createSlug } from '../../utils/slug';
import { reportService, GroupReport } from '../../services/reportService';
import { useAuth } from '../../contexts/AuthContext';
import { TelegramGroup } from '../../types/telegram';

interface ReportedGroupsProps {
  groups: TelegramGroup[];
}

export const ReportedGroups: React.FC<ReportedGroupsProps> = ({ groups }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<GroupReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<GroupReport | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved' | 'dismissed'>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadReports();
  }, [refreshTrigger]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const reportData = await reportService.getReports();
      setReports(reportData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleViewDetails = (report: GroupReport) => {
    setSelectedReport(report);
    setAdminNote(report.notes || '');
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (status: 'reviewed' | 'resolved' | 'dismissed') => {
    if (!selectedReport) return;
    
    try {
      const success = await reportService.updateReportStatus(
        selectedReport.id!,
        status,
        adminNote,
        user?.fullName || 'Admin'
      );
      
      if (success) {
        // Update local state
        setReports(prevReports => 
          prevReports.map(report => 
            report.id === selectedReport.id 
              ? {
                  ...report,
                  status,
                  notes: adminNote,
                  reviewedBy: user?.fullName || 'Admin',
                  reviewedAt: new Date()
                }
              : report
          )
        );
        
        // Close modal
        setShowDetailModal(false);
        setSelectedReport(null);
        setAdminNote('');
      }
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (confirm('Bu bildirimi silmek istediğinizden emin misiniz?')) {
      try {
        const success = await reportService.deleteReport(reportId);
        
        if (success) {
          // Update local state
          setReports(prevReports => prevReports.filter(report => report.id !== reportId));
          
          // Close modal if open
          if (selectedReport?.id === reportId) {
            setShowDetailModal(false);
            setSelectedReport(null);
            setAdminNote('');
          }
        }
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'reviewed': return <Eye className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'dismissed': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bildirilen Gruplar</h1>
        <p className="text-gray-600">Kullanıcılar tarafından bildirilen grupları yönetin</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Grup adı veya bildirim nedeni ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">Bekleyen</option>
                <option value="reviewed">İncelendi</option>
                <option value="resolved">Çözüldü</option>
                <option value="dismissed">Reddedildi</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="bg-gray-100 text-gray-700 px-4 py-3 rounded-2xl font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Yenile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Grup</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Bildirim Nedeni</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Bildiren</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Tarih</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Durum</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <Flag className="w-5 h-5 text-red-500" />
                        <div>
                          <div className="font-medium text-gray-900">{report.groupName}</div>
                          <div className="text-gray-500 text-sm">ID: {report.groupId.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-gray-600 line-clamp-2">{report.reason}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{report.userId.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{formatDate(report.reportedAt)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(report.status)}`}>
                        {getStatusIcon(report.status)}
                        <span>{report.status || 'pending'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(report)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Detayları Görüntüle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {(() => {
                          const group = groups.find(g => g.id === report.groupId);
                          return group ? (
                            <Link
                              to={`/group/${createSlug(group.name)}`}
                              target="_blank"
                              className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                              title="Grubu Görüntüle"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          ) : null;
                        })()}
                        
                        <button
                          onClick={() => handleDeleteReport(report.id!)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Bildirimi Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
          <Flag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Bildirim Bulunamadı</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Arama kriterlerinize uygun bildirim bulunamadı' 
              : 'Henüz bildirilmiş grup bulunmuyor'}
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Bildirim Detayı</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedReport(null);
                  setAdminNote('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Report Info */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{selectedReport.groupName}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(selectedReport.status)}`}>
                    {getStatusIcon(selectedReport.status)}
                    <span>{selectedReport.status || 'pending'}</span>
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-gray-500 text-sm">Grup ID:</span>
                    <p className="font-medium text-gray-900">{selectedReport.groupId}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Bildiren:</span>
                    <p className="font-medium text-gray-900">{selectedReport.userId}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Bildirim Tarihi:</span>
                    <p className="font-medium text-gray-900">{formatDate(selectedReport.reportedAt)}</p>
                  </div>
                  {selectedReport.reviewedAt && (
                    <div>
                      <span className="text-gray-500 text-sm">İnceleme Tarihi:</span>
                      <p className="font-medium text-gray-900">{formatDate(selectedReport.reviewedAt)}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <span className="text-gray-500 text-sm">Bildirim Nedeni:</span>
                  <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-800">{selectedReport.reason}</p>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Yönetici Notu
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Bildirim hakkında notlarınızı ekleyin..."
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => handleUpdateStatus('reviewed')}
                  className="bg-blue-100 text-blue-700 py-3 rounded-2xl font-semibold hover:bg-blue-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Eye className="w-5 h-5" />
                  <span>İncelendi</span>
                </button>
                
                <button
                  onClick={() => handleUpdateStatus('resolved')}
                  className="bg-green-100 text-green-700 py-3 rounded-2xl font-semibold hover:bg-green-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Çözüldü</span>
                </button>
                
                <button
                  onClick={() => handleUpdateStatus('dismissed')}
                  className="bg-gray-100 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Reddet</span>
                </button>
              </div>
              
              <div className="border-t border-gray-200 pt-4 flex justify-between">
                {(() => {
                  const group = groups.find(g => g.id === selectedReport.groupId);
                  return group ? (
                    <Link
                      to={`/group/${createSlug(group.name)}`}
                      target="_blank"
                      className="text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Grubu Görüntüle</span>
                    </Link>
                  ) : (
                    <span className="text-gray-400 font-medium flex items-center space-x-2">
                      <ExternalLink className="w-4 h-4" />
                      <span>Grup Bulunamadı</span>
                    </span>
                  );
                })()}
                
                <button
                  onClick={() => handleDeleteReport(selectedReport.id!)}
                  className="text-red-600 hover:text-red-700 font-medium flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Bildirimi Sil</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// X icon for the modal close button
const X = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 6 6 18"></path>
    <path d="m6 6 12 12"></path>
  </svg>
);