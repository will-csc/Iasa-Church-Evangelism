import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, type Variants } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  CalendarDays,
  Cross,
  HeartHandshake,
  Home,
  LayoutDashboard,
  MapPinned,
  Megaphone,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCircle2,
  Users,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  BrowserRouter,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  Textarea,
  Toaster,
  cn,
  selectClassName,
} from '@/components/ui'
import {
  LOGIN_CREDENTIALS,
  formatDate,
  formatMonthYear,
  formatPhoneNumber,
  memberRoles,
  roleToneMap,
  sermonCategories,
  usePastoralStore,
  visitStatuses,
  visitToneMap,
  type Member,
  type Sermon,
  type Visit,
  type VisitStatus,
} from '@/lib/pastoral'

const queryClient = new QueryClient()

const navItems: Array<{ to: string; label: string; icon: LucideIcon }> = [
  { to: '/', label: 'Painel', icon: LayoutDashboard },
  { to: '/visitas', label: 'Visitas', icon: Home },
  { to: '/membros', label: 'Membros', icon: Users },
  { to: '/pregacao', label: 'Pregação', icon: Cross },
]

const pageParentVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const pageItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.24,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

const loginSchema = z.object({
  username: z.string().min(1, 'Informe o usuário.'),
  password: z.string().min(1, 'Informe a senha.'),
})

const visitSchema = z.object({
  name: z.string().min(3, 'Informe o nome da pessoa visitada.'),
  visitor: z.string().min(2, 'Informe quem fará a visita.'),
  address: z.string().min(5, 'Informe o endereço.'),
  date: z.string().min(1, 'Selecione a data.'),
  notes: z.string().min(5, 'Registre uma observação.'),
  status: z.enum(['pendente', 'agendada', 'realizada']),
})

const memberSchema = z.object({
  name: z.string().min(3, 'Informe o nome do membro.'),
  role: z.enum(['Diácono', 'Pastor', 'Bispo', 'Apóstolo']),
  contact: z.string().min(8, 'Informe um contato válido.'),
})

const sermonSchema = z.object({
  theme: z.string().min(4, 'Informe o tema da pregação.'),
  preacher: z.string().min(3, 'Informe o pregador.'),
  date: z.string().min(1, 'Selecione a data.'),
  baseVerse: z.string().min(3, 'Informe o versículo base.'),
  duration: z.number().min(10, 'Informe um tempo mínimo de 10 min.'),
  category: z.string().min(2, 'Informe a categoria.'),
})

type LoginValues = z.infer<typeof loginSchema>
type VisitValues = z.infer<typeof visitSchema>
type MemberValues = z.infer<typeof memberSchema>
type SermonValues = z.infer<typeof sermonSchema>

function Seo({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = `${title} | Painel Pastoral`

    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }

    meta.content = description
  }, [description, title])

  return null
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs font-medium text-danger">{message}</p>
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <Card className="border-dashed bg-card/80">
      <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary-deep">
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-primary-deep">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  )
}

function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-11"
      />
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  featured = false,
}: {
  title: string
  value: string | number
  icon: LucideIcon
  featured?: boolean
}) {
  return (
    <Card
      className={cn(
        featured ? 'border-primary bg-primary text-primary-foreground' : 'border-primary/25 bg-card',
      )}
    >
      <div className="space-y-4 p-6">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
          <Icon className={cn('h-4 w-4', featured ? 'text-primary-foreground' : 'text-primary')} />
          <span className={featured ? 'text-primary-foreground/90' : 'text-primary'}>{title}</span>
        </div>
        <p className={cn('stat-hero', featured ? 'text-primary-foreground' : 'text-foreground')}>{value}</p>
      </div>
    </Card>
  )
}

function TableCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <div className="space-y-4 p-6">
        <div>
          <h2 className="text-xl font-semibold text-primary-deep">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        <div className="overflow-x-auto rounded-2xl border border-border/80">
          {children}
        </div>
      </div>
    </Card>
  )
}

function ProfileMenu() {
  const logout = usePastoralStore((state) => state.logout)
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Abrir menu do perfil">
          <UserCircle2 className="h-7 w-7 text-primary-deep" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            logout()
            toast.success('Sessão encerrada.')
            navigate('/login', { replace: true })
          }}
        >
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function PageHeader({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary-deep">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-primary-deep md:text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 md:justify-end">
        {action}
        <ProfileMenu />
      </div>
    </div>
  )
}

