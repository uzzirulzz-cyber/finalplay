'use client'

import { useState } from 'react'
import {
  RotateCcw,
  AlertTriangle,
  Loader2,
  X,
  CheckCircle2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ResetDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  onDone?: () => void
}

export function ResetDialog({ open, onOpenChange, onDone }: ResetDialogProps) {
  const [step, setStep] = useState<'confirm' | 'resetting' | 'done'>('confirm')
  const [error, setError] = useState<string | null>(null)

  async function handleReset() {
    setStep('resetting')
    setError(null)
    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ confirm: 'RESET' }),
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Reset failed')
      }
      setStep('done')
      toast.success('Database reset to seed state')
      setTimeout(() => {
        onOpenChange(false)
        setStep('confirm')
        onDone?.()
      }, 1500)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Reset failed'
      setError(msg)
      setStep('confirm')
      toast.error(msg)
    }
  }

  function handleClose(open: boolean) {
    if (step === 'resetting') return
    onOpenChange(open)
    if (!open) setTimeout(() => setStep('confirm'), 200)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border-red-500/20 bg-[#0f172a]/95 text-white backdrop-blur-xl">
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <DialogTitle className="text-xl font-bold">
            Reset Database to Seed State?
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            This will permanently delete <span className="font-semibold text-slate-300">all</span>{' '}
            products, orders, customers, and activity logs, then restore the original
            sample dataset. <span className="text-red-300">This action cannot be undone.</span>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        )}

        {step === 'done' && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            Reset complete! Refreshing data...
          </div>
        )}

        <DialogFooter className="mt-4 gap-2">
          <Button
            variant="ghost"
            onClick={() => handleClose(false)}
            disabled={step === 'resetting'}
            className="text-slate-300 hover:bg-white/5 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleReset}
            disabled={step !== 'confirm'}
            className="gap-2 bg-red-500/90 text-white hover:bg-red-500"
          >
            {step === 'resetting' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : step === 'done' ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Done
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4" />
                Yes, Reset Everything
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
