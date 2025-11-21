import bcrypt from 'bcryptjs';
import User from '../models/userModel';
import sequelize from '../config/database';

/**
 * Script para criar o primeiro usuário administrador do sistema.
 * 
 * Uso:
 * npm run create-admin
 * 
 * ou diretamente:
 * npx ts-node src/scripts/createAdminUser.ts
 */

async function createAdminUser() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida com sucesso.');

    console.log('🔄 Sincronizando modelos...');
    await sequelize.sync();
    console.log('✅ Modelos sincronizados.');

    // Dados do admin padrão
    const adminData = {
      name: 'Super Admin',
      email: 'admin@sistema.com',
      password: 'Admin@123',
      cpf: '00000000000',
      role: 'admin' as 'admin'
    };

    // Verificar se já existe um admin com este email
    const existingAdmin = await User.findOne({ where: { email: adminData.email } });
    
    if (existingAdmin) {
      console.log('⚠️  Admin já existe com este email.');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Nome:', existingAdmin.name);
      console.log('🔑 Role:', existingAdmin.role);
      
      if (existingAdmin.role !== 'admin') {
        console.log('🔄 Promovendo usuário existente para admin...');
        await existingAdmin.update({ role: 'admin' });
        console.log('✅ Usuário promovido para admin com sucesso!');
      }
      
      process.exit(0);
    }

    console.log('🔄 Criando hash da senha...');
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    console.log('🔄 Criando usuário admin...');
    const admin = await User.create({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      cpf: adminData.cpf,
      role: adminData.role
    });

    console.log('\n✅ Admin criado com sucesso!');
    console.log('═'.repeat(50));
    console.log('📧 Email:', admin.email);
    console.log('🔑 Senha:', adminData.password);
    console.log('👤 Nome:', admin.name);
    console.log('🆔 ID:', admin.id);
    console.log('🔒 Role:', admin.role);
    console.log('═'.repeat(50));
    console.log('\n⚠️  IMPORTANTE: Guarde estas credenciais em local seguro!');
    console.log('💡 Recomendação: Altere a senha após o primeiro login.\n');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro ao criar admin:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('⚠️  Este email ou CPF já está cadastrado no sistema.');
    } else if (error.name === 'SequelizeConnectionError') {
      console.error('⚠️  Erro de conexão com o banco de dados.');
      console.error('💡 Verifique se o MySQL está rodando e as credenciais estão corretas.');
    }
    
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  createAdminUser();
}

export default createAdminUser;
