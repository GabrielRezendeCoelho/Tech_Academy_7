/**
 * Script de Teste - Redis Pub/Sub
 * 
 * Este script demonstra o funcionamento do Redis Pub/Sub
 * mostrando mensagens sendo publicadas e recebidas em tempo real.
 * 
 * Para executar:
 * npx ts-node src/scripts/testPubSub.ts
 */

import { eventBus } from '../utils/eventBus';
import { logger } from '../utils/logger';

async function testPubSub() {
  console.log('\n🚀 INICIANDO TESTE DO REDIS PUB/SUB\n');
  console.log('═'.repeat(60));

  try {
    // 1. Conectar ao Redis
    console.log('\n📡 Conectando ao Redis...');
    await eventBus.connect(process.env.REDIS_URL || 'redis://localhost:6379');
    console.log('✅ Conectado ao Redis!');

    // 2. Configurar subscribers (antes de publicar)
    console.log('\n📬 Configurando subscribers...');
    
    await eventBus.subscribe('TransactionAdded', async (event) => {
      console.log('\n✅ EVENTO RECEBIDO: TransactionAdded');
      console.log('   📊 Dados:', JSON.stringify(event.data, null, 2));
      console.log('   🔖 Metadata:', JSON.stringify(event.metadata, null, 2));
      console.log('   ⏰ Timestamp:', event.timestamp);
    });

    await eventBus.subscribe('ExcessiveSpendingDetected', async (event) => {
      console.log('\n⚠️  ALERTA RECEBIDO: ExcessiveSpendingDetected');
      console.log('   💰 Total Gastos:', event.data.totalExpenses);
      console.log('   🎯 Limite:', event.data.threshold);
      console.log('   📈 Severidade:', event.metadata?.severity);
    });

    await eventBus.subscribe('BalanceUpdated', async (event) => {
      console.log('\n💰 SALDO ATUALIZADO: BalanceUpdated');
      console.log('   🔻 Saldo Anterior:', event.data.oldBalance);
      console.log('   🔺 Saldo Novo:', event.data.newBalance);
      console.log('   📊 Diferença:', event.data.difference);
    });

    await eventBus.subscribe('UserCreated', async (event) => {
      console.log('\n👤 USUÁRIO CRIADO: UserCreated');
      console.log('   📧 Email:', event.data.email);
      console.log('   👤 Nome:', event.data.name);
      console.log('   🆔 ID:', event.aggregateId);
    });

    // Pattern subscriber para todos os eventos de transação
    await eventBus.subscribePattern('Transaction*', async (event) => {
      console.log('\n🔍 Pattern match: Transaction*');
      console.log('   Tipo:', event.eventType);
    });

    console.log('✅ Subscribers configurados!');
    console.log('\n═'.repeat(60));
    console.log('📡 AGUARDANDO EVENTOS... (pressione Ctrl+C para sair)');
    console.log('═'.repeat(60));

    // 3. Aguardar 2 segundos para garantir que subscribers estão prontos
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Publicar eventos de teste
    console.log('\n\n📤 PUBLICANDO EVENTOS DE TESTE...\n');

    // Evento 1: Transação Adicionada
    console.log('1️⃣  Publicando TransactionAdded...');
    await eventBus.publish('TransactionAdded', {
      aggregateId: 'account-123',
      amount: 150.50,
      type: 'EXPENSE',
      description: 'Compra no supermercado',
      categoryId: 1
    }, {
      userId: 'user-456',
      correlationId: 'test-correlation-1',
      timestamp: new Date()
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Evento 2: Gasto Excessivo Detectado
    console.log('\n2️⃣  Publicando ExcessiveSpendingDetected...');
    await eventBus.publish('ExcessiveSpendingDetected', {
      aggregateId: 'account-123',
      totalExpenses: 5200,
      threshold: 5000,
      period: 'monthly'
    }, {
      userId: 'user-456',
      correlationId: 'test-correlation-2',
      severity: 'warning'
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Evento 3: Saldo Atualizado
    console.log('\n3️⃣  Publicando BalanceUpdated...');
    await eventBus.publish('BalanceUpdated', {
      aggregateId: 'account-123',
      newBalance: 2349.50,
      oldBalance: 2500.00,
      difference: -150.50
    }, {
      userId: 'user-456',
      correlationId: 'test-correlation-3'
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Evento 4: Usuário Criado
    console.log('\n4️⃣  Publicando UserCreated...');
    await eventBus.publish('UserCreated', {
      aggregateId: 'user-789',
      email: 'teste@kash.com',
      name: 'Usuário Teste'
    }, {
      correlationId: 'test-correlation-4',
      source: 'user-service'
    });

    // 5. Aguardar processamento dos eventos
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 6. Mostrar estatísticas
    console.log('\n\n═'.repeat(60));
    console.log('📊 ESTATÍSTICAS DO EVENT BUS');
    console.log('═'.repeat(60));
    const stats = eventBus.getStats();
    console.log('✅ Conectado:', stats.connected);
    console.log('📬 Canais Inscritos:', stats.subscribedChannels);
    console.log('🔧 Total de Handlers:', stats.totalHandlers);
    console.log('═'.repeat(60));

    console.log('\n\n✅ TESTE CONCLUÍDO COM SUCESSO!\n');
    console.log('💡 Os eventos foram publicados e recebidos via Redis Pub/Sub.');
    console.log('📝 Verifique os logs acima para ver a circulação de mensagens.\n');

    // Manter vivo por mais 5 segundos para capturar eventos tardios
    console.log('⏳ Aguardando 5 segundos para eventos tardios...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error);
    logger.error({ error }, 'Erro no teste de Pub/Sub');
  } finally {
    // Desconectar
    console.log('\n🔌 Desconectando do Redis...');
    await eventBus.disconnect();
    console.log('✅ Desconectado!\n');
    process.exit(0);
  }
}

// Executar teste
testPubSub().catch((error) => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
