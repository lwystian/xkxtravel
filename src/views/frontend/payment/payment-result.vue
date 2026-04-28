<template>
  <div class="payment-result-container">
    <el-result
      :icon="resultInfo.icon"
      :title="resultInfo.title"
      :sub-title="resultInfo.subTitle"
    >
      <template #extra>
        <el-button type="primary" @click="goToOrders">查看我的订单</el-button>
        <el-button @click="goToTickets">继续浏览行程</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOrderByOrderNo } from '@/api/tourOrderPay'

const router = useRouter()
const route = useRoute()

const paymentStatus = ref('processing') // processing, success, failed
const paymentInfo = ref({})

// 计算结果信息
const resultInfo = computed(() => {
  switch (paymentStatus.value) {
    case 'success':
      return {
        icon: 'success',
        title: '支付成功',
        subTitle: '您的订单已支付成功，感谢您的购买！我们已将出团通知发送至您的手机，请注意查收。'
      }
    case 'failed':
      return {
        icon: 'error',
        title: '支付失败',
        subTitle: '抱歉，您的支付未能完成，订单已保留，您可以稍后重新支付。'
      }
    default:
      return {
        icon: 'info',
        title: '处理中',
        subTitle: '正在处理您的支付结果，请稍候...'
      }
  }
})

// 查询支付结果
const checkPaymentResult = async () => {
  try {
    // 优先使用URL中的status参数
    const urlStatus = route.query.status
    if (urlStatus === 'success') {
      paymentStatus.value = 'success'
      return
    } else if (urlStatus === 'failed') {
      paymentStatus.value = 'failed'
      return
    }

    // 从URL获取支付宝回调参数（订单号）
    const outTradeNo = route.query.out_trade_no

    if (!outTradeNo) {
      paymentStatus.value = 'failed'
      return
    }

    // 查询订单状态
    const order = await getOrderByOrderNo(outTradeNo)

    if (order) {
      paymentInfo.value = order
      // 1表示已支付
      if (order.status === 1) {
        paymentStatus.value = 'success'
      } else {
        paymentStatus.value = 'failed'
      }
    } else {
      paymentStatus.value = 'failed'
    }
  } catch (error) {
    console.error('查询支付结果失败:', error)
    // 如果查询失败，根据URL参数判断
    const urlStatus = route.query.status
    if (urlStatus === 'success') {
      paymentStatus.value = 'success'
    } else {
      paymentStatus.value = 'failed'
    }
  }
}

const goToOrders = () => {
  router.push('/orders')
}

const goToTickets = () => {
  router.push('/tickets')
}

onMounted(() => {
  // 检查支付结果
  checkPaymentResult()
})
</script>

<style scoped>
.payment-result-container {
  width: 100%;
  min-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%);
}

.payment-result-container :deep(.el-result) {
  background: white;
  padding: 40px 60px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.payment-result-container :deep(.el-result__title .el-result__title) {
  font-size: 28px;
  font-weight: 600;
}

.payment-result-container :deep(.el-result__subtitle p) {
  font-size: 16px;
  color: #666;
}
</style>
