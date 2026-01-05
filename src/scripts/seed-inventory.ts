import { INVENTORY_ITEMS } from "@/shared/constants/inventory-items";
import { api } from "@/lib/tauri-api";

/**
 * Script لإضافة المنتجات الأساسية لقاعدة البيانات
 * يتم تشغيله مرة واحدة لتهيئة المخزون
 */
export async function seedInventory() {
  console.log("🌱 بدء تهيئة المخزون...");

  try {
    // جلب المنتجات الموجودة
    const existingItems = await api.inventory.list();
    const existingNames = existingItems.map((item) => item.name);

    let addedCount = 0;
    let skippedCount = 0;

    for (const item of INVENTORY_ITEMS) {
      // التحقق من وجود المنتج (بالعربية والإنجليزية)
      const existsAr = existingNames.includes(item.nameAr);
      const existsEn = existingNames.includes(item.nameEn);

      if (!existsAr && !existsEn) {
        // إضافة المنتج بالاسم العربي كافتراضي
        await api.inventory.create({
          name: item.nameAr,
          quantity: 0, // يبدأ بصفر، سيتم تحديثه يدوياً
          minStock: 5,
          price: item.defaultPrice,
        });

        console.log(`✅ تم إضافة: ${item.nameAr} (${item.nameEn})`);
        addedCount++;
      } else {
        console.log(`⏭️ موجود مسبقاً: ${item.nameAr} (${item.nameEn})`);
        skippedCount++;
      }
    }

    console.log(`\n🎉 تم الانتهاء من تهيئة المخزون:`);
    console.log(`   - تم إضافة: ${addedCount} منتج`);
    console.log(`   - تم تخطي: ${skippedCount} منتج (موجود مسبقاً)`);
    console.log(`   - الإجمالي: ${INVENTORY_ITEMS.length} منتج`);

    return { addedCount, skippedCount, total: INVENTORY_ITEMS.length };
  } catch (error) {
    console.error("❌ خطأ في تهيئة المخزون:", error);
    throw error;
  }
}

/**
 * تحديث أسعار المنتجات الموجودة حسب القائمة الثابتة
 */
export async function updateInventoryPrices() {
  console.log("💰 بدء تحديث الأسعار...");

  try {
    const existingItems = await api.inventory.list();
    let updatedCount = 0;

    for (const dbItem of existingItems) {
      // البحث عن المنتج في القائمة الثابتة
      const staticItem = INVENTORY_ITEMS.find(
        (item) => item.nameAr === dbItem.name || item.nameEn === dbItem.name,
      );

      if (staticItem && dbItem.price !== staticItem.defaultPrice) {
        await api.inventory.update(dbItem.id, {
          name: dbItem.name,
          quantity: dbItem.quantity,
          minStock: dbItem.minStock,
          price: staticItem.defaultPrice,
        });

        console.log(`💰 تم تحديث سعر ${dbItem.name}: ${dbItem.price} ← ${staticItem.defaultPrice}`);
        updatedCount++;
      }
    }

    console.log(`\n✅ تم تحديث ${updatedCount} سعر`);
    return updatedCount;
  } catch (error) {
    console.error("❌ خطأ في تحديث الأسعار:", error);
    throw error;
  }
}

// تشغيل التهيئة إذا تم استدعاء الملف مباشرة
if (typeof window !== "undefined") {
  // في البيئة المتصفح، يمكن استدعاء الدوال من console
  (window as any).seedInventory = seedInventory;
  (window as any).updateInventoryPrices = updateInventoryPrices;

  console.log("🔧 تم تحميل أدوات تهيئة المخزون:");
  console.log("   - seedInventory() - لإضافة المنتجات الأساسية");
  console.log("   - updateInventoryPrices() - لتحديث الأسعار");
}