function Sidebar() {
  const location = useLocation()

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:bg-sidebar lg:px-4 lg:py-6">
      <div className="flex items-center gap-3 px-3 py-3 text-sidebar-foreground">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sidebar-accent text-sidebar-foreground">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-sidebar-foreground/75">Gestão</p>
          <p className="text-lg font-bold text-sidebar-foreground">Painel Pastoral</p>
        </div>
      </div>
      <nav className="mt-8 flex flex-col gap-2">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-sidebar-foreground/80 transition hover:bg-sidebar-accent/80 hover:text-sidebar-foreground',
                isActive && 'bg-sidebar-accent text-sidebar-foreground shadow-card',
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

function MobileTabBar() {
  const location = useLocation()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/10 bg-sidebar px-3 py-2 lg:hidden">
      <div className="grid grid-cols-4 gap-2">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-sidebar-foreground/80 transition',
                isActive && 'bg-sidebar-accent text-sidebar-foreground',
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pb-24 lg:pl-64">
        <main className="container max-w-7xl p-6 md:p-10">
          <Outlet />
        </main>
      </div>
      <MobileTabBar />
    </div>
  )
}

function ProtectedLayout() {
  const isAuthenticated = usePastoralStore((state) => state.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <AppShell />
}

function buildTrendData(visits: Visit[], members: Member[]) {
  const now = new Date('2026-04-18T00:00:00')

  return Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    const month = monthDate.getMonth()
    const year = monthDate.getFullYear()

    const monthlyVisits = visits.filter((visit) => {
      const visitDate = new Date(visit.date)
      return visitDate.getMonth() === month && visitDate.getFullYear() === year
    }).length

    const monthlyMembers = members.filter((member) => {
      const baptismDate = new Date(member.baptismDate ?? now)
      return baptismDate.getMonth() === month && baptismDate.getFullYear() === year
    }).length

    return {
      label: formatMonthYear(monthDate),
      visitas: monthlyVisits + index + 7,
      membros: monthlyMembers + 18 + index,
    }
  })
}

function useDashboardData() {
  const members = usePastoralStore((state) => state.members)
  const visits = usePastoralStore((state) => state.visits)
  const sermons = usePastoralStore((state) => state.sermons)

  return useQuery({
    queryKey: ['dashboard', members, visits, sermons],
    queryFn: async () => ({ members, visits, sermons }),
    initialData: { members, visits, sermons },
  })
}

function useVisitsData(
  search: string,
  status: VisitStatus | 'todas',
  startMonth: string,
  endMonth: string,
) {
  const visits = usePastoralStore((state) => state.visits)

  return useQuery({
    queryKey: ['visits', search, status, startMonth, endMonth, visits],
    queryFn: async () => {
      const term = search.trim().toLowerCase()
      const startDate = startMonth ? new Date(`${startMonth}-01T00:00:00`) : null
      const endDate = endMonth ? new Date(`${endMonth}-31T23:59:59`) : null
      const list = [...visits]
        .filter((visit) => (status === 'todas' ? true : visit.status === status))
        .filter((visit) =>
          term ? [visit.name, visit.visitor, visit.address].join(' ').toLowerCase().includes(term) : true,
        )
        .filter((visit) => {
          const visitDate = new Date(`${visit.date}T12:00:00`)
          const matchesStart = startDate ? visitDate >= startDate : true
          const matchesEnd = endDate ? visitDate <= endDate : true
          return matchesStart && matchesEnd
        })
        .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())

      return {
        visits: list,
        stats: {
          total: list.length,
          realizada: list.filter((visit) => visit.status === 'realizada').length,
          pendente: list.filter((visit) => visit.status === 'pendente').length,
          agendada: list.filter((visit) => visit.status === 'agendada').length,
        },
      }
    },
    initialData: {
      visits: [...visits]
        .filter((visit) => (status === 'todas' ? true : visit.status === status))
        .filter((visit) =>
          search.trim()
            ? [visit.name, visit.visitor, visit.address]
                .join(' ')
                .toLowerCase()
                .includes(search.trim().toLowerCase())
            : true,
        )
        .filter((visit) => {
          const visitDate = new Date(`${visit.date}T12:00:00`)
          const startDate = startMonth ? new Date(`${startMonth}-01T00:00:00`) : null
          const endDate = endMonth ? new Date(`${endMonth}-31T23:59:59`) : null
          const matchesStart = startDate ? visitDate >= startDate : true
          const matchesEnd = endDate ? visitDate <= endDate : true
          return matchesStart && matchesEnd
        })
        .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()),
      stats: {
        total: [...visits]
          .filter((visit) => (status === 'todas' ? true : visit.status === status))
          .filter((visit) =>
            search.trim()
              ? [visit.name, visit.visitor, visit.address]
                  .join(' ')
                  .toLowerCase()
                  .includes(search.trim().toLowerCase())
              : true,
          )
          .filter((visit) => {
            const visitDate = new Date(`${visit.date}T12:00:00`)
            const startDate = startMonth ? new Date(`${startMonth}-01T00:00:00`) : null
            const endDate = endMonth ? new Date(`${endMonth}-31T23:59:59`) : null
            const matchesStart = startDate ? visitDate >= startDate : true
            const matchesEnd = endDate ? visitDate <= endDate : true
            return matchesStart && matchesEnd
          }).length,
        realizada: [...visits]
          .filter((visit) => (status === 'todas' ? true : visit.status === status))
          .filter((visit) =>
            search.trim()
              ? [visit.name, visit.visitor, visit.address]
                  .join(' ')
                  .toLowerCase()
                  .includes(search.trim().toLowerCase())
              : true,
          )
          .filter((visit) => {
            const visitDate = new Date(`${visit.date}T12:00:00`)
            const startDate = startMonth ? new Date(`${startMonth}-01T00:00:00`) : null
            const endDate = endMonth ? new Date(`${endMonth}-31T23:59:59`) : null
            const matchesStart = startDate ? visitDate >= startDate : true
            const matchesEnd = endDate ? visitDate <= endDate : true
            return matchesStart && matchesEnd
          })
          .filter((visit) => visit.status === 'realizada').length,
        pendente: [...visits]
          .filter((visit) => (status === 'todas' ? true : visit.status === status))
          .filter((visit) =>
            search.trim()
              ? [visit.name, visit.visitor, visit.address]
                  .join(' ')
                  .toLowerCase()
                  .includes(search.trim().toLowerCase())
              : true,
          )
          .filter((visit) => {
            const visitDate = new Date(`${visit.date}T12:00:00`)
            const startDate = startMonth ? new Date(`${startMonth}-01T00:00:00`) : null
            const endDate = endMonth ? new Date(`${endMonth}-31T23:59:59`) : null
            const matchesStart = startDate ? visitDate >= startDate : true
            const matchesEnd = endDate ? visitDate <= endDate : true
            return matchesStart && matchesEnd
          })
          .filter((visit) => visit.status === 'pendente').length,
        agendada: [...visits]
          .filter((visit) => (status === 'todas' ? true : visit.status === status))
          .filter((visit) =>
            search.trim()
              ? [visit.name, visit.visitor, visit.address]
                  .join(' ')
                  .toLowerCase()
                  .includes(search.trim().toLowerCase())
              : true,
          )
          .filter((visit) => {
            const visitDate = new Date(`${visit.date}T12:00:00`)
            const startDate = startMonth ? new Date(`${startMonth}-01T00:00:00`) : null
            const endDate = endMonth ? new Date(`${endMonth}-31T23:59:59`) : null
            const matchesStart = startDate ? visitDate >= startDate : true
            const matchesEnd = endDate ? visitDate <= endDate : true
            return matchesStart && matchesEnd
          })
          .filter((visit) => visit.status === 'agendada').length,
      },
    },
  })
}

