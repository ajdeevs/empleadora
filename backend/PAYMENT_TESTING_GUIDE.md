# Payment Contract Testing Guide

This guide provides comprehensive instructions for testing your payment/escrow contracts and ensuring they're working correctly.

## Prerequisites

1. **Server Running**: Make sure your backend server is running on `http://localhost:5000`
2. **Contract Deployed**: Ensure your Escrow contract is deployed and address is set in `.env`
3. **Admin Wallet Funded**: Admin wallet should have sufficient balance for transactions
4. **Database Connected**: PostgreSQL database should be running and migrated

## Payment Flow Overview

```
1. Create Project → 2. Fund Milestone → 3. Deliver Work → 4. Approve/Dispute → 5. Release/Refund
```

## Automated Testing

### Run Complete Payment Test Suite
```bash
cd backend
node test-payment-flow.js
```

This will test:
- ✅ Contract deployment status
- ✅ Project creation
- ✅ Milestone delivery
- ✅ Dispute creation
- ✅ Refund processing
- ✅ Invalid payment scenarios
- ✅ Database consistency

## Manual Testing Steps

### Step 1: Check Contract Status
```bash
curl -X GET http://localhost:5000/admin/status
```

**Expected Response**:
```json
{
  "contract_address": "0x...",
  "network_name": "Avalanche Fuji",
  "network_chain_id": "43113",
  "contract_deployed": true,
  "admin_wallet": "0x...",
  "admin_balance_eth": "1.5",
  "contract_code_size": 1234
}
```

### Step 2: Create a Project
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

**Expected Response**:
```json
{
  "id": 1,
  "onchain_pid": "1",
  "clientId": 1,
  "freelancerId": 2,
  "disputed": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "milestones": [
    {
      "id": 1,
      "mid": 0,
      "amount_wei": "1000000000000000000",
      "funded": false,
      "released": false
    },
    {
      "id": 2,
      "mid": 1,
      "amount_wei": "2000000000000000000",
      "funded": false,
      "released": false
    }
  ]
}
```

### Step 3: Deliver Milestone
```bash
curl -X POST http://localhost:5000/milestones/1/deliver \
  -H "Content-Type: application/json" \
  -d '{"file": "test-deliverable.txt"}'
```

**Expected Response**:
```json
{
  "milestone": {
    "id": 1,
    "deliverable_cid": "bafybeihq..."
  },
  "cid": "bafybeihq..."
}
```

### Step 4: Create Dispute (if needed)
```bash
curl -X POST http://localhost:5000/admin/dispute \
  -H "Content-Type: application/json" \
  -d '{"pid": 1}'
```

**Expected Response**:
```json
{
  "status": "dispute raised",
  "tx": "0x..."
}
```

### Step 5: Process Refund (after dispute)
```bash
curl -X POST http://localhost:5000/admin/refund \
  -H "Content-Type: application/json" \
  -d '{"pid": 1, "mid": 0}'
```

**Expected Response**:
```json
{
  "status": "refunded",
  "tx": "0x..."
}
```

## Blockchain-Specific Testing

### 1. Contract Deployment Test
```bash
# Check if contract is deployed
curl -X GET http://localhost:5000/admin/status | jq '.contract_deployed'
```

### 2. Wallet Balance Test
```bash
# Check admin wallet balance
curl -X GET http://localhost:5000/admin/status | jq '.admin_balance_eth'
```

### 3. Contract Interaction Test
```bash
# Test dispute creation (requires deployed contract)
curl -X POST http://localhost:5000/admin/dispute \
  -H "Content-Type: application/json" \
  -d '{"pid": 1}'
```

## Testing Scenarios

### Scenario 1: Happy Path (Successful Payment)
1. Create project with milestones
2. Fund milestone (blockchain)
3. Deliver work
4. Approve milestone (blockchain)
5. Verify payment to freelancer

### Scenario 2: Dispute Path (Refund)
1. Create project with milestones
2. Fund milestone (blockchain)
3. Create dispute
4. Process refund (blockchain)
5. Verify refund to client

### Scenario 3: Invalid Scenarios
1. **Invalid Project ID**: Try to create project with negative ID
2. **Invalid Amounts**: Try to create project with invalid amounts
3. **Missing Parameters**: Try to create project without required fields
4. **Unauthorized Access**: Try to access admin endpoints without proper auth

## Contract Function Testing

### Test Contract Functions Directly

If you have Hardhat set up, you can test contract functions directly:

