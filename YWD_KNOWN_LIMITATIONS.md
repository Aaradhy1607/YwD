# YwD — Known Limitations & Strategic Roadmap

**Document Version:** 1.0.0  
**Effective Date:** November 11, 2026  
**Audience:** Founders, Engineering Leadership, Campus Operations Team  

---

## 1. Operational Realities vs. Future Enhancements

To maintain transparency, reliability, and trust among students and equipment owners, this document outlines current boundaries and identifies when advanced capabilities should be introduced.

### 1.1 Payment Escrow vs. Regulated Bank Escrow
- **Current State:** YwD operates an internal platform ledger escrow system. Customer payments (rental fee + security deposit) are collected via Razorpay into the merchant account. Security deposits are tracked in the database (`RentalBooking.escrowStatus = 'HELD'`) and are never transferred to the product owner during the active loan. Upon verified return, the deposit is initiated for refund via the payment gateway.
- **Limitation:** This is not a segregated escrow trust account licensed by the Reserve Bank of India (RBI).
- **Roadmap:** For regional expansion across Delhi and multiple universities, partner with an RBI-regulated escrow trustee (e.g., Castler / ICICI Escrow) or implement Razorpay Route with nodal account segregation.

### 1.2 Automated Payouts & Refund Settlement Speed
- **Current State:** Refunds are initiated through the standard Razorpay refund API. Depending on the student's issuing bank and payment method (UPI vs. debit card), refunds reflect in 15 minutes (instant UPI rails) to 3–5 banking days (card networks).
- **Limitation:** Instant 1-second UPI refunds cannot be guaranteed for 100% of banking networks without an active Razorpay Payouts (X) wallet balance.
- **Roadmap:** Integrate Razorpay Payouts API once campus transaction volumes warrant maintaining a pre-funded operational float account.

### 1.3 Physical Campus Smart Lockers vs. Designated Handover Hubs
- **Current State:** Handovers take place in-person at designated campus handover points (e.g., Academic Library Annex, Central Equipment Desk, North Campus Hub Block B) verified via dual 6-digit OTP and 4-angle condition photos.
- **Limitation:** Automated IoT electronic locker hubs with RFID or BLE smart locks are not yet physically installed on campus.
- **Roadmap:** Pilot smart locker hardware integration in Phase 2 in partnership with university campus facilities.

### 1.4 Peer-to-Peer Messaging Transport
- **Current State:** Confidential Relay messaging operates via REST polling over HTTP with client-side polling intervals.
- **Limitation:** High-frequency chat exchanges may feel slightly less instantaneous than persistent WebSocket connections.
- **Roadmap:** Upgrade transport layer to Neon Realtime, Server-Sent Events (SSE), or Pusher/Supabase realtime channels once concurrent active chat sessions exceed 500 active users.

### 1.5 Automated AI Condition Inspection
- **Current State:** Inspection requires 4-angle photographic capture (front, display, ports, serial number) uploaded at pickup and return. Photos are stored for human arbitration in case of disputes.
- **Limitation:** Automated computer vision (AI difference comparison) does not automatically debit security deposits without human confirmation.
- **Policy:** This is an intentional safety guardrail: no student's money should ever be deducted based solely on an unverified computer vision model without administrator review.