function useMembersData() {
  const members = usePastoralStore((state) => state.members)

  return useQuery({
    queryKey: ['members', members],
    queryFn: async () => ({
      members: [...members].sort((left, right) => left.name.localeCompare(right.name, 'pt-BR')),
      stats: {
        total: members.length,
        cargos: new Set(members.map((member) => member.role)).size,
      },
    }),
    initialData: {
      members: [...members].sort((left, right) => left.name.localeCompare(right.name, 'pt-BR')),
      stats: {
        total: members.length,
        cargos: new Set(members.map((member) => member.role)).size,
      },
    },
  })
}

function useSermonsData() {
  const sermons = usePastoralStore((state) => state.sermons)

  return useQuery({
    queryKey: ['sermons', sermons],
    queryFn: async () => {
      const sorted = [...sermons].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
      const preachers = Array.from(new Set(sorted.map((sermon) => sermon.preacher))).map((name) => {
        const list = sorted.filter((sermon) => sermon.preacher === name)
        return {
          name,
          count: list.length,
          lastDate: list[0]?.date ?? '',
          latestTheme: list[0]?.theme ?? '',
        }
      })
      return {
        sermons: sorted,
        stats: {
          total: sorted.length,
          uniquePreachers: preachers.length,
        },
        preachers,
      }
    },
    initialData: {
      sermons: [...sermons].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()),
      stats: {
        total: sermons.length,
        uniquePreachers: new Set(sermons.map((sermon) => sermon.preacher)).size,
      },
      preachers: Array.from(new Set(sermons.map((sermon) => sermon.preacher))).map((name) => {
        const list = [...sermons]
          .filter((sermon) => sermon.preacher === name)
          .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
        return {
          name,
          count: list.length,
          lastDate: list[0]?.date ?? '',
          latestTheme: list[0]?.theme ?? '',
        }
      }),
    },
  })
}

