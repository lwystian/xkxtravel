<template>
  <div class="travel-product-page">
    <div class="main-content">
      <!-- 左侧区域 -->
      <div class="left-section">
        <!-- 主图/主视频区域 -->
        <div class="main-image-container">
          <!-- 有视频时显示视频播放器 -->
          <div v-if="hasVideo" class="video-container">
            <video 
              ref="videoPlayer"
              :key="videoUrl"
              :src="videoUrl" 
              :poster="currentPoster"
              :controls="showControls"
              class="main-video"
              @ended="handleVideoEnded"
            >
              您的浏览器不支持视频播放
            </video>
            <!-- 自定义播放按钮（点击触发视频播放并显示控制栏） -->
            <div v-if="!showControls" class="play-button" @click="playVideo">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          <!-- 没有视频时显示图片 -->
          <img 
            v-else
            :src="currentImage" 
            alt="产品图片" 
            class="main-image" 
          />
          <div class="image-tags">
            <span v-for="(tag, idx) in productTags" :key="idx" class="tag">{{ tag }}</span>
          </div>
        </div>

        <!-- 缩略图列表 -->
        <div class="thumbnail-list">
          <div
            v-for="(item, index) in mediaList"
            :key="index"
            :class="['thumbnail-item', { active: hasVideo ? currentMediaIndex === index : currentImageIndex === index }]"
            @click="selectMedia(index)"
          >
            <img :src="item.thumbnail" :alt="`封面${index + 1}`" />
          </div>
        </div>

        <!-- 日历查看切换 -->
        <div class="view-toggle">
          <div class="toggle-buttons">
            <button
              :class="['toggle-btn', { active: viewMode === 'calendar' }]"
              @click="viewMode = 'calendar'"
            >
              📅 日历查看
            </button>
            <button
              :class="['toggle-btn', { active: viewMode === 'list' }]"
              @click="viewMode = 'list'"
            >
              ≡ 列表查看
            </button>
          </div>
        </div>

        <!-- 日历组件 -->
        <div v-if="viewMode === 'calendar'" class="calendar-container">
          <div class="calendar-header">
            <button class="nav-btn" @click="prevMonth">&lt;</button>
            <span class="current-month">{{ currentYear }}-{{ String(currentMonth).padStart(2, '0') }}</span>
            <button class="nav-btn" @click="nextMonth">&gt;</button>
          </div>
          <div class="calendar-weekdays">
            <span
              v-for="day in weekDays"
              :key="day"
              :class="{ weekend: day === '日' || day === '六' }"
            >
              {{ day }}
            </span>
          </div>
          <div class="calendar-days">
            <div
              v-for="(day, index) in calendarDays"
              :key="index"
              :class="[
                'calendar-day',
                { 'other-month': day.otherMonth },
                { 'has-trip': day.hasTrip },
                { selected: selectedDate === day.fullDate },
                { weekend: day.isWeekend }
              ]"
              @click="toggleDateSelection(day)"
            >
              <span class="day-number">{{ day.day }}</span>
              <div v-if="day.hasTrip && !day.otherMonth && day.batch" class="trip-info">
                <span class="trip-status">{{ day.batch.status }}</span>
                <div class="trip-prices">
                  <span class="trip-price adult">成人 ¥{{ day.batch.finalAdultPrice }}</span>
                  <span v-if="hasChildPrice" class="trip-price child">儿童 ¥{{ day.batch.finalChildPrice }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 列表查看 -->
        <div v-if="viewMode === 'list'" class="list-container">
          <table class="batch-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>星期</th>
                <th>成人价</th>
                <th v-if="hasChildPrice">儿童价</th>
                <th>状态</th>
                <th>余位</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="batch in batchDatesWithDisplay"
                :key="batch.date"
                :class="{ 'selected-row': selectedBatchDate === batch.date }"
              >
                <td>{{ batch.date }}</td>
                <td>{{ batch.weekdayName }}</td>
                <td class="list-price">¥{{ batch.finalAdultPrice }}</td>
                <td v-if="hasChildPrice" class="list-price">¥{{ batch.finalChildPrice }}</td>
                <td>
                  <span :class="['status-tag', batch.status === '可报名' ? 'success' : 'warning']">
                    {{ batch.status }}
                  </span>
                </td>
                <td>{{ batch.remaining }}</td>
                <td>
                  <button
                    :class="['select-btn', { selected: selectedBatchDate === batch.date }]"
                    @click="toggleDateSelection(batch)"
                  >
                    {{ selectedBatchDate === batch.date ? '已选择' : '选择' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="list-price-note">
            <span>※ 最终价 = 套餐价 + 日期附加费 + 批次附加费</span>
          </div>
        </div>
      </div>

      <!-- 右侧区域 -->
      <div class="right-section">
        <!-- 标题区域 -->
        <div class="product-header">
          <h1 class="product-title">{{ productInfo.title }}</h1>
          <p class="product-subtitle">{{ productInfo.subtitle }}</p>
        </div>

        <!-- 编号和统计 -->
        <div class="product-meta">
          <span class="product-id">编号：{{ productInfo.code }}</span>
          <div class="meta-right">
            <span class="enrolled"><strong>{{ productInfo.enrolledCount }}</strong> 人已报名</span>
            <span class="action-link" @click="handleCopy">[复制]</span>
            <span class="action-link" @click="handleFavorite">☆收藏</span>
          </div>
        </div>

        <!-- 价格区域 - 固定显示最低起价 -->
        <div class="price-section">
          <div class="price-row">
            <span class="price-label">产品价格：</span>
            <div class="price-info">
              <span class="price-main">
                <span class="currency">¥</span>
                <span class="price-value">{{ minAdultPrice }}</span>
                <span class="price-unit">元起（成人）</span>
              </span>
              <span v-if="hasChildPrice" class="price-main child">
                <span class="currency">¥</span>
                <span class="price-value">{{ minChildPrice }}</span>
                <span class="price-unit">元起（儿童）</span>
              </span>
            </div>
            <span class="duration-tag">{{ productInfo.days }}天</span>
            <a href="#" class="price-explain" @click.prevent="showPriceDetail">起价说明？</a>
          </div>
          <div class="price-note">
            <span>※ 起价为标准套餐+标准批次+平日出发价格</span>
          </div>
        </div>

        <!-- VIP会员横幅 -->
        <div class="vip-banner">
          <span class="vip-text">🎖️ 开通侠客行会员，立享9.5折优惠</span>
          <button class="vip-btn" @click="handleOpenVip">立即开通 &gt;</button>
        </div>

        <!-- 产品特色 -->
        <div class="info-row info-row--feature">
          <span class="info-label">产品特色：</span>
          <div class="feature-tags">
            <span v-for="(feature, idx) in productFeatures" :key="idx" class="feature-tag">
              {{ feature }}
            </span>
          </div>
        </div>

        <!-- 供应商 -->
        <div class="info-row">
          <span class="info-label">供 应 商：</span>
          <a href="#" class="info-link" @click.prevent="viewSupplier">{{ supplierInfo.name }}</a>
        </div>

        <!-- 出发地 -->
        <div class="info-row">
          <span class="info-label">出 发 地：</span>
          <a href="#" class="info-link" @click.prevent="filterByDeparture">{{ productInfo.departure }}</a>
        </div>

        <!-- 退订政策 -->
        <div class="info-row">
          <span class="info-label">退订政策：</span>
          <span class="info-text">{{ refundPolicy.support }} {{ refundPolicy.special }}</span>
          <a href="#" class="info-link" @click.prevent="showRefundPolicy">查看政策 &gt;</a>
        </div>

        <!-- 出团通知 -->
        <div class="info-row">
          <span class="info-label">出团通知：</span>
          <span class="info-text">{{ productInfo.notice }}</span>
        </div>

        <!-- 行程套餐 -->
        <div class="package-row">
          <span class="package-label">行程套餐：</span>
          <div class="package-options">
            <button
              v-for="pkg in tripPackages"
              :key="pkg.id"
              :class="['package-btn', { active: selectedPackage === pkg.id }]"
              @click="selectTripPackage(pkg.id)"
            >
              <span class="package-name">{{ pkg.name }}</span>
              <div class="package-prices">
                <span class="package-price adult">成人 ¥{{ pkg.adultPrice }}</span>
                <span v-if="hasChildPrice" class="package-price child">儿童 ¥{{ pkg.childPrice }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- 批次套餐 -->
        <div class="package-row">
          <span class="package-label">批次套餐：</span>
          <div class="package-options">
            <button
              v-for="pkg in batchPackages"
              :key="pkg.id"
              :class="['package-btn', { active: selectedBatchPackage === pkg.id }]"
              @click="selectBatchPackage(pkg.id)"
            >
              {{ pkg.name }}
              <span v-if="pkg.extraFeePerPerson > 0" class="package-price">+¥{{ pkg.extraFeePerPerson }}/人</span>
              <span v-else class="package-price-free">标准</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 预订选择区域 -->
      <div class="booking-section-wrapper">
        <div class="booking-section">
          <div class="booking-items">
            <div class="booking-item">
              <span class="booking-label">套餐：</span>
              <select v-model="selectedPackageType" class="booking-select" @change="handleBatchPackageSelect">
                <option value="">请选择批次套餐</option>
                <option v-for="pkg in batchPackages" :key="pkg.id" :value="String(pkg.id)">
                  {{ pkg.name }} {{ pkg.extraFeePerPerson > 0 ? `(+¥${pkg.extraFeePerPerson}/人)` : '' }}
                </option>
              </select>
            </div>
            <div class="booking-item">
              <span class="booking-label">行程：</span>
              <select v-model="selectedTrip" class="booking-select" @change="handleTripSelect">
                <option value="">请选择行程套餐</option>
                <option v-for="pkg in tripPackages" :key="pkg.id" :value="String(pkg.id)">
                  {{ pkg.name }} (成人¥{{ pkg.adultPrice }}<span v-if="hasChildPrice">/儿童¥{{ pkg.childPrice }}</span>)
                </option>
              </select>
            </div>
            <div class="booking-item">
              <span class="booking-label">批次：</span>
              <select v-model="selectedBatchDate" class="booking-select" @change="handleBatchDateChange">
                <option value="">请选择出发日期</option>
                <option v-for="batch in batchDatesWithDisplay" :key="batch.date" :value="batch.date">
                  {{ batch.date }} ({{ batch.weekdayName }}) - 成人¥{{ batch.finalAdultPrice }}<span v-if="hasChildPrice"> / 儿童¥{{ batch.finalChildPrice }}</span>
                </option>
              </select>
            </div>
            <div class="booking-item">
              <span class="booking-label">成人：</span>
              <div
                class="number-input-wrapper"
                @mouseenter="showAdultDropdown = true"
                @mouseleave="showAdultDropdown = false"
              >
                <div class="number-input">
                  <button class="num-btn" @click="decreaseAdult">-</button>
                  <input type="text" :value="adultCount" readonly />
                  <button class="num-btn" @click="increaseAdult">+</button>
                </div>
                <div v-show="showAdultDropdown" class="person-dropdown">
                  <div
                    v-for="num in personCountOptions"
                    :key="`adult-${num}`"
                    :class="['dropdown-option', { active: adultCount === num }]"
                    @click="setAdultCount(num)"
                  >
                    {{ num }}人
                  </div>
                </div>
              </div>
            </div>
            <div v-if="hasChildPrice" class="booking-item">
              <span class="booking-label">儿童：</span>
              <div
                class="number-input-wrapper"
                @mouseenter="showChildDropdown = true"
                @mouseleave="showChildDropdown = false"
              >
                <div class="number-input">
                  <button class="num-btn" @click="decreaseChild">-</button>
                  <input type="text" :value="childCount" readonly />
                  <button class="num-btn" @click="increaseChild">+</button>
                </div>
                <div v-show="showChildDropdown" class="person-dropdown">
                  <div
                    v-for="num in personCountOptions"
                    :key="`child-${num}`"
                    :class="['dropdown-option', { active: childCount === num }]"
                    @click="setChildCount(num)"
                  >
                    {{ num }}人
                  </div>
                </div>
              </div>
            </div>
            <div v-if="isSelectionComplete" class="booking-total">
              <div class="total-detail">
                <span class="total-label">单价：</span>
                <span class="total-unit">成人¥{{ currentFinalAdultPrice }}<span v-if="hasChildPrice"> / 儿童¥{{ currentFinalChildPrice }}</span></span>
              </div>
              <div class="total-amount">
                <span class="total-label">总额：</span>
                <span class="total-value">¥{{ totalPrice }}</span>
              </div>
            </div>
          </div>
          <button class="submit-btn" @click="handleBooking">立刻报名</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
// import { getProductDetail } from '@/api/product' // 后端API

// =============================================
// 常量定义
// =============================================
const MAX_PERSON_COUNT = 50
const personCountOptions = Array.from({ length: 51 }, (_, i) => i)
const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const route = useRoute()

// =============================================
// 响应式数据
// =============================================
// 产品信息
const productInfo = ref({
  title: '',
  subtitle: '',
  code: '',
  days: 1,
  departure: '',
  enrolledCount: 0,
  notice: ''
})

const productTags = ref([])
const productFeatures = ref([])
const supplierInfo = ref({ name: '' })
const refundPolicy = ref({ support: '', special: '' })

// =============================================
// 媒体数据配置（从后端获取）
// =============================================
const hasVideo = ref(false)           // 是否有视频
const videoUrl = ref('')              // 视频地址
const showControls = ref(false)       // 控制栏显示状态
const mediaList = ref([])             // 封面列表（图片或视频封面）
const currentMediaIndex = ref(0)      // 当前选中的封面索引
const currentImageIndex = ref(0)      // 当前显示的图片索引（无视频时）
const videoPlayer = ref(null)         // 视频播放器引用

// 当前视频封面
const currentPoster = computed(() => {
  return mediaList.value[currentMediaIndex.value]?.poster || mediaList.value[0]?.poster || ''
})

// 没有视频时使用的图片
const productImages = ref({
  main: [],
  thumbnails: []
})

const currentImage = computed(() => {
  return productImages.value.main[currentImageIndex.value] || ''
})

// =============================================
// 行程套餐数据
// =============================================
const tripPackages = ref([])

// 判断是否有儿童价
const hasChildPrice = computed(() => {
  return tripPackages.value.some(pkg => 
    pkg.childPrice !== null && 
    pkg.childPrice !== undefined && 
    pkg.childPrice > 0
  )
})

// 批次套餐数据
const batchPackages = ref([])

// 出发日期数据
const batchDates = ref([])

// =============================================
// UI 状态
// =============================================
const viewMode = ref('calendar')
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const selectedDate = ref('')
const selectedBatchDate = ref('')
const selectedPackage = ref(1)
const selectedBatchPackage = ref(1)
const selectedPackageType = ref('')
const selectedTrip = ref('')
const adultCount = ref(1)
const childCount = ref(0)
const showAdultDropdown = ref(false)
const showChildDropdown = ref(false)
const currentBatch = ref(null)

// =============================================
// 计算属性 - 最低价
// =============================================
const minAdultPrice = computed(() => {
  if (tripPackages.value.length === 0) return 0
  return Math.min(...tripPackages.value.map(p => p.adultPrice))
})

const minChildPrice = computed(() => {
  if (!hasChildPrice.value) return 0
  const packagesWithChild = tripPackages.value.filter(p => p.childPrice !== null && p.childPrice > 0)
  if (packagesWithChild.length === 0) return 0
  return Math.min(...packagesWithChild.map(p => p.childPrice))
})

// =============================================
// 计算属性 - 选中的套餐
// =============================================
const selectedTripPackage = computed(() => {
  return tripPackages.value.find(pkg => pkg.id === selectedPackage.value)
})

const selectedBatchPackageData = computed(() => {
  return batchPackages.value.find(pkg => pkg.id === selectedBatchPackage.value)
})

// =============================================
// 计算属性 - 最终价格
// =============================================
const currentFinalAdultPrice = computed(() => {
  const tripAdultPrice = selectedTripPackage.value?.adultPrice || 0
  const dateAdultExtra = currentBatch.value?.adultDateExtraFee || 0
  const batchExtra = selectedBatchPackageData.value?.extraFeePerPerson || 0
  return tripAdultPrice + dateAdultExtra + batchExtra
})

const currentFinalChildPrice = computed(() => {
  if (!hasChildPrice.value) return 0
  const tripChildPrice = selectedTripPackage.value?.childPrice ?? selectedTripPackage.value?.adultPrice ?? 0
  const dateChildExtra = currentBatch.value?.childDateExtraFee || 0
  const batchExtra = selectedBatchPackageData.value?.extraFeePerPerson || 0
  return tripChildPrice + dateChildExtra + batchExtra
})

const totalPrice = computed(() => {
  const adultTotal = adultCount.value * currentFinalAdultPrice.value
  const childTotal = hasChildPrice.value ? childCount.value * currentFinalChildPrice.value : 0
  return adultTotal + childTotal
})

// =============================================
// 计算属性 - 批次列表展示
// =============================================
const batchDatesWithDisplay = computed(() => {
  const tripAdultPrice = selectedTripPackage.value?.adultPrice || 0
  const tripChildPrice = hasChildPrice.value ? (selectedTripPackage.value?.childPrice ?? tripAdultPrice) : 0
  const batchExtra = selectedBatchPackageData.value?.extraFeePerPerson || 0

  return batchDates.value.map(batch => {
    const date = new Date(batch.date)
    return {
      ...batch,
      weekdayName: weekdayNames[date.getDay()],
      finalAdultPrice: tripAdultPrice + (batch.adultDateExtraFee || 0) + batchExtra,
      finalChildPrice: hasChildPrice.value ? (tripChildPrice + (batch.childDateExtraFee || 0) + batchExtra) : 0
    }
  })
})

// =============================================
// 计算属性 - 日历
// =============================================
const getBatchForDate = (dateStr) => {
  const batch = batchDates.value.find(b => b.date === dateStr)
  if (!batch) return null

  const tripAdultPrice = selectedTripPackage.value?.adultPrice || 0
  const tripChildPrice = hasChildPrice.value ? (selectedTripPackage.value?.childPrice ?? tripAdultPrice) : 0
  const batchExtra = selectedBatchPackageData.value?.extraFeePerPerson || 0

  return {
    ...batch,
    finalAdultPrice: tripAdultPrice + (batch.adultDateExtraFee || 0) + batchExtra,
    finalChildPrice: hasChildPrice.value ? (tripChildPrice + (batch.childDateExtraFee || 0) + batchExtra) : 0
  }
}

const getWeekday = (dateStr) => {
  const date = new Date(dateStr)
  return weekdayNames[date.getDay()]
}

const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value, 0)
  const startDay = firstDay.getDay()

  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value - 1, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthLastDay - i, otherMonth: true, hasTrip: false, isWeekend: false, fullDate: null, batch: null })
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value - 1, i)
    const dateStr = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const batch = getBatchForDate(dateStr)
    days.push({
      day: i,
      otherMonth: false,
      hasTrip: !!batch,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      fullDate: dateStr,
      batch: batch || null
    })
  }

  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ day: i, otherMonth: true, hasTrip: false, isWeekend: false, fullDate: null, batch: null })
  }

  return days
})

