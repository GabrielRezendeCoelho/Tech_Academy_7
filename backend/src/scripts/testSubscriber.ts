/**
 * Script de Teste - Subscriber Externo (Simulação de Microserviço)
 * 
 * Este script simula um microserviço separado que consome eventos
 * publicados no Redis Pub/Sub pela aplicação principal.
 * 
 * Execute em paralelo com o servidor principal para ver a comunicação distribuída:
 * 
 * Terminal 1: npm run dev (servidor principal)
 * Terminal 2: npx ts-node src/scripts/testSubscriber.ts (este script)
 * Terminal 3: faça requisições na API (POST /saldos, etc)
 * 
 * Você verá os eventos sendo recebidos em tempo real neste terminal!
 */

import { eventBus } from '../utils/eventBus';
import { logger } from '../utils/logger';

async function startSubscriber() {
  console.log('\n🎧 MICROSERVIÇO SUBSCRIBER - INICIANDO');
  console.log('═'.repeat(70));
  console.log('Este é um serviço separado que consome eventos da aplicação principal');
  console.log('═'.repeat(70));

  try {
    // Conectar ao Redis
    console.log('\n📡 Conectando ao Redis...');
    await eventBus.connect(process.env.REDIS_URL || 'redis://localhost:6379');
    console.log('✅ Conectado ao Redis Pub/Sub!');

    console.log('\n📬 Configurando listeners para TODOS os eventos...\n');

    // Subscriber 1: Transações
    await eventBus.subscribe('TransactionAdded', async (event) => {
      console.log('\n' + '='.repeat(70));
      console.log('💳 [TRANSAÇÃO DETECTADA]');
      console.log('='.repeat(70));
      console.log('🆔 Event ID:', event.eventId);
      console.log('📦 Aggregate:', event.aggregateId);
      console.log('💰 Valor:', event.data.amount);
      console.log('📊 Tipo:', event.data.type);
      console.log('📝 Descrição:', event.data.description || 'N/A');
      console.log('👤 User ID:', event.metadata?.userId);
      console.log('⏰ Timestamp:', event.timestamp);
      console.log('='.repeat(70));
    });

    // Subscriber 2: Gastos Excessivos
    await eventBus.subscribe('ExcessiveSpendingDetected', async (event) => {
      console.log('\n' + '⚠'.repeat(35));
      console.log('⚠️  [ALERTA DE GASTO EXCESSIVO] ⚠️');
      console.log('⚠'.repeat(35));
      console.log('🚨 Usuário:', event.metadata?.userId);
      console.log('💸 Total Gastos:', `R$ ${event.data.totalExpenses}`);
      console.log('🎯 Limite:', `R$ ${event.data.threshold}`);
      console.log('📊 Período:', event.data.period);
      console.log('⚠️  Severidade:', event.metadata?.severity);
      console.log('⏰ Timestamp:', event.timestamp);
      console.log('⚠'.repeat(35));
      
      // Aqui você poderia:
      // - Enviar email/SMS de alerta
      // - Criar notificação push
      // - Registrar no sistema de alertas
      console.log('📧 → Enviando notificação ao usuário...');
      console.log('✅ → Notificação enviada com sucesso!');
    });

    // Subscriber 3: Saldo Atualizado
    await eventBus.subscribe('BalanceUpdated', async (event) => {
      console.log('\n' + '─'.repeat(70));
      console.log('💰 [ATUALIZAÇÃO DE SALDO]');
      console.log('─'.repeat(70));
      const diff = event.data.difference;
      const emoji = diff >= 0 ? '📈' : '📉';
      const color = diff >= 0 ? '🟢' : '🔴';
      
      console.log('🆔 Conta:', event.aggregateId);
      console.log('👤 Usuário:', event.metadata?.userId);
      console.log(`${color} Saldo Anterior: R$ ${event.data.oldBalance.toFixed(2)}`);
      console.log(`${color} Saldo Atual: R$ ${event.data.newBalance.toFixed(2)}`);
      console.log(`${emoji} Diferença: R$ ${Math.abs(diff).toFixed(2)} (${diff >= 0 ? '+' : '-'})`);
      console.log('⏰ Timestamp:', event.timestamp);
      console.log('─'.repeat(70));
      
      // Aqui você poderia:
      // - Invalidar cache de saldo
      // - Atualizar dashboard em tempo real via WebSocket
      // - Registrar no histórico de saldos
      console.log('🔄 → Invalidando cache de saldo...');
      console.log('✅ → Cache invalidado!');
    });

    // Subscriber 4: Usuário Criado
    await eventBus.subscribe('UserCreated', async (event) => {
      console.log('\n' + '🎉'.repeat(35));
      console.log('👤 [NOVO USUÁRIO CADASTRADO]');
      console.log('🎉'.repeat(35));
      console.log('🆔 User ID:', event.aggregateId);
      console.log('📧 Email:', event.data.email);
      console.log('👤 Nome:', event.data.name);
      console.log('📍 Origem:', event.metadata?.source);
      console.log('⏰ Timestamp:', event.timestamp);
      console.log('🎉'.repeat(35));
      
      // Aqui você poderia:
      // - Criar conta financeira padrão
      // - Enviar email de boas-vindas
      // - Criar categorias padrão
      // - Registrar em analytics
      console.log('💌 → Enviando email de boas-vindas...');
      console.log('🏦 → Criando conta financeira padrão...');
      console.log('✅ → Onboarding concluído!');
    });

    // Pattern Subscriber: Todos os eventos de transação
    await eventBus.subscribePattern('Transaction*', async (event) => {
      console.log(`\n🔍 [PATTERN MATCH] Evento capturado: ${event.eventType}`);
    });

    // Mostrar estatísticas
    const stats = eventBus.getStats();
    console.log('\n📊 ESTATÍSTICAS DO SUBSCRIBER');
    console.log('═'.repeat(70));
    console.log('✅ Status:', stats.connected ? 'CONECTADO' : 'DESCONECTADO');
    console.log('📬 Canais Inscritos:', stats.subscribedChannels);
    console.log('🔧 Total de Handlers:', stats.totalHandlers);
    console.log('═'.repeat(70));

    console.log('\n🎧 SUBSCRIBER ATIVO - Aguardando eventos...');
    console.log('💡 Execute ações na API principal para ver os eventos chegando aqui!');
    console.log('🔗 Exemplo: POST http://localhost:3000/saldos com uma transação');
    console.log('⌨️  Pressione Ctrl+C para sair\n');
    console.log('═'.repeat(70));

    // Mantém o processo vivo
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Encerrando subscriber...');
      await eventBus.disconnect();
      console.log('✅ Desconectado do Redis');
      console.log('👋 Até logo!\n');
      process.exit(0);
    });

  } catch (error) {
    console.error('\n❌ ERRO AO INICIAR SUBSCRIBER:', error);
    logger.error({ error }, 'Erro no subscriber');
    process.exit(1);
  }
}

// Iniciar subscriber
startSubscriber().catch((error) => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
