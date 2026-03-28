import { create } from 'zustand'
import api from '../services/api.service'
import type { Company } from '../types'

interface CompanyState {
  companies: Company[]
  activeCompany: Company | null
  loading: boolean
  setCompanies: (companies: Company[]) => void
  setActiveCompany: (company: Company) => void
  fetchCompanies: () => Promise<Company[]>
  createCompany: (name: string) => Promise<Company>
  switchCompany: (company: Company) => void
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [],
  activeCompany: JSON.parse(localStorage.getItem('activeCompany') || 'null'),
  loading: false,
  setCompanies: (companies) => set({ companies }),
  setActiveCompany: (company) => {
    localStorage.setItem('activeCompany', JSON.stringify(company))
    set({ activeCompany: company })
  },
  fetchCompanies: async () => {
    set({ loading: true })
    try {
      const { data } = await api.get<Company[]>('/companies')
      set({ companies: data, loading: false })
      return data
    } catch {
      set({ loading: false })
      return get().companies
    }
  },
  createCompany: async (name: string) => {
    const { data } = await api.post<Company>('/companies', { name })
    set((state) => ({ companies: [...state.companies, data] }))
    return data
  },
  switchCompany: (company) => {
    localStorage.setItem('activeCompany', JSON.stringify(company))
    set({ activeCompany: company })
  },
}))
