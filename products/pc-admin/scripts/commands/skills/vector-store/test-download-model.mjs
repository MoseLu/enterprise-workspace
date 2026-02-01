/**
 * 测试脚本：手动触发模型下载
 * 用于验证模型是否可以正常下载和加载
 */

import { generateEmbeddingLocal, checkLocalEmbeddingAvailable } from './local-embedding.mjs';

async function testDownloadModel() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                   本地 Embedding 模型下载测试');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
  
  console.log('📥 开始检查模型可用性...\n');
  
  try {
    // 检查模型是否可用（会触发下载）
    const available = await checkLocalEmbeddingAvailable();
    
    if (available) {
      console.log('✅ 模型已可用！\n');
      
      // 测试生成向量
      console.log('🧪 测试生成向量...');
      const testText = '这是一个测试文本';
      const embedding = await generateEmbeddingLocal(testText);
      
      console.log(`✅ 向量生成成功！`);
      console.log(`   - 文本: "${testText}"`);
      console.log(`   - 向量维度: ${embedding.length}`);
      console.log(`   - 向量前 5 个值: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}]`);
      console.log(`   - 向量范围: [${Math.min(...embedding).toFixed(4)}, ${Math.max(...embedding).toFixed(4)}]`);
      
      console.log('\n✅ 本地 Embedding 模型测试通过！');
      console.log('\n💡 提示：');
      console.log('   - 模型已下载到: ./.models/Xenova/all-MiniLM-L6-v2/');
      console.log('   - 可以在配置中设置 provider: "local" 使用本地 Embedding');
      console.log('   - 或设置 provider: "auto" 自动选择（优先本地）\n');
    } else {
      console.log('❌ 模型不可用');
      console.log('💡 请检查网络连接和错误信息\n');
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.log('\n💡 可能的原因：');
    console.log('   1. 网络连接问题');
    console.log('   2. 防火墙阻止下载');
    console.log('   3. 磁盘空间不足');
    console.log('   4. 权限问题\n');
    throw error;
  }
  
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
}

testDownloadModel().catch(console.error);