const isSelectionComplete = computed(() => {
  return selectedPackageType.value && selectedTrip.value && selectedBatchDate.value && adultCount.value > 0
})

// =============================================
// 方法
// =============================================
const prevMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const toggleDateSelection = (item) => {
  if ('fullDate' in item) {
    if (item.otherMonth || !item.hasTrip || !item.batch) return
    if (selectedDate.value === item.fullDate) {
      selectedDate.value = ''
      selectedBatchDate.value = ''
      currentBatch.value = null
    } else {
      selectedDate.value = item.fullDate
      selectedBatchDate.value = item.fullDate
      currentBatch.value = item.batch
    }
  } else {
    if (selectedBatchDate.value === item.date) {
      selectedDate.value = ''
      selectedBatchDate.value = ''
      currentBatch.value = null
    } else {
      selectedDate.value = item.date
      selectedBatchDate.value = item.date
      currentBatch.value = item
    }
  }
}

// 选择媒体（切换封面/图片）
// 核心修改：只暂停视频，不重置进度
const selectMedia = (index) => {
  if (hasVideo.value) {
    // 有视频时：切换封面，只暂停视频（保留进度），隐藏控制栏
    if (videoPlayer.value) {
      videoPlayer.value.pause()           // 只暂停，不重置 currentTime
      showControls.value = false          // 隐藏控制栏，让自定义播放按钮重新显示
    }
    // 切换封面
    currentMediaIndex.value = index
  } else {
    // 无视频时：切换图片
    currentImageIndex.value = index
  }
}

