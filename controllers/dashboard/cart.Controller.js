import { Op, Sequelize } from "sequelize";
import {
  Order,
  OrderItem,
  User,
  Product,
  ProductVariantCombination,
  Wishlist,
} from "../../models/index.js";

/* =====================================================
   GET ONLINE ORDERS (LIST)
===================================================== */
export const getOnlineOrders = async (req, res) => {
  try {
    const { page = 1, perPage = 10, search = "", status = "all" } = req.query;

    const limit = Number(perPage);
    const offset = (page - 1) * limit;

    const where = {};

    if (status !== "all") {
      where.order_status = status;
    }

    if (search) {
      where[Op.or] = [
        { id: { [Op.like]: `%${search}%` } },
        { payment_id: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows, count } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "phone"],
        },
        {
          model: OrderItem,
          as: "items",
          attributes: ["price", "quantity"],
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name"],
            },
            {
              model: ProductVariantCombination,
              as: "variant",
              attributes: ["id", "sku"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      status: true,
      data: rows,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
      },
    });
  } catch (err) {
    console.error("ONLINE ORDERS ERROR:", err);
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

export const getOnlineOrderStats = async (req, res) => {
  try {
    const [totalOrders, totalRevenue, pendingOrders, completedOrders] =
      await Promise.all([
        Order.count(),
        Order.sum("total_amount", {
          where: { payment_status: "paid" },
        }),
        Order.count({
          where: { order_status: "placed" },
        }),
        Order.count({
          where: { order_status: "completed" },
        }),
      ]);

    return res.json({
      status: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue || 0,
        pendingOrders,
        completedOrders,
      },
    });
  } catch (err) {
    console.error("ORDER STATS ERROR:", err);
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

export const getOnlineOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["phone"],
        },
        {
          model: OrderItem,
          as: "items",
          attributes: ["price", "quantity"],
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["name"],
            },
            {
              model: ProductVariantCombination,
              as: "variant",
              attributes: ["sku"],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        status: false,
        message: "Order not found",
      });
    }

    return res.json({
      status: true,
      data: order,
    });
  } catch (err) {
    console.error("ORDER DETAIL ERROR:", err);
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status } = req.body;

    // ✅ Allowed statuses (match your business logic)
    const allowedStatuses = [
      "placed",
      "bill_sent",
      "ready",
      "in_transit",
      "completed",
      "cancelled",
    ];

    if (!order_status) {
      return res.status(400).json({
        status: false,
        message: "Order status is required",
      });
    }

    if (!allowedStatuses.includes(order_status)) {
      return res.status(400).json({
        status: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        status: false,
        message: "Order not found",
      });
    }

    await order.update({ order_status });

    return res.json({
      status: true,
      message: "Order status updated successfully",
      data: {
        id: order.id,
        order_status: order.order_status,
      },
    });
  } catch (err) {
    console.error("UPDATE ORDER STATUS ERROR:", err);
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

export const getOrderStatusCounts = async (req, res) => {
  try {
    const rows = await Order.findAll({
      attributes: [
        "order_status",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: ["order_status"],
    });

    // normalize response
    const counts = {
      all: 0,
      placed: 0,
      bill_sent: 0,
      ready: 0,
      in_transit: 0,
      completed: 0,
      others: 0,
    };

    rows.forEach((row) => {
      const status = row.order_status;
      const count = Number(row.get("count"));

      counts.all += count;

      if (counts[status] !== undefined) {
        counts[status] = count;
      } else {
        counts.others += count;
      }
    });

    return res.json({
      status: true,
      data: counts,
    });
  } catch (err) {
    console.error("STATUS COUNT ERROR:", err);
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

export const getAccountSummary = async (req, res) => {
  try {
    const userId = req.users.id; // from token middleware

    const [totalOrders, wishlistCount, user] = await Promise.all([
      Order.count({ where: { user_id: userId } }),
      Wishlist.count({ where: { user_id: userId } }),
      User.findByPk(userId, {
        attributes: ["created_at"],
      }),
    ]);

    return res.json({
      status: true,
      data: {
        totalOrders,
        wishlistCount,
        memberSince: user.created_at,
      },
    });
  } catch (err) {
    console.error("ACCOUNT SUMMARY ERROR:", err);
    res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};
