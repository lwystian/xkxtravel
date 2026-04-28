<template>
  <div class="tour-order-pay-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在准备支付，请稍候...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <el-result
        icon="error"
        title="加载失败"
        :sub-title="error"
      >
        <template #extra>
          <el-button type="primary" @click="goToOrders">返回订单列表</el-button>
        </template>
      </el-result>
    </div>

    <!-- 支付信息确认 -->
    <div v-else-if="order" class="payment-container">
      <div class="payment-header">
        <div class="alipay-logo">
          <svg viewBox="0 0 124 36" class="alipay-svg">
            <path fill="#1677FF" d="M117.6 10.2c0-1.8-1.5-3.3-3.3-3.3-1.8 0-3.3 1.5-3.3 3.3 0 1.5 1 2.7 2.4 3.1l-.6 2.9c-.1.4.2.8.6.8h.6c.3 0 .5-.2.6-.5l.6-2.9c1.2-.4 2-1.5 2-2.9h-.6zm-8.4 0c0-1.8-1.5-3.3-3.3-3.3-1.8 0-3.3 1.5-3.3 3.3 0 1.8 1.5 3.3 3.3 3.3 1.8 0 3.3-1.5 3.3-3.3zm-6.6 0c0-1.8-1.5-3.3-3.3-3.3-1.8 0-3.3 1.5-3.3 3.3 0 1.8 1.5 3.3 3.3 3.3 1.8 0 3.3-1.5 3.3-3.3zm-6.6 0c0-1.8-1.5-3.3-3.3-3.3-1.8 0-3.3 1.5-3.3 3.3 0 1.5 1 2.7 2.4 3.1l-.6 2.9c-.1.4.2.8.6.8h.6c.3 0 .5-.2.6-.5l.6-2.9c1.2-.4 2-1.5 2-2.9h-.6zM74.4 15.4c-4.5 0-8.1 3.6-8.1 8.1s3.6 8.1 8.1 8.1 8.1-3.6 8.1-8.1-3.6-8.1-8.1-8.1zm0 13.2c-2.8 0-5.1-2.3-5.1-5.1s2.3-5.1 5.1-5.1 5.1 2.3 5.1 5.1-2.3 5.1-5.1 5.1z"/>
            <text x="50" y="24" font-size="18" fill="#333">支付宝支付</text>
          </svg>
        </div>
        <p class="payment-tip">请确认以下支付信息</p>
      </div>

      <!-- 订单信息 -->
      <div class="order-info-card">
        <div class="info-header">
          <span class="info-label">订单信息</span>
          <span class="order-no">{{ order.orderNo }}</span>
        </div>

        <div class="info-item">
          <span class="label">行程名称</span>
          <span class="value">{{ order.tourName }}</span>
        </div>

        <div class="info-item" v-if="order.packageName">
          <span class="label">套餐类型</span>
          <span class="value">{{ order.packageName }}</span>
        </div>

        <div class="info-item" v-if="order.departureDate">
          <span class="label">出发日期</span>
          <span class="value">{{ formatDate(order.departureDate) }}</span>
        </div>

        <div class="info-item">
          <span class="label">出行人数</span>
          <span class="value">
            成人 {{ order.adultCount }} 人
            <span v-if="order.childCount > 0">，儿童 {{ order.childCount }} 人</span>
          </span>
        </div>

        <div class="info-item" v-if="order.hotelName">
          <span class="label">住宿酒店</span>
          <span class="value">{{ order.hotelName }} ({{ order.hotelDays }}晚)</span>
        </div>

        <div class="info-item">
          <span class="label">联系人</span>
          <span class="value">{{ order.contactName }} {{ order.contactPhone }}</span>
        </div>
      </div>

      <!-- 支付金额 -->
      <div class="amount-section">
        <span class="amount-label">应付金额</span>
        <span class="amount-value">¥ {{ formatPrice(order.totalAmount) }}</span>
      </div>

      <!-- 支付方式提示 -->
      <div class="payment-method-tip">
        <el-icon><InfoFilled /></el-icon>
        <span>点击下方按钮将跳转到支付宝完成支付</span>
      </div>

      <!-- 按钮区域 -->
      <div class="button-section">
        <el-button @click="cancelPayment" :disabled="paying">取消支付</el-button>
        <el-button type="primary" @click="goToAlipay" :loading="paying" size="large">
          <span v-if="!paying">打开支付宝支付</span>
          <span v-else>正在跳转...</span>
        </el-button>
      </div>

      <!-- 调试模式提示 -->
      <div class="debug-mode-tip" v-if="showDebugTip">
        <el-alert
          title="提示"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <p>如果无法跳转到支付宝，可点击下方按钮进行模拟支付测试</p>
            <el-button type="warning" size="small" @click="handleMockPay" :loading="paying" plain>
              模拟支付（调试用）
            </el-button>
          </template>
        </el-alert>
      </div>
    </div>

    <!-- 隐藏的支付表单 -->
    <form
      ref="alipayFormRef"
      name="alipaysubmit"
      method="post"
      action="https://openapi-sandbox.dl.alipaydev.com/gateway.do"
      style="display: none;"
    >
      <input type="hidden" name="biz_content" />
      <input type="hidden" name="charset" value="UTF-8" />
      <input type="hidden" name="sign_type" value="RSA2" />
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import { getTourOrderDetail } from '@/api/tourOrder'
import { generatePayForm, mockPay as mockPayApi, getOrderByOrderNo } from '@/api/tourOrderPay'

const route = useRoute()
const router = useRouter()

// 状态
const loading = ref(true)
const paying = ref(false)
const order = ref(null)
const error = ref(null)
const alipayFormRef = ref(null)

