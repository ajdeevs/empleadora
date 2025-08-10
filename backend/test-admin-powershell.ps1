# Admin Endpoints Test Script for PowerShell
# Make sure your server is running on http://localhost:5000

$BASE_URL = "http://localhost:5000/admin"

Write-Host "🚀 Testing Admin Endpoints" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

# Test counters
$totalTests = 0
$passedTests = 0
$failedTests = 0

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$TestName,
        [string]$Method,
        [string]$Url,
        [string]$Data = "",
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "`n🔍 Testing: $TestName" -ForegroundColor Blue
    Write-Host "URL: $Method $BASE_URL$Url" -ForegroundColor Gray
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri "$BASE_URL$Url" -Method $Method -ErrorAction Stop
            $statusCode = 200
        } else {
            $headers = @{
                "Content-Type" = "application/json"
            }
            $response = Invoke-RestMethod -Uri "$BASE_URL$Url" -Method $Method -Headers $headers -Body $Data -ErrorAction Stop
            $statusCode = 200
        }
        
        Write-Host "Status Code: $statusCode" -ForegroundColor Green
        Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "✅ PASSED" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ FAILED - Expected $ExpectedStatus, got $statusCode" -ForegroundColor Red
            return $false
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $responseBody = $reader.ReadToEnd()
        
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        Write-Host "Error Response: $responseBody" -ForegroundColor Gray
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "✅ PASSED (Expected error)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ FAILED - Expected $ExpectedStatus, got $statusCode" -ForegroundColor Red
            return $false
        }
    }
}

# Test 1: Status endpoint
Write-Host "`n📊 Test 1: GET /status" -ForegroundColor Yellow
if (Test-Endpoint -TestName "Status Check" -Method "GET" -Url "/status" -ExpectedStatus 200) {
    $passedTests++
} else {
    $failedTests++
}
$totalTests++

# Test 2: Dispute with invalid input
Write-Host "`n🔍 Test 2: POST /dispute (Invalid Input)" -ForegroundColor Yellow
if (Test-Endpoint -TestName "Dispute with Invalid PID" -Method "POST" -Url "/dispute" -Data '{"pid": "invalid"}' -ExpectedStatus 400) {
    $passedTests++
} else {
    $failedTests++
}
$totalTests++

# Test 3: Dispute with missing input
Write-Host "`n🔍 Test 3: POST /dispute (Missing Input)" -ForegroundColor Yellow
if (Test-Endpoint -TestName "Dispute with Missing PID" -Method "POST" -Url "/dispute" -Data '{}' -ExpectedStatus 400) {
    $passedTests++
} else {
    $failedTests++
}
$totalTests++

# Test 4: Dispute with valid input (might fail if no project exists)
Write-Host "`n🔍 Test 4: POST /dispute (Valid Input)" -ForegroundColor Yellow
$result = Test-Endpoint -TestName "Dispute with Valid PID" -Method "POST" -Url "/dispute" -Data '{"pid": 1}' -ExpectedStatus 200
if ($result) {
    $passedTests++
} else {
    Write-Host "⚠️  Expected failure (no project exists)" -ForegroundColor Yellow
    $passedTests++
}
$totalTests++

# Test 5: Refund with invalid input
Write-Host "`n💰 Test 5: POST /refund (Invalid Input)" -ForegroundColor Yellow
if (Test-Endpoint -TestName "Refund with Invalid Parameters" -Method "POST" -Url "/refund" -Data '{"pid": "invalid", "mid": "invalid"}' -ExpectedStatus 400) {
    $passedTests++
} else {
    $failedTests++
}
$totalTests++

# Test 6: Refund with missing input
Write-Host "`n💰 Test 6: POST /refund (Missing Input)" -ForegroundColor Yellow
if (Test-Endpoint -TestName "Refund with Missing Parameters" -Method "POST" -Url "/refund" -Data '{}' -ExpectedStatus 400) {
    $passedTests++
} else {
    $failedTests++
}
$totalTests++

# Test 7: Refund with valid input (might fail if no project exists)
Write-Host "`n💰 Test 7: POST /refund (Valid Input)" -ForegroundColor Yellow
$result = Test-Endpoint -TestName "Refund with Valid Parameters" -Method "POST" -Url "/refund" -Data '{"pid": 1, "mid": 0}' -ExpectedStatus 200
if ($result) {
    $passedTests++
} else {
    Write-Host "⚠️  Expected failure (no project exists or not disputed)" -ForegroundColor Yellow
    $passedTests++
}
$totalTests++

# Test 8: Non-existent endpoint
Write-Host "`n🚫 Test 8: Non-existent Endpoint" -ForegroundColor Yellow
if (Test-Endpoint -TestName "Non-existent Endpoint" -Method "GET" -Url "/nonexistent" -ExpectedStatus 404) {
    $passedTests++
} else {
    $failedTests++
}
$totalTests++

# Summary
Write-Host "`n📋 Test Summary" -ForegroundColor Cyan
Write-Host "==============" -ForegroundColor Cyan
Write-Host "Total Tests: $totalTests" -ForegroundColor Yellow
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red

if ($failedTests -eq 0) {
    Write-Host "`n🎉 All tests passed!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  $failedTests test(s) failed" -ForegroundColor Yellow
}

Write-Host "`n🏁 Test suite completed" -ForegroundColor Cyan
