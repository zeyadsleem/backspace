import { useState, useEffect } from 'react'
import type { ActiveSession, PaymentMethod, InvoiceStatus } from '@/types'
import { X, Clock, Coffee, DollarSign, Wallet, CheckCircle2, User, AlertCircle, Receipt } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/shared'

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
    const [amountToPay, setAmountToPay] = useState(0)
    const [paymentMode, setPaymentMode] = useState<'pay-now' | 'pay-later'>('pay-now')
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
            setAmountToPay(total)
            setPaymentMode('pay-now')
        }
    }, [session, isOpen, session?.inventoryTotal])

    if (!isOpen || !session) return null

    const totalAmount = sessionCost + session.inventoryTotal

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // logic: 
        // Pay Now -> Status: Paid, Amount: Input Amount (usually Total)
        // Pay Later -> Status: Unpaid, Amount: 0

        const isPayNow = paymentMode === 'pay-now'
        const finalStatus: InvoiceStatus = isPayNow ? 'paid' : 'unpaid'
        const finalPaidAmount = isPayNow ? amountToPay : 0

        onConfirm({
            amount: finalPaidAmount,
            method: 'cash', // Default to cash for now
            date: new Date().toISOString(),
            notes,
            status: finalStatus
        })
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="max-w-3xl"
            showCloseButton={false}
            className="overflow-hidden"
        >
            {/* Header */}
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                        <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('checkout')}</h2>
                        <p className="text-xs text-stone-500 font-mono">{session.customerName}</p>
                    </div>
                </div>
                <button onClick={onClose} className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300 transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">

                {/* LEFT COLUMN: THE BILL */}
                <div className="lg:flex-[3] flex flex-col border-e border-stone-100 dark:border-stone-800 bg-stone-50/30 dark:bg-stone-900/30">
                    <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
                        <div className="space-y-6">

                            {/* Session Cost */}
                            <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                                <div className="p-3 border-b border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                                        <Clock className="h-4 w-4" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">{t('session')}</span>
                                    </div>
                                    <span className="font-mono font-semibold text-stone-900 dark:text-stone-100">{sessionCost} {t('egp')}</span>
                                </div>
                                <div className="p-3 flex justify-between items-center text-sm">
                                    <div className="text-stone-600 dark:text-stone-400">
                                        <span className="font-medium text-stone-900 dark:text-stone-100">{session.resourceName}</span>
                                        <span className="mx-2 text-stone-300">|</span>
                                        <span>{duration} {t('minutes')}</span>
                                    </div>
                                    <span className="text-xs text-stone-400">{session.resourceRate} {t('egpHr')}</span>
                                </div>
                            </div>

                            {/* Inventory Items */}
                            <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                                <div className="p-3 border-b border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                                        <Coffee className="h-4 w-4" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">{t('orders')}</span>
                                    </div>
                                    <span className="font-mono font-semibold text-stone-900 dark:text-stone-100">{session.inventoryTotal} {t('egp')}</span>
                                </div>
                                <div className="divide-y divide-stone-100 dark:divide-stone-700">
                                    {session.inventoryConsumptions.length === 0 ? (
                                        <p className="p-4 text-center text-xs text-stone-400 italic">{t('noOrders')}</p>
                                    ) : (
                                        session.inventoryConsumptions.map((item) => (
                                            <div key={item.id} className="p-3 flex justify-between items-center text-sm group">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-stone-800 dark:text-stone-200">{item.itemName}</span>
                                                    <span className="text-xs text-stone-400">x{item.quantity}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-stone-600 dark:text-stone-400">{item.quantity * item.price}</span>
                                                    {onRemoveItem && (
                                                        <button onClick={() => onRemoveItem(item.id)} className="text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Total Bar */}
                    <div className="p-5 border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-medium text-stone-500 uppercase tracking-widest mb-0.5">{t('totalDue')}</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-medium text-stone-900 dark:text-stone-100">{totalAmount}</span>
                                <span className="text-xs font-normal text-stone-400">{t('egp')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: PAYMENT ACTIONS */}
                <div className="w-full lg:flex-[2] flex flex-col bg-white dark:bg-stone-900 p-5">
                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">

                        <div>
                            <label className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3 block">{t('paymentMethod')}</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMode('pay-now')}
                                    className={cn(
                                        "flex items-center justify-center gap-2 h-11 rounded-xl border transition-all",
                                        paymentMode === 'pay-now'
                                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-semibold ring-2 ring-emerald-500/20"
                                            : "border-stone-200 dark:border-stone-700 hover:border-emerald-200 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium"
                                    )}
                                >
                                    <Wallet className="h-4 w-4" />
                                    <span className="text-sm">{t('payNow')}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMode('pay-later')}
                                    className={cn(
                                        "flex items-center justify-center gap-2 h-11 rounded-xl border transition-all",
                                        paymentMode === 'pay-later'
                                            ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-semibold ring-2 ring-red-500/20"
                                            : "border-stone-200 dark:border-stone-700 hover:border-red-200 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium"
                                    )}
                                >
                                    <User className="h-4 w-4" />
                                    <span className="text-sm">{t('addToDebt')}</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1">
                            {paymentMode === 'pay-now' ? (
                                <div className="animate-fade-in space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-stone-400 uppercase tracking-widest block">{t('amountReceived')}</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={amountToPay}
                                                onChange={(e) => setAmountToPay(Number(e.target.value))}
                                                className={`w-full h-14 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 text-3xl font-medium font-mono outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${isRTL ? 'pl-10' : 'pr-10'}`}
                                            />
                                            <span className={`absolute top-1/2 -translate-y-1/2 text-sm font-medium text-stone-400 uppercase pointer-events-none ${isRTL ? 'left-4' : 'right-4'}`}>{t('egp')}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 flex items-start gap-3 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-100 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-400">
                                        <DollarSign className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" />
                                        <p className="leading-relaxed">{t('cashPaymentDescription')}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-fade-in space-y-4">
                                    <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20 flex items-start gap-3">
                                        <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-red-700 dark:text-red-400 mb-1 text-sm">{t('unpaidInvoice')}</p>
                                            <p className="text-xs text-red-600/80 dark:text-red-400/80 leading-relaxed">
                                                {t('addToDebtWarning', { name: session.customerName, amount: totalAmount })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4">
                                <label className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2 block">{t('notes')}</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder={t('addPaymentNotes')}
                                    className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:ring-2 focus:ring-stone-400 outline-none transition-all resize-none h-20"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "w-full h-11 rounded-xl font-medium text-base text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                                paymentMode === 'pay-now'
                                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 dark:shadow-none"
                                    : "bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none"
                            )}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle2 className="h-5 w-5" />
                                    {paymentMode === 'pay-now' ? t('confirmPayment') : t('confirmDebt')}
                                </>
                            )}
                        </button>

                    </form>
                </div>
            </div>
        </Modal>
    )
}
