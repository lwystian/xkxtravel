import request from '@/utils/request'

/**
 * 生成支付宝支付表单
 * @param {number} orderId - 订单ID
 * @returns {Promise<string>} 支付表单HTML
 */
export function generatePayForm(orderId) {
  return request.get(`/tour-order-pay/pay/${orderId}`, {}, {
    showDefaultMsg: false
  })
}

/**
 * 获取订单支付状态
 * @param {number} orderId - 订单ID
 * @returns {Promise<object>} 订单信息
 */
export function getPaymentStatus(orderId) {
  return request.get(`/tour-order-pay/status/${orderId}`, {}, {
    showDefaultMsg: false
  })
}

/**
 * 根据订单号获取订单信息
 * @param {string} orderNo - 订单号
 * @returns {Promise<object>} 订单信息
 */
export function getOrderByOrderNo(orderNo) {
  return request.get(`/tour-order-pay/order`, { orderNo }, {
    showDefaultMsg: false
  })
}

/**
 * 模拟支付（仅用于测试）
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
export function mockPay(orderId) {
  return request.post(`/tour-order-pay/mock-pay/${orderId}`, {}, {
    showDefaultMsg: false
  })
}
