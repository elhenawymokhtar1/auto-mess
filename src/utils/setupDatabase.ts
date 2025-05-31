import { supabase } from '@/integrations/supabase/client';

// إنشاء جدول المنتجات وإدراج بيانات تجريبية
export const setupProductsTable = async () => {
  try {
    console.log('🔄 Setting up products table...');

    // إنشاء جدول المنتجات
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS products (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          description TEXT,
          color VARCHAR(100) NOT NULL,
          category VARCHAR(100) NOT NULL,
          image_url TEXT,
          is_available BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- إنشاء فهارس للبحث السريع
        CREATE INDEX IF NOT EXISTS idx_products_color ON products(color);
        CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
        CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
        CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

        -- إنشاء trigger لتحديث updated_at تلقائياً
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_products_updated_at
            BEFORE UPDATE ON products
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
      `
    });

    if (createError) {
      console.error('Error creating products table:', createError);
      return false;
    }

    console.log('✅ Products table created successfully');

    // إدراج بيانات تجريبية
    const sampleProducts = [
      {
        name: 'حذاء رياضي أبيض كلاسيك',
        price: 450.00,
        description: 'حذاء رياضي مريح للاستخدام اليومي، مصنوع من مواد عالية الجودة',
        color: 'أبيض',
        category: 'رياضي',
        image_url: 'https://files.easy-orders.net/1744641208557436357.jpg'
      },
      {
        name: 'حذاء رياضي أبيض عصري',
        price: 550.00,
        description: 'حذاء رياضي بتصميم عصري ومواد متطورة',
        color: 'أبيض',
        category: 'رياضي',
        image_url: 'https://files.easy-orders.net/1744641208557436357.jpg'
      },
      {
        name: 'حذاء كلاسيك أبيض رسمي',
        price: 750.00,
        description: 'حذاء كلاسيك أنيق مناسب للمناسبات الرسمية',
        color: 'أبيض',
        category: 'كلاسيك',
        image_url: 'https://files.easy-orders.net/1744641208557436357.jpg'
      },
      {
        name: 'حذاء كاجوال أبيض مريح',
        price: 320.00,
        description: 'حذاء كاجوال مريح للاستخدام اليومي',
        color: 'أبيض',
        category: 'كاجوال',
        image_url: 'https://files.easy-orders.net/1744641208557436357.jpg'
      },
      {
        name: 'حذاء رياضي أسود أنيق',
        price: 480.00,
        description: 'حذاء رياضي أسود أنيق ومريح',
        color: 'أسود',
        category: 'رياضي',
        image_url: 'https://files.easy-orders.net/1723117580290608498.jpg'
      },
      {
        name: 'حذاء كلاسيك بني جلد',
        price: 680.00,
        description: 'حذاء كلاسيك بني من الجلد الطبيعي',
        color: 'بني',
        category: 'كلاسيك',
        image_url: 'https://files.easy-orders.net/1739181695020677812.jpg'
      },
      {
        name: 'حذاء رياضي أحمر جذاب',
        price: 520.00,
        description: 'حذاء رياضي أحمر بتصميم جذاب وعصري',
        color: 'أحمر',
        category: 'رياضي',
        image_url: 'https://files.easy-orders.net/1744720320703143217.jpg'
      },
      {
        name: 'حذاء رياضي أزرق مميز',
        price: 490.00,
        description: 'حذاء رياضي أزرق بتصميم مميز ومريح',
        color: 'أزرق',
        category: 'رياضي',
        image_url: 'https://files.easy-orders.net/1723117554054321721.jpg'
      }
    ];

    // التحقق من وجود منتجات مسبقاً
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing products:', checkError);
      return false;
    }

    if (existingProducts && existingProducts.length > 0) {
      console.log('✅ Products already exist, skipping sample data insertion');
      return true;
    }

    // إدراج البيانات التجريبية
    const { error: insertError } = await supabase
      .from('products')
      .insert(sampleProducts);

    if (insertError) {
      console.error('Error inserting sample products:', insertError);
      return false;
    }

    console.log('✅ Sample products inserted successfully');
    return true;

  } catch (error) {
    console.error('Error setting up products table:', error);
    return false;
  }
};

// إعداد نظام المنتجات مع المتغيرات
export const setupProductsVariantsSystem = async () => {
  try {
    console.log('🔄 Setting up products variants system...');

    // إنشاء الجداول الجديدة
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        -- جدول المنتجات الأساسي
        CREATE TABLE IF NOT EXISTS products_base (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100) NOT NULL,
          base_price DECIMAL(10,2) NOT NULL,
          brand VARCHAR(100),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- جدول متغيرات المنتجات
        CREATE TABLE IF NOT EXISTS product_variants (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          product_id UUID NOT NULL REFERENCES products_base(id) ON DELETE CASCADE,
          color VARCHAR(100) NOT NULL,
          size VARCHAR(50) NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          stock_quantity INTEGER DEFAULT 0,
          sku VARCHAR(100) UNIQUE,
          image_url TEXT,
          is_available BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(product_id, color, size)
        );

        -- إنشاء فهارس
        CREATE INDEX IF NOT EXISTS idx_products_base_category ON products_base(category);
        CREATE INDEX IF NOT EXISTS idx_products_base_active ON products_base(is_active);
        CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
        CREATE INDEX IF NOT EXISTS idx_product_variants_color ON product_variants(color);
        CREATE INDEX IF NOT EXISTS idx_product_variants_size ON product_variants(size);
        CREATE INDEX IF NOT EXISTS idx_product_variants_available ON product_variants(is_available);

        -- trigger لتحديث updated_at
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_products_base_updated_at
            BEFORE UPDATE ON products_base
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER update_product_variants_updated_at
            BEFORE UPDATE ON product_variants
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        -- view للمنتجات مع متغيراتها
        CREATE OR REPLACE VIEW products_with_variants AS
        SELECT
            pb.id as product_id,
            pb.name as product_name,
            pb.description,
            pb.category,
            pb.base_price,
            pb.brand,
            pb.is_active as product_active,
            pv.id as variant_id,
            pv.color,
            pv.size,
            pv.price as variant_price,
            pv.stock_quantity,
            pv.sku,
            pv.image_url,
            pv.is_available as variant_available,
            pb.created_at as product_created_at,
            pv.created_at as variant_created_at
        FROM products_base pb
        LEFT JOIN product_variants pv ON pb.id = pv.product_id
        WHERE pb.is_active = true
        ORDER BY pb.created_at DESC, pv.color, pv.size;
      `
    });

    if (createError) {
      console.error('Error creating products variants tables:', createError);
      return false;
    }

    console.log('✅ Products variants tables created successfully');

    // التحقق من وجود بيانات تجريبية
    const { data: existingProducts, error: checkError } = await supabase
      .from('products_base')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing products:', checkError);
      return false;
    }

    if (existingProducts && existingProducts.length > 0) {
      console.log('✅ Products variants data already exists');
      return true;
    }

    // إدراج بيانات تجريبية
    const sampleProducts = [
      {
        name: 'حذاء رياضي عصري',
        description: 'حذاء رياضي مريح بتصميم عصري مناسب للاستخدام اليومي والرياضة',
        category: 'رياضي',
        base_price: 450.00,
        brand: 'سبورت لايف'
      },
      {
        name: 'حذاء كلاسيك أنيق',
        description: 'حذاء كلاسيك من الجلد الطبيعي مناسب للمناسبات الرسمية',
        category: 'كلاسيك',
        base_price: 750.00,
        brand: 'إليجانت'
      }
    ];

    const { data: insertedProducts, error: insertError } = await supabase
      .from('products_base')
      .insert(sampleProducts)
      .select();

    if (insertError) {
      console.error('Error inserting sample products:', insertError);
      return false;
    }

    // إدراج متغيرات تجريبية
    const variants = [];
    const colors = ['أبيض', 'أسود', 'أحمر'];
    const sizes = ['40', '41', '42', '43'];
    const imageUrls = {
      'أبيض': 'https://files.easy-orders.net/1744641208557436357.jpg',
      'أسود': 'https://files.easy-orders.net/1723117580290608498.jpg',
      'أحمر': 'https://files.easy-orders.net/1744720320703143217.jpg'
    };

    for (const product of insertedProducts) {
      for (const color of colors) {
        for (const size of sizes) {
          variants.push({
            product_id: product.id,
            color,
            size,
            price: product.base_price + (color === 'أحمر' ? 20 : 0),
            stock_quantity: Math.floor(Math.random() * 10) + 1,
            image_url: imageUrls[color] || '',
            is_available: true
          });
        }
      }
    }

    const { error: variantsError } = await supabase
      .from('product_variants')
      .insert(variants);

    if (variantsError) {
      console.error('Error inserting variants:', variantsError);
      return false;
    }

    console.log('✅ Sample products variants inserted successfully');
    return true;

  } catch (error) {
    console.error('Error setting up products variants system:', error);
    return false;
  }
};