// 播放视频
const playVideo = () => {
  if (videoPlayer.value) {
    videoPlayer.value.play()
    showControls.value = true
  }
}

// 视频播放结束
const handleVideoEnded = () => {
  // 可选：视频结束后重置控制栏，重新显示播放按钮
  // showControls.value = false
}

const selectTripPackage = (id) => {
  selectedPackage.value = id
  selectedTrip.value = String(id)
  refreshCurrentBatchPrice()
}

const selectBatchPackage = (id) => {
  selectedBatchPackage.value = id
  selectedPackageType.value = String(id)
  refreshCurrentBatchPrice()
}

const handleTripSelect = () => {
  if (selectedTrip.value) {
    selectedPackage.value = parseInt(selectedTrip.value)
  }
  refreshCurrentBatchPrice()
}

const handleBatchPackageSelect = () => {
  if (selectedPackageType.value) {
    selectedBatchPackage.value = parseInt(selectedPackageType.value)
  }
  refreshCurrentBatchPrice()
}

const handleBatchDateChange = () => {
  if (selectedBatchDate.value) {
    const batch = batchDatesWithDisplay.value.find(b => b.date === selectedBatchDate.value)
    currentBatch.value = batch || null
    selectedDate.value = selectedBatchDate.value
  }
}

const refreshCurrentBatchPrice = () => {
  if (selectedBatchDate.value) {
    const batch = batchDatesWithDisplay.value.find(b => b.date === selectedBatchDate.value)
    if (batch) currentBatch.value = batch
  }
}

