const Order = require("../models/order.model");
const WOrder = require("../models/whatsapp");
const dayjs = require("dayjs");

// Helper to get date filter
const getDateFilter = (days) => {
  if (!days || days === "all") return {};
  let startDate;
  if (days === "today") {
    startDate = dayjs().startOf("day").toDate();
  } else {
    startDate = dayjs().subtract(parseInt(days), "day").startOf("day").toDate();
  }
  return { createdAt: { $gte: startDate } };
};

exports.getStats = async (req, res) => {
  try {
    const { days, paymentMethod } = req.query;
    const dateFilter = getDateFilter(days);
    
    // Base filter
    const filter = { ...dateFilter };
    if (paymentMethod && paymentMethod !== "all") {
      filter.paymentMethod = paymentMethod;
    }

    // 1. Order Analytics (Total, Completed, Pending, Cancelled)
    // We combine standard orders and whatsapp orders
    const standardStats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$total" }
        }
      }
    ]);

    const whatsappStats = await WOrder.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$finalPrice" }
        }
      }
    ]);

    // Map statuses to categories
    const categories = {
      total: 0,
      completed: 0,
      pending: 0,
      cancelled: 0,
      revenue: 0
    };

    standardStats.forEach(s => {
      categories.total += s.count;
      categories.revenue += s.totalValue;
      if (s._id === "delivered") categories.completed += s.count;
      else if (s._id === "cancelled" || s._id === "refunded") categories.cancelled += s.count;
      else categories.pending += s.count;
    });

    whatsappStats.forEach(s => {
      categories.total += s.count;
      categories.revenue += s.totalValue;
      if (s._id === "done") categories.completed += s.count;
      else if (s._id === "rejected") categories.cancelled += s.count;
      else categories.pending += s.count;
    });

    // 2. Orders by Status (Pie Chart)
    const statusDistribution = {};
    standardStats.forEach(s => {
      statusDistribution[s._id] = (statusDistribution[s._id] || 0) + s.count;
    });
    whatsappStats.forEach(s => {
      statusDistribution[s._id] = (statusDistribution[s._id] || 0) + s.count;
    });

    // 3. Payment Methods (Bar Chart)
    const paymentStats = await Promise.all([
      Order.aggregate([
        { $match: filter },
        { $group: { _id: "$paymentMethod", count: { $sum: 1 } } }
      ]),
      WOrder.aggregate([
        { $match: filter },
        { $group: { _id: "$paymentMethod", count: { $sum: 1 } } }
      ])
    ]);

    const paymentMethods = {};
    paymentStats.flat().forEach(p => {
      const method = p._id || "unknown";
      paymentMethods[method] = (paymentMethods[method] || 0) + p.count;
    });

    // 4. Shipping Methods (Bar Chart) - Derived since field is missing
    // Logic: If deliveryPartnerId exists, it's "Partner", else if it's whatsapp it's "Self/Pickup", else "Standard"
    const standardShipping = await Order.aggregate([
      { $match: filter },
      {
        $project: {
          method: {
            $cond: {
              if: { $ifNull: ["$deliveryPartnerId", false] },
              then: "Partner Delivery",
              else: "Standard Shipping"
            }
          }
        }
      },
      { $group: { _id: "$method", count: { $sum: 1 } } }
    ]);
    const whatsappShipping = await WOrder.aggregate([
        { $match: filter },
        { $group: { _id: { $literal: "WhatsApp/Self" }, count: { $sum: 1 } } }
    ]);

    const shippingMethods = {};
    standardShipping.forEach(s => shippingMethods[s._id] = s.count);
    whatsappShipping.forEach(s => shippingMethods[s._id] = (shippingMethods[s._id] || 0) + s.count);

    // 5. Recent Orders
    const [recentStandard, recentWhatsapp] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).limit(5).populate("userId customerInfo"),
      WOrder.find(filter).sort({ createdAt: -1 }).limit(5).populate("productId")
    ]);

    const combinedRecent = [...recentStandard.map(o => ({
      id: o._id,
      customer: o.customerInfo?.name || "User",
      total: o.total,
      status: o.status,
      payment: o.paymentStatus || o.paymentMethod,
      date: o.createdAt,
      type: "standard"
    })), ...recentWhatsapp.map(o => ({
      id: o._id,
      customer: o.name,
      total: o.finalPrice,
      status: o.status,
      payment: o.paymentMethod,
      date: o.createdAt,
      type: "whatsapp"
    }))].sort((a,b) => b.date - a.date).slice(0, 10);

    // 6. Order Performance (Chart Data)
    // We group by day for the last N days
    const performanceFilter = days === "today" ? getDateFilter(1) : dateFilter;
    const performance = await getPerformanceData(performanceFilter);

    res.status(200).json({
      analytics: categories,
      statusDistribution,
      paymentMethods,
      shippingMethods,
      recentOrders: combinedRecent,
      performance
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function getPerformanceData(filter) {
    // This is a simplified version grouping by day
    const standard = await Order.aggregate([
        { $match: filter },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 },
                revenue: { $sum: "$total" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const whatsapp = await WOrder.aggregate([
        { $match: filter },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 },
                revenue: { $sum: "$finalPrice" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Merge them
    const daily = {};
    standard.forEach(d => {
        daily[d._id] = { name: d._id, current: d.count, revenue: d.revenue };
    });
    whatsapp.forEach(d => {
        if (daily[d._id]) {
            daily[d._id].current += d.count;
            daily[d._id].revenue += d.revenue;
        } else {
            daily[d._id] = { name: d._id, current: d.count, revenue: d.revenue };
        }
    });

    return Object.values(daily).sort((a,b) => a.name.localeCompare(b.name));
}
