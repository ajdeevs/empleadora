# API Endpoint Testing Guide

Your server is running on: http://localhost:5000

## Available Endpoints:

### 1. Create Project
**POST** `/projects`
```bash
curl -X POST http://localhost:5000/projects \
  -H "Content-Type: application/json" \
  -d '{
    "onchain_pid": 1,
    "client_wallet": "0x1234567890123456789012345678901234567890",
    "freelancer_wallet": "0x0987654321098765432109876543210987654321",
    "amounts_wei": ["1000000000000000000", "2000000000000000000"]
  }'
```

### 2. Upload Milestone Deliverable
**POST** `/milestones/:id/deliver`
```bash
curl -X POST http://localhost:5000/milestones/1/deliver \
  -H "Content-Type: application/json" \
  -d '{
    "file": "test-file-path.txt"
  }'
```

### 3. Admin Dispute (Required before refund)
**POST** `/admin/dispute`
```bash
curl -X POST http://localhost:5000/admin/dispute \
  -H "Content-Type: application/json" \
  -d '{
    "pid": 1
  }'
```

### 4. Admin Refund (After dispute)
**POST** `/admin/refund`
```bash
curl -X POST http://localhost:5000/admin/refund \
  -H "Content-Type: application/json" \
  -d '{
    "pid": 1,
    "mid": 0
  }'
```

## Testing with Postman:
1. Open Postman
2. Create a new request
3. Set method to POST
4. Use the URLs above
5. Set Content-Type: application/json in headers
6. Copy the JSON data to the body (raw JSON)

## Refund Process:
1. First call `/admin/dispute` to mark project as disputed
2. Then call `/admin/refund` to process the refund

## Expected Issues:
- Database connection needed for /projects endpoint
- IPFS service needed for /milestones/:id/deliver
- Web3 wallet setup needed for admin endpoints
- Project must be disputed before refund can be processed