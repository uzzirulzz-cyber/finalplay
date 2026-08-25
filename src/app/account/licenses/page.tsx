'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, KeyRound, Copy, CheckCircle2 } from 'lucide-react'
import { useCustomer } from '@/lib/use-customer'
import { toast } from 'sonner'

interface License {
  id: string
  productName: string
  licenseKey: string
  activationInfo?: string | null
  status: string
  expiresAt?: string | null
  createdAt: string
}

export default function LicensesPage() {
  const { customer, loading } = useCustomer()
  const router = useRouter()
  const [licenses, setLicenses] = useState<License[]>([])
  const [loadingLicenses, setLoadingLicenses] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !customer) router.replace('/login?redirect=/account/licenses')
  }, [loading, customer, router])

  useEffect(() => {
    if (!customer) return
    fetch('/api/customer/licenses', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setLicenses(data.licenses || []))
      .finally(() => setLoadingLicenses(false))
  }, [customer])

  function copyKey(key: string) {
    navigator.clipboard.writeText(key)
    setCopied(key)
    toast.success('License key copied to clipboard')
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading || !customer) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#050608] text-slate-300">
        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050608] text-white">
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Digital License Vault</h1>
        <p className="mt-1 text-sm text-slate-400">{licenses.length} active licenses</p>

        {loadingLicenses ? (
          <div className="mt-8 grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          </div>
        ) : licenses.length === 0 ? (
          <div className="mt-8 flex flex-col items-center py-16 text-center">
            <KeyRound className="h-12 w-12 text-slate-600" />
            <p className="mt-3 text-sm text-slate-400">No active licenses yet</p>
            <p className="mt-1 text-xs text-slate-500">Purchase a digital product to access your license keys here.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {licenses.map((license) => (
              <div key={license.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-white">{license.productName}</div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      Purchased: {new Date(license.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}
                    </div>
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${
                    license.status === 'active' ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400' :
                    'border-yellow-400/30 bg-yellow-400/15 text-yellow-400'
                  }`}>
                    {license.status}
                  </span>
                </div>
                <div className="mt-3 rounded-lg border border-white/5 bg-black/40 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">License Key</div>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="flex-1 font-mono text-sm text-emerald-400 break-all">{license.licenseKey}</code>
                    <button
                      onClick={() => copyKey(license.licenseKey)}
                      className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs transition hover:bg-white/10"
                    >
                      {copied === license.licenseKey ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-slate-300" />
                      )}
                    </button>
                  </div>
                </div>
                {license.activationInfo && (
                  <div className="mt-2 text-xs text-slate-400">
                    <strong className="text-slate-300">Activation:</strong> {license.activationInfo}
                  </div>
                )}
                {license.expiresAt && (
                  <div className="mt-1 text-xs text-slate-400">
                    <strong className="text-slate-300">Expires:</strong> {new Date(license.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