const increaseAdult = () => {
  if (adultCount.value < MAX_PERSON_COUNT) adultCount.value++
}
const decreaseAdult = () => {
  if (adultCount.value > 0) adultCount.value--
}
const setAdultCount = (num) => {
  adultCount.value = num
  showAdultDropdown.value = false
}

const increaseChild = () => {
  if (childCount.value < MAX_PERSON_COUNT) childCount.value++
}
const decreaseChild = () => {
  if (childCount.value > 0) childCount.value--
}
const setChildCount = (num) => {
  childCount.value = num
  showChildDropdown.value = false
}

const initDefaultSelection = () => {
  if (batchDates.value.length > 0) {
    const firstBatch = batchDates.value[0]
    selectedBatchDate.value = firstBatch.date
    selectedDate.value = firstBatch.date
    
    const tripAdultPrice = selectedTripPackage.value?.adultPrice || 0
    const tripChildPrice = hasChildPrice.value ? (selectedTripPackage.value?.childPrice ?? tripAdultPrice) : 0
    const batchExtra = selectedBatchPackageData.value?.extraFeePerPerson || 0
    
    currentBatch.value = {
      ...firstBatch,
      finalAdultPrice: tripAdultPrice + (firstBatch.adultDateExtraFee || 0) + batchExtra,
      finalChildPrice: hasChildPrice.value ? (tripChildPrice + (firstBatch.childDateExtraFee || 0) + batchExtra) : 0
    }
  }
}

