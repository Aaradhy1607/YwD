# Temporary UPI Payment Flow (No Gateway)

This flow is for a **temporary pilot only**: small amounts and people you trust. For a real launch, add Cashfree or Razorpay later.

---

## 1. Flow at a glance

1. The student taps **"Pay ₹650"** (rent + deposit).
2. Their UPI app opens with your UPI ID and the amount already filled in.
3. After paying, the student taps **"I have paid"**.
4. The order status becomes **PENDING**.
5. You check your bank or UPI app to confirm the money arrived.
6. On the admin screen you tap **"Mark as paid"**, and the status becomes **ACTIVE**.
7. When the item is returned, the owner enters the damage amount.
8. The app shows: `refund = deposit - damage`.
9. You send the refund to the student by UPI and tap **"Mark as refunded"**.

---

## 2. Order statuses

```
CREATED -> PENDING -> ACTIVE -> INSPECT -> REFUNDED
                 \-> REJECTED (if the money never arrived)
```

| Status | Meaning |
|---|---|
| CREATED | Order created, student has not paid yet |
| PENDING | Student tapped "I have paid", your check is pending |
| ACTIVE | You confirmed the money, rental is running |
| INSPECT | Item is back, damage is being checked |
| REFUNDED | Deposit (minus damage) has been sent back |
| REJECTED | Money not received, order cancelled |

---

## 3. UPI pay link

This button opens the student's UPI app on a phone, with the amount already filled in.

```html
<a href="upi://pay?pa=YOURUPI@bank&pn=CampusRentals&am=650.00&cu=INR&tn=ORDER-1042">
  Pay ₹650
</a>
```

| Part | Meaning |
|---|---|
| `pa` | Your UPI ID (for example `name@okhdfcbank`) |
| `pn` | Your name or business name |
| `am` | Amount (rent + deposit) |
| `cu` | Currency, always `INR` |
| `tn` | Note. Use a different order number for every order so you can match it in your bank statement |

Important:
- This link works **on phones only**. For laptops, show your own **UPI QR image**.
- Always put the order number in `tn`. You will use it to match payments in your bank app.
- Set the amount **on the backend**, not in the student's browser, so nobody can change it.

---

## 4. Student screen

- Order summary: Rent, Deposit (refundable), Total.
- A **Pay ₹650** button (the UPI link) and the UPI QR.
- An **I have paid** button. Tapping it sets the status to PENDING.
- A message: "Your rental becomes active after the payment is verified."

---

## 5. Admin screen

A list of pending orders. Each row shows:

- Order number, student name, amount, time.
- **Mark as paid** button (status becomes ACTIVE).
- **Reject** button (status becomes REJECTED).

How to verify:
1. Open your bank or UPI app.
2. Match the order number (the `tn` note) and the amount.
3. Tap **Mark as paid** only if both match.
4. Never trust a screenshot alone.

---

## 6. Return and refund

1. The owner checks the item and enters the damage amount. Damage can never be more than the deposit.
2. The app shows: `refund = deposit - damage`.
3. You send the refund to the student's UPI ID.
4. You tap **Mark as refunded**. The status becomes REFUNDED and a ledger entry is saved.

Example: deposit ₹500, damage ₹120, so the refund is ₹380.

---

## 7. What to store in the database

**rentals**

| Field | Type |
|---|---|
| id | text |
| student_name | text |
| student_upi | text |
| item_id | text |
| rent_paise | integer |
| deposit_paise | integer |
| damage_paise | integer (default 0) |
| status | text |
| created_at | timestamp |

**ledger** (one entry for every money event)

| Field | Type |
|---|---|
| id | integer |
| rental_id | text |
| event | text (PAID, DAMAGE, REFUNDED) |
| amount_paise | integer |
| note | text |
| created_at | timestamp |

Always store money as **integer paise**, never as decimals.

---

## 8. Safety rules (please follow these)

- This is for a **small pilot only**: low amounts and people you know.
- Keep a **record** of every payment and refund (the ledger).
- **Do not spend** the deposit money. Keep it separate, ideally in a different bank account.
- Never rely on a screenshot. Always check your own bank.
- Keep students' UPI IDs and details private.
- State clearly on the platform: "This is a pilot, payments are verified manually."
- This money may count as your income. Check with a **CA**.
- A bank can flag a personal account that receives many business-style payments.

---

## 9. Prompt for your AI coding tool (copy and paste)

```
In my existing project, add a temporary manual UPI payment flow. Do not use any payment gateway.

1. Add rentals and ledger tables (money as integer paise). Statuses: CREATED, PENDING, ACTIVE, INSPECT, REFUNDED, REJECTED.
2. Student checkout page: show rent, deposit, total. A "Pay" button with a upi://pay link (pa, pn, am, cu=INR, tn=order id) built on the backend, plus my UPI QR image for desktop. An "I have paid" button that sets status PENDING.
3. Admin page (admin-only): list PENDING orders with "Mark as paid" (ACTIVE) and "Reject" buttons.
4. Return flow: owner enters damage (cannot exceed deposit). Show refund = deposit - damage. Admin "Mark as refunded" sets REFUNDED and writes a ledger row.
5. Show a visible "Pilot mode: payments are verified manually" banner.
6. Validate all inputs on the server, never trust amounts from the browser, and restrict admin routes.
```

---

## 10. Moving to a gateway later

When you have HTTPS, KYC and approval:
- Add Cashfree or Razorpay (collect payments + payouts).
- Remove "I have paid" and the manual approval. A webhook will confirm payments automatically.
- Send refunds as instant UPI payouts.

The earlier `rental-cashfree.js` file is the next step.
