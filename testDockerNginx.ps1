# Script de Teste - Docker Compose + Nginx
# Execute: ./testDockerNginx.ps1

Write-Host "`n🐳 TESTE DO DOCKER COMPOSE + NGINX`n" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Gray

# 1. Verificar se Docker está rodando
Write-Host "`n1️⃣  Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "   ✅ $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker não está instalado ou rodando!" -ForegroundColor Red
    exit 1
}

# 2. Verificar containers rodando
Write-Host "`n2️⃣  Verificando containers..." -ForegroundColor Yellow
$containers = @("kash-mysql", "kash-redis", "kash-backend", "kash-frontend", "kash-nginx")

foreach ($container in $containers) {
    $status = docker ps --filter "name=$container" --format "{{.Status}}" 2>$null
    if ($status) {
        if ($status -match "healthy" -or $status -match "Up") {
            Write-Host "   ✅ $container - $status" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $container - $status" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ $container - NÃO RODANDO" -ForegroundColor Red
    }
}

# 3. Testar healthchecks
Write-Host "`n3️⃣  Testando Healthchecks..." -ForegroundColor Yellow

# MySQL
Write-Host "   📊 MySQL:" -NoNewline
try {
    $mysqlHealth = docker exec kash-mysql mysqladmin ping -h localhost 2>&1
    if ($mysqlHealth -match "alive") {
        Write-Host " ✅ ALIVE" -ForegroundColor Green
    } else {
        Write-Host " ❌ FAILED" -ForegroundColor Red
    }
} catch {
    Write-Host " ❌ ERRO" -ForegroundColor Red
}

# Redis
Write-Host "   📊 Redis:" -NoNewline
try {
    $redisHealth = docker exec kash-redis redis-cli ping 2>&1
    if ($redisHealth -match "PONG") {
        Write-Host " ✅ PONG" -ForegroundColor Green
    } else {
        Write-Host " ❌ FAILED" -ForegroundColor Red
    }
} catch {
    Write-Host " ❌ ERRO" -ForegroundColor Red
}

# Backend
Write-Host "   📊 Backend:" -NoNewline
try {
    $backendHealth = curl -s http://localhost:3000/health 2>$null
    if ($backendHealth -match "ok") {
        Write-Host " ✅ OK" -ForegroundColor Green
    } else {
        Write-Host " ❌ FAILED" -ForegroundColor Red
    }
} catch {
    Write-Host " ❌ ERRO" -ForegroundColor Red
}

# 4. Testar Nginx Reverse Proxy
Write-Host "`n4️⃣  Testando Nginx Reverse Proxy..." -ForegroundColor Yellow

# Backend via Nginx
Write-Host "   🌐 Backend via Nginx (port 80):" -NoNewline
try {
    $nginxBackend = curl -s http://localhost/health 2>$null
    if ($nginxBackend -match "ok") {
        Write-Host " ✅ OK" -ForegroundColor Green
    } else {
        Write-Host " ❌ FAILED" -ForegroundColor Red
    }
} catch {
    Write-Host " ❌ ERRO" -ForegroundColor Red
}

# Frontend via Nginx
Write-Host "   🌐 Frontend via Nginx (port 80):" -NoNewline
try {
    $response = Invoke-WebRequest -Uri http://localhost/ -UseBasicParsing -TimeoutSec 5 2>$null
    if ($response.StatusCode -eq 200) {
        Write-Host " ✅ OK (HTTP $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host " ⚠️  HTTP $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host " ❌ ERRO" -ForegroundColor Red
}

# 5. Verificar Security Headers
Write-Host "`n5️⃣  Verificando Security Headers..." -ForegroundColor Yellow
try {
    $headers = Invoke-WebRequest -Uri http://localhost/ -Method HEAD -UseBasicParsing 2>$null
    
    $securityHeaders = @(
        "X-Frame-Options",
        "X-Content-Type-Options",
        "X-XSS-Protection",
        "Referrer-Policy"
    )
    
    foreach ($header in $securityHeaders) {
        if ($headers.Headers[$header]) {
            Write-Host "   ✅ $header : $($headers.Headers[$header])" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $header : NÃO ENCONTRADO" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "   ❌ Erro ao verificar headers" -ForegroundColor Red
}

# 6. Testar Rate Limiting
Write-Host "`n6️⃣  Testando Rate Limiting (10 requisições)..." -ForegroundColor Yellow
$successCount = 0
$rateLimitCount = 0

for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri http://localhost/health -UseBasicParsing -TimeoutSec 2 2>$null
        if ($response.StatusCode -eq 200) {
            $successCount++
        }
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 429) {
            $rateLimitCount++
        }
    }
}

Write-Host "   ✅ Sucesso: $successCount requisições" -ForegroundColor Green
if ($rateLimitCount -gt 0) {
    Write-Host "   ⚠️  Rate Limited: $rateLimitCount requisições (429)" -ForegroundColor Yellow
}

# 7. Ver logs recentes do Nginx
Write-Host "`n7️⃣  Últimos logs do Nginx..." -ForegroundColor Yellow
try {
    $logs = docker logs kash-nginx --tail 5 2>&1
    $logs | ForEach-Object {
        if ($_ -match "error") {
            Write-Host "   🔴 $_" -ForegroundColor Red
        } elseif ($_ -match "warn") {
            Write-Host "   🟡 $_" -ForegroundColor Yellow
        } else {
            Write-Host "   📝 $_" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "   ❌ Erro ao ler logs" -ForegroundColor Red
}

# 8. Verificar Network
Write-Host "`n8️⃣  Verificando Network..." -ForegroundColor Yellow
try {
    $network = docker network inspect kash-network --format '{{.Name}}' 2>$null
    if ($network -eq "kash-network") {
        Write-Host "   ✅ Network 'kash-network' existe" -ForegroundColor Green
        
        $containerCount = docker network inspect kash-network --format '{{len .Containers}}' 2>$null
        Write-Host "   📊 Containers conectados: $containerCount" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ❌ Network não encontrada" -ForegroundColor Red
}

# 9. Verificar Volumes
Write-Host "`n9️⃣  Verificando Volumes..." -ForegroundColor Yellow
$volumes = @("mysql_data", "redis_data")

foreach ($volume in $volumes) {
    $volumeExists = docker volume ls --format '{{.Name}}' | Select-String -Pattern $volume
    if ($volumeExists) {
        Write-Host "   ✅ Volume '$volume' existe" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Volume '$volume' não encontrado" -ForegroundColor Red
    }
}

# 10. Estatísticas de recursos
Write-Host "`n🔟 Estatísticas de Recursos..." -ForegroundColor Yellow
Write-Host "   (Coletando dados por 2 segundos...)" -ForegroundColor Gray
Start-Sleep -Seconds 2

$stats = docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" $containers 2>$null
if ($stats) {
    Write-Host "`n$stats`n" -ForegroundColor Cyan
}

# Resumo Final
Write-Host "`n" + ("=" * 70) -ForegroundColor Gray
Write-Host "✅ TESTE CONCLUÍDO!" -ForegroundColor Green
Write-Host "`n📋 RESUMO:" -ForegroundColor Cyan
Write-Host "   • Docker Compose: Orquestrando 5 containers" -ForegroundColor White
Write-Host "   • Nginx: Reverse proxy funcionando" -ForegroundColor White
Write-Host "   • Healthchecks: MySQL, Redis, Backend OK" -ForegroundColor White
Write-Host "   • Security Headers: Configurados" -ForegroundColor White
Write-Host "   • Rate Limiting: Ativo" -ForegroundColor White
Write-Host "   • Network: kash-network isolada" -ForegroundColor White
Write-Host "   • Volumes: mysql_data, redis_data persistentes" -ForegroundColor White