// إعداد نظام الفئات
export const setupCategoriesSystem = async () => {
  try {
    console.log('🔄 Setting up categories system...');

    // إنشاء جدول الفئات
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        -- جدول الفئات
        CREATE TABLE IF NOT EXISTS product_categories (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          icon VARCHAR(50),
          color VARCHAR(20),
          is_active BOOLEAN DEFAULT true,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- إنشاء فهارس
        CREATE INDEX IF NOT EXISTS idx_product_categories_name ON product_categories(name);
        CREATE INDEX IF NOT EXISTS idx_product_categories_active ON product_categories(is_active);
        CREATE INDEX IF NOT EXISTS idx_product_categories_sort ON product_categories(sort_order);

        -- trigger لتحديث updated_at
        CREATE OR REPLACE FUNCTION update_categories_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_product_categories_updated_at
            BEFORE UPDATE ON product_categories
            FOR EACH ROW
            EXECUTE FUNCTION update_categories_updated_at();

        -- view لعرض الفئات مع إحصائيات
        CREATE OR REPLACE VIEW categories_with_stats AS
        SELECT
            pc.id,
            pc.name,
            pc.description,
            pc.icon,
            pc.color,
            pc.is_active,
            pc.sort_order,
            pc.created_at,
            pc.updated_at,
            COALESCE(COUNT(pb.id), 0) as total_products,
            COALESCE(COUNT(CASE WHEN pb.is_active = true THEN 1 END), 0) as active_products,
            COALESCE(SUM(pv.stock_quantity), 0) as total_stock
        FROM product_categories pc
        LEFT JOIN products_base pb ON pb.category = pc.name
        LEFT JOIN product_variants pv ON pv.product_id = pb.id AND pv.is_available = true
        GROUP BY pc.id, pc.name, pc.description, pc.icon, pc.color, pc.is_active, pc.sort_order, pc.created_at, pc.updated_at
        ORDER BY pc.sort_order, pc.name;
      `
    });

    if (createError) {
      console.error('Error creating categories tables:', createError);
      return false;
    }

    console.log('✅ Categories tables created successfully');

    // التحقق من وجود فئات
    const { data: existingCategories, error: checkError } = await supabase
      .from('product_categories')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing categories:', checkError);
      return false;
    }

    if (existingCategories && existingCategories.length > 0) {
      console.log('✅ Categories already exist');
      return true;
    }

    // إدراج الفئات الافتراضية
    const defaultCategories = [
      {
        name: 'رياضي',
        description: 'أحذية رياضية ومناسبة للتمارين والأنشطة الرياضية',
        icon: 'activity',
        color: 'blue',
        sort_order: 1
      },
      {
        name: 'كلاسيك',
        description: 'أحذية كلاسيكية أنيقة مناسبة للمناسبات الرسمية',
        icon: 'crown',
        color: 'purple',
        sort_order: 2
      },
      {
        name: 'كاجوال',
        description: 'أحذية كاجوال مريحة للاستخدام اليومي',
        icon: 'coffee',
        color: 'green',
        sort_order: 3
      },
      {
        name: 'رسمي',
        description: 'أحذية رسمية فاخرة للمناسبات المهمة',
        icon: 'briefcase',
        color: 'gray',
        sort_order: 4
      }
    ];

    const { error: insertError } = await supabase
      .from('product_categories')
      .insert(defaultCategories);

    if (insertError) {
      console.error('Error inserting default categories:', insertError);
      return false;
    }

    console.log('✅ Default categories inserted successfully');
    return true;

  } catch (error) {
    console.error('Error setting up categories system:', error);
    return false;
  }
};

// دالة لتشغيل الإعداد
export const initializeDatabase = async () => {
  console.log('🚀 Initializing database...');

  // إعداد النظام القديم
  const oldSystemSuccess = await setupProductsTable();

  // إعداد النظام الجديد
  const newSystemSuccess = await setupProductsVariantsSystem();

  // إعداد نظام الفئات
  const categoriesSuccess = await setupCategoriesSystem();

  if (oldSystemSuccess && newSystemSuccess && categoriesSuccess) {
    console.log('🎉 Database initialization completed successfully!');
  } else {
    console.error('❌ Database initialization failed!');
  }

  return oldSystemSuccess && newSystemSuccess && categoriesSuccess;
};
