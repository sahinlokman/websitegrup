import { supabase } from '../lib/supabase';
import { User, LoginCredentials, RegisterData } from '../types/user';
import { TelegramGroup } from '../types/telegram';
import { UserGroup } from '../types/userGroup';
import { GroupPromotion } from '../types/promotion';
import { Page } from '../types/page';
import { BlogPost } from '../types/blog';

// Helper function to handle Supabase errors
const handleSupabaseError = (error: any, fallbackValue: any, errorMessage: string) => {
  if (error) {
    console.error(errorMessage, error);
    return fallbackValue;
  }
  return null;
};

// User Authentication Services
export const authService = {
  async login(credentials: LoginCredentials): Promise<User | null> {
    try {
      // In a real app, you would use Supabase Auth
      // For now, we'll simulate login with a database query
      const { data, error } = await supabase
        .rpc('get_user_by_username', { username_param: credentials.username });
      
      if (error || !data || data.length === 0) {
        console.error('Login error:', error);
        return null;
      }
      
      const userData = data[0];
      
      // Update last login
      const { error: updateError } = await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id);
      
      if (updateError) {
        console.error('Error updating last login:', updateError);
      }
      
      // Convert to User type
      const user: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        fullName: userData.full_name,
        role: userData.role,
        createdAt: new Date(userData.created_at),
        lastLogin: userData.last_login ? new Date(userData.last_login) : undefined
      };
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },
  
  async register(data: RegisterData): Promise<User | null> {
    try {
      // In a real app, you would use Supabase Auth
      // For now, we'll insert directly into the users table
      const { data: newUser, error } = await supabase
        .rpc('register_new_user', { 
          username_param: data.username,
          email_param: data.email,
          full_name_param: data.fullName
        });
      
      if (error || !newUser || newUser.length === 0) {
        console.error('Registration error:', error);
        return null;
      }
      
      const userData = newUser[0];
      
      // Convert to User type
      const user: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        fullName: userData.full_name,
        role: userData.role,
        createdAt: new Date(userData.created_at),
        lastLogin: userData.last_login ? new Date(userData.last_login) : undefined
      };
      
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  },
  
  async updateProfile(userId: string, data: Partial<User>): Promise<boolean> {
    try {
      const { error } = await supabase
        .rpc('update_user_profile', {
          user_id_param: userId,
          email_param: data.email,
          full_name_param: data.fullName
        });
      
      if (error) {
        console.error('Profile update error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  },
  
  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_all_users');
      
      if (error) {
        console.error('Get users error:', error);
        return [];
      }
      
      // Convert to User type
      return data.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        createdAt: new Date(user.created_at),
        lastLogin: user.last_login ? new Date(user.last_login) : undefined
      }));
    } catch (error) {
      console.error('Get users error:', error);
      return [];
    }
  },
  
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .rpc('delete_user', { user_id_param: userId });
      
      if (error) {
        console.error('Delete user error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
  },
  
  async updateUserRole(userId: string, role: 'admin' | 'user'): Promise<boolean> {
    try {
      const { error } = await supabase
        .rpc('update_user_role', { 
          user_id_param: userId,
          role_param: role
        });
      
      if (error) {
        console.error('Update user role error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Update user role error:', error);
      return false;
    }
  }
};

// Group Services
export const groupService = {
  async getGroups(): Promise<TelegramGroup[]> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Get groups error:', error);
        return [];
      }
      
      // Convert to TelegramGroup type
      return data.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        image: group.image || undefined,
        members: group.members,
        category: group.category,
        tags: group.tags || [],
        link: group.link,
        verified: group.verified,
        featured: group.featured,
        approved: group.approved,
        username: group.username || undefined,
        type: group.type as any || undefined,
        createdAt: new Date(group.created_at)
      }));
    } catch (error) {
      console.error('Get groups error:', error);
      return [];
    }
  },
  
  async getPublicGroups(): Promise<TelegramGroup[]> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('approved', true)
        .order('featured', { ascending: false })
        .order('members', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Get public groups error:', error);
        return [];
      }
      
      // Convert to TelegramGroup type
      return data.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        image: group.image || undefined,
        members: group.members,
        category: group.category,
        tags: group.tags || [],
        link: group.link,
        verified: group.verified,
        featured: group.featured,
        approved: group.approved,
        username: group.username || undefined,
        type: group.type as any || undefined,
        createdAt: new Date(group.created_at)
      }));
    } catch (error) {
      console.error('Get public groups error:', error);
      return [];
    }
  },
  
  async addGroup(group: TelegramGroup): Promise<TelegramGroup | null> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: group.name,
          description: group.description,
          image: group.image || null,
          members: group.members,
          category: group.category,
          tags: group.tags,
          link: group.link,
          verified: group.verified || false,
          featured: group.featured || false,
          approved: group.approved || false,
          username: group.username || null,
          type: group.type || null,
          user_id: group.userId || null
        })
        .select()
        .single();
      
      if (error) {
        console.error('Add group error:', error);
        return null;
      }
      
      // Convert to TelegramGroup type
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        image: data.image || undefined,
        members: data.members,
        category: data.category,
        tags: data.tags || [],
        link: data.link,
        verified: data.verified,
        featured: data.featured,
        approved: data.approved,
        username: data.username || undefined,
        type: data.type as any || undefined,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error('Add group error:', error);
      return null;
    }
  },
  
  async updateGroup(group: TelegramGroup): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('groups')
        .update({
          name: group.name,
          description: group.description,
          image: group.image || null,
          members: group.members,
          category: group.category,
          tags: group.tags,
          link: group.link,
          verified: group.verified,
          featured: group.featured,
          approved: group.approved,
          username: group.username || null,
          type: group.type || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', group.id);
      
      if (error) {
        console.error('Update group error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Update group error:', error);
      return false;
    }
  },
  
  async deleteGroup(groupId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);
      
      if (error) {
        console.error('Delete group error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Delete group error:', error);
      return false;
    }
  },
  
  async getGroupsByCategory(category: string): Promise<TelegramGroup[]> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('approved', true)
        .eq('category', category)
        .order('featured', { ascending: false })
        .order('members', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Get groups by category error:', error);
        return [];
      }
      
      // Convert to TelegramGroup type
      return data.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        image: group.image || undefined,
        members: group.members,
        category: group.category,
        tags: group.tags || [],
        link: group.link,
        verified: group.verified,
        featured: group.featured,
        approved: group.approved,
        username: group.username || undefined,
        type: group.type as any || undefined,
        createdAt: new Date(group.created_at)
      }));
    } catch (error) {
      console.error('Get groups by category error:', error);
      return [];
    }
  }
};