// =============================================
// 从后端获取数据
// =============================================
const fetchProductDetail = async () => {
  try {
    // TODO: 替换为真实的API调用
    // const productId = route.params.id
    // const res = await getProductDetail(productId)
    // if (res.code === 0) {
    //   const data = res.data
    //   productInfo.value = data.productInfo
    //   productTags.value = data.tags || []
    //   productFeatures.value = data.features || []
    //   supplierInfo.value = data.supplier || { name: '' }
    //   refundPolicy.value = data.refundPolicy || { support: '', special: '' }
    //   tripPackages.value = data.tripPackages || []
    //   batchPackages.value = data.batchPackages || []
    //   batchDates.value = data.batchDates || []
    //   
    //   // 处理图片和视频 - 根据是否有视频链接自动切换模式
    //   if (data.video && data.video.url) {
    //     hasVideo.value = true
    //     videoUrl.value = data.video.url
    //     mediaList.value = data.video.posters || data.images?.thumbnails?.map(thumb => ({
    //       thumbnail: thumb,
    //       poster: thumb
    //     })) || []
    //   } else {
    //     hasVideo.value = false
    //     productImages.value = data.images || { main: [], thumbnails: [] }
    //     mediaList.value = productImages.value.thumbnails.map((thumb, idx) => ({
    //       thumbnail: thumb,
    //       poster: productImages.value.main[idx] || thumb
    //     }))
    //   }
    //   
    //   // 设置默认选中
    //   if (tripPackages.value.length > 0) {
    //     selectedPackage.value = tripPackages.value[0].id
    //     selectedTrip.value = String(tripPackages.value[0].id)
    //   }
    //   if (batchPackages.value.length > 0) {
    //     selectedBatchPackage.value = batchPackages.value[0].id
    //     selectedPackageType.value = String(batchPackages.value[0].id)
    //   }
    //   
    //   initDefaultSelection()
    // }

    // ========== Mock 数据（演示用，对接后端时删除）==========
    await new Promise(resolve => setTimeout(resolve, 300))
    
    productInfo.value = {
      title: '极道·小鹿池 | 金佛山强度穿越，重庆毕业线',
      subtitle: '<极道之徒·小鹿池>18km累计爬升1200米，龙岩城-小鹿池-石人峰，新人勿入！！！',
      code: 1,
      days: 1,
      departure: '重庆',
      enrolledCount: 253,
      notice: '周边游提前1天，国内游提前3天，出境游提前3-5天，APP和短信群发出团通知'
    }
    
    productTags.value = ['跟团游', '户外游', '登山徒步']
    productFeatures.value = ['强度穿越', '山城经典', '林海秘境', '小众线路']
    supplierInfo.value = { name: '重庆侠客行国际旅行社有限公司' }
    refundPolicy.value = { support: '支持退款', special: '特殊原因退订保障' }
    
    tripPackages.value = [
      { id: 1, name: '极道·小鹿池（标准套餐）', adultPrice: 158, childPrice: 79 },
      { id: 2, name: '极道·小鹿池（VIP套餐）', adultPrice: 198, childPrice: 99 },
      { id: 3, name: '极道·小鹿池（豪华套餐）', adultPrice: 258, childPrice: 129 }
    ]
    
    batchPackages.value = [
      { id: 1, name: '工贸集散·标准套餐', extraFeePerPerson: 0 },
      { id: 2, name: '工贸集散·含餐套餐', extraFeePerPerson: 30 },
      { id: 3, name: '市区上门接送', extraFeePerPerson: 50 }
    ]
    
    batchDates.value = [
      { date: '2026-05-05', adultDateExtraFee: 0, childDateExtraFee: 0, status: '可报名', remaining: 28 },
      { date: '2026-05-10', adultDateExtraFee: 0, childDateExtraFee: 0, status: '可报名', remaining: 15 },
      { date: '2026-05-12', adultDateExtraFee: 0, childDateExtraFee: 0, status: '可报名', remaining: 30 },
      { date: '2026-05-17', adultDateExtraFee: 0, childDateExtraFee: 0, status: '可报名', remaining: 22 },
      { date: '2026-05-21', adultDateExtraFee: 0, childDateExtraFee: 0, status: '可报名', remaining: 30 },
      { date: '2026-06-01', adultDateExtraFee: 0, childDateExtraFee: 0, status: '可报名', remaining: 45 }
    ]

    // 设置日历默认月份为最早有行程的月份
    const setDefaultCalendarMonth = () => {
      if (batchDates.value.length > 0) {
        // 找出最早的日期
        const earliestDate = batchDates.value.reduce((earliest, current) => {
          return new Date(current.date) < new Date(earliest.date) ? current : earliest
        }, batchDates.value[0])
        
        const earliestYear = new Date(earliestDate.date).getFullYear()
        const earliestMonth = new Date(earliestDate.date).getMonth() + 1
        
        currentYear.value = earliestYear
        currentMonth.value = earliestMonth
      }
    }

    // 调用这个函数
    setDefaultCalendarMonth()
    
    // 根据是否有视频链接自动决定模式
    // 有视频链接时使用视频模式
    const hasVideoLink = true  // 改为 false 测试纯图片模式
    const videoLink = 'https://vjs.zencdn.net/v/oceans.mp4'
    
    if (hasVideoLink && videoLink) {
      // 视频模式
      hasVideo.value = true
      videoUrl.value = videoLink
      mediaList.value = [
        { thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=150&h=100&fit=crop', poster: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop' },
        { thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=100&fit=crop', poster: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop' },
        { thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=150&h=100&fit=crop', poster: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop' },
        { thumbnail: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=150&h=100&fit=crop', poster: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&h=600&fit=crop' },
        { thumbnail: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=150&h=100&fit=crop', poster: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&h=600&fit=crop' }
      ]
    } else {
      // 纯图片模式
      hasVideo.value = false
      productImages.value = {
        main: [
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&h=600&fit=crop'
        ],
        thumbnails: [
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=150&h=100&fit=crop',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=100&fit=crop',
          'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=150&h=100&fit=crop',
          'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=150&h=100&fit=crop',
          'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=150&h=100&fit=crop'
        ]
      }
      mediaList.value = productImages.value.thumbnails.map((thumb, idx) => ({
        thumbnail: thumb,
        poster: productImages.value.main[idx] || thumb
      }))
    }
    
    // 设置默认选中
    if (tripPackages.value.length > 0) {
      selectedPackage.value = tripPackages.value[0].id
      selectedTrip.value = String(tripPackages.value[0].id)
    }
    if (batchPackages.value.length > 0) {
      selectedBatchPackage.value = batchPackages.value[0].id
      selectedPackageType.value = String(batchPackages.value[0].id)
    }
    
    initDefaultSelection()
  } catch (error) {
    console.error('获取产品详情失败:', error)
    ElMessage.error('加载产品信息失败')
  }
}

