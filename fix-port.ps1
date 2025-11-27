# Script para liberar porta 3000 e subir containers
# Execute: ./fix-port.ps1

Write-Host "`n🔧 LIBERANDO PORTA 3000 E SUBINDO CONTAINERS`n" -ForegroundColor Cyan

# 1. Encontrar processo na porta 3000
Write-Host "1️⃣  Procurando processo na porta 3000..." -ForegroundColor Yellow
$connections = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($connections) {
    $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    
    foreach ($pid in $pids) {
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "   ⚠️  Processo encontrado:" -ForegroundColor Yellow
            Write-Host "      PID: $pid" -ForegroundColor Gray
            Write-Host "      Nome: $($process.ProcessName)" -ForegroundColor Gray
            Write-Host "      Path: $($process.Path)" -ForegroundColor DarkGray
            
            Write-Host "`n   🔨 Finalizando processo $pid..." -ForegroundColor Cyan
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "   ✅ Processo finalizado!" -ForegroundColor Green
        }
    }
} else {
    Write-Host "   ✅ Porta 3000 livre!" -ForegroundColor Green
}

Start-Sleep -Seconds 2

# 2. Parar containers existentes
Write-Host "`n2️⃣  Parando containers existentes..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null
Write-Host "   ✅ Containers parados!" -ForegroundColor Green

Start-Sleep -Seconds 2

# 3. Subir containers novamente
Write-Host "`n3️⃣  Subindo containers..." -ForegroundColor Yellow
docker-compose up -d

Start-Sleep -Seconds 3

# 4. Verificar status
Write-Host "`n4️⃣  Verificando status dos containers..." -ForegroundColor Yellow
$containers = docker ps --format "{{.Names}}" 2>$null

$expected = @("kash-mysql", "kash-redis", "kash-backend", "kash-frontend", "kash-nginx")
$running = @()
$missing = @()

foreach ($container in $expected) {
    if ($containers -contains $container) {
        $running += $container
        Write-Host "   ✅ $container" -ForegroundColor Green
    } else {
        $missing += $container
        Write-Host "   ❌ $container - não iniciou" -ForegroundColor Red
    }
}

# 5. Aguardar healthchecks
if ($missing.Count -eq 0) {
    Write-Host "`n5️⃣  Aguardando healthchecks (30 segundos)..." -ForegroundColor Yellow
    
    $seconds = 30
    for ($i = 1; $i -le $seconds; $i++) {
        $percent = ($i / $seconds) * 100
        Write-Progress -Activity "Aguardando containers..." -Status "$i/$seconds segundos" -PercentComplete $percent
        Start-Sleep -Seconds 1
    }
    Write-Progress -Activity "Aguardando containers..." -Completed
    
    Write-Host "   ✅ Containers prontos!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Alguns containers não iniciaram. Verificando logs..." -ForegroundColor Yellow
    
    foreach ($container in $missing) {
        Write-Host "`n   📋 Logs de $container (últimas 10 linhas):" -ForegroundColor Cyan
        docker logs $container --tail 10 2>&1 | ForEach-Object {
            Write-Host "      $_" -ForegroundColor DarkGray
        }
    }
}

# 6. Status final
Write-Host "`n" + ("═" * 70) -ForegroundColor Gray
Write-Host "📊 STATUS FINAL" -ForegroundColor Cyan
Write-Host ("═" * 70) -ForegroundColor Gray

docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Select-String -Pattern "kash-|NAMES"

Write-Host "`n✅ Porta 3000 liberada!" -ForegroundColor Green
Write-Host "✅ Containers em execução: $($running.Count)/$($expected.Count)" -ForegroundColor Green

if ($missing.Count -eq 0) {
    Write-Host "`n🎉 TUDO PRONTO! Execute: ./demo.ps1" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️  Verifique os logs acima para resolver problemas" -ForegroundColor Yellow
}

Write-Host ""