// User Group Services
export const userGroupService = {
  async getUserGroups(userId: string): Promise<UserGroup[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_groups', { user_id_param: userId });
      
      if (error) {
        console.error('Get user groups error:', error);
        return [];
      }
      
      // Convert to UserGroup type
      return data.map(group => ({
        id: group.id,
        userId: group.user_id,
        groupName: group.group_name,
        groupDescription: group.group_description,
        groupUsername: group.group_username,
        groupImage: group.group_image || undefined,
        category: group.category,
        tags: group.tags || [],
        link: group.link,
        members: group.members,
        status: group.status as any,
        submittedAt: new Date(group.submitted_at),
        reviewedAt: group.reviewed_at ? new Date(group.reviewed_at) : undefined,
        rejectionReason: group.rejection_reason || undefined,
        reviewedBy: group.reviewed_by || undefined,
        submissionNote: group.submission_note || undefined
      }));
    } catch (error) {
      console.error('Get user groups error:', error);
      return [];
    }
  },
  
  async addUserGroup(group: UserGroup): Promise<UserGroup | null> {
    try {
      const { data, error } = await supabase
        .rpc('add_user_group', {
          user_id_param: group.userId,
          group_name_param: group.groupName,
          group_description_param: group.groupDescription,
          group_username_param: group.groupUsername,
          group_image_param: group.groupImage || null,
          category_param: group.category,
          tags_param: group.tags,
          link_param: group.link,
          members_param: group.members,
          status_param: group.status,
          submitted_at_param: group.submittedAt.toISOString(),
          submission_note_param: group.submissionNote || null
        });
      
      if (error) {
        console.error('Add user group error:', error);
        return null;
      }
      
      // Convert to UserGroup type
      return {
        id: data.id,
        userId: data.user_id,
        groupName: data.group_name,
        groupDescription: data.group_description,
        groupUsername: data.group_username,
        groupImage: data.group_image || undefined,
        category: data.category,
        tags: data.tags || [],
        link: data.link,
        members: data.members,
        status: data.status as any,
        submittedAt: new Date(data.submitted_at),
        reviewedAt: data.reviewed_at ? new Date(data.reviewed_at) : undefined,
        rejectionReason: data.rejection_reason || undefined,
        reviewedBy: data.reviewed_by || undefined,
        submissionNote: data.submission_note || undefined
      };
    } catch (error) {
      console.error('Add user group error:', error);
      return null;
    }
  },
  
  async updateUserGroup(group: UserGroup): Promise<boolean> {
    try {
      const { error } = await supabase
        .rpc('update_user_group', {
          group_id_param: group.id,
          group_name_param: group.groupName,
          group_description_param: group.groupDescription,
          group_username_param: group.groupUsername,
          group_image_param: group.groupImage || null,
          category_param: group.category,
          tags_param: group.tags,
          link_param: group.link,
          members_param: group.members,
          status_param: group.status,
          reviewed_at_param: group.reviewedAt?.toISOString() || null,
          reviewed_by_param: group.reviewedBy || null,
          rejection_reason_param: group.rejectionReason || null
        });
      
      if (error) {
        console.error('Update user group error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Update user group error:', error);
      return false;
    }
  },
  
  async deleteUserGroup(groupId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .rpc('delete_user_group', { group_id_param: groupId });
      
      if (error) {
        console.error('Delete user group error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Delete user group error:', error);
      return false;
    }
  },
  
  async getPendingGroups(): Promise<UserGroup[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_pending_groups');
      
      if (error) {
        console.error('Get pending groups error:', error);
        return [];
      }
      
      // Convert to UserGroup type with submitter info
      return data.map(group => ({
        id: group.id,
        userId: group.user_id,
        groupName: group.group_name,
        groupDescription: group.group_description,
        groupUsername: group.group_username,
        groupImage: group.group_image || undefined,
        category: group.category,
        tags: group.tags || [],
        link: group.link,
        members: group.members,
        status: group.status as any,
        submittedAt: new Date(group.submitted_at),
        reviewedAt: group.reviewed_at ? new Date(group.reviewed_at) : undefined,
        rejectionReason: group.rejection_reason || undefined,
        reviewedBy: group.reviewed_by || undefined,
        submissionNote: group.submission_note || undefined,
        submittedByUser: {
          id: group.users.id,
          username: group.users.username,
          email: group.users.email,
          fullName: group.users.full_name
        }
      }));
    } catch (error) {
      console.error('Get pending groups error:', error);
      return [];
    }
  }
};

