<template>
  <div class="document-meta" v-if="frontmatter">
    <div class="meta-row">
      <span class="meta-item" v-if="frontmatter.author">
        <el-icon><User /></el-icon>
        <span>{{ frontmatter.author }}</span>
      </span>

      <span class="meta-item" v-if="frontmatter.created">
        <el-icon><Calendar /></el-icon>
        <span>{{ formatDate(frontmatter.created) }}</span>
      </span>

      <span class="meta-item" v-if="frontmatter.updated">
        <el-icon><Edit /></el-icon>
        <span>更新于 {{ formatDate(frontmatter.updated) }}</span>
      </span>

      <span class="meta-item" v-if="frontmatter.project">
        <el-icon><FolderOpened /></el-icon>
        <span>{{ frontmatter.project }}</span>
      </span>
    </div>

    <div class="meta-row" v-if="frontmatter.tags && frontmatter.tags.length">
      <el-icon><PriceTag /></el-icon>
      <el-tag
        v-for="tag in frontmatter.tags"
        :key="tag"
        size="small"
        effect="plain"
        style="margin-left: 8px"
      >
        {{ tag }}
      </el-tag>
    </div>

    <div class="meta-row" v-if="frontmatter.confidentiality">
      <el-tag
        :type="getConfidentialityType(frontmatter.confidentiality)"
        size="small"
      >
        <el-icon><Lock /></el-icon>
        <span style="margin-left: 4px">{{ frontmatter.confidentiality }}</span>
      </el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useData } from 'vitepress';
import { User, Calendar, Edit, FolderOpened, PriceTag, Lock } from '@element-plus/icons-vue';
import { ElIcon, ElTag } from 'element-plus';

const { frontmatter } = useData();

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function getConfidentialityType(level: string) {
  switch (level) {
    case 'restricted': return 'danger';
    case 'internal': return 'warning';
    case 'public': return 'success';
    default: return 'info';
  }
}
</script>

<style scoped>
.document-meta {
  margin: 16px 0 24px;
  padding: 16px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border-left: 4px solid var(--vp-c-brand-1);
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.meta-row:last-child {
  margin-bottom: 0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.meta-item .el-icon {
  font-size: 16px;
}
</style>