```javascript
// In your Hardhat test file
const { ethers } = require("hardhat");

describe("Escrow Contract", function () {
  let escrow, client, freelancer, admin;
  
  beforeEach(async function () {
    [client, freelancer, admin] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy();
  });

  it("Should create project", async function () {
    const amounts = [ethers.parseEther("1"), ethers.parseEther("2")];
    await escrow.connect(client).createProject(freelancer.address, amounts);
    const project = await escrow.projects(0);
    expect(project.client).to.equal(client.address);
  });

  it("Should fund milestone", async function () {
    const amounts = [ethers.parseEther("1")];
    await escrow.connect(client).createProject(freelancer.address, amounts);
    await escrow.connect(client).fundMilestone(0, 0, { value: ethers.parseEther("1") });
    const milestone = await escrow.projects(0).milestones(0);
    expect(milestone.funded).to.be.true;
  });
});
```

## Database Consistency Testing

### Check Database State
```sql
-- Check projects
SELECT * FROM "Project" WHERE onchain_pid = 1;

-- Check milestones
SELECT * FROM "Milestone" WHERE "projectId" = 1;

-- Check users
SELECT * FROM "User" WHERE wallet_address = '0x1234567890123456789012345678901234567890';
```

## Performance Testing

### Load Testing Payment Endpoints
```bash
# Test project creation under load
ab -n 100 -c 10 -p project_data.json -T application/json http://localhost:5000/projects

# Test milestone delivery under load
ab -n 100 -c 10 -p delivery_data.json -T application/json http://localhost:5000/milestones/1/deliver
```

## Security Testing

### 1. Input Validation
```bash
# Test SQL injection
curl -X POST http://localhost:5000/projects \
  -H "Content-Type: application/json" \
  -d '{"onchain_pid": "1; DROP TABLE Project; --"}'

# Test XSS
curl -X POST http://localhost:5000/projects \
  -H "Content-Type: application/json" \
  -d '{"client_wallet": "<script>alert(\"xss\")</script>"}'
```

### 2. Authorization Testing
```bash
# Test admin endpoints without proper auth
curl -X POST http://localhost:5000/admin/dispute \
  -H "Content-Type: application/json" \
  -d '{"pid": 1}'
```

### 3. Rate Limiting
```bash
# Test rate limiting (if implemented)
for i in {1..100}; do
  curl -X GET http://localhost:5000/admin/status
done
```

## Troubleshooting

### Common Issues

1. **Contract Not Deployed**
   ```
   Error: Contract not deployed
   Solution: Deploy contract and update CONTRACT_ADDRESS in .env
   ```

2. **Insufficient Balance**
   ```
   Error: insufficient funds
   Solution: Fund the admin wallet with test tokens
   ```

3. **Database Connection Failed**
   ```
   Error: Database update error
   Solution: Check DATABASE_URL and run migrations
   ```

4. **Invalid Contract Address**
   ```
   Error: Contract connection failed
   Solution: Verify CONTRACT_ADDRESS is correct
   ```

### Debugging Steps

1. **Check Environment Variables**
   ```bash
   echo $CONTRACT_ADDRESS
   echo $PRIVATE_KEY_ADMIN
   echo $DATABASE_URL
   ```

2. **Check Server Logs**
   ```bash
   npm start
   # Watch for error messages
   ```

3. **Test Contract Directly**
   ```bash
   npx hardhat test
   ```

4. **Check Database State**
   ```bash
   psql $DATABASE_URL -c "SELECT * FROM \"Project\";"
   ```

## Monitoring Payment Events

### Track Contract Events
```javascript
// Listen for payment events
contract.on("MilestoneFunded", (projectId, milestoneId, amount, event) => {
  console.log(`Milestone ${milestoneId} funded for project ${projectId} with ${amount} wei`);
});

contract.on("MilestoneReleased", (projectId, milestoneId, to, amount, event) => {
  console.log(`Milestone ${milestoneId} released to ${to} for ${amount} wei`);
});
```

## Testing Checklist

- [ ] Contract is deployed and accessible
- [ ] Admin wallet has sufficient balance
- [ ] Database is connected and migrated
- [ ] Project creation works
- [ ] Milestone delivery works
- [ ] Dispute creation works
- [ ] Refund processing works
- [ ] Invalid inputs are rejected
- [ ] Database consistency is maintained
- [ ] Contract events are emitted correctly
- [ ] Payment amounts are correct
- [ ] Gas costs are reasonable
- [ ] Security measures are in place

## Next Steps

1. **Deploy Contract**: If not already deployed
2. **Fund Admin Wallet**: Add test tokens to admin wallet
3. **Run Tests**: Execute the test suite
4. **Monitor Events**: Set up event monitoring
5. **Load Test**: Test under realistic load
6. **Security Audit**: Review for vulnerabilities
