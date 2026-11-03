import type { Role } from './types';

export const DEMO_NOTICE =
  'Demo clone only. Use the sample accounts below — never enter real NUBCC passwords, payment details, or personal information.';

export const DEMO_ACCOUNTS: Array<{
  role: Role;
  label: string;
  identifierLabel: string;
  identifier: string;
  password: string;
  name: string;
}> = [
  {
    role: 'member',
    label: 'Member',
    identifierLabel: 'Student ID',
    identifier: 'NUB-2026-001',
    password: 'Member@123',
    name: 'Ayesha Rahman',
  },
  {
    role: 'cr',
    label: 'Class Representative',
    identifierLabel: 'Email',
    identifier: 'cr@demo.nubcc.test',
    password: 'Cr@12345',
    name: 'Tanvir Ahmed',
  },
  {
    role: 'executive',
    label: 'Executive',
    identifierLabel: 'Email',
    identifier: 'executive@demo.nubcc.test',
    password: 'Exec@12345',
    name: 'Nusrat Jahan',
  },
];

export const demoAccount = (role: Role) => DEMO_ACCOUNTS.find((a) => a.role === role)!;
