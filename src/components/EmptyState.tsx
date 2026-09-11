import { Sparkles } from 'lucide-react';
export function EmptyState({ message }: { message: string }) { return <div className="empty-state"><Sparkles /><p>{message}</p></div>; }
