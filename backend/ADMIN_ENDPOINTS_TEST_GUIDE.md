# Admin Endpoints Test Guide

This guide provides comprehensive testing instructions for all admin endpoints in the `admin.js` file.

## Prerequisites

1. **Server Running**: Make sure your backend server is running on `http://localhost:5000`
2. **Environment Setup**: Ensure your `.env` file has the required variables:
   - `PRIVATE_KEY_ADMIN`
   - `CONTRACT_ADDRESS`
   - `DATABASE_URL`

## Available Endpoints

### 1. GET `/admin/status`
**Purpose**: Check contract and admin wallet status

**Test Command**:
```bash
curl -X GET http://localhost:5000/admin/status
```

**Expected Response** (200 OK):
```json
{
  "contract_address": "0x...",
  "network_name": "Avalanche Fuji",
  "network_chain_id": "43113",
  "contract_deployed": true,
  "admin_wallet": "0x...",
  "admin_balance_eth": "0.123",
  "contract_code_size": 1234
}
```

**Test Cases**:
- ✅ Should return contract status
- ✅ Should show admin wallet address
- ✅ Should show network information

---

### 2. POST `/admin/dispute`
**Purpose**: Raise a dispute for a project (required before refund)

**Test Command**:
```bash
curl -X POST http://localhost:5000/admin/dispute \
  -H "Content-Type: application/json" \
  -d '{"pid": 1}'
```

**Test Cases**:

#### 2.1 Invalid Input (Expected: 400 Bad Request)
```bash
# Invalid PID
curl -X POST http://localhost:5000/admin/dispute \
  -H "Content-Type: application/json" \
  -d '{"pid": "invalid"}'

# Missing PID
curl -X POST http://localhost:5000/admin/dispute \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response** (400 Bad Request):
```json
{
  "error": "Invalid pid parameter"
}
```

#### 2.2 Valid Input (Expected: 200 OK)
```bash
curl -X POST http://localhost:5000/admin/dispute \
  -H "Content-Type: application/json" \
  -d '{"pid": 1}'
```

**Expected Response** (200 OK):
```json
{
  "status": "dispute raised",
  "tx": "0x..."
}
```

**Note**: This will fail if no project exists with PID 1, which is expected behavior.

---

### 3. POST `/admin/refund`
**Purpose**: Process refund for a milestone (requires project to be disputed first)

**Test Command**:
```bash
curl -X POST http://localhost:5000/admin/refund \
  -H "Content-Type: application/json" \
  -d '{"pid": 1, "mid": 0}'
```

**Test Cases**:

#### 3.1 Invalid Input (Expected: 400 Bad Request)
```bash
# Invalid parameters
curl -X POST http://localhost:5000/admin/refund \
  -H "Content-Type: application/json" \
  -d '{"pid": "invalid", "mid": "invalid"}'

# Missing parameters
curl -X POST http://localhost:5000/admin/refund \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response** (400 Bad Request):
```json
{
  "error": "Missing or invalid pid or mid parameter"
}
```

#### 3.2 Valid Input (Expected: 200 OK)
```bash
curl -X POST http://localhost:5000/admin/refund \
  -H "Content-Type: application/json" \
  -d '{"pid": 1, "mid": 0}'
```

**Expected Response** (200 OK):
```json
{
  "status": "refunded",
  "tx": "0x..."
}
```

**Note**: This will fail if:
- No project exists with PID 1
- Project is not disputed (call `/admin/dispute` first)
- Milestone doesn't exist

---

## Automated Testing

### Option 1: Node.js Test Script
```bash
cd backend
node test-admin-endpoints.js
```

### Option 2: PowerShell Script (Windows)
```powershell
cd backend
.\test-admin-powershell.ps1
```

### Option 3: Bash Script (Linux/Mac)
```bash
cd backend
./test-admin-curl.sh
```

## Manual Testing with Postman

### 1. Status Check
- **Method**: GET
- **URL**: `http://localhost:5000/admin/status`
- **Headers**: None required
- **Body**: None

### 2. Dispute Project
- **Method**: POST
- **URL**: `http://localhost:5000/admin/dispute`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "pid": 1
}
```

### 3. Refund Milestone
- **Method**: POST
- **URL**: `http://localhost:5000/admin/refund`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "pid": 1,
  "mid": 0
}
```

## Expected Error Scenarios

### 1. Contract Not Deployed
**Error**: `Contract not deployed`
**Solution**: Check `CONTRACT_ADDRESS` in `.env` file

### 2. Contract Connection Failed
**Error**: `Contract connection failed`
**Solution**: Check network connection and RPC URL

### 3. Project Not Found
**Error**: `Project not found`
**Solution**: Create a project first or use existing project ID

### 4. Project Not Disputed
**Error**: `Project must be disputed before refund`
**Solution**: Call `/admin/dispute` first, then `/admin/refund`

### 5. Milestone Not Found
**Error**: `Milestone not found`
**Solution**: Use valid milestone ID

## Testing Checklist

- [ ] Server is running on port 5000
- [ ] Environment variables are set
- [ ] Database is connected
- [ ] Contract is deployed
- [ ] Admin wallet has sufficient balance
- [ ] Test status endpoint
- [ ] Test dispute with invalid input
- [ ] Test dispute with missing input
- [ ] Test dispute with valid input
- [ ] Test refund with invalid input
- [ ] Test refund with missing input
- [ ] Test refund with valid input
- [ ] Test non-existent endpoint

## Troubleshooting

### Common Issues:

1. **Server not running**
   ```
   Error: connect ECONNREFUSED
   Solution: Start the server with `npm start`
   ```

2. **Contract not deployed**
   ```
   Error: Contract not deployed
   Solution: Deploy contract and update CONTRACT_ADDRESS
   ```

3. **Database connection failed**
   ```
   Error: Database update error
   Solution: Check DATABASE_URL and run migrations
   ```

4. **Insufficient admin balance**
   ```
   Error: insufficient funds
   Solution: Fund the admin wallet
   ```

## Performance Testing

For load testing, you can use tools like:
- **Apache Bench**: `ab -n 100 -c 10 http://localhost:5000/admin/status`
- **Artillery**: Create a test scenario file
- **Postman**: Use the collection runner

## Security Testing

- [ ] Test with invalid admin credentials
- [ ] Test with malformed JSON
- [ ] Test with oversized payloads
- [ ] Test with SQL injection attempts
- [ ] Test with XSS payloads
- [ ] Test rate limiting (if implemented)
