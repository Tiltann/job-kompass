import {
  ShieldCheck,
  HeartPulse,
  CalendarDays,
  Users,
  Briefcase,
  Brain,
  Target,
  Wallet,
  MessageCircle,
  Star,
  type LucideIcon,
} from 'lucide-vue-next'

// Maps the icon key used in questions.ts to a lucide component.
export const categoryIcons: Record<string, LucideIcon> = {
  confidence: ShieldCheck,
  health: HeartPulse,
  routine: CalendarDays,
  social: Users,
  work: Briefcase,
  stress: Brain,
  goals: Target,
  money: Wallet,
  open: MessageCircle,
  custom: Star,
}
