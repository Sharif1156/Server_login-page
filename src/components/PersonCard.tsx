import { Github, Linkedin, Facebook, Mail, Phone } from 'lucide-react';
import { Avatar } from './ui';

export interface Person {
  id: number;
  name: string;
  position?: string;
  batch?: string;
  semester?: number;
  section?: string;
  email?: string;
  phone?: string;
  github?: string;
  linkedin?: string;
  facebook?: string;
  avatarColor?: string;
  panelYear?: string;
}

export function PersonCard({ person, subtitle }: { person: Person; subtitle?: string }) {
  const sub = subtitle || person.position || (person.batch ? `Batch ${person.batch} · Semester ${person.semester}` : '');
  return (
    <article className="person-card">
      <Avatar name={person.name} color={person.avatarColor || '#0d6efd'} size={64} />
      <h3>{person.name}</h3>
      {sub && <p className="person-role">{sub}</p>}
      <p className="person-meta">
        {person.section && <>Section {person.section}</>}
        {person.panelYear && <> · Panel {person.panelYear}</>}
      </p>
      <div className="person-links">
        {person.email && <a href={`mailto:${person.email}`} aria-label={`Email ${person.name}`} title={person.email}><Mail size={16} /></a>}
        {person.phone && <a href={`tel:${person.phone}`} aria-label={`Call ${person.name}`} title={person.phone}><Phone size={16} /></a>}
        {person.github && <a href={person.github} target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={16} /></a>}
        {person.linkedin && <a href={person.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={16} /></a>}
        {person.facebook && <a href={person.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={16} /></a>}
      </div>
    </article>
  );
}
