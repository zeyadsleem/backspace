import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: React.ReactNode
    children: React.ReactNode
    maxWidth?: string
    className?: string
    showCloseButton?: boolean
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'max-w-lg',
    className,
    showCloseButton = true,
}: ModalProps) {
    const isRTL = useAppStore((state) => state.isRTL)

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div
                className={cn(
                    "relative z-10 w-full bg-white dark:bg-stone-900 rounded-xl shadow-2xl flex flex-col max-h-[90vh] transition-all transform duration-200",
                    maxWidth,
                    className,
                    isRTL ? "rtl-dialog" : "ltr-dialog"
                )}
                dir={isRTL ? 'rtl' : 'ltr'}
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-800">
                        <div className="text-lg font-bold text-stone-900 dark:text-stone-100">
                            {title}
                        </div>
                        {showCloseButton && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300 transition-colors"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                {children}
            </div>
        </div>
    )
}
