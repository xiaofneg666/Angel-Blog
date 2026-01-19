<template>
  <div class="article-card" :class="layout" @click="navigateToDetail">
    <img :src="article.cover_image || '/1.jpg'" alt="文章封面" class="cover" />
    <div class="content">
      <h2 class="title">{{ article.title || '文章标题' }}</h2>
      <p class="desc">{{ article.excerpt || '这里是文章简介...' }}</p>
      <div class="meta">
        <span>{{ article.author_name || '作者' }}</span> ·
        <span>{{ article.publish_time || '日期' }}</span>
      </div>
      <div class="actions">
        <button @click.stop="$emit('like', article.id, article.is_liked)">{{ article.is_liked ? '取消点赞' : '点赞' }} ({{ article.like_count || 0 }})</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  article: {
    type: Object,
    required: true
  },
  layout: {
    type: String,
    default: 'list'
  }
});

const emit = defineEmits(['like']);

// 跳转到文章详情页
const navigateToDetail = () => {
  if (props.article.id) {
    router.push({ name: 'post-detail', params: { id: props.article.id } });
  }
};
</script>

<style scoped>
.article-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.article-card.list {
  display: flex;
  padding: 18px;
  gap: 18px;
  align-items: flex-start;
}

.article-card.grid {
  display: flex;
  flex-direction: column;
}

.cover {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.article-card.grid .cover {
  width: 100%;
  height: 180px;
  border-radius: 12px 12px 0 0;
}

.content {
  flex: 1;
}

.article-card.grid .content {
  padding: 16px;
}

.title {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 8px;
  color: #1d2129;
}

.desc {
  color: #666;
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 1.5;
}

.meta {
  font-size: 0.9em;
  color: #999;
  margin-bottom: 10px;
}

.actions {
  display: flex;
  gap: 10px;
}

.actions button {
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
}

.actions button:hover {
  background: #66b1ff;
}
</style>
