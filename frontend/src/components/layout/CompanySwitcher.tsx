import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCompanyStore } from '../../stores/companyStore'
import { cn } from '../../lib/utils'
import type { Company } from '../../types'

function CompanyAvatar({ company }: { company: Company }) {
  if (company.logoUrl) {
    return (
      <img
        src={company.logoUrl}
        alt={company.name}
        className="h-10 w-10 rounded-full object-cover"
      />
    )
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-holio-orange text-sm font-bold text-white">
      {company.name.charAt(0).toUpperCase()}
    </div>
  )
}

function Tooltip({
  text,
  children,
}: {
  text: string
  children: React.ReactNode
}) {
  const [show, setShow] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-holio-dark px-3 py-1.5 text-xs font-medium text-white shadow-lg">
          {text}
          <div className="absolute top-1/2 right-full -translate-y-1/2 border-4 border-transparent border-r-holio-dark" />
        </div>
      )}
    </div>
  )
}

export default function CompanySwitcher() {
  const navigate = useNavigate()
  const { companies, activeCompany, fetchCompanies, switchCompany } =
    useCompanyStore()

  useEffect(() => {
    if (companies.length === 0) {
      fetchCompanies()
    }
  }, [companies.length, fetchCompanies])

  function handleSwitch(company: Company) {
    if (activeCompany?.id === company.id) {
      navigate('/select-company')
    } else {
      switchCompany(company)
    }
  }

  return (
    <div className="flex w-full flex-col items-center py-3">
      <div className="flex flex-col items-center gap-2">
        {companies.map((company) => {
          const isActive = activeCompany?.id === company.id
          return (
            <Tooltip key={company.id} text={company.name}>
              <button
                onClick={() => handleSwitch(company)}
                className={cn(
                  'relative flex items-center justify-center rounded-full transition-all duration-200',
                  isActive
                    ? 'scale-105'
                    : 'opacity-70 hover:opacity-100',
                )}
              >
                {isActive && (
                  <div className="absolute -left-[14px] h-8 w-[3px] rounded-r-full bg-white" />
                )}
                <CompanyAvatar company={company} />
              </button>
            </Tooltip>
          )
        })}
      </div>

      <div className="mx-auto my-2 h-px w-8 bg-white/20" />

      <Tooltip text="Add workspace">
        <button
          onClick={() => {
            navigate('/select-company')
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-white/30 text-white/50 transition-all hover:border-white/60 hover:text-white/80"
        >
          <Plus className="h-5 w-5" />
        </button>
      </Tooltip>
    </div>
  )
}
