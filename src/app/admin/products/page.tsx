'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Plus,
  Search,
  Upload,
  Download,
  FileSpreadsheet,
  Trash2,
  Pencil,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  Package,
  Inbox,
  RotateCw,
} from 'lucide-react'
import { Sidebar } from '@/components/admin/sidebar'
import { Header } from '@/components/admin/header'
import { useSession } from '@/lib/use-session'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Product {
  id: string
  sku: string
  name: string
  description?: string | null
  category?: string | null
  price: number // USD base
  currency: string // always "USD"
  originalPrice?: number | null
  originalCurrency?: string | null
  region?: string | null
  stock: number
  status: string
  digital: boolean
  image?: string | null
  tags: string[]
  createdAt: string
}

interface ImportResult {
  ok: boolean
  total?: number
  created?: number
  updated?: number
  skipped?: { row: number; reason: string }[]
  errors?: { sku: string; reason: string }[]
  error?: string
}

export default function ProductsPage() {
  const { user, loading } = useSession()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const LIMIT = 20

  const [createOpen, setCreateOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importMode, setImportMode] = useState<'upsert' | 'create'>('upsert')
  const [importing, setImporting] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (category !== 'all') params.set('category', category)
      if (status !== 'all') params.set('status', status)
      params.set('page', String(page))
      params.set('limit', String(LIMIT))
      const res = await fetch(`/api/products?${params}`, { credentials: 'include' })
      const data = await res.json()
      if (data?.ok) {
        setProducts(data.data || [])
        setTotal(data.total || 0)
        setPages(data.pages || 1)
      } else {
        toast.error(data?.error || 'Failed to load products')
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to load products')
    } finally {
      setLoadingProducts(false)
    }
  }, [search, category, status, page])

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/admin/products')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (user) fetchProducts()
  }, [user, fetchProducts])

  // Debounce search
  useEffect(() => {
    setPage(1)
    const t = setTimeout(() => fetchProducts(), 250)
    return () => clearTimeout(t)
  }, [search, category, status])

  async function handleDelete(id: string, sku: string) {
    if (!confirm(`Delete product ${sku}? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Delete failed')
      }
      toast.success(`Deleted ${sku}`)
      fetchProducts()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Delete failed'
      toast.error(msg)
    }
  }

  async function handleFile(file: File) {
    setImporting(true)
    setImportResult(null)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch(`/api/products/import?mode=${importMode}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      const data: ImportResult = await res.json()
      setImportResult(data)
      if (data.ok) {
        toast.success(
          `Imported: ${data.created} created, ${data.updated} updated`
        )
        fetchProducts()
      } else {
        toast.error(data.error || 'Import failed')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Import failed'
      toast.error(msg)
      setImportResult({ ok: false, error: msg })
    } finally {
      setImporting(false)
    }
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragActive(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#070b18] text-slate-300">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen bg-[#070b18] text-foreground">
      <div className="grid-pattern pointer-events-none fixed inset-0 opacity-40" />

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setMobileOpen(true)} />

        <main className="scrollbar-thin flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1500px] space-y-5 p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white lg:text-2xl">
                  Product Manager
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  {total} product{total !== 1 ? 's' : ''} in catalog
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/api/products/template"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">CSV Template</span>
                </a>
                <button
                  onClick={() => setImportOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20"
                >
                  <Upload className="h-4 w-4" />
                  <span>Import CSV</span>
                </button>
                <button
                  onClick={() => setCreateOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-3.5 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-yellow-500/25 transition hover:brightness-105"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <div className="relative min-w-[240px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products by name, SKU..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-yellow-400/40 focus:bg-white/[0.07]"
                />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-yellow-400/40"
              >
                <option value="all">All Categories</option>
                <option value="Gift Cards">Gift Cards</option>
                <option value="Streaming">Streaming</option>
                <option value="IPTV">IPTV</option>
                <option value="VPN">VPN</option>
                <option value="AI">AI</option>
                <option value="Software">Software</option>
              </select>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-yellow-400/40"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              {(search || category !== 'all' || status !== 'all') && (
                <button
                  onClick={() => {
                    setSearch('')
                    setCategory('all')
                    setStatus('all')
                  }}
                  className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]">
              {loadingProducts ? (
                <div className="flex h-40 items-center justify-center text-sm text-slate-400">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading products...
                </div>
              ) : products.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-slate-400">
                  <Inbox className="h-8 w-8 text-slate-500" />
                  <span>No products found</span>
                  <button
                    onClick={() => setCreateOpen(true)}
                    className="mt-1 rounded-lg bg-yellow-400/20 px-3 py-1.5 text-xs font-semibold text-yellow-300 transition hover:bg-yellow-400/30"
                  >
                    Add your first product
                  </button>
                </div>
              ) : (
                <>
                  <div className="scrollbar-thin overflow-x-auto">
                    <table className="w-full min-w-[800px] text-sm">
                      <thead>
                        <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-slate-500">
                          <th className="px-4 py-3 font-semibold">SKU</th>
                          <th className="px-4 py-3 font-semibold">Name</th>
                          <th className="px-4 py-3 font-semibold">Category</th>
                          <th className="px-4 py-3 text-right font-semibold">Price</th>
                          <th className="px-4 py-3 text-right font-semibold">Stock</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr
                            key={p.id}
                            className="border-b border-white/5 transition hover:bg-white/[0.03]"
                          >
                            <td className="px-4 py-3 font-mono text-xs text-slate-300">
                              {p.sku}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 text-[10px] font-bold text-slate-300">
                                  {p.name.split(' ')[0].slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="truncate font-medium text-white">
                                    {p.name}
                                  </div>
                                  {p.tags?.length > 0 && (
                                    <div className="mt-0.5 flex flex-wrap gap-1">
                                      {p.tags.slice(0, 2).map((t) => (
                                        <span
                                          key={t}
                                          className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-slate-400"
                                        >
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                              {p.category || '—'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="font-mono text-sm font-semibold text-white">
                                ${p.price.toFixed(2)}
                              </div>
                              {p.originalCurrency && p.originalCurrency !== 'USD' && (
                                <div className="font-mono text-[10px] text-slate-500">
                                  {p.originalCurrency} {p.originalPrice?.toLocaleString()}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right text-slate-300">
                              {p.stock}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                                  p.status === 'active' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                                  p.status === 'draft' && 'bg-slate-500/10 text-slate-400 border-slate-500/20',
                                  p.status === 'archived' && 'bg-red-500/10 text-red-400 border-red-500/20'
                                )}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setEditing(p)}
                                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(p.id, p.sku)}
                                  className="grid h-8 w-8 place-items-center rounded-lg text-red-400/70 transition hover:bg-red-500/10 hover:text-red-400"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  <div className="flex items-center justify-between border-t border-white/5 px-4 py-3 text-xs text-slate-400">
                    <div>
                      Page {page} of {pages} · {total} total
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 transition hover:bg-white/10 disabled:opacity-40"
                      >
                        ← Prev
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(pages, p + 1))}
                        disabled={page >= pages}
                        className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 transition hover:bg-white/10 disabled:opacity-40"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create/Edit Dialog */}
      <ProductFormDialog
        open={createOpen || editing !== null}
        onOpenChange={(v) => {
          if (!v) {
            setCreateOpen(false)
            setEditing(null)
          }
        }}
        product={editing}
        onSaved={() => {
          fetchProducts()
          setCreateOpen(false)
          setEditing(null)
        }}
      />

      {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-2xl border-emerald-500/20 bg-[#0f172a]/95 text-white backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
              Import Products from CSV
            </DialogTitle>
          </DialogHeader>

          {/* Mode */}
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
            {(['upsert', 'create'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setImportMode(m)}
                className={cn(
                  'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition',
                  importMode === m
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {m === 'upsert' ? 'Update existing (Upsert)' : 'Create only (Skip dups)'}
              </button>
            ))}
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            className={cn(
              'mt-3 grid place-items-center rounded-2xl border-2 border-dashed p-8 text-center transition',
              dragActive
                ? 'border-emerald-500 bg-emerald-500/5'
                : 'border-white/15 bg-white/[0.02]'
            )}
          >
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/15">
              {importing ? (
                <Loader2 className="h-7 w-7 animate-spin text-emerald-400" />
              ) : (
                <Upload className="h-7 w-7 text-emerald-400" />
              )}
            </div>
            <div className="mt-3 text-sm font-medium text-white">
              {importing ? 'Importing...' : 'Drop CSV / XLSX file here'}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              or click to browse — supported: .csv, .tsv, .xlsx
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv,.xlsx,.xls"
              onChange={onFileSelected}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="mt-4 rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/30 disabled:opacity-60"
            >
              Choose File
            </button>
          </div>

          {/* Template help */}
          <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-slate-400">
            <div className="mb-1 font-semibold text-slate-300">
              Required columns:
            </div>
            <code className="block whitespace-pre-wrap break-words text-[11px] text-emerald-300/80">
              sku, name, description, category, price, currency, stock, status, image, digital, tags
            </code>
            <a
              href="/api/products/template"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-yellow-400 transition hover:text-yellow-300"
            >
              <Download className="h-3 w-3" />
              Download template
            </a>
          </div>

          {/* Result */}
          {importResult && (
            <div
              className={cn(
                'mt-3 rounded-xl border p-3 text-xs',
                importResult.ok
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-red-500/30 bg-red-500/10 text-red-300'
              )}
            >
              {importResult.ok ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    Import complete!
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="font-mono text-lg font-bold text-white">
                        {importResult.total}
                      </div>
                      <div className="text-[10px] uppercase text-slate-400">
                        Total
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-lg font-bold text-emerald-400">
                        {importResult.created}
                      </div>
                      <div className="text-[10px] uppercase text-slate-400">
                        Created
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-lg font-bold text-blue-400">
                        {importResult.updated}
                      </div>
                      <div className="text-[10px] uppercase text-slate-400">
                        Updated
                      </div>
                    </div>
                  </div>
                  {importResult.skipped && importResult.skipped.length > 0 && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-[11px] text-yellow-300/80">
                        {importResult.skipped.length} row(s) skipped
                      </summary>
                      <div className="mt-1 max-h-32 overflow-y-auto space-y-1 scrollbar-thin">
                        {importResult.skipped.map((s, i) => (
                          <div key={i} className="text-[10px] text-yellow-300/70">
                            Row {s.row}: {s.reason}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                  {importResult.errors && importResult.errors.length > 0 && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-[11px] text-red-300/80">
                        {importResult.errors.length} error(s)
                      </summary>
                      <div className="mt-1 max-h-32 overflow-y-auto space-y-1 scrollbar-thin">
                        {importResult.errors.map((s, i) => (
                          <div key={i} className="text-[10px] text-red-300/70">
                            SKU {s.sku}: {s.reason}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{importResult.error || 'Import failed'}</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button
              variant="ghost"
              onClick={() => setImportOpen(false)}
              className="text-slate-300 hover:bg-white/5 hover:text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Product Form Dialog (Create/Edit)
function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  product: Product | null
  onSaved: () => void
}) {
  const isEdit = !!product
  const [form, setForm] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    price: '', // USD base
    originalPrice: '', // source currency
    originalCurrency: 'USD',
    region: '',
    stock: '0',
    status: 'active',
    image: '',
    digital: true,
    tags: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (product) {
      setForm({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        category: product.category || '',
        price: String(product.price),
        originalPrice: product.originalPrice ? String(product.originalPrice) : '',
        originalCurrency: product.originalCurrency || 'USD',
        region: product.region || '',
        stock: String(product.stock),
        status: product.status,
        image: product.image || '',
        digital: product.digital,
        tags: (product.tags || []).join(', '),
      })
    } else {
      setForm({
        sku: '',
        name: '',
        description: '',
        category: '',
        price: '',
        originalPrice: '',
        originalCurrency: 'USD',
        region: '',
        stock: '0',
        status: 'active',
        image: '',
        digital: true,
        tags: '',
      })
    }
    setError(null)
  }, [product, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const price = Number(form.price) || 0
      const payload = {
        sku: form.sku,
        name: form.name,
        description: form.description,
        category: form.category,
        price,
        originalPrice: form.originalPrice ? Number(form.originalPrice) : price,
        originalCurrency: form.originalCurrency || 'USD',
        region: form.region || null,
        stock: Number(form.stock) || 0,
        status: form.status,
        digital: form.digital,
        image: form.image,
        tags: form.tags
          ? form.tags.split(/[,;]/).map((t) => t.trim()).filter(Boolean)
          : [],
      }
      const url = isEdit ? `/api/products/${product!.id}` : '/api/products'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Save failed')
      }
      toast.success(isEdit ? 'Product updated' : 'Product created')
      onSaved()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Save failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-white/10 bg-[#0f172a]/95 text-white backdrop-blur-xl scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Package className="h-5 w-5 text-yellow-400" />
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="SKU *">
              <input
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                placeholder="PSN-50-US"
                className="input"
              />
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="input"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
          </div>
          <Field label="Product Name *">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="PlayStation Gift Card - $50 (USA)"
              className="input"
            />
          </Field>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief product description..."
              rows={3}
              className="input resize-none"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Gift Cards"
                className="input"
              />
            </Field>
            <Field label="Region">
              <input
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                placeholder="US / EU / UK / Global"
                className="input"
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Selling Price (USD) *">
              <input
                required
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="31.20"
                className="input"
              />
            </Field>
            <Field label="Original Price">
              <input
                type="number"
                step="0.01"
                value={form.originalPrice}
                onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                placeholder="31.20"
                className="input"
              />
            </Field>
            <Field label="Original Currency">
              <select
                value={form.originalCurrency}
                onChange={(e) => setForm({ ...form, originalCurrency: e.target.value })}
                className="input"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="AED">AED</option>
                <option value="PKR">PKR</option>
                <option value="TRY">TRY</option>
                <option value="JPY">JPY</option>
                <option value="AUD">AUD</option>
                <option value="BRL">BRL</option>
                <option value="COP">COP</option>
                <option value="MXN">MXN</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Stock">
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="100"
                className="input"
              />
            </Field>
            <Field label="Image URL">
              <input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
                className="input"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tags (comma separated)">
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="psn, usa, giftcard"
                className="input"
              />
            </Field>
            <Field label="Digital Product">
              <label className="flex h-[42px] cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white">
                <input
                  type="checkbox"
                  checked={form.digital}
                  onChange={(e) => setForm({ ...form, digital: e.target.checked })}
                  className="h-4 w-4 accent-yellow-400"
                />
                Yes, this is a digital product
              </label>
            </Field>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-slate-300 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="gap-2 bg-gradient-to-r from-yellow-300 to-amber-500 text-slate-950 hover:brightness-105"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {isEdit ? 'Update Product' : 'Create Product'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>

        <style jsx>{`
          :global(.input) {
            width: 100%;
            border-radius: 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.05);
            padding: 0.625rem 0.75rem;
            font-size: 0.875rem;
            color: white;
            outline: none;
            transition: all 0.15s;
          }
          :global(.input:focus) {
            border-color: rgba(250, 204, 21, 0.4);
            background: rgba(255, 255, 255, 0.07);
          }
          :global(.input::placeholder) {
            color: rgb(100, 116, 139);
          }
        `}</style>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      {children}
    </div>
  )
}
