<template>
  <div class="home-carousel">
    <el-carousel :interval="4000" height="450px" indicator-position="none" arrow="always" v-loading="loading">
      <el-carousel-item v-for="item in carouselList" :key="item.id">
        <div class="carousel-content">
          <img :src="getImageUrl(item.imageUrl)" :alt="item.title" class="carousel-image" />
          <div class="carousel-overlay">
            <div class="carousel-title" v-if="item.title">{{ item.title }}</div>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

const carouselList = ref([])
const loading = ref(false)
const baseAPI = process.env.VUE_APP_BASE_API || '/api'

// 获取图片完整URL
const getImageUrl = (url) => {
  if (!url) return ''
  return url.startsWith('http') ? url : baseAPI + url
}

// 获取轮播图数据
const fetchCarousels = async () => {
  loading.value = true
  try {
    await request.get('/carousel/active', null, {
      showDefaultMsg: false,
      onSuccess: (data) => {
        carouselList.value = data || []
      }
    })
  } catch (error) {
    console.error('获取轮播图失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCarousels()
})
</script>

<style lang="scss" scoped>
.home-carousel {
  width: 100%;
  background: transparent !important;
  overflow: hidden;

  :deep(.el-carousel) {
    width: 100% !important;
    max-width: none !important;
  }

  :deep(.el-carousel__container) {
    width: 100% !important;
  }

  :deep(.el-carousel__item) {
    width: 100% !important;
  }
}

.carousel-content {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.carousel-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 60px 20px 20px;
}

.carousel-title {
  color: #fff;
  font-size: 28px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  transform: translateY(0);
  transition: transform 0.4s ease;
}

:deep(.el-carousel__arrow) {
  background-color: rgba(0, 0, 0, 0.3);
  font-size: 22px;
  width: 50px;
  height: 50px;
  z-index: 2;

  &:hover {
    background-color: rgba(0, 0, 0, 0.5);
  }
}

// 轮播项的动画效果
:deep(.el-carousel__item) {
  background: none !important;
  background-color: transparent !important;
  width: 100% !important;

  &:hover .carousel-image {
    transform: scale(1.05);
  }

  &:hover .carousel-title {
    transform: translateY(-5px);
  }
}

:deep(.el-carousel) {
  background: none !important;
  background-color: transparent !important;
  z-index: 1 !important;
  width: 100% !important;
}

:deep(.el-carousel__container) {
  background: none !important;
  background-color: transparent !important;
  width: 100% !important;
}

:deep(.el-carousel__mask) {
  background: none !important;
  background-color: transparent !important;
}

:deep(.el-carousel__item) {
  background-image: none !important;
}

:deep(.loading-mask) {
  background-color: rgba(255, 255, 255, 0.8) !important;
}

// 响应式样式
@media (max-width: 768px) {
  :deep(.el-carousel__arrow) {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .carousel-title {
    font-size: 20px;
  }
}
</style> 