const handleBooking = async () => {
  if (!selectedPackageType.value) {
    ElMessage.warning('请选择批次套餐')
    return
  }
  if (!selectedTrip.value) {
    ElMessage.warning('请选择行程套餐')
    return
  }
  if (!selectedBatchDate.value) {
    ElMessage.warning('请选择出发日期')
    return
  }
  if (adultCount.value === 0) {
    ElMessage.warning('请选择成人数量')
    return
  }

  const orderData = {
    productId: productInfo.value.code,
    tripPackageId: selectedPackage.value,
    batchPackageId: selectedBatchPackage.value,
    batchDate: selectedBatchDate.value,
    adultCount: adultCount.value,
    childCount: hasChildPrice.value ? childCount.value : 0
  }

  try {
    await ElMessageBox.confirm(
      `请确认订单信息：\n\n` +
      `行程套餐：${selectedTripPackage.value?.name}\n` +
      `批次套餐：${selectedBatchPackageData.value?.name}\n` +
      `出发日期：${selectedBatchDate.value}\n` +
      `成人：${adultCount.value}人 × ¥${currentFinalAdultPrice.value}\n` +
      `${hasChildPrice.value ? `儿童：${childCount.value}人 × ¥${currentFinalChildPrice.value}\n` : ''}` +
      `────────────────\n` +
      `预计总额：¥${totalPrice.value}\n\n` +
      `（最终价格以系统计算为准）`,
      '确认订单信息',
      {
        confirmButtonText: '确认提交',
        cancelButtonText: '返回修改',
        type: 'info'
      }
    )
    
    // TODO: 调用后端API创建订单
    // const res = await createOrder(orderData)
    
    console.log('提交订单参数:', orderData)
    ElMessage.success(`预订成功，订单号：BK${Date.now()}`)
    
  } catch {
    ElMessage.info('已取消')
  }
}

const handleCopy = () => {
  const text = `${productInfo.value.title} - ${productInfo.value.code}`
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制')
}

const handleFavorite = () => {
  ElMessage.info('收藏功能开发中')
}

const showPriceDetail = () => {
  ElMessage.info('起价为标准套餐+标准批次+平日出发价格')
}

const handleOpenVip = () => {
  ElMessage.info('VIP开通功能开发中，敬请期待')
}

const viewSupplier = () => {
  ElMessage.info(`供应商：${supplierInfo.value.name}`)
}

const filterByDeparture = () => {
  ElMessage.info(`筛选 ${productInfo.value.departure} 出发的线路`)
}

const showRefundPolicy = () => {
  ElMessage.info('出发前3天可全额退款，出发前1天扣除50%')
}

const showNotice = () => {
  ElMessage.info('报名须知：请仔细阅读行程安排...')
}

