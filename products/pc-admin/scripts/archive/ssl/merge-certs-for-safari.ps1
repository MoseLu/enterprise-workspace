# Safari/iOS Certificate Chain Merger (PowerShell)
# Merge certificate files from certs directory for Safari compatibility

$ErrorActionPreference = "Stop"

$CertDir = Join-Path $PSScriptRoot "..\certs"
$OutputFile = Join-Path $CertDir "bellis.com.cn_bundle_safari.pem"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Safari/iOS Certificate Chain Merger" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check input files
Write-Host "1. Checking certificate files..." -ForegroundColor Yellow

$BundlePem = Join-Path $CertDir "bellis.com.cn_bundle.pem"
$BundleCrt = Join-Path $CertDir "bellis.com.cn_bundle.crt"
$KeyFile = Join-Path $CertDir "bellis.com.cn.key"

$SourceFile = $null

if (Test-Path $BundlePem) {
    Write-Host "   [OK] Found: bellis.com.cn_bundle.pem" -ForegroundColor Green
    $SourceFile = $BundlePem
} elseif (Test-Path $BundleCrt) {
    Write-Host "   [OK] Found: bellis.com.cn_bundle.crt" -ForegroundColor Green
    $SourceFile = $BundleCrt
} else {
    Write-Host "   [ERROR] bundle.pem or bundle.crt not found" -ForegroundColor Red
    exit 1
}

if (Test-Path $KeyFile) {
    Write-Host "   [OK] Found: bellis.com.cn.key" -ForegroundColor Green
} else {
    Write-Host "   [WARN] Key file not found (optional)" -ForegroundColor Yellow
}

Write-Host ""

# 2. Read certificate content
Write-Host "2. Reading certificate content..." -ForegroundColor Yellow

$CertContent = Get-Content $SourceFile -Raw -Encoding UTF8

# 3. Extract certificates
Write-Host "3. Extracting certificates..." -ForegroundColor Yellow

$CertPattern = "(?s)-----BEGIN CERTIFICATE-----.+?-----END CERTIFICATE-----"
$Matches = [regex]::Matches($CertContent, $CertPattern)

$CertCount = $Matches.Count
Write-Host "   Found $CertCount certificates" -ForegroundColor Cyan
Write-Host ""

# 4. Analyze each certificate
Write-Host "4. Analyzing certificates..." -ForegroundColor Yellow

$RootCertIndex = -1
$Certs = @()

for ($i = 0; $i -lt $CertCount; $i++) {
    $CertText = $Matches[$i].Value
    
    # Save to temp file for openssl analysis
    $TempCertFile = [System.IO.Path]::GetTempFileName()
    try {
        [System.IO.File]::WriteAllText($TempCertFile, $CertText, [System.Text.Encoding]::ASCII)
        
        # Use openssl to get certificate info (if available)
        if (Get-Command openssl -ErrorAction SilentlyContinue) {
            try {
                $Subject = & openssl x509 -in $TempCertFile -noout -subject 2>$null
                $Issuer = & openssl x509 -in $TempCertFile -noout -issuer 2>$null
                
                # Extract CN
                $SubjectCN = "Unknown"
                $IssuerCN = "Unknown"
                
                if ($Subject -match "CN\s*=\s*([^,]+)") {
                    $SubjectCN = $matches[1].Trim()
                }
                if ($Issuer -match "CN\s*=\s*([^,]+)") {
                    $IssuerCN = $matches[1].Trim()
                }
                
                Write-Host "   Certificate $($i+1): $SubjectCN" -ForegroundColor Cyan
                Write-Host "      Issuer: $IssuerCN" -ForegroundColor Gray
                
                # Check if root certificate (self-signed)
                if ($SubjectCN -eq $IssuerCN -and $SubjectCN -ne "Unknown") {
                    $RootCertIndex = $i
                    Write-Host "      [WARN] Root certificate (self-signed), will be excluded" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "   Certificate $($i+1): (Analysis failed)" -ForegroundColor Gray
            }
        } else {
            Write-Host "   Certificate $($i+1): (openssl not available)" -ForegroundColor Gray
        }
    } finally {
        Remove-Item $TempCertFile -ErrorAction SilentlyContinue
    }
    
    $Certs += $CertText
}

Write-Host ""

# 5. Build Safari-optimized certificate chain
Write-Host "5. Building Safari-optimized certificate chain..." -ForegroundColor Yellow

if ($RootCertIndex -ge 0) {
    $CertsToKeep = $RootCertIndex
    Write-Host "   Excluding root certificate (cert $($RootCertIndex+1)), keeping first $CertsToKeep certificates" -ForegroundColor Cyan
} elseif ($CertCount -ge 4) {
    # If 4 certificates, usually the last one is root certificate
    $CertsToKeep = 3
    Write-Host "   No obvious root certificate found, but certificate count >= 4" -ForegroundColor Cyan
    Write-Host "   Keeping first 3 certificates (usually: server cert + 2 intermediate certs)" -ForegroundColor Cyan
} else {
    $CertsToKeep = $CertCount
    Write-Host "   Keeping all $CertCount certificates" -ForegroundColor Cyan
}

# Merge certificates
$OutputContent = ""
for ($i = 0; $i -lt $CertsToKeep; $i++) {
    $OutputContent += $Certs[$i] + "`r`n`r`n"
}

# Save to file
$OutputContent = $OutputContent.TrimEnd()
[System.IO.File]::WriteAllText($OutputFile, $OutputContent, [System.Text.Encoding]::ASCII)

$FinalCount = ([regex]::Matches($OutputContent, "-----BEGIN CERTIFICATE-----")).Count
Write-Host "   [OK] New certificate chain contains $FinalCount certificates" -ForegroundColor Green
Write-Host ""

# 6. Verify (if openssl available)
if (Get-Command openssl -ErrorAction SilentlyContinue) {
    Write-Host "6. Verifying certificate chain..." -ForegroundColor Yellow
    try {
        $VerifyResult = & openssl verify -CAfile $OutputFile $OutputFile 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   [OK] Certificate chain verification passed!" -ForegroundColor Green
        } else {
            Write-Host "   [WARN] Certificate chain verification failed (this may be normal if root cert is missing)" -ForegroundColor Yellow
            Write-Host "   Verification output: $VerifyResult" -ForegroundColor Gray
            Write-Host "   Note: Safari does not need root certificate, verification failure may be normal" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   [WARN] Verification failed: $_" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Merge completed!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Output file: $OutputFile" -ForegroundColor Cyan
Write-Host "Certificates: $FinalCount" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Upload $OutputFile to server" -ForegroundColor White
Write-Host "2. Replace /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem" -ForegroundColor White
Write-Host "3. Reload nginx: nginx -s reload" -ForegroundColor White
Write-Host ""