// Category Services
export const categoryService = {
  async getCategories(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Get categories error:', error);
        return [];
      }
      
      // Get group counts for each category
      const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('category')
        .eq('approved', true);
      
      if (groupsError) {
        console.error('Get group counts error:', groupsError);
      }
      
      const groupCounts = groups ? groups.reduce((acc: Record<string, number>, curr: any) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
      }, {}) : {};
      
      // Convert to category type with group counts
      return data.map(category => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        description: category.description,
        groupCount: groupCounts[category.name] || 0
      }));
    } catch (error) {
      console.error('Get categories error:', error);
      return [];
    }
  },
  
  async addCategory(category: any): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          icon: category.icon,
          color: category.color,
          description: category.description || null
        })
        .select()
        .single();
      
      if (error) {
        console.error('Add category error:', error);
        return null;
      }
      
      return {
        id: data.id,
        name: data.name,
        icon: data.icon,
        color: data.color,
        description: data.description,
        groupCount: 0
      };
    } catch (error) {
      console.error('Add category error:', error);
      return null;
    }
  },
  
  async updateCategory(category: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          icon: category.icon,
          color: category.color,
          description: category.description || null
        })
        .eq('id', category.id);
      
      if (error) {
        console.error('Update category error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Update category error:', error);
      return false;
    }
  },
  
  async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) {
        console.error('Delete category error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Delete category error:', error);
      return false;
    }
  }
};