const showPolicy = () => {
  ElMessage.info('优惠政策：早鸟优惠、团体优惠...')
}

const startCustomTravel = () => {
  ElMessage.info('定制旅行功能开发中')
}

// 监听视频源变化，重新加载视频
watch(videoUrl, (newUrl, oldUrl) => {
  if (newUrl && videoPlayer.value) {
    videoPlayer.value.load()
  }
})

// =============================================
// 生命周期
// =============================================
onMounted(() => {
  nextTick(() => {
    fetchProductDetail()
  })
})
</script>

<style scoped>
/* 样式保持不变 */
.travel-product-page {
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  background: #f5f5f5;
  min-height: 100vh;
}

.main-content {
  display: flex;
  flex-wrap: wrap;
  max-width: 1320px;
  margin: 0 auto;
  padding: 20px;
  gap: 30px;
  background: #fff;
  box-sizing: border-box;
}

.left-section {
  width: 540px;
  flex-shrink: 0;
}

.right-section {
  flex: 1;
  min-width: 300px;
}

.booking-section-wrapper {
  width: 100%;
  margin: 0 -15px;
}

.main-image-container {
  position: relative;
  width: 530px;
  height: 400px;
  overflow: hidden;
  border-radius: 4px;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #000;
  cursor: pointer;
}

.main-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 自定义播放按钮 - 居中显示 */
.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 64px;
  height: 64px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.play-button:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: translate(-50%, -50%) scale(1.1);
}

.play-button svg {
  margin-left: 4px;
}

