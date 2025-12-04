const mongoose = require("mongoose");

const categoriesData = {
  mobile_devices: {
    value: "اجهزة الموبايل والاكسسوارات",
    subcategories: [
      "جميع الموبايلات",
      "اجهزة التابلت",
      "ساعات ذكية",
      "الجرابات والاغطية",
      "باور بنك",
      "جميع اكسسوارات الموبايلات",
    ],
  },

  computers_office: {
    value: "اجهزة الكمبيوتر والمكتب",
    subcategories: [
      "جميع اجهزة الكمبيوتر",
      "اجهزة لاب توب",
      "اجهزة الكمبيوتر مكتبيه والشاشات",
      "محركات الاقراص والتخزين",
      "اجهزة الشبكات",
      "اجهزة الكيبورد والماوس",
      "جميع ملحقات الكمبيوتر",
    ],
  },

  office_supplies: {
    value: "مستلزمات المكتب",
    subcategories: ["الطابعات وملحقتها", "مستلزمات مكتبيه ومدرسية"],
  },

  women_fashion: {
    value: "موضة النساء",
    subcategories: [
      "ملابس",
      "ساعات",
      "ملابس رياضية",
      "ملابس النوم",
      "احذية",
      "الحقائب ومحافظ",
      "نظارات",
      "احذية رياضية",
      "حقائب سفر وظهر",
    ],
  },

  men_fashion: {
    value: "موضة الرجال",
    subcategories: [
      "ملابس",
      "ساعات",
      "ملابس رياضية",
      "ملابس النوم",
      "احذية",
      "الحقائب ومحافظ",
      "نظارات",
      "احذية رياضية",
      "حقائب سفر وظهر",
    ],
  },

  kids_fashion: {
    value: "موضة الاطفال",
    subcategories: ["ملابس", "احذية", "جميع حقائب المدرسية"],
  },

  home_supplies: {
    value: "مستلزمات المنزل",
    subcategories: [
      "مستلزمات المنزل",
      "الفراش والبياضات",
      "اكسسوارات الحمام",
      "مستلزمات التخزين",
      "اللوازم منزلية",
      "مستلزمات الحديقة واللوازم الخارجيه",
    ],
  },

  furniture: {
    value: "الاثاث",
    subcategories: ["غرفة معيشة", "غرفة النوم", "اثاث مكتبي"],
  },

  home_improvement: {
    value: "التحسينات المنزلية",
    subcategories: ["معدات يدوية", "اضاءات", "معدات كهرباية"],
  },

  books: {
    value: "الكتب",
    subcategories: ["كتب المنتشرة", "وادي الذئاب المنسية"],
  },

  electronics: {
    value: "الإلكترونيات",
    subcategories: [
      "التليفزيونات",
      "كاميرات",
      "السماعات",
      "مكبرات صوتية",
      "اكسسورات الالكتورنية",
      "ريسيفرات",
    ],
  },
};

const productSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "store",
      default: null,
    },

    name: {
      type: String,
      required: true,
    },

    desc: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },
    imageURL: {
      type: [String],
      required: true,
    },

    category: {
      type: String,
      enum: Object.keys(categoriesData),
      required: true,
    },

    subCategory: {
      type: String,
      required: true,
    },

    sale: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    Isadvertising: {
      type: Boolean,
      default: false,
    },

    stock: {
      type: Number,
      default: 0,
    },

    Isdeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
productSchema.pre("validate", function (next) {
  const validSubs = categoriesData[this.category].subcategories;
  if (validSubs && !validSubs.includes(this.subCategory)) {
    return next(
      new Error(
        `❌ Subcategory '${this.subCategory}' غير موجودة داخل category '${this.category}'`
      )
    );
  }
  next();
});
productSchema.virtual("finalPrice").get(function () {
  if (!this.sale || this.sale === 0) return this.price;
  return this.price - (this.price * this.sale) / 100;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });
module.exports = {
  Product: mongoose.model("product", productSchema),
  categoriesData,
};
