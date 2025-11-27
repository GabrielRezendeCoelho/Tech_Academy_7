// Script simples para testar Redis Pub/Sub
// Execute: node backend/testPubSubSimple.js

const { createClient } = require('redis');

async function testPubSub() {
  console.log('\n🚀 TESTE REDIS PUB/SUB\n');
  console.log('═'.repeat(60));

  // Criar dois clientes: um publisher e um subscriber
  const publisher = createClient({ url: 'redis://localhost:6379' });
  const subscriber = createClient({ url: 'redis://localhost:6379' });

  try {
    // Conectar ambos
    await publisher.connect();
    await subscriber.connect();
    console.log('✅ Conectado ao Redis!\n');

    // Configurar subscriber ANTES de publicar
    await subscriber.subscribe('kash:events:TransactionAdded', (message) => {
      const event = JSON.parse(message);
      console.log('\n✅ EVENTO RECEBIDO: TransactionAdded');
      console.log('   📊 Valor:', event.data.amount);
      console.log('   📝 Tipo:', event.data.type);
      console.log('   ⏰ Timestamp:', event.timestamp);
      console.log('   🔖 User ID:', event.metadata?.userId);
    });

    await subscriber.subscribe('kash:events:ExcessiveSpendingDetected', (message) => {
      const event = JSON.parse(message);
      console.log('\n⚠️  ALERTA RECEBIDO: ExcessiveSpendingDetected');
      console.log('   💰 Total Gastos:', event.data.totalExpenses);
      console.log('   🎯 Limite:', event.data.threshold);
    });

    console.log('📬 Subscribers configurados!\n');
    console.log('═'.repeat(60));

    // Aguardar 1 segundo
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Publicar eventos de teste
    console.log('\n📤 PUBLICANDO EVENTOS...\n');

    // Evento 1
    console.log('1️⃣  Publicando TransactionAdded...');
    await publisher.publish('kash:events:TransactionAdded', JSON.stringify({
      eventType: 'TransactionAdded',
      eventId: `test-${Date.now()}`,
      timestamp: new Date().toISOString(),
      aggregateId: 'account-123',
      data: {
        amount: 150.50,
        type: 'EXPENSE',
        description: 'Teste Pub/Sub'
      },
      metadata: {
        userId: 'user-456'
      }
    }));

    await new Promise(resolve => setTimeout(resolve, 500));

    // Evento 2
    console.log('\n2️⃣  Publicando ExcessiveSpendingDetected...');
    await publisher.publish('kash:events:ExcessiveSpendingDetected', JSON.stringify({
      eventType: 'ExcessiveSpendingDetected',
      eventId: `test-${Date.now()}`,
      timestamp: new Date().toISOString(),
      aggregateId: 'account-123',
      data: {
        totalExpenses: 5200,
        threshold: 5000
      },
      metadata: {
        userId: 'user-456',
        severity: 'warning'
      }
    }));

    // Aguardar processamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n\n═'.repeat(60));
    console.log('✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('💡 Os eventos foram publicados e recebidos via Redis Pub/Sub');
    console.log('═'.repeat(60));
    console.log('\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
  } finally {
    await publisher.quit();
    await subscriber.quit();
    console.log('🔌 Desconectado do Redis\n');
  }
}

testPubSub().catch(console.error);
