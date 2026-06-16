const db = require("../config/db");

/* ======================================================
   GET BOOKING / RESERVATION CHARGES
====================================================== */
const getBookingCharges = (req, res) => {
  const bookingId = Number(req.params.id);

  if (!bookingId) {
    return res.status(400).json({ message: "Invalid booking ID." });
  }

  const sql = `
    SELECT
      id,
      booking_id,
      charge_name,
      charge_amount,
      charge_note,
      COALESCE(is_paid, 0) AS is_paid,
      paid_at,
      created_at
    FROM booking_charges
    WHERE booking_id = ?
    ORDER BY created_at DESC, id DESC
  `;

  db.query(sql, [bookingId], (err, rows) => {
    if (err) {
      console.error("getBookingCharges error:", err);
      return res.status(500).json({ message: "Failed to load charges." });
    }

    const total = rows.reduce(
      (sum, item) => sum + Number(item.charge_amount || 0),
      0,
    );

    const unpaidTotal = rows.reduce((sum, item) => {
      return Number(item.is_paid || 0) === 1
        ? sum
        : sum + Number(item.charge_amount || 0);
    }, 0);

    return res.json({
      charges: rows,
      total,
      unpaidTotal,
      paid: rows.length > 0 && unpaidTotal <= 0,
    });
  });
};

/* ======================================================
   ADD BOOKING / RESERVATION CHARGE
====================================================== */
const addBookingCharge = (req, res) => {
  const bookingId = Number(req.params.id);
  const chargeName = String(req.body.charge_name || "").trim();
  const chargeAmount = Number(req.body.charge_amount || 0);
  const chargeNote = String(req.body.charge_note || "").trim();

  if (!bookingId) {
    return res.status(400).json({ message: "Invalid booking ID." });
  }

  if (!chargeName) {
    return res.status(400).json({ message: "Charge name is required." });
  }

  if (!chargeAmount || chargeAmount <= 0) {
    return res.status(400).json({
      message: "Charge amount must be greater than zero.",
    });
  }

  const checkSql = `
    SELECT id FROM reservations WHERE id = ?
    LIMIT 1
  `;

  db.query(checkSql, [bookingId], (checkErr, rows) => {
    if (checkErr) {
      console.error("addBookingCharge check error:", checkErr);
      return res.status(500).json({ message: "Failed to verify booking." });
    }

    if (!rows.length) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    const insertSql = `
      INSERT INTO booking_charges
        (booking_id, charge_name, charge_amount, charge_note, is_paid, paid_at)
      VALUES (?, ?, ?, ?, 0, NULL)
    `;

    db.query(
      insertSql,
      [bookingId, chargeName, chargeAmount, chargeNote || null],
      (insertErr, result) => {
        if (insertErr) {
          console.error("addBookingCharge insert error:", insertErr);
          return res.status(500).json({
            message: "Failed to add charge.",
          });
        }

        return res.status(201).json({
          message: "Charge added successfully.",
          charge: {
            id: result.insertId,
            booking_id: bookingId,
            charge_name: chargeName,
            charge_amount: chargeAmount,
            charge_note: chargeNote || null,
            is_paid: 0,
            paid_at: null,
          },
        });
      },
    );
  });
};

/* ======================================================
   MARK ALL BOOKING CHARGES AS PAID
====================================================== */
const markBookingChargesPaid = (req, res) => {
  const bookingId = Number(req.params.id);

  if (!bookingId) {
    return res.status(400).json({ message: "Invalid booking ID." });
  }

  const sql = `
    UPDATE booking_charges
    SET
      is_paid = 1,
      paid_at = NOW()
    WHERE booking_id = ?
      AND COALESCE(is_paid, 0) = 0
  `;

  db.query(sql, [bookingId], (err, result) => {
    if (err) {
      console.error("markBookingChargesPaid error:", err);
      return res.status(500).json({
        message: "Failed to mark charges as paid.",
      });
    }

    return res.json({
      message:
        result.affectedRows > 0
          ? "Additional charges marked as paid."
          : "No unpaid additional charges found.",
      affectedRows: result.affectedRows,
    });
  });
};

/* ======================================================
   DELETE BOOKING CHARGE
====================================================== */
const deleteBookingCharge = (req, res) => {
  const chargeId = Number(req.params.chargeId);

  if (!chargeId) {
    return res.status(400).json({ message: "Invalid charge ID." });
  }

  const sql = `DELETE FROM booking_charges WHERE id = ?`;

  db.query(sql, [chargeId], (err, result) => {
    if (err) {
      console.error("deleteBookingCharge error:", err);
      return res.status(500).json({ message: "Failed to delete charge." });
    }

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Charge not found." });
    }

    return res.json({ message: "Charge deleted successfully." });
  });
};

module.exports = {
  getBookingCharges,
  addBookingCharge,
  markBookingChargesPaid,
  deleteBookingCharge,
};