export interface UserGroup {
  id: string;
  userId: string;
  groupName: string;
  groupDescription: string;
  groupUsername: string;
  groupImage?: string;
  category: string;
  tags: string[];
  link: string;
  members: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
  reviewedBy?: string;
  submissionNote?: string;
}

export interface GroupSubmissionData {
  groupName: string;
  groupDescription: string;
  groupUsername: string;
  groupImage?: string;
  category: string;
  tags: string[];
  link: string;
  members: number;
  submissionNote?: string;
}