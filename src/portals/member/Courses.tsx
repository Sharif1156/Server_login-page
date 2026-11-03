import { useEffect, useState } from 'react';
import { BookOpen, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Badge, EmptyState, Loading, PageHeader } from '@/components/ui';
import { bdt } from '@/lib/format';
import type { Course } from '@shared/types';

export function Courses() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [progress, setProgress] = useState<Record<number, number>>({});
  const load = () => api<{ courses: Course[] }>('/api/portal/courses').then((d) => {
    setCourses(d.courses);
    setProgress(Object.fromEntries(d.courses.filter((c) => c.enrolled).map((c) => [c.id, c.progress || 0])));
  }).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const enroll = async (c: Course) => {
    setBusyId(c.id);
    try { const d = await api<{ courses: Course[] }>(`/api/portal/courses/${c.id}/enroll`, { method: 'POST' }); setCourses(d.courses); toast(`Enrolled in ${c.title}.`, 'success'); }
    catch (e: any) { toast(e.message, 'error'); }
    finally { setBusyId(null); }
  };
  const saveProgress = async (c: Course) => {
    setBusyId(c.id);
    try { const d = await api<{ courses: Course[] }>(`/api/portal/courses/${c.id}/progress`, { method: 'POST', body: JSON.stringify({ progress: progress[c.id] ?? 0 }) }); setCourses(d.courses); toast('Progress updated.', 'success'); }
    catch (e: any) { toast(e.message, 'error'); }
    finally { setBusyId(null); }
  };

  return (
    <>
      <PageHeader title="Courses & learning tracks" description="Enroll in demo courses and track your progress. No real payment is collected." />
      {loading ? <Loading /> : courses.length === 0 ? <EmptyState title="No courses available" icon={BookOpen} /> : (
        <div className="course-grid portal-course-grid">
          {courses.map((c) => (
            <div key={c.id} className="card course-card">
              <div className="course-track" style={{ background: c.color }}><BookOpen size={22} /></div>
              <div className="course-card-head"><Badge variant="info">{c.track}</Badge>{c.enrolled && <Badge variant="success"><CheckCircle2 size={12} /> Enrolled</Badge>}</div>
              <h3>{c.title}</h3>
              <p>{c.description}</p>
              <div className="course-meta"><span>{c.duration}</span><span>{c.lessons} lessons</span><span>{c.level}</span></div>
              {c.enrolled ? (
                <div className="course-progress">
                  <div className="progress-label"><span>Progress</span><strong>{progress[c.id] ?? c.progress ?? 0}%</strong></div>
                  <input type="range" min={0} max={100} value={progress[c.id] ?? c.progress ?? 0} onChange={(e) => setProgress((p) => ({ ...p, [c.id]: Number(e.target.value) }))} />
                  <button className="btn btn-outline btn-sm" onClick={() => saveProgress(c)} disabled={busyId === c.id}>{busyId === c.id ? <Loader2 size={14} className="spin" /> : null} Save progress</button>
                </div>
              ) : (
                <div className="course-enroll"><strong>{bdt(c.price)}</strong><button className="btn btn-primary btn-sm" onClick={() => enroll(c)} disabled={busyId === c.id}>{busyId === c.id ? <Loader2 size={14} className="spin" /> : null} Enroll (demo)</button></div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
