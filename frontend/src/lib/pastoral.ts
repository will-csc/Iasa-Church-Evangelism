import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type VisitStatus = 'pendente' | 'agendada' | 'realizada'

export type MemberRole =
  | 'Diácono'
  | 'Pastor'
  | 'Bispo'
  | 'Apóstolo'

export interface Member {
  id: string
  name: string
  role: MemberRole
  contact: string
  email?: string
  baptismDate?: string
}

export interface Visit {
  id: string
  name: string
  visitor: string
  address: string
  date: string
  notes: string
  status: VisitStatus
}

export interface Sermon {
  id: string
  theme: string
  preacher: string
  date: string
  baseVerse: string
  duration: number
  category: string
}

export const LOGIN_CREDENTIALS = {
  username: 'pastor',
  password: '123456',
}

export const memberRoles: MemberRole[] = [
  'Diácono',
  'Pastor',
  'Bispo',
  'Apóstolo',
]

export const visitStatuses: Array<VisitStatus | 'todas'> = [
  'todas',
  'pendente',
  'agendada',
  'realizada',
]

export const sermonCategories = ['Fé', 'Evangelismo', 'Discipulado', 'Esperança', 'Família']

export const roleToneMap: Record<MemberRole, string> = {
  'Diácono': 'bg-role-diacono text-primary-deep',
  Pastor: 'bg-accent text-primary-deep',
  Bispo: 'bg-role-presbitero text-primary-deep',
  'Apóstolo': 'bg-role-evangelista text-warning-foreground',
}

export function normalizeMemberRole(role: string): MemberRole {
  switch (role) {
    case 'Diácono':
    case 'Diaconisa':
      return 'Diácono'
    case 'Bispo':
      return 'Bispo'
    case 'Apóstolo':
      return 'Apóstolo'
    case 'Pastor':
    case 'Pastor Presidente':
      return 'Pastor'
    default:
      return 'Pastor'
  }
}

export const visitToneMap: Record<VisitStatus, string> = {
  realizada: 'border-success/30 bg-success/15 text-success-foreground',
  pendente: 'border-warning/30 bg-warning/15 text-warning-foreground',
  agendada: 'border-info/20 bg-info/10 text-primary-deep',
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatPhoneNumber(value: string) {
  return value.replace(/\D/g, '')
}

export function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    year: '2-digit',
  }).format(date)
}

export function getInitials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

const seedMembers: Member[] = [
  {
    id: 'm-1',
    name: 'Pr. João Batista',
    role: 'Pastor',
    contact: '(11) 99999-0001',
    email: 'joao@igreja.com',
    baptismDate: '2010-01-14',
  },
  {
    id: 'm-2',
    name: 'Dc. Ana Ferreira',
    role: 'Diácono',
    contact: '(11) 99999-0002',
    email: 'ana@igreja.com',
    baptismDate: '2015-06-19',
  },
  {
    id: 'm-3',
    name: 'Ob. Pedro Santos',
    role: 'Bispo',
    contact: '(11) 99999-0003',
    email: 'pedro@igreja.com',
    baptismDate: '2018-03-09',
  },
  {
    id: 'm-4',
    name: 'Ev. Marcos Ribeiro',
    role: 'Apóstolo',
    contact: '(11) 99999-0004',
    email: 'marcos@igreja.com',
    baptismDate: '2016-08-31',
  },
  {
    id: 'm-5',
    name: 'Dc. Lúcia Alves',
    role: 'Diácono',
    contact: '(11) 99999-0005',
    email: 'lucia@igreja.com',
    baptismDate: '2019-11-24',
  },
  {
    id: 'm-6',
    name: 'Pb. Ricardo Gomes',
    role: 'Pastor',
    contact: '(11) 99999-0006',
    email: 'ricardo@igreja.com',
    baptismDate: '2012-07-13',
  },
  {
    id: 'm-7',
    name: 'Ob. Carla Nascimento',
    role: 'Bispo',
    contact: '(11) 99999-0007',
    email: 'carla@igreja.com',
    baptismDate: '2020-02-07',
  },
  {
    id: 'm-8',
    name: 'Dc. Thiago Oliveira',
    role: 'Diácono',
    contact: '(11) 99999-0008',
    email: 'thiago@igreja.com',
    baptismDate: '2021-05-16',
  },
]

const seedVisits: Visit[] = [
  {
    id: 'v-1',
    name: 'Maria Silva',
    visitor: 'Pr. João Batista',
    address: 'Rua das Flores, 123',
    date: '2026-03-15',
    notes: 'Receptiva, pediu oração pela família.',
    status: 'realizada',
  },
  {
    id: 'v-2',
    name: 'Carlos Souza',
    visitor: 'Dc. Ana Ferreira',
    address: 'Av. Brasil, 456',
    date: '2026-03-14',
    notes: 'Aceitou convite para o culto de domingo.',
    status: 'realizada',
  },
  {
    id: 'v-3',
    name: 'Fernanda Oliveira',
    visitor: 'Equipe de Visitação',
    address: 'Rua São Paulo, 789',
    date: '2026-03-20',
    notes: 'Nova na vizinhança, indicada por membro.',
    status: 'agendada',
  },
  {
    id: 'v-4',
    name: 'Roberto Lima',
    visitor: 'Ob. Pedro Santos',
    address: 'Rua do Comércio, 55',
    date: '2026-03-18',
    notes: 'Precisa de acompanhamento após alta médica.',
    status: 'pendente',
  },
  {
    id: 'v-5',
    name: 'Juliana Costa',
    visitor: 'Ev. Marcos Ribeiro',
    address: 'Travessa Vitória, 88',
    date: '2026-02-27',
    notes: 'Pediu estudo bíblico para jovens.',
    status: 'realizada',
  },
  {
    id: 'v-6',
    name: 'Patrícia Mendes',
    visitor: 'Dc. Thiago Oliveira',
    address: 'Rua Esperança, 410',
    date: '2026-04-22',
    notes: 'Agendada com a família completa.',
    status: 'agendada',
  },
  {
    id: 'v-7',
    name: 'Renato Almeida',
    visitor: 'Ob. Carla Nascimento',
    address: 'Alameda Central, 902',
    date: '2026-04-19',
    notes: 'Contato recente, aguardando confirmação.',
    status: 'pendente',
  },
]