// Promotion Services
export const promotionService = {
  async getPromotions(userId?: string): Promise<GroupPromotion[]> {
    try {
      let query = supabase
        .rpc('get_promotions');
      
      if (userId) {
        query = supabase.rpc('get_user_promotions', { user_id_param: userId });
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Get promotions error:', error);
        return [];
      }
      
      // Convert to GroupPromotion type
      return data.map(promo => ({
        id: promo.id,
        groupId: promo.group_id,
        userId: promo.user_id,
        planId: promo.plan_id,
        startDate: new Date(promo.start_date),
        endDate: new Date(promo.end_date),
        status: promo.status as any,
        paymentId: promo.payment_id || undefined,
        amount: promo.amount,
        currency: promo.currency
      }));
    } catch (error) {
      console.error('Get promotions error:', error);
      return [];
    }
  },
  
  async addPromotion(promotion: GroupPromotion): Promise<GroupPromotion | null> {
    try {
      const { data, error } = await supabase
        .rpc('add_promotion', {
          group_id_param: promotion.groupId,
          user_id_param: promotion.userId,
          plan_id_param: promotion.planId,
          start_date_param: promotion.startDate.toISOString(),
          end_date_param: promotion.endDate.toISOString(),
          status_param: promotion.status,
          payment_id_param: promotion.paymentId || null,
          amount_param: promotion.amount,
          currency_param: promotion.currency
        });
      
      if (error) {
        console.error('Add promotion error:', error);
        return null;
      }
      
      // Convert to GroupPromotion type
      return {
        id: data.id,
        groupId: data.group_id,
        userId: data.user_id,
        planId: data.plan_id,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        status: data.status as any,
        paymentId: data.payment_id || undefined,
        amount: data.amount,
        currency: data.currency
      };
    } catch (error) {
      console.error('Add promotion error:', error);
      return null;
    }
  },
  
  async updatePromotionStatus(promotionId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .rpc('update_promotion_status', {
          promotion_id_param: promotionId,
          status_param: status
        });
      
      if (error) {
        console.error('Update promotion status error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Update promotion status error:', error);
      return false;
    }
  },
  
  async checkExpiredPromotions(): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('check_expired_promotions');
      
      if (error) {
        console.error('Check expired promotions error:', error);
      }
    } catch (error) {
      console.error('Check expired promotions error:', error);
    }
  },
  
  async isGroupPromoted(groupId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_group_promoted', { 
        group_id_param: groupId 
      });
      
      if (error) {
        console.error('Check group promotion error:', error);
        return false;
      }
      
      return data.length > 0;
    } catch (error) {
      console.error('Check group promotion error:', error);
      return false;
    }
  }
};

