import { create } from 'zustand'
import api from '../services/api.service'

interface Plan {
  id: string
  name: string
  interval: 'monthly' | 'annual'
  pricePerMonth: number
  totalPerYear: number | null
  discount: string | null
  currency: string
}

interface Subscription {
  id: string
  planId: string
  planName: string
  interval: 'monthly' | 'annual'
  status: 'active' | 'cancelled' | 'expired' | 'trialing'
  daysLeft: number
  totalDays: number
  currentPeriodEnd: string
}

interface SubscriptionState {
  plans: Plan[]
  subscription: Subscription | null
  loading: boolean
  subscribing: boolean
  fetchPlans: () => Promise<void>
  fetchSubscription: () => Promise<void>
  subscribe: (planId: string) => Promise<{ checkoutUrl?: string }>
  cancelSubscription: () => Promise<void>
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  plans: [],
  subscription: null,
  loading: false,
  subscribing: false,

  fetchPlans: async () => {
    set({ loading: true })
    try {
      const { data } = await api.get<Plan[]>('/subscriptions/plans')
      set({ plans: data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchSubscription: async () => {
    try {
      const { data } = await api.get<Subscription>('/subscriptions/me')
      set({ subscription: data })
    } catch {
      // no active subscription
      set({ subscription: null })
    }
  },

  subscribe: async (planId: string) => {
    set({ subscribing: true })
    try {
      const { data } = await api.post<{ checkoutUrl?: string }>('/subscriptions', { planId })
      set({ subscribing: false })
      return data
    } catch {
      set({ subscribing: false })
      return {}
    }
  },

  cancelSubscription: async () => {
    try {
      await api.post('/subscriptions/cancel')
      set({ subscription: null })
    } catch {
      // ignore
    }
  },
}))
