# Notification Transaction Detection

This backend now supports parsing raw notification text (bank/shop/restaurant/SMS/push) and converting it into transactions.

## 1) Send notification text to backend

`POST /api/expenses/notifications/ingest`

Body:
```json
{
  "message": "INR 850 debited from A/c XX1234 at Zomato on 26-Mar"
}
```

What backend detects:
- `amount` (e.g. 850)
- `type` (`debit`/`credit`)
- `category` (Food, Travel, Shopping, Bills, Entertainment, Others, Income)
- `merchant` (best-effort from text)

## 2) Get credit/debit + category summary

`GET /api/expenses/notifications/summary`

Response:
```json
{
  "totalCredited": 12000,
  "totalDebited": 3450,
  "spendingByCategory": {
    "Food": 1800,
    "Travel": 900,
    "Bills": 750
  },
  "transactionCount": 23
}
```

## 3) Mobile listener integration (next step)

Your app's mobile layer should read incoming SMS/push/app notifications and call the ingest API.
For Android React Native, this is usually done with a native notification listener service and then posting message text to the endpoint above.
<<<<<<< codex/locate-real-time-transaction-notifications-6xvbir


## Important

Backend cannot directly read SMS/bank app notifications from your phone.
You must run a mobile notification listener (Android native service) that forwards each message to `POST /api/expenses/notifications/ingest`.
=======
>>>>>>> main