// Page Services
export const pageService = {
  async getPages(): Promise<Page[]> {
    try {
      const { data, error } = await supabase
        .from('pages') 
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Get pages error:', error);
        return [];
      }
      
      // Convert to Page type
      return data.map(page => ({
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content,
        excerpt: page.excerpt || undefined,
        status: page.status,
        author: page.author,
        createdAt: new Date(page.created_at),
        updatedAt: new Date(page.updated_at),
        publishedAt: page.published_at ? new Date(page.published_at) : undefined,
        featuredImage: page.featured_image || undefined,
        seo: page.seo,
        template: page.template || undefined
      }));
    } catch (error) {
      console.error('Get pages error:', error);
      return [];
    }
  },
  
  async getPublishedPages(): Promise<Page[]> {
    try {
      const { data, error } = await supabase
        .from('pages') 
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Get published pages error:', error);
        return [];
      }
      
      // Convert to Page type
      return data.map(page => ({
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content,
        excerpt: page.excerpt || undefined,
        status: page.status,
        author: page.author,
        createdAt: new Date(page.created_at),
        updatedAt: new Date(page.updated_at),
        publishedAt: page.published_at ? new Date(page.published_at) : undefined,
        featuredImage: page.featured_image || undefined,
        seo: page.seo,
        template: page.template || undefined
      }));
    } catch (error) {
      console.error('Get published pages error:', error);
      return [];
    }
  },
  
  async getPageBySlug(slug: string): Promise<Page | null> {
    try {
      const { data, error } = await supabase
        .from('pages') 
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) {
        console.error('Get page by slug error:', error);
        return null;
      }
      
      // Convert to Page type
      return {
        id: data.id,
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || undefined,
        status: data.status,
        author: data.author,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        publishedAt: data.published_at ? new Date(data.published_at) : undefined,
        featuredImage: data.featured_image || undefined,
        seo: data.seo,
        template: data.template || undefined
      };
    } catch (error) {
      console.error('Get page by slug error:', error);
      return null;
    }
  },
  
  async addPage(page: Page): Promise<Page | null> {
    try {
      const { data, error } = await supabase
        .from('pages') 
        .insert({
          title: page.title,
          slug: page.slug,
          content: page.content,
          excerpt: page.excerpt || null,
          status: page.status,
          author: page.author,
          published_at: page.status === 'published' ? new Date().toISOString() : null,
          featured_image: page.featuredImage || null,
          seo: page.seo,
          template: page.template || null
        })
        .select()
        .single();
      
      if (error) {
        console.error('Add page error:', error);
        return null;
      }
      
      // Convert to Page type
      return {
        id: data.id,
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || undefined,
        status: data.status,
        author: data.author,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        publishedAt: data.published_at ? new Date(data.published_at) : undefined,
        featuredImage: data.featured_image || undefined,
        seo: data.seo,
        template: data.template || undefined
      };
    } catch (error) {
      console.error('Add page error:', error);
      return null;
    }
  },
  
  async updatePage(page: Page): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pages') 
        .update({
          title: page.title,
          slug: page.slug,
          content: page.content,
          excerpt: page.excerpt || null,
          status: page.status,
          author: page.author,
          published_at: page.status === 'published' ? (page.publishedAt || new Date()).toISOString() : null,
          featured_image: page.featuredImage || null,
          seo: page.seo,
          template: page.template || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', page.id);
      
      if (error) {
        console.error('Update page error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Update page error:', error);
      return false;
    }
  },
  
  async deletePage(pageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pages') 
        .delete()
        .eq('id', pageId);
      
      if (error) {
        console.error('Delete page error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Delete page error:', error);
      return false;
    }
  }
};

