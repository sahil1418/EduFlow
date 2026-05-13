'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardBody, CardHeader, Stat } from '@/components/ui/Card';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api, session } from '@/lib/api';
import { Clock, Save, AlertTriangle, Send } from 'lucide-react';
import { FileUpload, type Attachment } from '@/components/ui/FileUpload';

type Detail = {
  id: string;
  dueAt: string;
  maxMarks: number | null;
  post: {
    title: string;
    body: string;
    author: { id: string; name: string; role: string };
    section: { id: string; name: string; class: { label: string } };
  };
};

type Row = {
  student: { id: string; name: string; rollNumber: string | null };
  submission: any | null;
  status: string;
  isLate: boolean;
};

export default function AssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  const me = session.user();
  const isStudent = me?.role === 'STUDENT';

  const [detail, setDetail] = useState<Detail | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [studentBody, setStudentBody] = useState('');
  const [studentFiles, setStudentFiles] = useState<Attachment[]>([]);
  const [gradeMap, setGradeMap] = useState<Record<string, { grade: string; feedback: string }>>({});
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const d = await api<Detail>(`/assignments/${id}`, {
        token: session.token(), subdomain: session.subdomain(),
      });
      setDetail(d);

      if (!isStudent) {
        const s = await api<{ rows: Row[] }>(`/assignments/${id}/submissions`, {
          token: session.token(), subdomain: session.subdomain(),
        });
        setRows(s.rows);
      }
    } catch (e: any) { setErr(e.message); }
  }
  useEffect(() => { load(); }, [id]);

  const stats = useMemo(() => {
    const total = rows.length;
    const submitted = rows.filter((r) => r.status !== 'PENDING').length;
    const graded = rows.filter((r) => r.status === 'GRADED').length;
    const late = rows.filter((r) => r.isLate).length;
    return { total, submitted, graded, late };
  }, [rows]);

  async function submitAsStudent() {
    setBusy(true);
    try {
      await api(`/assignments/${id}/submit`, {
        method: 'POST',
        token: session.token(),
        subdomain: session.subdomain(),
        body: JSON.stringify({ body: studentBody, attachments: studentFiles }),
      });
      alert('Submitted!');
      setStudentFiles([]);
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }

  async function gradeOne(submissionId: string) {
    const g = gradeMap[submissionId];
    if (!g?.grade) return;
    setBusy(true);
    try {
      await api(`/assignments/submissions/${submissionId}/grade`, {
        method: 'POST',
        token: session.token(),
        subdomain: session.subdomain(),
        body: JSON.stringify({ grade: Number(g.grade), feedback: g.feedback || undefined }),
      });
      await load();
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }

  if (!detail) return <><TopBar title="Assignment" /><div className="p-6 text-sm">{err ?? 'Loading…'}</div></>;

  const past = new Date() > new Date(detail.dueAt);

  return (
    <>
      <TopBar title={detail.post.title} />
      <div className="flex-1 p-6 space-y-5">
        {err && <Card className="p-4 text-sm text-[var(--color-danger)]">{err}</Card>}

        <Card>
          <CardBody>
            <p className="text-[var(--color-text)] whitespace-pre-wrap">{detail.post.body}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className={`ef-chip ${past ? 'ef-chip-danger' : 'ef-chip-brand'}`}>
                <Clock className="h-3 w-3" /> Due {new Date(detail.dueAt).toLocaleString()}
              </span>
              {detail.maxMarks != null && <span className="ef-chip">Max {detail.maxMarks}</span>}
              <span className="ef-chip">{detail.post.section.class.label} · Section {detail.post.section.name}</span>
              <span className="ef-chip">by {detail.post.author.name}</span>
            </div>
          </CardBody>
        </Card>

        {isStudent ? (
          <Card>
            <CardHeader title="Your submission" subtitle="Type your answer or upload a file (file upload coming soon)." />
            <CardBody>
              <textarea
                className="ef-input min-h-[8rem]"
                placeholder="Write your submission here…"
                value={studentBody}
                onChange={(e) => setStudentBody(e.target.value)}
              />
              <div className="mt-3">
                <FileUpload value={studentFiles} onChange={setStudentFiles} label="Files" />
              </div>
              <div className="mt-3 flex justify-end">
                <Button onClick={submitAsStudent} disabled={busy || (!studentBody.trim() && !studentFiles.length)}>
                  <Send className="h-4 w-4" /> {busy ? 'Sending…' : 'Submit'}
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : (
          <>
            <section className="grid sm:grid-cols-4 gap-4">
              <Stat label="Students" value={stats.total} />
              <Stat label="Submitted" value={stats.submitted} tone="info" />
              <Stat label="Graded" value={stats.graded} tone="success" />
              <Stat label="Late" value={stats.late} tone="warn" />
            </section>

            <Card>
              <CardHeader title="Submissions" subtitle="Review and grade each entry." />
              <CardBody className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-[var(--color-border)] text-xs uppercase tracking-wider text-[var(--color-text-subtle)]">
                      <th className="px-5 py-3 w-14">Roll</th>
                      <th className="px-5 py-3">Student</th>
                      <th className="px-5 py-3">Submission</th>
                      <th className="px-5 py-3 w-28">Status</th>
                      <th className="px-5 py-3 w-28">Grade</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const sub = r.submission;
                      const gm = gradeMap[sub?.id] ?? { grade: sub?.grade ?? '', feedback: sub?.feedback ?? '' };
                      return (
                        <tr key={r.student.id} className="border-b last:border-0 border-[var(--color-border)] align-top">
                          <td className="px-5 py-3 text-[var(--color-text-muted)]">{r.student.rollNumber || '—'}</td>
                          <td className="px-5 py-3 font-medium">{r.student.name}</td>
                          <td className="px-5 py-3 max-w-md">
                            {sub ? (
                              <details>
                                <summary className="cursor-pointer text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                                  {(sub.body ?? '').slice(0, 80) || '(file only)'}
                                </summary>
                                <p className="mt-2 text-sm whitespace-pre-wrap">{sub.body}</p>
                              </details>
                            ) : (
                              <span className="text-[var(--color-text-subtle)]">No submission</span>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <StatusChip status={r.status} late={r.isLate} />
                          </td>
                          <td className="px-5 py-3">
                            {sub && (
                              <input
                                type="number"
                                className="ef-input w-20 tabular-nums"
                                value={gm.grade}
                                onChange={(e) => setGradeMap((m) => ({ ...m, [sub.id]: { ...gm, grade: e.target.value } }))}
                              />
                            )}
                          </td>
                          <td className="px-5 py-3">
                            {sub && (
                              <div className="flex items-center gap-2">
                                <input
                                  className="ef-input"
                                  placeholder="Feedback"
                                  value={gm.feedback}
                                  onChange={(e) => setGradeMap((m) => ({ ...m, [sub.id]: { ...gm, feedback: e.target.value } }))}
                                />
                                <Button variant="outline" onClick={() => gradeOne(sub.id)} disabled={busy}>
                                  <Save className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {rows.length === 0 && (
                      <tr><td colSpan={6} className="px-5 py-10 text-center text-[var(--color-text-muted)]">No students in this section.</td></tr>
                    )}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </>
  );
}

function StatusChip({ status, late }: { status: string; late: boolean }) {
  if (status === 'GRADED') return <span className="ef-chip ef-chip-success">Graded</span>;
  if (status === 'SUBMITTED') return (
    <span className={`ef-chip ${late ? 'ef-chip-warn' : 'ef-chip-info'}`}>
      {late && <AlertTriangle className="h-3 w-3" />} {late ? 'Late' : 'Submitted'}
    </span>
  );
  return <span className="ef-chip">Pending</span>;
}