const seedSermons: Sermon[] = [
  {
    id: 's-1',
    theme: 'A Fé que Move Montanhas',
    preacher: 'Pr. João Batista',
    date: '2026-03-15',
    baseVerse: 'Hebreus 11:1-6',
    duration: 45,
    category: 'Fé',
  },
  {
    id: 's-2',
    theme: 'O Chamado para Evangelizar',
    preacher: 'Ev. Marcos Ribeiro',
    date: '2026-03-08',
    baseVerse: 'Mateus 28:18-20',
    duration: 35,
    category: 'Evangelismo',
  },
  {
    id: 's-3',
    theme: 'Servir com Amor',
    preacher: 'Dc. Ana Ferreira',
    date: '2026-02-15',
    baseVerse: 'Gálatas 5:13',
    duration: 32,
    category: 'Discipulado',
  },
  {
    id: 's-4',
    theme: 'Graça Suficiente',
    preacher: 'Pb. Ricardo Gomes',
    date: '2026-03-01',
    baseVerse: '2 Coríntios 12:9',
    duration: 40,
    category: 'Esperança',
  },
  {
    id: 's-5',
    theme: 'Lares Firmados na Palavra',
    preacher: 'Pr. João Batista',
    date: '2026-01-19',
    baseVerse: 'Josué 24:15',
    duration: 38,
    category: 'Família',
  },
  {
    id: 's-6',
    theme: 'Cristo em Nós, Esperança Viva',
    preacher: 'Ev. Marcos Ribeiro',
    date: '2025-12-10',
    baseVerse: 'Colossenses 1:27',
    duration: 34,
    category: 'Esperança',
  },
]

interface PastoralState {
  isAuthenticated: boolean
  userName: string
  members: Member[]
  visits: Visit[]
  sermons: Sermon[]
  login: (userName: string) => void
  logout: () => void
  addMember: (member: Member) => void
  updateMember: (member: Member) => void
  deleteMember: (memberId: string) => void
  addVisit: (visit: Visit) => void
  updateVisit: (visit: Visit) => void
  deleteVisit: (visitId: string) => void
  addSermon: (sermon: Sermon) => void
  updateSermon: (sermon: Sermon) => void
  deleteSermon: (sermonId: string) => void
}

export const usePastoralStore = create<PastoralState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userName: 'Pastor',
      members: seedMembers.map((member) => ({
        ...member,
        role: normalizeMemberRole(member.role),
      })),
      visits: seedVisits,
      sermons: seedSermons,
      login: (userName) => set({ isAuthenticated: true, userName }),
      logout: () => set({ isAuthenticated: false, userName: 'Pastor' }),
      addMember: (member) =>
        set((state) => ({
          members: [{ ...member, role: normalizeMemberRole(member.role) }, ...state.members],
        })),
      updateMember: (member) =>
        set((state) => ({
          members: state.members.map((item) =>
            item.id === member.id ? { ...member, role: normalizeMemberRole(member.role) } : item,
          ),
        })),
      deleteMember: (memberId) =>
        set((state) => ({ members: state.members.filter((item) => item.id !== memberId) })),
      addVisit: (visit) => set((state) => ({ visits: [visit, ...state.visits] })),
      updateVisit: (visit) =>
        set((state) => ({
          visits: state.visits.map((item) => (item.id === visit.id ? visit : item)),
        })),
      deleteVisit: (visitId) =>
        set((state) => ({ visits: state.visits.filter((item) => item.id !== visitId) })),
      addSermon: (sermon) => set((state) => ({ sermons: [sermon, ...state.sermons] })),
      updateSermon: (sermon) =>
        set((state) => ({
          sermons: state.sermons.map((item) => (item.id === sermon.id ? sermon : item)),
        })),
      deleteSermon: (sermonId) =>
        set((state) => ({ sermons: state.sermons.filter((item) => item.id !== sermonId) })),
    }),
    {
      name: 'painel-pastoral-store',
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const typedState = persistedState as Partial<PastoralState> | undefined

        return {
          ...currentState,
          ...typedState,
          members: (typedState?.members ?? currentState.members).map((member) => ({
            ...member,
            role: normalizeMemberRole(member.role),
          })),
        }
      },
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userName: state.userName,
        members: state.members,
        visits: state.visits,
        sermons: state.sermons,
      }),
    },
  ),
)
