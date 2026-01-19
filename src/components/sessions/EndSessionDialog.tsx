import { useState, useEffect } from 'react'
import type { ActiveSession, PaymentMethod, InvoiceStatus } from '@/types'
import { X, Clock, Coffee, DollarSign, Wallet, Calendar, Calculator, CheckCircle2, Trash2 } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'

interface EndSessionDialogProps {
  isOpen: boolean
  session: ActiveSession | null
  onClose: () => void
  onRemoveItem?: (consumptionId: string) => void
  onConfirm: (paymentData: { 
    amount: number; 
    method: PaymentMethod; 
    date: string; 
    notes?: string;
    status: InvoiceStatus 
  }) => void
  isLoading?: boolean
}

export function EndSessionDialog({ isOpen, session, onClose, onRemoveItem, onConfirm, isLoading }: EndSessionDialogProps) {
  const t = useAppStore((state) => state.t)
  const isRTL = useAppStore((state) => state.isRTL)
  
  const [duration, setDuration] = useState(0)
  const [sessionCost, setSessionCost] = useState(0)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [paymentStatus, setPaymentStatus] = useState<InvoiceStatus>('paid')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (session && isOpen) {
      const start = new Date(session.startedAt)
      const now = new Date()
      const diffMins = Math.floor((now.getTime() - start.getTime()) / 60000)
      setDuration(diffMins)
      
      const cost = session.isSubscribed ? 0 : (diffMins / 60) * session.resourceRate
      const roundedCost = Math.round(cost)
      setSessionCost(roundedCost)
      
      const total = roundedCost + session.inventoryTotal
      setPaymentAmount(total)
      setPaymentStatus('paid')
    }
  }, [session, isOpen, session?.inventoryTotal])

  if (!isOpen || !session) return null

  const totalAmount = sessionCost + session.inventoryTotal

  const handleStatusChange = (status: InvoiceStatus) => {
    setPaymentStatus(status)
    if (status === 'unpaid') {
      setPaymentAmount(0)
    } else if (status === 'paid') {
      setPaymentAmount(totalAmount)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm({
      amount: paymentAmount,
      method: 'cash',
      date: new Date().toISOString(),
      notes,
      status: paymentStatus
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full max-w-4xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        
        {/* Header */}
        <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('endSession')}</h2>
              <p className="text-[11px] text-stone-500">{session.customerName} • {session.resourceName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                
                {/* Right Side: Account Details */}
                <div className="flex flex-col space-y-5">
                  <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest px-1 border-s-4 border-amber-500 ps-2">
                    {t('details')}
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800">
                      <div className="flex items-center gap-1.5 mb-1 text-stone-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-medium uppercase">{t('sessionTime')}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-semibold text-stone-800 dark:text-stone-100">{duration}</span>
                        <span className="text-xs text-stone-500">{t('minutes')}</span>
                      </div>
                    </div>
                    <div className="p-3.5 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-100/50 dark:border-amber-900/20">
                      <div className="flex items-center gap-1.5 mb-1 text-amber-600">
                        <Calculator className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-medium uppercase">{t('totalAmount')}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-semibold text-amber-700 dark:text-amber-400">{totalAmount}</span>
                        <span className="text-xs text-amber-600/80">{t('egpCurrency')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Items List */}
                  <div className="flex-1 min-h-[200px] bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-stone-100 dark:border-stone-800 bg-stone-50/30 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-tight">{t('billingItems')}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-stone-100 dark:divide-stone-800">
                        <div className="p-3 flex justify-between items-center hover:bg-stone-50/50 transition-colors text-sm">
                          <div className="flex items-center gap-3 text-stone-600 dark:text-stone-300">
                            <Clock className="h-4 w-4 opacity-40" />
                            <div>
                              <p className="font-medium text-stone-800 dark:text-stone-100">{t('sessionUsage')}</p>
                              <p className="text-[10px] text-stone-400">{duration} {t('minutes')} @ {session.resourceRate} {t('egpHr')}</p>
                            </div>
                          </div>
                          <span className="font-semibold text-stone-800 dark:text-stone-100">{sessionCost}</span>
                        </div>

                        {session.inventoryConsumptions.map((item) => (
                          <div key={item.id} className="p-3 flex justify-between items-center hover:bg-stone-50/50 transition-colors text-sm group">
                            <div className="flex items-center gap-3 text-stone-600 dark:text-stone-300">
                              <Coffee className="h-4 w-4 opacity-40" />
                              <div>
                                <p className="font-medium text-stone-800 dark:text-stone-100">{item.itemName}</p>
                                <p className="text-[10px] text-stone-400">{item.quantity} × {item.price} {t('egpCurrency')}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-stone-800 dark:text-stone-100">{item.quantity * item.price}</span>
                                <button 
                                    type="button"
                                    onClick={() => onRemoveItem?.(item.id)}
                                    className="p-1 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Left Side: Payment Options */}
                <div className="flex flex-col space-y-5">
                  <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest px-1 border-s-4 border-amber-500 ps-2">
                    {t('paymentStatus')}
                  </h3>

                  <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleStatusChange('paid')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all ${paymentStatus === 'paid' ? 'bg-white dark:bg-stone-700 text-emerald-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                      <DollarSign className="h-4 w-4" /> {t('paid')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('pending')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all ${paymentStatus === 'pending' ? 'bg-white dark:bg-stone-700 text-amber-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                      <Wallet className="h-4 w-4" /> {t('pending')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('unpaid')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all ${paymentStatus === 'unpaid' ? 'bg-white dark:bg-stone-700 text-red-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                      <Calendar className="h-4 w-4" /> {t('debt')}
                    </button>
                  </div>

                  <div className={`p-5 rounded-xl border-2 transition-all flex-1 flex flex-col ${
                    paymentStatus === 'paid' ? 'border-emerald-100 bg-emerald-50/10 dark:border-emerald-900/20' : 
                    paymentStatus === 'pending' ? 'border-amber-100 bg-amber-50/10 dark:border-amber-900/20' : 
                    'border-red-100 bg-red-50/10 dark:border-red-900/20'
                  }`}>
                    <div className="space-y-5 flex-1">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('amountPaid')}</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(Number(e.target.value))}
                            disabled={paymentStatus === 'unpaid'}
                            className="w-full h-10 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 text-lg font-semibold focus:ring-1 focus:ring-amber-500 outline-none disabled:opacity-50"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-400 uppercase">{t('egpCurrency')}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('paymentMethod')}</label>
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl">
                            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600">
                                <DollarSign className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{t('cash')}</p>
                                <p className="text-[10px] text-stone-500">{t('onlyCashAccepted')}</p>
                            </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 flex-1 flex flex-col">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('notes')}</label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder={t('addPaymentNotes')}
                          className="w-full flex-1 p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 min-h-[80px] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 rounded-lg border border-stone-200 bg-white dark:bg-stone-800 dark:border-stone-700 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 transition-all uppercase tracking-wider"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-[1.5] h-10 rounded-lg bg-amber-500 text-xs font-medium text-white hover:bg-amber-600 shadow-sm transition-all uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    {t('confirmAndEnd')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
