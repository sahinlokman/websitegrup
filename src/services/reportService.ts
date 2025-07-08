import { supabase } from '../lib/supabase';

export interface GroupReport {
  id?: string;
  groupId: string;
  userId: string;
  reason: string;
  groupName: string;
  reportedAt: Date;
  status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: Date;
  notes?: string;
}

class ReportService {
  async reportGroup(report: GroupReport): Promise<boolean> {
    try {
      // Try to use Supabase if available
      if (supabase) {
        try {
          const { error } = await supabase
            .from('group_reports')
            .insert({
              group_id: report.groupId,
              user_id: report.userId,
              reason: report.reason,
              group_name: report.groupName,
              reported_at: report.reportedAt.toISOString(),
              status: 'pending'
            });
          
          if (error) {
            console.error('Supabase error reporting group:', error);
            // Fall back to localStorage if Supabase fails
            return this.saveReportToLocalStorage(report);
          }
          
          return true;
        } catch (error) {
          console.error('Error reporting group to Supabase:', error);
          // Fall back to localStorage
          return this.saveReportToLocalStorage(report);
        }
      } else {
        // Use localStorage if Supabase is not available
        return this.saveReportToLocalStorage(report);
      }
    } catch (error) {
      console.error('Error reporting group:', error);
      return false;
    }
  }

  private saveReportToLocalStorage(report: GroupReport): boolean {
    try {
      // Get existing reports
      const savedReports = localStorage.getItem('groupReports');
      let reports: GroupReport[] = [];
      
      if (savedReports) {
        reports = JSON.parse(savedReports);
      }
      
      // Add new report with generated ID
      const newReport = {
        ...report,
        id: `report-${Date.now()}`,
        status: 'pending' as const,
        reportedAt: new Date()
      };
      
      reports.push(newReport);
      
      // Save back to localStorage
      localStorage.setItem('groupReports', JSON.stringify(reports));
      
      return true;
    } catch (error) {
      console.error('Error saving report to localStorage:', error);
      return false;
    }
  }

  async getReports(): Promise<GroupReport[]> {
    try {
      // Try to use Supabase if available
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('group_reports')
            .select('*')
            .order('reported_at', { ascending: false });
          
          if (error) {
            console.error('Supabase error getting reports:', error);
            // Fall back to localStorage if Supabase fails
            return this.getReportsFromLocalStorage();
          }
          
          // Convert to GroupReport type
          return data.map(report => ({
            id: report.id,
            groupId: report.group_id,
            userId: report.user_id,
            reason: report.reason,
            groupName: report.group_name,
            reportedAt: new Date(report.reported_at),
            status: report.status,
            reviewedBy: report.reviewed_by,
            reviewedAt: report.reviewed_at ? new Date(report.reviewed_at) : undefined,
            notes: report.notes
          }));
        } catch (error) {
          console.error('Error getting reports from Supabase:', error);
          // Fall back to localStorage
          return this.getReportsFromLocalStorage();
        }
      } else {
        // Use localStorage if Supabase is not available
        return this.getReportsFromLocalStorage();
      }
    } catch (error) {
      console.error('Error getting reports:', error);
      return [];
    }
  }

  private getReportsFromLocalStorage(): GroupReport[] {
    try {
      const savedReports = localStorage.getItem('groupReports');
      
      if (savedReports) {
        const reports = JSON.parse(savedReports);
        
        // Convert date strings to Date objects
        return reports.map((report: any) => ({
          ...report,
          reportedAt: new Date(report.reportedAt),
          reviewedAt: report.reviewedAt ? new Date(report.reviewedAt) : undefined
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error getting reports from localStorage:', error);
      return [];
    }
  }

  async updateReportStatus(reportId: string, status: 'reviewed' | 'resolved' | 'dismissed', notes?: string, reviewedBy?: string): Promise<boolean> {
    try {
      // Try to use Supabase if available
      if (supabase) {
        try {
          const { error } = await supabase
            .from('group_reports')
            .update({
              status: status,
              notes: notes,
              reviewed_by: reviewedBy,
              reviewed_at: new Date().toISOString()
            })
            .eq('id', reportId);
          
          if (error) {
            console.error('Supabase error updating report status:', error);
            // Fall back to localStorage if Supabase fails
            return this.updateReportStatusInLocalStorage(reportId, status, notes, reviewedBy);
          }
          
          return true;
        } catch (error) {
          console.error('Error updating report status in Supabase:', error);
          // Fall back to localStorage
          return this.updateReportStatusInLocalStorage(reportId, status, notes, reviewedBy);
        }
      } else {
        // Use localStorage if Supabase is not available
        return this.updateReportStatusInLocalStorage(reportId, status, notes, reviewedBy);
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      return false;
    }
  }

  private updateReportStatusInLocalStorage(reportId: string, status: 'reviewed' | 'resolved' | 'dismissed', notes?: string, reviewedBy?: string): boolean {
    try {
      // Get existing reports
      const savedReports = localStorage.getItem('groupReports');
      
      if (!savedReports) {
        return false;
      }
      
      const reports: GroupReport[] = JSON.parse(savedReports);
      
      // Find and update the report
      const updatedReports = reports.map(report => {
        if (report.id === reportId) {
          return {
            ...report,
            status: status,
            notes: notes || report.notes,
            reviewedBy: reviewedBy || report.reviewedBy,
            reviewedAt: new Date()
          };
        }
        return report;
      });
      
      // Save back to localStorage
      localStorage.setItem('groupReports', JSON.stringify(updatedReports));
      
      return true;
    } catch (error) {
      console.error('Error updating report status in localStorage:', error);
      return false;
    }
  }

  async deleteReport(reportId: string): Promise<boolean> {
    try {
      // Try to use Supabase if available
      if (supabase) {
        try {
          const { error } = await supabase
            .from('group_reports')
            .delete()
            .eq('id', reportId);
          
          if (error) {
            console.error('Supabase error deleting report:', error);
            // Fall back to localStorage if Supabase fails
            return this.deleteReportFromLocalStorage(reportId);
          }
          
          return true;
        } catch (error) {
          console.error('Error deleting report from Supabase:', error);
          // Fall back to localStorage
          return this.deleteReportFromLocalStorage(reportId);
        }
      } else {
        // Use localStorage if Supabase is not available
        return this.deleteReportFromLocalStorage(reportId);
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      return false;
    }
  }

  private deleteReportFromLocalStorage(reportId: string): boolean {
    try {
      // Get existing reports
      const savedReports = localStorage.getItem('groupReports');
      
      if (!savedReports) {
        return false;
      }
      
      const reports: GroupReport[] = JSON.parse(savedReports);
      
      // Filter out the report to delete
      const updatedReports = reports.filter(report => report.id !== reportId);
      
      // Save back to localStorage
      localStorage.setItem('groupReports', JSON.stringify(updatedReports));
      
      return true;
    } catch (error) {
      console.error('Error deleting report from localStorage:', error);
      return false;
    }
  }
}

export const reportService = new ReportService();