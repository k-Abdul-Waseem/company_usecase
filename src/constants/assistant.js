import { Bot, FileText, LayoutDashboard, ShieldCheck } from 'lucide-react';

/** Capability cards shown on the assistant empty state. */
export const ASSISTANT_CAPABILITIES = [
  {
    id: 'grounded',
    icon: ShieldCheck,
    title: 'Approved content only',
    description: 'Answers are retrieved from content your manager has published to this project.',
  },
  {
    id: 'sources',
    icon: FileText,
    title: 'Every answer cites a source',
    description: 'Open the source panel to see the exact module or document behind each answer.',
  },
  {
    id: 'followups',
    icon: Bot,
    title: 'Follow-up in plain language',
    description: 'Ask for a simpler explanation, an example, or a summary of any module.',
  },
  {
    id: 'scoped',
    icon: LayoutDashboard,
    title: 'Scoped to your role',
    description: 'Retrieval is filtered by your project and learning role before the answer is written.',
  },
];

/** Labels for the source panel type filter. */
export const SOURCE_TYPE_LABELS = {
  module: 'Learning module',
  document: 'Document',
  faq: 'FAQ',
};
