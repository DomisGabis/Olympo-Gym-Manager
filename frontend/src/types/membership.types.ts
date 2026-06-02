export type MembershipStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELED';

export interface Membership {
  id: string;
  userId: string;
  type: string;
  startDate: Date;
  endDate: Date;
  status: MembershipStatus;
  createdAt: Date;
}