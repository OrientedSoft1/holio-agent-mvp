import { create } from 'zustand'

interface Company {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  description: string | null
}

interface CompanyState {
  companies: Company[]
  activeCompany: Company | null
  setCompanies: (companies: Company[]) => void
  setActiveCompany: (company: Company) => void
}

export const useCompanyStore = create<CompanyState>((set) => ({
  companies: [],
  activeCompany: null,
  setCompanies: (companies) => set({ companies }),
  setActiveCompany: (company) => set({ activeCompany: company })
}))
