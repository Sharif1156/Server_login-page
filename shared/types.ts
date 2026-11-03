export type Role = 'member' | 'cr' | 'executive';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type EventType = 'workshop' | 'seminar' | 'contest' | 'meetup' | 'social' | 'other';

export interface User {
  id: number;
  role: Role;
  name: string;
  email: string;
  studentId: string;
  phone: string;
  batch: string;
  semester: number;
  section: string;
  bloodGroup: string;
  position: string;
  status: string;
  membershipId: string;
  joinedAt: string;
  skills: string;
  experience: string;
  address: string;
  facebook: string;
  linkedin: string;
  github: string;
  avatarColor: string;
}

export interface ClubEvent {
  id: number;
  title: string;
  type: EventType;
  description: string;
  eventDate: string;
  location: string;
  price: number;
  memberPrice: number;
  capacity: number;
  cover: string;
  status: 'upcoming' | 'past';
  registered: number;
  isRegistered?: boolean;
}

export interface Application {
  id: number;
  role: Role;
  name: string;
  studentId: string;
  email: string;
  phone: string;
  batch: string;
  semester: number;
  section: string;
  bloodGroup: string;
  position: string;
  panelYear: string;
  tenureStart: string;
  skills: string;
  experience: string;
  address: string;
  facebook: string;
  linkedin: string;
  github: string;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedAt: string | null;
  reviewNote: string;
}

export interface Announcement {
  id: number;
  title: string;
  body: string;
  audience: 'all' | Role;
  priority: 'normal' | 'important';
  createdAt: string;
  authorName: string;
}

export interface Classmate {
  id: number;
  crId: number;
  name: string;
  studentId: string;
  email: string;
  phone: string;
  section: string;
  attendance: number;
}

export interface Course {
  id: number;
  title: string;
  track: string;
  description: string;
  level: string;
  price: number;
  duration: string;
  lessons: number;
  color: string;
  progress?: number;
  enrolled?: boolean;
}

export interface Certificate {
  id: number;
  userId: number;
  title: string;
  issuedAt: string;
  code: string;
}

export interface Activity {
  id: number;
  action: string;
  createdAt: string;
}

export interface PublicStats {
  members: number;
  executives: number;
  crs: number;
  courses: number;
  upcomingEvents: number;
}