// Blog Services
export const blogService = {
  async getPosts(): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from('posts') 
        .select(`
          id,
          title,
          slug,
          content,
          excerpt,
          featured_image,
          status,
          author,
          author_id,
          category,
          tags,
          views,
          read_time,
          seo,
          created_at,
          updated_at,
          published_at
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Get posts error:', error);
        return [];
      }
      
      // Convert to BlogPost type
      return data.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt || undefined,
        featuredImage: post.featured_image || undefined,
        status: post.status as any,
        author: post.author,
        authorId: post.author_id,
        category: post.category,
        tags: post.tags || [],
        createdAt: new Date(post.created_at),
        updatedAt: new Date(post.updated_at),
        publishedAt: post.published_at ? new Date(post.published_at) : undefined,
        views: post.views,
        readTime: post.read_time,
        seo: post.seo
      }));
    } catch (error) {
      console.error('Get posts error:', error);
      return [];
    }
  },
  
  async getPublishedPosts(): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from('posts') 
        .select(`
          id,
          title,
          slug,
          content,
          excerpt,
          featured_image,
          status,
          author,
          author_id,
          category,
          tags,
          views,
          read_time,
          seo,
          created_at,
          updated_at,
          published_at
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Get published posts error:', error);
        return [];
      }
      
      // Convert to BlogPost type
      return data.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt || undefined,
        featuredImage: post.featured_image || undefined,
        status: post.status as any,
        author: post.author,
        authorId: post.author_id,
        category: post.category,
        tags: post.tags || [],
        createdAt: new Date(post.created_at),
        updatedAt: new Date(post.updated_at),
        publishedAt: post.published_at ? new Date(post.published_at) : undefined,
        views: post.views,
        readTime: post.read_time,
        seo: post.seo
      }));
    } catch (error) {
      console.error('Get published posts error:', error);
      return [];
    }
  },
  
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('posts') 
        .select(`
          id,
          title,
          slug,
          content,
          excerpt,
          featured_image,
          status,
          author,
          author_id,
          category,
          tags,
          views,
          read_time,
          seo,
          created_at,
          updated_at,
          published_at
        `)
        .eq('slug', slug)
        .single();
      
      if (error) {
        console.error('Get post by slug error:', error);
        return null;
      }
      
      // Increment view count
      const { error: updateError } = await supabase
        .from('posts') 
        .update({ views: data.views + 1 })
        .eq('id', data.id);
      
      if (updateError) {
        console.error('Update post views error:', updateError);
      }
      
      // Convert to BlogPost type
      return {
        id: data.id,
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || undefined,
        featuredImage: data.featured_image || undefined,
        status: data.status as any,
        author: data.author,
        authorId: data.author_id,
        category: data.category,
        tags: data.tags || [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        publishedAt: data.published_at ? new Date(data.published_at) : undefined,
        views: data.views + 1, // Increment locally too
        readTime: data.read_time,
        seo: data.seo
      };
    } catch (error) {
      console.error('Get post by slug error:', error);
      return null;
    }
  },
  
  async addPost(post: BlogPost): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('posts') 
        .insert({
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt || null,
          featured_image: post.featuredImage || null,
          status: post.status,
          author: post.author,
          author_id: post.authorId,
          category: post.category,
          tags: post.tags,
          published_at: post.status === 'published' ? new Date().toISOString() : null,
          views: 0,
          read_time: post.readTime,
          seo: post.seo
        })
        .select()
        .single();
      
      if (error) {
        console.error('Add post error:', error);
        return null;
      }
      
      // Convert to BlogPost type
      return {
        id: data.id,
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || undefined,
        featuredImage: data.featured_image || undefined,
        status: data.status as any,
        author: data.author,
        authorId: data.author_id,
        category: data.category,
        tags: data.tags || [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        publishedAt: data.published_at ? new Date(data.published_at) : undefined,
        views: data.views,
        readTime: data.read_time,
        seo: data.seo
      };
    } catch (error) {
      console.error('Add post error:', error);
      return null;
    }
  },
  
  async updatePost(post: BlogPost): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('posts') 
        .update({
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt || null,
          featured_image: post.featuredImage || null,
          status: post.status,
          author: post.author,
          author_id: post.authorId,
          category: post.category,
          tags: post.tags,
          published_at: post.status === 'published' ? (post.publishedAt || new Date()).toISOString() : null,
          read_time: post.readTime,
          seo: post.seo,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);
      
      if (error) {
        console.error('Update post error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Update post error:', error);
      return false;
    }
  },
  
  async deletePost(postId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('posts') 
        .delete()
        .eq('id', postId);
      
      if (error) {
        console.error('Delete post error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Delete post error:', error);
      return false;
    }
  }
};