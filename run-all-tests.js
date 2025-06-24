#!/usr/bin/env node

/**
 * 🧪 SCRIPT MAESTRO DE TESTING - EL NOPAL RESTAURANT
 * 
 * Ejecuta todos los tests automáticos del proyecto de forma secuencial
 */

const { exec } = require('child_process');
const path = require('path');

class TestRunner {
  constructor() {
    this.results = [];
  }

  async runCommand(command, cwd, description) {
    return new Promise((resolve) => {
      console.log(`\n🔄 ${description}...`);
      console.log(`📂 Directorio: ${cwd}`);
      console.log(`⚡ Comando: ${command}\n`);

      const child = exec(command, { cwd }, (error, stdout, stderr) => {
        const result = {
          description,
          command,
          success: !error,
          stdout,
          stderr,
          error: error ? error.message : null
        };

        this.results.push(result);

        if (error) {
          console.log(`❌ FALLÓ: ${description}`);
          console.log(`Error: ${error.message}`);
        } else {
          console.log(`✅ ÉXITO: ${description}`);
        }

        resolve(result);
      });

      // Mostrar output en tiempo real
      child.stdout.on('data', (data) => {
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        process.stderr.write(data);
      });
    });
  }

  async runAllTests() {
    console.log('🧪 INICIANDO SUITE COMPLETA DE TESTS - EL NOPAL RESTAURANT\n');
    
    const startTime = Date.now();

    // 1. Tests del Servidor (Backend)
    await this.runCommand(
      'npm test',
      path.join(__dirname, 'server'),
      'Tests del Backend (API, Base de Datos, Seguridad)'
    );

    // 2. Tests del Cliente (Frontend)
    await this.runCommand(
      'npm test -- --coverage --watchAll=false',
      path.join(__dirname, 'client'),
      'Tests del Frontend (React, Componentes, Responsive)'
    );

    // 3. Tests de Producción (E2E)
    await this.runCommand(
      'node test-production.js',
      __dirname,
      'Tests de Producción (E2E, Performance, Seguridad)'
    );

    // 4. Auditoría de Seguridad
    await this.runCommand(
      'npm audit --audit-level=moderate',
      path.join(__dirname, 'server'),
      'Auditoría de Seguridad del Servidor'
    );

    await this.runCommand(
      'npm audit --audit-level=moderate',
      path.join(__dirname, 'client'),
      'Auditoría de Seguridad del Cliente'
    );

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    this.showSummary(duration);
  }

  showSummary(duration) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMEN COMPLETO DE TESTS - EL NOPAL RESTAURANT');
    console.log('='.repeat(80));

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log(`\n⏱️  Tiempo total: ${duration} segundos`);
    console.log(`📈 Tests ejecutados: ${totalTests}`);
    console.log(`✅ Exitosos: ${passedTests}`);
    console.log(`❌ Fallidos: ${failedTests}`);
    console.log(`🎯 Tasa de éxito: ${successRate}%`);

    console.log('\n📋 DETALLE POR CATEGORÍA:');
    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.description}`);
      if (!result.success) {
        console.log(`   ⚠️  Error: ${result.error}`);
      }
    });

    // Evaluación final
    console.log('\n' + '='.repeat(80));
    if (successRate >= 90) {
      console.log('🎉 ¡EXCELENTE! Tu aplicación está LISTA PARA PRODUCCIÓN');
      console.log('   ✅ Todos los sistemas funcionan correctamente');
      console.log('   ✅ Seguridad validada');
      console.log('   ✅ Performance aceptable');
      console.log('\n🚀 PUEDES PROCEDER CON EL LANZAMIENTO');
    } else if (successRate >= 70) {
      console.log('⚠️  ADVERTENCIA: Hay algunos problemas menores');
      console.log('   🔧 Revisa los tests fallidos');
      console.log('   🛠️  Corrige los errores antes del lanzamiento');
      console.log('\n🟡 RECOMENDACIÓN: Soluciona los problemas primero');
    } else {
      console.log('🚨 CRÍTICO: Demasiados tests fallando');
      console.log('   ❌ NO despliegues a producción');
      console.log('   🔧 Soluciona todos los errores críticos');
      console.log('   🧪 Vuelve a ejecutar los tests');
      console.log('\n🔴 NO APTO PARA PRODUCCIÓN');
    }

    console.log('\n📚 PRÓXIMOS PASOS:');
    if (successRate >= 90) {
      console.log('1. ✅ Usar el checklist manual: production-checklist.md');
      console.log('2. ✅ Hacer backup de la base de datos');
      console.log('3. ✅ Verificar SSL y dominio');
      console.log('4. 🚀 ¡Lanzar a producción!');
    } else {
      console.log('1. 🔧 Revisar tests fallidos');
      console.log('2. 🛠️  Corregir errores encontrados');
      console.log('3. 🧪 Re-ejecutar: node run-all-tests.js');
      console.log('4. 📋 Usar checklist cuando todo pase');
    }

    console.log('\n🌮 ¡El Nopal Restaurant - Testing Complete!');
    console.log('='.repeat(80) + '\n');

    // Exit code basado en resultados
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests().catch(err => {
    console.error('\n💥 ERROR FATAL:', err.message);
    process.exit(1);
  });
}

module.exports = TestRunner; 