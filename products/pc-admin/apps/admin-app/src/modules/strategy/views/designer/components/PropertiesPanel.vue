<template>
  <div class="properties-panel">
    <div class="panel-header">
      <div class="panel-actions">
        <el-button v-if="!!selectedNode" type="danger" size="small" @click="$emit('delete-selected')">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
      </div>
    </div>

    <div class="panel-content">
      <div class="text-config-section">
        <h4>文本配置</h4>
        <el-form :model="textConfig" label-width="60px" size="small">
          <el-form-item label="字体大小" prop="fontSize">
            <el-input-number v-model="textConfig.fontSize" :min="8" :max="32" :step="1" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="字体族" prop="fontFamily">
            <el-select v-model="textConfig.fontFamily" style="width: 100%">
              <el-option v-for="option in fontFamilyOptions" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="字体粗细" prop="fontWeight">
            <el-select v-model="textConfig.fontWeight" style="width: 100%">
              <el-option label="极细" value="100" />
              <el-option label="细体" value="300" />
              <el-option label="正常" value="normal" />
              <el-option label="中等" value="500" />
              <el-option label="粗体" value="bold" />
              <el-option label="极粗" value="900" />
            </el-select>
          </el-form-item>
          <el-form-item label="字体样式" prop="fontStyle">
            <el-select v-model="textConfig.fontStyle" style="width: 100%">
              <el-option label="正常" value="normal" />
              <el-option label="斜体" value="italic" />
              <el-option label="倾斜" value="oblique" />
            </el-select>
          </el-form-item>
        </el-form>

        <div class="font-preview">
          <h5>预览效果</h5>
          <div class="preview-text" :style="{ fontSize: textConfig.fontSize + 'px', fontFamily: textConfig.fontFamily, fontWeight: textConfig.fontWeight, fontStyle: textConfig.fontStyle }">开始节点</div>
        </div>
      </div>

      <StrategyNodeProperties v-if="!!selectedNode" :node="selectedNode" @update="$emit('update-node', $event)" />
      <StrategyConnectionProperties v-if="!!selectedConnection" :connection="selectedConnection" @update="$emit('update-connection', $event)" />

      <div v-if="!selectedNode && !selectedConnection" class="empty-state">
        <div class="empty-icon">
          <el-icon><Setting /></el-icon>
        </div>
        <div class="empty-text">请选择一个节点或连接线来配置属性</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import StrategyNodeProperties from '../components/StrategyNodeProperties.vue';
import StrategyConnectionProperties from '../components/StrategyConnectionProperties.vue';
import { Delete, Setting, FullScreen } from '@element-plus/icons-vue';

const props = defineProps<{ selectedNode: any; selectedConnection: any; textConfig: any; fontFamilyOptions: Array<{label:string; value:string}> }>();
defineEmits(['delete-selected','update-node','update-connection','update-text-config']);

const textConfig = reactive({ ...props.textConfig });
watch(() => props.textConfig, v => Object.assign(textConfig, v || {}));
watch(textConfig, v => { /* 允许外部监听更新 */ }, { deep: true });
</script>


