// controllers/orderController.js
import asyncHandler from 'express-async-handler';
import Order from '../Models/Order.js';
import nodemailer from 'nodemailer';

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 })
  res.json(orders);
 
});

export const createOrder = asyncHandler(async (req, res) => {
  const {
    customerName,
    phone,
    customerEmail,
    wilaya,
    address,
    deliveryType,    
    store,
    deliveryPrice,
    items
  } = req.body;

  // Validation
  if (!customerName || !phone || !wilaya || !deliveryType || !store || !items || items.length === 0) {
    res.status(400);
    throw new Error('Please fill all required fields: name, phone, wilaya, store, items');
  }

  if (deliveryType === 'home' && !address) {
    res.status(400);
    throw new Error('Address is required for home delivery');
  }


  const subtotal =  items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const totalPrice = (subtotal + (deliveryPrice || 0));

  // Create order
  const order = await Order.create({
    customerName: customerName.trim(),
    phone: phone.trim(),
    customerEmail: customerEmail ? customerEmail.trim() : null,
    wilaya,
    address: deliveryType === 'home' ? address.trim() : null,
    deliveryType,
    store: store,
    deliveryPrice: deliveryPrice || 0,
    items,
    subtotal,
    totalPrice,
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    message: "Order placed successfully! We will call you soon to confirm.",
    orderId: order._id
  });
});


// Controllers/orderController.js (only updateOrderStatus part)

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  const validStatuses = ['pending', 'confirmed', 'in_delivery', 'reached', 'canceled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Statut invalide" });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Commande non trouvée" });
  }

  const oldStatus = order.status;
  order.status = status;
  await order.save();

  console.log(`Order ${order._id} changed: ${oldStatus} -> ${status}`);

  // -------- Email logic --------
  if (order.customerEmail && oldStatus !== status) {
    // 1. Prepare Content FIRST to avoid initialization errors
    const statusLabels = {
      pending: { fr: "En attente", ar: "في الانتظار" },
      confirmed: { fr: "Confirmée", ar: "مؤكدة" },
      in_delivery: { fr: "En livraison", ar: "في التوصيل" },
      reached: { fr: "Livrée", ar: "تم التوصيل" },
      canceled: { fr: "Annulée", ar: "ملغاة" }
    };

    const currentStatus = statusLabels[order.status];
    const orderIdShort = order._id.toString().slice(-6).toUpperCase();
    const subject = `Mise à jour de votre commande #${orderIdShort}`;

   const html = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #f9f9f9;">
    
    <!-- French Section -->
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="color: #111; font-size: 24px; margin-bottom: 10px;">Mise à jour de votre commande</h2>
      <p style="font-size: 16px; color: #333;">Bonjour <strong>${order.customerName}</strong>,</p>
      <p style="font-size: 16px; color: #333;">Nous vous informons que le statut de votre commande a été mis à jour :</p>
      <h3 style="background-color: #111; color: #fff; padding: 12px 20px; border-radius: 8px; display: inline-block; margin: 15px 0; font-size: 18px;">
        ${currentStatus.fr}
      </h3>
      <p style="font-size: 16px; color: #333;">Numéro de commande : <strong>#${orderIdShort}</strong></p>
      <p style="font-size: 14px; color: #777; margin-top: 10px;">Merci de votre confiance !</p>
    </div>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />

    <!-- Arabic Section -->
    <div style="text-align: center; direction: rtl; margin-bottom: 20px;">
      <h2 style="color: #111; font-size: 24px; margin-bottom: 10px;">تحديث طلبك</h2>
      <p style="font-size: 16px; color: #333;">مرحباً <strong>${order.customerName}</strong>،</p>
      <p style="font-size: 16px; color: #333;">نود إعلامك بأن حالة طلبك قد تم تحديثها:</p>
      <h3 style="background-color: #111; color: #fff; padding: 12px 20px; border-radius: 8px; display: inline-block; margin: 15px 0; font-size: 18px;">
        ${currentStatus.ar}
      </h3>
      <p style="font-size: 16px; color: #333;">رقم الطلب: <strong>#${orderIdShort}</strong></p>
      <p style="font-size: 14px; color: #777; margin-top: 10px;">شكراً لثقتك بنا!</p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">
      <p>© ${new Date().getFullYear()} ${order.store}. Tous droits réservés / جميع الحقوق محفوظة.</p>
    </div>
  </div>
`;


    // 2. Transporter configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // 3. Send Email (using .then/.catch so it doesn't block the API response)
    transporter.sendMail({
      from: `"${order.store || 'Store'}" <${process.env.EMAIL_USER}>`,
      to: order.customerEmail,
      subject,
      html,
    })
    .then(info => console.log("Email sent:", info.response))
    .catch(err => console.error("Email error:", err.message));
  }

  // Response is sent immediately while email sends in background
  res.json({
    success: true,
    order
  });
});
