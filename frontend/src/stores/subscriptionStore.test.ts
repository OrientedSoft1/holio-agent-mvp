import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../services/api.service', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import { useSubscriptionStore } from './subscriptionStore'
import api from '../services/api.service'

describe('subscriptionStore', () => {
  beforeEach(() => {
    useSubscriptionStore.setState({
      plans: [],
      subscription: null,
      loading: false,
      subscribing: false,
    })
    vi.clearAllMocks()
  })

  it('should start with empty state', () => {
    const state = useSubscriptionStore.getState()
    expect(state.plans).toEqual([])
    expect(state.subscription).toBeNull()
    expect(state.loading).toBe(false)
    expect(state.subscribing).toBe(false)
  })

  it('should fetch plans from API', async () => {
    const mockPlans = [
      { id: 'plan-annual', name: 'Annual', interval: 'annual', pricePerMonth: 3.99, totalPerYear: 47.88, discount: '-40%', currency: 'USD' },
      { id: 'plan-monthly', name: 'Monthly', interval: 'monthly', pricePerMonth: 5.99, totalPerYear: null, discount: null, currency: 'USD' },
    ]
    vi.mocked(api.get).mockResolvedValue({ data: mockPlans })
    await useSubscriptionStore.getState().fetchPlans()
    expect(useSubscriptionStore.getState().plans).toEqual(mockPlans)
    expect(useSubscriptionStore.getState().loading).toBe(false)
  })

  it('should set loading true while fetching plans', async () => {
    let resolvePromise: (v: unknown) => void
    const pending = new Promise((resolve) => { resolvePromise = resolve })
    vi.mocked(api.get).mockReturnValue(pending as never)

    const fetchPromise = useSubscriptionStore.getState().fetchPlans()
    expect(useSubscriptionStore.getState().loading).toBe(true)

    resolvePromise!({ data: [] })
    await fetchPromise
    expect(useSubscriptionStore.getState().loading).toBe(false)
  })

  it('should handle fetch plans error gracefully', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'))
    await useSubscriptionStore.getState().fetchPlans()
    expect(useSubscriptionStore.getState().plans).toEqual([])
    expect(useSubscriptionStore.getState().loading).toBe(false)
  })

  it('should fetch current subscription', async () => {
    const mockSub = {
      id: 'sub-1', planId: 'plan-annual', planName: 'Annual',
      interval: 'annual' as const, status: 'active' as const,
      daysLeft: 300, totalDays: 365, currentPeriodEnd: '2027-01-01',
    }
    vi.mocked(api.get).mockResolvedValue({ data: mockSub })
    await useSubscriptionStore.getState().fetchSubscription()
    expect(useSubscriptionStore.getState().subscription).toEqual(mockSub)
  })

  it('should clear subscription when fetch returns 404', async () => {
    useSubscriptionStore.setState({ subscription: { id: 'sub-old' } as never })
    vi.mocked(api.get).mockRejectedValue(new Error('Not found'))
    await useSubscriptionStore.getState().fetchSubscription()
    expect(useSubscriptionStore.getState().subscription).toBeNull()
  })

  it('should subscribe and return checkout URL', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { checkoutUrl: 'https://pay.example.com' } })
    const result = await useSubscriptionStore.getState().subscribe('plan-annual')
    expect(result).toEqual({ checkoutUrl: 'https://pay.example.com' })
    expect(useSubscriptionStore.getState().subscribing).toBe(false)
  })

  it('should handle subscribe error gracefully', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('Payment failed'))
    const result = await useSubscriptionStore.getState().subscribe('plan-annual')
    expect(result).toEqual({})
    expect(useSubscriptionStore.getState().subscribing).toBe(false)
  })

  it('should cancel subscription', async () => {
    useSubscriptionStore.setState({
      subscription: {
        id: 'sub-1', planId: 'plan-annual', planName: 'Annual',
        interval: 'annual', status: 'active', daysLeft: 300,
        totalDays: 365, currentPeriodEnd: '2027-01-01',
      },
    })
    vi.mocked(api.post).mockResolvedValue({ data: {} })
    await useSubscriptionStore.getState().cancelSubscription()
    expect(useSubscriptionStore.getState().subscription).toBeNull()
  })
})
