import { useState } from 'react'
import { CustomerFormV3 } from './CustomerFormV3'
import { useAppStore } from '@/stores/useAppStore'
import type { CustomerType } from '@/types'

// مثال على كيفية استخدام النموذج المحسن
export function CustomerFormExample() {
  const { addCustomer, updateCustomer } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<any>(null)

  const customerTypes: CustomerType[] = ['visitor', 'weekly', 'half-monthly', 'monthly']

  const handleSubmit = async (data: {
    name: string
    phone: string
    email?: string
    customerType: CustomerType
    notes?: string
  }) => {
    setIsLoading(true)
    
    try {
      // محاكاة API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingCustomer) {
        // تحديث عميل موجود
        updateCustomer(editingCustomer.id, data)
        console.log('Customer updated:', data)
      } else {
        // إضافة عميل جديد
        addCustomer({
          ...data,
          email: data.email || null,
          notes: data.notes || '',
          balance: 0,
        })
        console.log('Customer added:', data)
      }
      
      // إعادة تعيين النموذج
      setEditingCustomer(null)
    } catch (error) {
      console.error('Error saving customer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingCustomer(null)
  }

  // مثال على بيانات عميل للتحرير
  const sampleCustomer = {
    name: 'أحمد محمد',
    phone: '01012345678',
    email: 'ahmed@example.com',
    customerType: 'monthly' as CustomerType,
    notes: 'عميل مميز'
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          مثال على النموذج المحسن
        </h1>
        <p className="text-stone-600 dark:text-stone-400">
          جرب النموذج الجديد مع جميع التحسينات
        </p>
      </div>

      {/* أزرار للاختبار */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setEditingCustomer(null)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          نموذج جديد
        </button>
        <button
          onClick={() => setEditingCustomer(sampleCustomer)}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          تحرير عميل
        </button>
      </div>

      {/* النموذج المحسن */}
      <div className="bg-white dark:bg-stone-800 rounded-lg shadow-lg p-6">
        <CustomerFormV3
          initialData={editingCustomer}
          customerTypes={customerTypes}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>

      {/* معلومات إضافية */}
      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
        <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
          المزايا الجديدة:
        </h3>
        <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
          <li>• تحقق من صحة البيانات في الوقت الفعلي</li>
          <li>• مؤشرات بصرية لحالة النموذج</li>
          <li>• رسائل خطأ واضحة ومفيدة</li>
          <li>• تعطيل الأزرار عند وجود أخطاء</li>
          <li>• تصميم محسن وسهل الاستخدام</li>
        </ul>
      </div>
    </div>
  )
}