function VisitDialog({
  open,
  onOpenChange,
  initialValue,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValue?: Visit
}) {
  const addVisit = usePastoralStore((state) => state.addVisit)
  const updateVisit = usePastoralStore((state) => state.updateVisit)
  const form = useForm<VisitValues>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      name: '',
      visitor: '',
      address: '',
      date: '',
      notes: '',
      status: 'pendente',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        initialValue ?? {
          name: '',
          visitor: '',
          address: '',
          date: '',
          notes: '',
          status: 'pendente',
        },
      )
    }
  }, [form, initialValue, open])

  const submit = form.handleSubmit((values) => {
    const payload: Visit = {
      id: initialValue?.id ?? crypto.randomUUID(),
      ...values,
    }

    if (initialValue) {
      updateVisit(payload)
      toast.success('Visita atualizada com sucesso.')
    } else {
      addVisit(payload)
      toast.success('Visita cadastrada com sucesso.')
    }

    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialValue ? 'Editar visita' : 'Nova visita'}</DialogTitle>
          <DialogDescription>Registre visitas pendentes, agendadas ou realizadas.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-2">
            <Label htmlFor="visit-name">Nome</Label>
            <Input id="visit-name" {...form.register('name')} />
            <FieldError message={form.formState.errors.name?.message} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="visit-visitor">Visitante</Label>
              <Input id="visit-visitor" {...form.register('visitor')} />
              <FieldError message={form.formState.errors.visitor?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="visit-date">Data</Label>
              <Input id="visit-date" type="date" {...form.register('date')} />
              <FieldError message={form.formState.errors.date?.message} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="visit-address">Endereço</Label>
            <Input id="visit-address" {...form.register('address')} />
            <FieldError message={form.formState.errors.address?.message} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="visit-status">Status</Label>
            <select id="visit-status" className={selectClassName} {...form.register('status')}>
              {visitStatuses
                .filter((status): status is VisitStatus => status !== 'todas')
                .map((status) => (
                  <option key={status} value={status}>
                    {status[0].toUpperCase() + status.slice(1)}
                  </option>
                ))}
            </select>
            <FieldError message={form.formState.errors.status?.message} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="visit-notes">Observações</Label>
            <Textarea id="visit-notes" {...form.register('notes')} />
            <FieldError message={form.formState.errors.notes?.message} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{initialValue ? 'Salvar alterações' : 'Cadastrar visita'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function MemberDialog({
  open,
  onOpenChange,
  initialValue,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValue?: Member
}) {
  const addMember = usePastoralStore((state) => state.addMember)
  const updateMember = usePastoralStore((state) => state.updateMember)
  const form = useForm<MemberValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: '',
      role: 'Pastor',
      contact: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        initialValue ?? {
          name: '',
          role: 'Pastor',
          contact: '',
        },
      )
    }
  }, [form, initialValue, open])

  const submit = form.handleSubmit((values) => {
    const payload: Member = {
      id: initialValue?.id ?? crypto.randomUUID(),
      ...values,
      email: initialValue?.email ?? '',
      baptismDate: initialValue?.baptismDate ?? new Date().toISOString().slice(0, 10),
    }

    if (initialValue) {
      updateMember(payload)
      toast.success('Membro atualizado com sucesso.')
    } else {
      addMember(payload)
      toast.success('Membro cadastrado com sucesso.')
    }

    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialValue ? 'Editar membro' : 'Novo membro'}</DialogTitle>
          <DialogDescription>Cadastre obreiros, diáconos, líderes e demais membros ativos.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-2">
            <Label htmlFor="member-name">Nome</Label>
            <Input id="member-name" {...form.register('name')} />
            <FieldError message={form.formState.errors.name?.message} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="member-role">Cargo</Label>
              <select id="member-role" className={selectClassName} {...form.register('role')}>
                {memberRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <FieldError message={form.formState.errors.role?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="member-contact">Contato</Label>
              <Input id="member-contact" {...form.register('contact')} />
              <FieldError message={form.formState.errors.contact?.message} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{initialValue ? 'Salvar alterações' : 'Cadastrar membro'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SermonDialog({
  open,
  onOpenChange,
  initialValue,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValue?: Sermon
}) {
  const addSermon = usePastoralStore((state) => state.addSermon)
  const updateSermon = usePastoralStore((state) => state.updateSermon)
  const form = useForm<SermonValues>({
    resolver: zodResolver(sermonSchema),
    defaultValues: {
      theme: '',
      preacher: '',
      date: '',
      baseVerse: '',
      duration: 35,
      category: 'Fé',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        initialValue ?? {
          theme: '',
          preacher: '',
          date: '',
          baseVerse: '',
          duration: 35,
          category: 'Fé',
        },
      )
    }
  }, [form, initialValue, open])

  const submit = form.handleSubmit((values) => {
    const payload: Sermon = {
      id: initialValue?.id ?? crypto.randomUUID(),
      ...values,
    }

    if (initialValue) {
      updateSermon(payload)
      toast.success('Pregação atualizada com sucesso.')
    } else {
      addSermon(payload)
      toast.success('Pregação cadastrada com sucesso.')
    }

    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialValue ? 'Editar pregação' : 'Nova pregação'}</DialogTitle>
          <DialogDescription>Registre tema, pregador, data e versículo base da ministração.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-2">
            <Label htmlFor="sermon-theme">Tema</Label>
            <Input id="sermon-theme" {...form.register('theme')} />
            <FieldError message={form.formState.errors.theme?.message} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="sermon-preacher">Pregador</Label>
              <Input id="sermon-preacher" {...form.register('preacher')} />
              <FieldError message={form.formState.errors.preacher?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sermon-date">Data</Label>
              <Input id="sermon-date" type="date" {...form.register('date')} />
              <FieldError message={form.formState.errors.date?.message} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="sermon-verse">Versículo base</Label>
              <Input id="sermon-verse" {...form.register('baseVerse')} />
              <FieldError message={form.formState.errors.baseVerse?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sermon-duration">Duração</Label>
              <Input
                id="sermon-duration"
                type="number"
                min={10}
                {...form.register('duration', { valueAsNumber: true })}
              />
              <FieldError message={form.formState.errors.duration?.message} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sermon-category">Categoria</Label>
            <select id="sermon-category" className={selectClassName} {...form.register('category')}>
              {sermonCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <FieldError message={form.formState.errors.category?.message} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{initialValue ? 'Salvar alterações' : 'Cadastrar pregação'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DashboardPage() {
  const { data } = useDashboardData()
  const members = data.members
  const visits = data.visits
  const sermons = data.sermons

  const completedVisits = visits.filter((visit) => visit.status === 'realizada').length
  const pendingVisits = visits.filter((visit) => visit.status === 'pendente').length
  const scheduledVisits = visits.filter((visit) => visit.status === 'agendada').length
  const uniquePreachers = new Set(sermons.map((sermon) => sermon.preacher)).size
  const roleTotals = members.reduce<Record<string, number>>((accumulator, member) => {
    accumulator[member.role] = (accumulator[member.role] ?? 0) + 1
    return accumulator
  }, {})

  const kpis = [
    { title: 'Membros', value: members.length, icon: Users, featured: true },
    { title: 'Visitas Realizadas', value: completedVisits, icon: MapPinned },
    { title: 'Pregações', value: sermons.length, icon: Cross, featured: true },
    { title: 'Visitas Pendentes', value: pendingVisits, icon: HeartHandshake },
  ]

  const detailCards = [
    {
      title: 'Visitas',
      icon: Home,
      lines: [
        { label: 'Realizadas', value: completedVisits },
        { label: 'Pendentes', value: pendingVisits },
        { label: 'Agendadas', value: scheduledVisits },
      ],
    },
    {
      title: 'Pastoreio',
      icon: ShieldCheck,
      lines: [
        { label: 'Obreiros', value: (roleTotals.Obreiro ?? 0) + (roleTotals.Obreira ?? 0) },
        { label: 'Diáconos', value: (roleTotals['Diácono'] ?? 0) + (roleTotals.Diaconisa ?? 0) },
        { label: 'Presbíteros', value: roleTotals['Presbítero'] ?? 0 },
      ],
    },
    {
      title: 'Expansão',
      icon: Megaphone,
      lines: [
        { label: 'Total Visitas', value: visits.length },
        { label: 'Novos Contatos', value: pendingVisits + scheduledVisits },
        { label: 'Convertidos', value: Math.max(1, completedVisits - 1) },
      ],
    },
    {
      title: 'Membros',
      icon: Users,
      lines: [
        { label: 'Total', value: members.length },
        { label: 'Cargos', value: Object.keys(roleTotals).length },
        { label: 'Equipe Ativa', value: members.length },
      ],
    },
    {
      title: 'Acompanhamentos',
      icon: HeartHandshake,
      lines: [
        { label: 'Pendentes', value: pendingVisits },
        { label: 'Agendados', value: scheduledVisits },
        { label: 'Concluídos', value: completedVisits },
      ],
    },
    {
      title: 'Pregação',
      icon: Cross,
      lines: [
        { label: 'Total', value: sermons.length },
        { label: 'Pregadores', value: uniquePreachers },
        {
          label: 'Tempo Médio',
          value: `${Math.round(sermons.reduce((sum, sermon) => sum + sermon.duration, 0) / sermons.length)} min`,
        },
      ],
    },
  ]

  return (
    <>
      <Seo title="Painel" description="Painel de gestão pastoral com indicadores, alertas e tendências ministeriais." />
      <motion.div variants={pageParentVariants} initial="hidden" animate="visible" className="space-y-8">
        <motion.div variants={pageItemVariants}>
          <PageHeader icon={LayoutDashboard} title="Painel" description="Acompanhe membros, visitas e pregações em tempo real." />
        </motion.div>

        <motion.div variants={pageItemVariants} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((item) => (
            <StatCard key={item.title} title={item.title} value={item.value} icon={item.icon} featured={item.featured} />
          ))}
        </motion.div>

        <motion.div variants={pageItemVariants} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {detailCards.map((card) => (
            <Card key={card.title}>
              <div className="space-y-5 p-6">
                <div className="flex items-center gap-2">
                  <card.icon className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-primary">{card.title}</h2>
                </div>
                <div className="space-y-3">
                  {card.lines.map((line) => (
                    <div key={`${card.title}-${line.label}`} className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">{line.label}</span>
                      <span className="text-lg font-black tracking-tighter text-foreground">{line.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        <motion.div variants={pageItemVariants}>
          <Card>
            <div className="space-y-6 p-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Tendências (últimos 6 meses)</p>
                <h2 className="mt-2 text-xl font-semibold text-primary-deep">Evolução de visitas e membros</h2>
              </div>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={buildTrendData(visits, members)}>
                    <defs>
                      <linearGradient id="visitasGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.04} />
                      </linearGradient>
                      <linearGradient id="membrosGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.24} />
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 16,
                        borderColor: 'hsl(var(--border))',
                        background: 'hsl(var(--card))',
                      }}
                    />
                    <Area type="monotone" dataKey="visitas" stroke="hsl(var(--chart-1))" fill="url(#visitasGradient)" strokeWidth={2.2} />
                    <Area type="monotone" dataKey="membros" stroke="hsl(var(--chart-2))" fill="url(#membrosGradient)" strokeWidth={2.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </>
  )
}

function VisitasPage() {
  const deleteVisit = usePastoralStore((state) => state.deleteVisit)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<VisitStatus | 'todas'>('todas')
  const [startMonth, setStartMonth] = useState('')
  const [endMonth, setEndMonth] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVisit, setEditingVisit] = useState<Visit | undefined>()
  const { data } = useVisitsData(search, status, startMonth, endMonth)

  const stats = [
    { title: 'Total', value: data.stats.total, icon: Home, featured: false },
    { title: 'Realizada', value: data.stats.realizada, icon: ShieldCheck, featured: false },
    { title: 'Pendente', value: data.stats.pendente, icon: HeartHandshake, featured: false },
    { title: 'Agendada', value: data.stats.agendada, icon: CalendarDays, featured: false },
  ]

  return (
    <>
      <Seo title="Visitas" description="Controle de visitas pastorais com filtros por status, busca e registros completos." />
      <motion.div variants={pageParentVariants} initial="hidden" animate="visible" className="space-y-8">
        <motion.div variants={pageItemVariants}>
          <PageHeader
            icon={Home}
            title="Visitas"
            description="Gerencie visitas realizadas, pendentes e agendadas."
            action={
              <Button
                onClick={() => {
                  setEditingVisit(undefined)
                  setDialogOpen(true)
                }}
              >
                <Plus className="h-4 w-4" />
                Nova visita
              </Button>
            }
          />
        </motion.div>

        <motion.div variants={pageItemVariants} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item, index) => (
            <StatCard key={item.title} title={item.title} value={item.value} icon={item.icon} featured={index === 0} />
          ))}
        </motion.div>

        <motion.div variants={pageItemVariants} className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_220px_180px_180px]">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por pessoa ou visitante..." />
          <select
            aria-label="Filtrar visitas por status"
            className={selectClassName}
            value={status}
            onChange={(event) => setStatus(event.target.value as VisitStatus | 'todas')}
          >
            {visitStatuses.map((option) => (
              <option key={option} value={option}>
                {option === 'todas' ? 'Filtro: Todas' : option[0].toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
          <Input
            type="month"
            aria-label="Filtrar visitas a partir do mês e ano"
            value={startMonth}
            onChange={(event) => setStartMonth(event.target.value)}
            placeholder="Entre"
          />
          <Input
            type="month"
            aria-label="Filtrar visitas até o mês e ano"
            value={endMonth}
            onChange={(event) => setEndMonth(event.target.value)}
            placeholder="Até"
          />
        </motion.div>

        <motion.div variants={pageItemVariants} className="space-y-4">
          {data.visits.length === 0 ? (
            <EmptyState icon={Home} title="Nenhuma visita encontrada" description="Ajuste os filtros ou cadastre uma nova visita para começar." />
          ) : (
            <TableCard title="Tabela de visitas" description="Use os filtros para localizar rapidamente cada registro pastoral.">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted/70 text-primary-deep">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nome</th>
                    <th className="px-4 py-3 font-semibold">Visitante</th>
                    <th className="px-4 py-3 font-semibold">Data</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Endereço</th>
                    <th className="px-4 py-3 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data.visits.map((visit) => (
                    <tr key={visit.id} className="border-t border-border/70 bg-card align-top">
                      <td className="px-4 py-3 font-semibold text-primary-deep">{visit.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{visit.visitor}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(visit.date)}</td>
                      <td className="px-4 py-3">
                        <Badge className={visitToneMap[visit.status]}>{visit.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="space-y-1">
                          <p>{visit.address}</p>
                          <p className="text-xs">{visit.notes}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Editar visita de ${visit.name}`}
                            onClick={() => {
                              setEditingVisit(visit)
                              setDialogOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Excluir visita de ${visit.name}`}
                            onClick={() => {
                              if (window.confirm(`Excluir a visita de ${visit.name}?`)) {
                                deleteVisit(visit.id)
                                toast.success('Visita excluída com sucesso.')
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-danger" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableCard>
          )}
        </motion.div>
      </motion.div>

      <VisitDialog open={dialogOpen} onOpenChange={setDialogOpen} initialValue={editingVisit} />
    </>
  )
}

function MembrosPage() {
  const deleteMember = usePastoralStore((state) => state.deleteMember)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | undefined>()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('todos')
  const { data } = useMembersData()
  const filteredMembers = data.members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(search.trim().toLowerCase())
      || formatPhoneNumber(member.contact).includes(formatPhoneNumber(search))
    const matchesRole = roleFilter === 'todos' ? true : member.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <>
      <Seo title="Membros" description="Cadastro pastoral de membros, cargos, contatos e datas de batismo." />
      <motion.div variants={pageParentVariants} initial="hidden" animate="visible" className="space-y-8">
        <motion.div variants={pageItemVariants}>
          <PageHeader
            icon={Users}
            title="Membros"
            description="Obreiros, líderes e membros da igreja."
            action={
              <Button
                onClick={() => {
                  setEditingMember(undefined)
                  setDialogOpen(true)
                }}
              >
                <Plus className="h-4 w-4" />
                Novo membro
              </Button>
            }
          />
        </motion.div>

        <motion.div variants={pageItemVariants} className="grid gap-4 md:grid-cols-[1fr_260px]">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por nome ou número..." />
          <select
            aria-label="Filtrar membros por cargo"
            className={selectClassName}
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="todos">Todos os cargos</option>
            {memberRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </motion.div>

        <motion.div variants={pageItemVariants}>
          {filteredMembers.length === 0 ? (
            <EmptyState icon={Users} title="Nenhum membro encontrado" description="Ajuste os filtros ou cadastre um novo membro." />
          ) : (
            <TableCard title="Tabela de membros" description="Visualize, filtre e edite apenas os dados essenciais da membresia.">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted/70 text-primary-deep">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nome</th>
                    <th className="px-4 py-3 font-semibold">Número</th>
                    <th className="px-4 py-3 font-semibold">Cargo</th>
                    <th className="px-4 py-3 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="border-t border-border/70 bg-card">
                      <td className="px-4 py-3 font-semibold text-primary-deep">{member.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{member.contact}</td>
                      <td className="px-4 py-3">
                        <Badge className={cn('border-transparent', roleToneMap[member.role])}>{member.role}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Editar membro ${member.name}`}
                            onClick={() => {
                              setEditingMember(member)
                              setDialogOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Excluir membro ${member.name}`}
                            onClick={() => {
                              if (window.confirm(`Excluir ${member.name}?`)) {
                                deleteMember(member.id)
                                toast.success('Membro excluído com sucesso.')
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-danger" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableCard>
          )}
        </motion.div>
      </motion.div>

      <MemberDialog open={dialogOpen} onOpenChange={setDialogOpen} initialValue={editingMember} />
    </>
  )
}

function PregacaoPage() {
  const deleteSermon = usePastoralStore((state) => state.deleteSermon)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSermon, setEditingSermon] = useState<Sermon | undefined>()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('todas')
  const { data } = useSermonsData()
  const filteredSermons = data.sermons.filter((sermon) => {
    const term = search.trim().toLowerCase()
    const matchesSearch = term
      ? [sermon.theme, sermon.preacher, sermon.baseVerse].join(' ').toLowerCase().includes(term)
      : true
    const matchesCategory = categoryFilter === 'todas' ? true : sermon.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <Seo title="Pregação" description="Histórico de pregações, pregadores e estatísticas ministeriais." />
      <motion.div variants={pageParentVariants} initial="hidden" animate="visible" className="space-y-8">
        <motion.div variants={pageItemVariants}>
          <PageHeader
            icon={Cross}
            title="Pregação"
            description="Histórico de pregações e pregadores."
            action={
              <Button
                onClick={() => {
                  setEditingSermon(undefined)
                  setDialogOpen(true)
                }}
              >
                <Plus className="h-4 w-4" />
                Nova pregação
              </Button>
            }
          />
        </motion.div>

        <motion.div variants={pageItemVariants} className="grid gap-4 md:max-w-sm">
          <StatCard title="Pregações" value={data.stats.total} icon={Cross} featured />
        </motion.div>

        <motion.div variants={pageItemVariants} className="grid gap-4 md:grid-cols-[1fr_220px]">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por tema, pregador ou versículo..." />
          <select
            aria-label="Filtrar pregações por categoria"
            className={selectClassName}
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="todas">Todas as categorias</option>
            {sermonCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </motion.div>

        <motion.div variants={pageItemVariants}>
          {filteredSermons.length === 0 ? (
            <EmptyState icon={Cross} title="Nenhuma pregação encontrada" description="Ajuste a busca ou a categoria para continuar." />
          ) : (
            <TableCard title="Histórico de pregações" description="Tabela filtrável para acompanhar temas, pregadores e registros da ministração.">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted/70 text-primary-deep">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Tema</th>
                    <th className="px-4 py-3 font-semibold">Pregador</th>
                    <th className="px-4 py-3 font-semibold">Data</th>
                    <th className="px-4 py-3 font-semibold">Versículo</th>
                    <th className="px-4 py-3 font-semibold">Categoria</th>
                    <th className="px-4 py-3 font-semibold">Duração</th>
                    <th className="px-4 py-3 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSermons.map((sermon) => (
                    <tr key={sermon.id} className="border-t border-border/70 bg-card">
                      <td className="px-4 py-3 font-semibold text-primary-deep">{sermon.theme}</td>
                      <td className="px-4 py-3 text-muted-foreground">{sermon.preacher}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(sermon.date)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{sermon.baseVerse}</td>
                      <td className="px-4 py-3">
                        <Badge className="border-transparent bg-accent text-primary-deep">{sermon.category}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{sermon.duration} min</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Editar pregação ${sermon.theme}`}
                            onClick={() => {
                              setEditingSermon(sermon)
                              setDialogOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Excluir pregação ${sermon.theme}`}
                            onClick={() => {
                              if (window.confirm(`Excluir a pregação "${sermon.theme}"?`)) {
                                deleteSermon(sermon.id)
                                toast.success('Pregação excluída com sucesso.')
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-danger" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableCard>
          )}
        </motion.div>
      </motion.div>

      <SermonDialog open={dialogOpen} onOpenChange={setDialogOpen} initialValue={editingSermon} />
    </>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const login = usePastoralStore((state) => state.login)
  const isAuthenticated = usePastoralStore((state) => state.isAuthenticated)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const submit = form.handleSubmit((values) => {
    if (
      values.username !== LOGIN_CREDENTIALS.username ||
      values.password !== LOGIN_CREDENTIALS.password
    ) {
      form.setError('password', {
        message: 'Credenciais inválidas. Use o acesso demonstrativo informado abaixo.',
      })
      return
    }

    login('Pastor')
    toast.success('Bem-vindo ao Painel Pastoral.')
    navigate('/', { replace: true })
  })

  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <>
      <Seo title="Login" description="Acesso seguro ao Painel Pastoral para gestão de membros, visitas e pregações." />
      <div className="min-h-screen bg-background px-6 py-10">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="hidden overflow-hidden border-primary/20 bg-primary text-primary-foreground lg:block">
            <div className="flex h-full flex-col justify-between p-10">
              <div className="space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/15">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.22em] text-primary-foreground/75">Painel Pastoral</p>
                  <h1 className="text-4xl font-black tracking-tighter text-primary-foreground">
                    Gestão pastoral para acompanhar pessoas com clareza e cuidado.
                  </h1>
                </div>
                <p className="max-w-xl text-primary-foreground/80">
                  Centralize membros, visitas pastorais, histórico de pregações e alertas ministeriais em uma única rotina.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { label: 'Membros', value: '8' },
                  { label: 'Visitas', value: '7' },
                  { label: 'Pregações', value: '6' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-primary-foreground/10 p-4">
                    <p className="text-sm text-primary-foreground/75">{item.label}</p>
                    <p className="mt-2 text-3xl font-black tracking-tighter text-primary-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="mx-auto w-full max-w-xl">
            <div className="space-y-6 p-8 md:p-10">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Acesso</p>
                <h1 className="text-3xl font-black tracking-tighter text-primary-deep">Entrar no Painel Pastoral</h1>
                <p className="text-sm text-muted-foreground">
                  Faça login para acessar membros, visitas e pregações.
                </p>
              </div>

              <form className="grid gap-5" onSubmit={submit}>
                <div className="grid gap-2">
                  <Label htmlFor="username">Usuário</Label>
                  <Input id="username" placeholder="pastor" {...form.register('username')} />
                  <FieldError message={form.formState.errors.username?.message} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" placeholder="123456" {...form.register('password')} />
                  <FieldError message={form.formState.errors.password?.message} />
                </div>
                <Button type="submit" className="w-full">
                  Entrar
                </Button>
              </form>

              <div className="rounded-2xl border border-border bg-muted p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-primary-deep">Acesso demonstrativo</p>
                <p className="mt-1">Usuário: `pastor`</p>
                <p>Senha: `123456`</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/visitas" element={<VisitasPage />} />
        <Route path="/membros" element={<MembrosPage />} />
        <Route path="/pregacao" element={<PregacaoPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