// 判断是否为测试模式（沙箱环境）
const isTestMode = computed(() => {
  return true // 始终显示测试按钮，方便调试
})

// 是否显示调试提示（通过URL参数控制）
const showDebugTip = computed(() => {
  return route.query.debug === 'true'
})

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dateStr
}

// 格式化价格
const formatPrice = (price) => {
  if (!price) return '0.00'
  return Number(price).toFixed(2)
}

// 获取订单信息
const fetchOrderInfo = async () => {
  try {
    loading.value = true
    error.value = null

    const orderId = route.params.id
    const orderNo = route.query.orderNo

    if (orderId) {
      const data = await getTourOrderDetail(orderId)
      order.value = data
    } else if (orderNo) {
      const data = await getOrderByOrderNo(orderNo)
      order.value = data
    } else {
      error.value = '订单信息不存在'
      return
    }

    // 检查订单状态
    if (order.value && order.value.status !== 0) {
      if (order.value.status === 1) {
        ElMessage.warning('该订单已支付')
        router.replace(`/payment/result?out_trade_no=${order.value.orderNo}&status=success`)
      } else {
        ElMessage.warning('该订单无法支付')
        router.replace('/orders')
      }
    }
  } catch (err) {
    console.error('获取订单信息失败:', err)
    error.value = err.message || '获取订单信息失败'
  } finally {
    loading.value = false
  }
}

// 跳转支付宝支付
const goToAlipay = async () => {
  if (!order.value) {
    ElMessage.error('订单信息不存在')
    return
  }

  try {
    paying.value = true
    ElMessage.info('正在准备支付...')

    // 调用后端生成支付表单
    const formHtml = await generatePayForm(order.value.id)

    // 创建临时容器
    const container = document.createElement('div')
    container.innerHTML = formHtml
    container.style.display = 'none'
    document.body.appendChild(container)

    // 获取表单并自动提交
    const form = container.querySelector('form')
    if (form) {
      // 添加 Target="_blank" 打开新窗口
      form.target = '_blank'
      form.method = 'post'
      form.acceptCharset = 'UTF-8'
      form.submit()
    } else {
      throw new Error('支付表单生成失败')
    }

    // 清理临时容器
    setTimeout(() => {
      document.body.removeChild(container)
    }, 100)

  } catch (err) {
    console.error('准备支付失败:', err)
    ElMessage.error(err.message || '准备支付失败，请重试')
    paying.value = false
  }
}

// 模拟支付（测试用）
const handleMockPay = async () => {
  if (!order.value) {
    ElMessage.error('订单信息不存在')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要模拟支付订单 ${order.value.orderNo} 吗？\n金额：¥${formatPrice(order.value.totalAmount)}`,
      '模拟支付',
      {
        confirmButtonText: '确定模拟支付',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    paying.value = true
    await mockPayApi(order.value.id)

    ElMessage.success('模拟支付成功')
    router.replace(`/payment/result?out_trade_no=${order.value.orderNo}&status=success`)

  } catch (err) {
    if (err !== 'cancel') {
      console.error('模拟支付失败:', err)
      ElMessage.error(err.message || '模拟支付失败')
    }
  } finally {
    paying.value = false
  }
}

// 取消支付
const cancelPayment = () => {
  ElMessageBox.confirm('确定要取消支付吗？订单将保留但不会自动完成支付。', '提示', {
    confirmButtonText: '确定取消',
    cancelButtonText: '继续支付',
    type: 'warning'
  }).then(() => {
    router.push('/orders')
  }).catch(() => {
    // 用户选择继续支付
  })
}

// 返回订单列表
const goToOrders = () => {
  router.push('/orders')
}

onMounted(() => {
  fetchOrderInfo()
})
</script>

<style scoped>
.tour-order-pay-container {
  width: 100%;
  min-height: calc(100vh - 200px);
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%);
  padding: 40px 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409EFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #666;
  font-size: 16px;
}

.error-container {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.payment-container {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.payment-header {
  background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
  color: white;
  padding: 30px;
  text-align: center;
}

.alipay-logo {
  margin-bottom: 15px;
}

.alipay-svg {
  height: 40px;
  width: auto;
}

.payment-header .alipay-svg text {
  fill: white;
}

.payment-tip {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.order-info-card {
  padding: 20px 30px;
  border-bottom: 1px solid #f0f0f0;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #e8e8e8;
}

.info-label {
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.order-no {
  color: #999;
  font-size: 13px;
  font-family: monospace;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px 0;
}

.info-item .label {
  color: #666;
  font-size: 14px;
  flex-shrink: 0;
}

.info-item .value {
  color: #333;
  font-size: 14px;
  text-align: right;
  max-width: 60%;
}

.amount-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  background: #fffbf0;
  border-bottom: 1px solid #f0f0f0;
}

.amount-label {
  font-size: 16px;
  color: #666;
}

.amount-value {
  font-size: 32px;
  font-weight: bold;
  color: #ff4d4f;
}

.payment-method-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px;
  background: #f0f9ff;
  color: #1677ff;
  font-size: 14px;
}

.button-section {
  display: flex;
  gap: 15px;
  padding: 25px 30px;
}

.button-section .el-button {
  flex: 1;
  height: 48px;
  font-size: 16px;
}

.button-section .el-button--primary {
  background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
  border: none;
}

.button-section .el-button--primary:hover {
  background: linear-gradient(135deg, #409eff 0%, #1677ff 100%);
}

.debug-mode-tip {
  padding: 0 30px 30px;
}

.debug-mode-tip .el-alert {
  border-radius: 8px;
}

.debug-mode-tip p {
  margin: 0 0 10px 0;
  color: #666;
}
</style>
