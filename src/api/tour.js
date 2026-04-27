import request from '@/utils/request'

// 获取行程列表（分页）
export function getTourPage(params) {
  return request.get('/tour/page', params)
}

// 获取所有行程
export function getAllTours() {
  return request.get('/tour/all', {}, { showDefaultMsg: false })
}

// 获取所有上架行程
export function getTourList() {
  return request.get('/tour/list', {}, { showDefaultMsg: false })
}

// 获取行程详情
export function getTourDetail(id) {
  return request.get(`/tour/${id}`, {}, { showDefaultMsg: false })
}
