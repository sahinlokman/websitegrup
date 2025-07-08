import { supabase } from '../lib/supabase';

export interface UserActivity {
  id: string | number;
  action_type: string;
  entity_type: string;
  entity_id?: string;
  action_details: Record<string, any>;
  created_at: string;
}

class UserActivityService {
  // Get user activities from Supabase
  async getUserActivities(userId: string): Promise<UserActivity[]> {
    try {
      // Check if userId is a valid UUID
      if (!this.isValidUUID(userId)) {
        // If not, use local storage or generate mock data
        return this.getLocalUserActivities(userId);
      }
      
      // Try to get from Supabase
      const { data, error } = await supabase
        .from('user_activity')
        .select('id, action_type, entity_type, entity_id, action_details, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error || !data || data.length === 0) {
        // Fallback to local storage
        return this.getLocalUserActivities(userId);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching user activities:', error);
      return this.getLocalUserActivities(userId);
    }
  }
  
  // Get user activities from local storage
  async getLocalUserActivities(userId: string): Promise<UserActivity[]> {
    try {
      // Try to get from localStorage
      const savedActivities = localStorage.getItem(`userActivities_${userId}`);
      if (savedActivities) {
        return JSON.parse(savedActivities);
      }
      
      // If no activities in localStorage, generate and save mock activities
      const mockActivities = this.generateMockActivities(userId);
      localStorage.setItem(`userActivities_${userId}`, JSON.stringify(mockActivities));
      return mockActivities;
    } catch (error) {
      console.error('Error getting local user activities:', error);
      return this.generateMockActivities(userId);
    }
  }
  
  // Add a new activity
  async addActivity(
    userId: string, 
    actionType: string, 
    entityType: string, 
    details: Record<string, any>,
    entityId?: string
  ): Promise<boolean> {
    try {
      // Check if userId is a valid UUID
      if (this.isValidUUID(userId)) {
        // Try to add to Supabase
        const { error } = await supabase
          .from('user_activity')
          .insert({
            user_id: userId,
            action_type: actionType,
            entity_type: entityType,
            entity_id: entityId,
            action_details: details,
          });
        
        if (!error) {
          return true;
        }
      }
      
      // Fallback to localStorage
      return this.addLocalActivity(userId, actionType, entityType, details, entityId);
    } catch (error) {
      console.error('Error adding activity:', error);
      return this.addLocalActivity(userId, actionType, entityType, details, entityId);
    }
  }
  
  // Add activity to localStorage
  async addLocalActivity(
    userId: string, 
    actionType: string, 
    entityType: string, 
    details: Record<string, any>,
    entityId?: string
  ): Promise<boolean> {
    try {
      // Get existing activities
      const savedActivities = localStorage.getItem(`userActivities_${userId}`);
      let activities: UserActivity[] = [];
      
      if (savedActivities) {
        activities = JSON.parse(savedActivities);
      }
      
      // Add new activity
      const newActivity: UserActivity = {
        id: Date.now(),
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId,
        action_details: details,
        created_at: new Date().toISOString()
      };
      
      // Add to beginning of array
      activities.unshift(newActivity);
      
      // Keep only the latest 20 activities
      if (activities.length > 20) {
        activities = activities.slice(0, 20);
      }
      
      // Save to localStorage
      localStorage.setItem(`userActivities_${userId}`, JSON.stringify(activities));
      
      return true;
    } catch (error) {
      console.error('Error adding local activity:', error);
      return false;
    }
  }
  
  // Generate mock activities based on user's groups and promotions
  generateMockActivities(userId: string): UserActivity[] {
    const activities: UserActivity[] = [];
    const now = Date.now();
    
    try {
      // Check if user has groups
      const savedGroups = localStorage.getItem(`userGroups_${userId}`);
      if (savedGroups) {
        const groups = JSON.parse(savedGroups);
        
        // Generate activities based on actual groups
        groups.slice(0, 3).forEach((group: any, index: number) => {
          // Create activity for group creation
          activities.push({
            id: now - (index * 100000),
            action_type: 'create',
            entity_type: 'group',
            entity_id: group.id,
            action_details: { 
              group_name: group.groupName || group.name,
              status: group.status
            },
            created_at: new Date(now - (index * 3600000)).toISOString() // Hours ago
          });
          
          // If group is approved, add approval activity
          if (group.status === 'approved') {
            activities.push({
              id: now - (index * 100000) - 50000,
              action_type: 'update',
              entity_type: 'group',
              entity_id: group.id,
              action_details: { 
                group_name: group.groupName || group.name,
                status: 'approved'
              },
              created_at: new Date(now - (index * 3600000) - 1800000).toISOString() // 30 min after creation
            });
          }
        });
      }
      
      // Check if user has promotions
      const savedPromotions = localStorage.getItem(`userPromotions_${userId}`);
      if (savedPromotions) {
        const promotions = JSON.parse(savedPromotions);
        
        // Generate activities based on actual promotions
        promotions.slice(0, 2).forEach((promo: any, index: number) => {
          activities.push({
            id: now - (index * 200000),
            action_type: 'create',
            entity_type: 'promotion',
            entity_id: promo.id,
            action_details: { 
              group_id: promo.groupId,
              amount: promo.amount,
              currency: promo.currency
            },
            created_at: new Date(now - (index * 7200000)).toISOString() // 2 hours ago
          });
        });
      }
      
      // Add login activity
      activities.push({
        id: now - 500000,
        action_type: 'login',
        entity_type: 'user',
        action_details: {},
        created_at: new Date(now - 3600000).toISOString() // 1 hour ago
      });
      
      // Sort by created_at (newest first)
      activities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      // Limit to 5 activities
      return activities.slice(0, 5);
    } catch (error) {
      console.error('Error generating mock activities:', error);
      
      // Return basic fallback activities if everything else fails
      return [
        { 
          id: now - 7200000, 
          action_type: 'create', 
          entity_type: 'group',
          action_details: { group_name: 'React Developers TR' },
          created_at: new Date(now - 7200000).toISOString() // 2 hours ago
        },
        { 
          id: now - 14400000, 
          action_type: 'update', 
          entity_type: 'group',
          action_details: { group_name: 'Vue.js Türkiye', status: 'pending' },
          created_at: new Date(now - 14400000).toISOString() // 4 hours ago
        },
        { 
          id: now - 21600000, 
          action_type: 'login', 
          entity_type: 'user',
          action_details: {},
          created_at: new Date(now - 21600000).toISOString() // 6 hours ago
        }
      ];
    }
  }
  
  // Helper function to validate UUID format
  isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}

export const userActivityService = new UserActivityService();