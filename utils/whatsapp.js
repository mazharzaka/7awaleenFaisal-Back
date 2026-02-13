/**
 * WhatsApp Utility Functions for Backend
 * Generates WhatsApp messages and links for orders
 */

/**
 * Format order details for WhatsApp message (Arabic)
 * @param {Object} order - Order object from database
 * @returns {String} Formatted WhatsApp message
 */
function generateWhatsAppMessage(order) {
  let message = "السلام عليكم، لدي طلب جديد عبر موقع 7awaleen:\n\n";

  // Order number
  if (order._id) {
    message += `رقم الطلب: ${order._id}\n\n`;
  }

  // Products
  message += "📦 *المنتجات:*\n";
  if (order.items && order.items.length > 0) {
    order.items.forEach((item, index) => {
      const productName = item.productId?.name || item.productName || "منتج";
      message += `${index + 1}. ${productName}\n`;
      message += `   الكمية: ${item.qty}\n`;
      message += `   السعر: ${item.price.toLocaleString("ar-EG")} جنيه\n\n`;
    });
  }

  // Total
  message += `💰 *الإجمالي:* ${order.total.toLocaleString("ar-EG")} جنيه\n\n`;

  // Customer info
  message += "👤 *معلومات العميل:*\n";
  if (order.customerInfo) {
    message += `الاسم: ${order.customerInfo.name}\n`;
    message += `الهاتف: ${order.customerInfo.phone}\n`;
    if (order.customerInfo.address) {
      message += `العنوان: ${order.customerInfo.address}\n`;
    }
  } else if (order.userId) {
    message += `معرف العميل: ${order.userId}\n`;
  }

  // Address (if separate field)
  if (order.address && !order.customerInfo?.address) {
    message += `العنوان: ${order.address}\n`;
  }

  // Notes
  if (order.note) {
    message += `\n📝 *ملاحظات:* ${order.note}`;
  }

  // Payment method
  if (order.paymentMethod) {
    const paymentMethodArabic = {
      whatsapp: "واتساب",
      cash: "الدفع عند الاستلام",
      card: "بطاقة ائتمان",
      wallet: "محفظة إلكترونية",
    };
    message += `\n💳 *طريقة الدفع:* ${paymentMethodArabic[order.paymentMethod] || order.paymentMethod}`;
  }

  return message;
}

/**
 * Generate WhatsApp link with pre-filled message
 * @param {String} phoneNumber - Store/business phone number
 * @param {String} message - Pre-filled message
 * @returns {String} WhatsApp link
 */
function generateWhatsAppLink(phoneNumber, message) {
  const encodedMessage = encodeURIComponent(message);
  // Remove any non-numeric characters from phone number
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Format single product for quick WhatsApp order
 * @param {Object} product - Product object
 * @param {Number} quantity - Quantity (default: 1)
 * @returns {String} Formatted message
 */
function formatProductForWhatsApp(product, quantity = 1) {
  const total = product.finalPrice * quantity;
  return `السلام عليكم، أريد طلب:\n\n📦 ${product.name}\nالكمية: ${quantity}\nالسعر: ${product.finalPrice.toLocaleString("ar-EG")} جنيه\n\nالمجموع: ${total.toLocaleString("ar-EG")} جنيه`;
}

module.exports = {
  generateWhatsAppMessage,
  generateWhatsAppLink,
  formatProductForWhatsApp,
};