.image-tags {
  position: absolute;
  top: 15px;
  left: 15px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.image-tags .tag {
  background: #f60;
  color: #fff;
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 2px;
}

.thumbnail-list {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  padding-right: 10px;
}

.thumbnail-item {
  position: relative;
  width: 100px;
  height: 60px;
  cursor: pointer;
  border: 2px solid transparent;
  overflow: hidden;
  border-radius: 4px;
}

.thumbnail-item.active {
  border-color: #f60;
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.view-toggle {
  margin-top: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.toggle-buttons {
  display: flex;
  gap: 0;
}

.toggle-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
}

.toggle-btn:first-child {
  border-radius: 4px 0 0 4px;
}

.toggle-btn:last-child {
  border-radius: 0 4px 4px 0;
  border-left: none;
}

.toggle-btn.active {
  background: #f60;
  color: #fff;
  border-color: #f60;
}

.calendar-container {
  width: 540px;
  margin-top: 15px;
}

.list-container {
  width: 540px;
  margin-top: 15px;
}

.batch-table {
  width: 100%;
  border-collapse: collapse;
}

.batch-table th,
.batch-table td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.batch-table th {
  background: #fafafa;
  font-weight: normal;
  color: #666;
}

.batch-table .selected-row {
  background: #fff8f5;
}

.list-price {
  color: #f60;
  font-weight: bold;
}

.list-price-note {
  margin-top: 10px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-tag.success {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-tag.warning {
  background: #fffbe6;
  color: #faad14;
  border: 1px solid #ffe58f;
}

.select-btn {
  padding: 4px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
}

.select-btn.selected {
  background: #f60;
  color: #fff;
  border-color: #f60;
}

.calendar-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.nav-btn {
  background: none;
  border: 1px solid #ddd;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
}

.current-month {
  font-size: 16px;
  font-weight: bold;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.calendar-weekdays span {
  font-size: 14px;
  color: #333;
}

.calendar-weekdays span.weekend {
  color: #f60;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  min-height: 70px;
  padding: 6px 4px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  cursor: default;
  transition: all 0.2s ease;
}

.calendar-day.other-month {
  color: #ccc;
  cursor: not-allowed;
}

.calendar-day.has-trip {
  background: #fff8f5;
  cursor: pointer;
  border: 2px solid transparent;
}

.calendar-day.has-trip:hover {
  background: #ffede0;
  border-color: #f60;
}

.calendar-day.selected {
  background: #f60 !important;
  border-color: #f60;
  border-radius: 6px;
}

.calendar-day.selected .day-number {
  color: #fff !important;
  font-weight: bold;
}

.calendar-day.selected .trip-status,
.calendar-day.selected .trip-prices {
  color: #fff !important;
}

.calendar-day.selected .trip-price {
  color: #fff !important;
}

.day-number {
  font-size: 14px;
  font-weight: 500;
}

.trip-info {
  margin-top: 4px;
}

.trip-status {
  display: block;
  font-size: 10px;
  color: #f60;
}

.trip-prices {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 2px;
}

.trip-price {
  display: block;
  font-size: 10px;
  color: #f60;
  font-weight: bold;
}

.trip-price.adult {
  color: #e94560;
}

.trip-price.child {
  color: #ff8c42;
}

.booking-section {
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 12px 15px;
  background: #fff;
  box-sizing: border-box;
}

.booking-items {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}

.booking-item {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  min-width: 0;
}

.booking-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
  padding-left: 12px;
  border-left: 1px solid #eee;
}

.total-detail {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.total-unit {
  color: #333;
}

.total-amount {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.total-label {
  font-size: 13px;
  color: #666;
}

.total-value {
  font-size: 22px;
  font-weight: bold;
  color: #f60;
}

.booking-label {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  flex-shrink: 0;
}

.booking-select {
  border: 1px solid #ddd;
  padding: 6px 25px 6px 8px;
  font-size: 13px;
  border-radius: 4px;
  min-width: 80px;
  max-width: 160px;
  appearance: none;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E") no-repeat right 8px center;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.booking-select:focus {
  border-color: #f60;
  outline: none;
}

.number-input-wrapper {
  position: relative;
  display: inline-block;
}

.number-input {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex-shrink: 0;
}

.number-input input {
  width: 30px;
  text-align: center;
  border: none;
  font-size: 13px;
  padding: 4px 0;
  outline: none;
}

.num-btn {
  background: #f5f5f5;
  border: none;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 14px;
  flex-shrink: 0;
}

.num-btn:hover {
  background: #eee;
}

.person-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  margin-top: 2px;
}

.dropdown-option {
  padding: 8px 12px;
  cursor: pointer;
  text-align: center;
  font-size: 13px;
  transition: background 0.15s;
}

.dropdown-option:hover {
  background: #fff8f5;
}

.dropdown-option.active {
  background: #f60;
  color: #fff;
}

.submit-btn {
  background: #f60;
  color: #fff;
  border: none;
  padding: 8px 20px;
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
  min-width: 80px;
}

.submit-btn:hover {
  background: #e55a00;
}

.product-header {
  margin-bottom: 15px;
}

.product-title {
  font-size: 22px;
  color: #333;
  font-weight: bold;
  margin: 0 0 10px 0;
}

.product-subtitle {
  font-size: 14px;
  color: #f60;
  margin: 0;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  color: #666;
}

.meta-right {
  display: flex;
  gap: 15px;
}

.enrolled strong {
  color: #f60;
}

.action-link {
  color: #999;
  cursor: pointer;
}

.action-link:hover {
  color: #f60;
}

.price-section {
  padding: 20px 0;
  border-bottom: 1px solid #eee;
  background-color: #fef9f3;
  border-radius: 8px;
  margin-bottom: 10px;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.price-label {
  font-size: 14px;
  color: #666;
  width: 80px;
  flex-shrink: 0;
}

.price-info {
  display: flex;
  gap: 30px;
}

.price-main {
  display: flex;
  align-items: baseline;
}

.currency {
  font-size: 16px;
  color: #f60;
}

.price-value {
  font-size: 36px;
  color: #f60;
  font-weight: bold;
  line-height: 1;
}

.price-unit {
  font-size: 12px;
  color: #999;
  margin-left: 5px;
}

.price-note {
  margin-top: 8px;
  padding-left: 95px;
  font-size: 12px;
  color: #999;
}

.duration-tag {
  background: #f60;
  color: #fff;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 4px;
}

.price-explain {
  font-size: 12px;
  color: #f60;
  text-decoration: none;
  margin-left: auto;
}

.vip-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(90deg, #fff8f0 0%, #fff 100%);
  border: 1px solid #ffe0c0;
  padding: 12px 15px;
  margin: 15px 0;
  border-radius: 4px;
}

.vip-text {
  font-size: 14px;
  color: #f60;
}

.vip-btn {
  background: #f60;
  color: #fff;
  border: none;
  padding: 8px 20px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
}

.info-row {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 14px;
}

.info-row--feature {
  background-color: #fef9f3;
  padding: 12px 0;
  border-radius: 4px;
  border-bottom: none;
  margin-bottom: 0;
}

.info-label {
  width: 80px;
  color: #666;
  flex-shrink: 0;
}

.info-link {
  color: #f60;
  text-decoration: none;
  cursor: pointer;
}

.info-text {
  color: #333;
  margin-right: 12px;
}

.feature-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.feature-tag {
  border: 1px solid #f60;
  color: #f60;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 4px;
}

.custom-travel {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  flex-wrap: wrap;
}

.custom-icon {
  font-size: 18px;
}

.custom-brand {
  font-weight: bold;
  color: #333;
}

.custom-text {
  color: #666;
}

.custom-link {
  color: #f60;
  text-decoration: none;
  cursor: pointer;
}

.custom-actions {
  margin-left: auto;
}

.custom-actions a {
  color: #f60;
  text-decoration: none;
  cursor: pointer;
}

.custom-actions .divider {
  color: #ddd;
  margin: 0 10px;
}

.package-row {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;
}

.package-label {
  width: 80px;
  font-size: 14px;
  color: #666;
  flex-shrink: 0;
}

.package-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.package-btn {
  border: 1px solid #f60;
  color: #f60;
  background: #fff;
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 140px;
}

.package-btn.active {
  background: #fff5f0;
}

.package-name {
  font-weight: bold;
  font-size: 14px;
}

.package-prices {
  display: flex;
  gap: 12px;
}

.package-price {
  font-size: 12px;
  font-weight: normal;
}

.package-price.adult {
  color: #e94560;
}

.package-price.child {
  color: #e94560;
}

.package-price-free {
  font-size: 12px;
  color: #52c41a;
  font-weight: normal;
}

@media (max-width: 1024px) {
  .booking-section {
    padding: 10px 12px;
    gap: 10px;
  }
  .booking-items {
    gap: 8px;
  }
  .booking-item {
    gap: 4px;
  }
  .booking-label {
    font-size: 12px;
  }
  .booking-select {
    font-size: 12px;
    padding: 5px 20px 5px 6px;
    min-width: 70px;
    max-width: 120px;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  .left-section {
    width: 100%;
  }
  .main-image-container {
    width: 100%;
  }
  .calendar-container {
    width: 100%;
  }
  .list-container {
    width: 100%;
    overflow-x: auto;
  }
  .booking-section {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  .booking-total {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    border-left: none;
    padding-left: 0;
    border-top: 1px solid #eee;
    padding-top: 10px;
    margin-top: 5px;
  }
  .submit-btn {
    width: 100%;
    margin-top: 10px;
  }
  .price-note {
    padding-left: 0;
  }
}
</style>