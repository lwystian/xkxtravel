<template>
  <div class="tickets-page">
    <!-- 筛选区域 - 移除了搜索框 -->
    <div class="filters-section" v-if="hasSearched">
      <div class="filters-container">
        <!-- 动态筛选条件行 - 只要有搜索结果就显示 -->
        <div class="filters-wrapper" v-if="hasSearched">
          <div class="filters-row">
            <!-- 行程类型筛选 - 动态生成 -->
            <div class="filter-item" v-if="availableFilters.tourTypes.length > 0">
              <span class="filter-label">行程类型：</span>
              <div class="filter-tags">
                <!-- 全部标签 -->
                <span
                  :class="['filter-tag', { active: !activeFilters.tourType }]"
                  @click="removeFilter('tourType')"
                >
                  全部
                  <span class="filter-count">({{ totalCount }})</span>
                </span>
                <span
                  v-for="item in availableFilters.tourTypes"
                  :key="item.value"
                  :class="['filter-tag', { active: activeFilters.tourType === item.value }]"
                  @click="toggleFilter('tourType', item.value)"
                >
                  {{ item.label }}
                  <span class="filter-count">({{ item.count }})</span>
                </span>
              </div>
            </div>

            <!-- 出发城市筛选 - 动态生成 -->
            <div class="filter-item" v-if="availableFilters.cities.length > 0">
              <span class="filter-label">出发城市：</span>
              <div class="filter-tags">
                <!-- 全部标签 -->
                <span
                  :class="['filter-tag', { active: !activeFilters.city }]"
                  @click="removeFilter('city')"
                >
                  全部
                  <span class="filter-count">({{ totalCount }})</span>
                </span>
                <span
                  v-for="item in availableFilters.cities"
                  :key="item.value"
                  :class="['filter-tag', { active: activeFilters.city === item.value }]"
                  @click="toggleFilter('city', item.value)"
                >
                  {{ item.label }}
                  <span class="filter-count">({{ item.count }})</span>
                </span>
              </div>
            </div>

            <!-- 目标地点筛选 - 动态生成 -->
            <div class="filter-item" v-if="availableFilters.destinations.length > 0">
              <span class="filter-label">目标地点：</span>
              <div class="filter-tags">
                <span
                  :class="['filter-tag', { active: !activeFilters.destination }]"
                  @click="removeFilter('destination')"
                >
                  全部
                  <span class="filter-count">({{ totalCount }})</span>
                </span>
                <span
                  v-for="item in availableFilters.destinations"
                  :key="item.value"
                  :class="['filter-tag', { active: activeFilters.destination === item.value }]"
                  @click="toggleFilter('destination', item.value)"
                >
                  {{ item.label }}
                  <span class="filter-count">({{ item.count }})</span>
                </span>
              </div>
            </div>

            <!-- 出行天数筛选 - 统一使用范围格式 -->
            <div class="filter-item" v-if="availableFilters.daysList.length > 0">
              <span class="filter-label">出行天数：</span>
              <div class="filter-tags">
                <span
                  :class="['filter-tag', { active: !activeFilters.days }]"
                  @click="removeFilter('days')"
                >
                  全部
                  <span class="filter-count">({{ totalCount }})</span>
                </span>
                <span
                  v-for="item in availableFilters.daysList"
                  :key="item.value"
                  :class="['filter-tag', { active: activeFilters.days === item.value }]"
                  @click="toggleFilter('days', item.value)"
                >
                  {{ item.label }}
                  <span class="filter-count">({{ item.count }})</span>
                </span>
              </div>
            </div>

            <!-- 出行时间筛选 - 动态生成 -->
            <div class="filter-item" v-if="availableFilters.months.length > 0">
              <span class="filter-label">出行时间：</span>
              <div class="filter-tags">
                <span
                  :class="['filter-tag', { active: !activeFilters.month }]"
                  @click="removeFilter('month')"
                >
                  全部
                  <span class="filter-count">({{ totalCount }})</span>
                </span>
                <span
                  v-for="item in availableFilters.months"
                  :key="item.value"
                  :class="['filter-tag', { active: activeFilters.month === item.value }]"
                  @click="toggleFilter('month', item.value)"
                >
                  {{ item.label }}
                  <span class="filter-count">({{ item.count }})</span>
                </span>
              </div>
            </div>

            <!-- 价格区间筛选 - 动态生成 -->
            <div class="filter-item" v-if="availableFilters.priceRanges.length > 0">
              <span class="filter-label">价格区间：</span>
              <div class="filter-tags">
                <span
                  :class="['filter-tag', { active: !activeFilters.priceRange }]"
                  @click="removeFilter('priceRange')"
                >
                  全部
                  <span class="filter-count">({{ totalCount }})</span>
                </span>
                <span
                  v-for="item in availableFilters.priceRanges"
                  :key="item.value"
                  :class="['filter-tag', { active: activeFilters.priceRange === item.value }]"
                  @click="toggleFilter('priceRange', item.value)"
                >
                  {{ item.label }}
                  <span class="filter-count">({{ item.count }})</span>
                </span>
              </div>
            </div>

            <!-- 产品主题筛选 - 动态生成 -->
            <div class="filter-item" v-if="availableFilters.themes.length > 0">
              <span class="filter-label">产品主题：</span>
              <div class="filter-tags">
                <span
                  :class="['filter-tag', { active: !activeFilters.theme }]"
                  @click="removeFilter('theme')"
                >
                  全部
                  <span class="filter-count">({{ totalCount }})</span>
                </span>
                <span
                  v-for="item in availableFilters.themes"
                  :key="item.value"
                  :class="['filter-tag', { active: activeFilters.theme === item.value }]"
                  @click="toggleFilter('theme', item.value)"
                >
                  {{ item.label }}
                  <span class="filter-count">({{ item.count }})</span>
                </span>
              </div>
            </div>
          </div>

          <!-- 已选筛选条件汇总 -->
          <div class="active-filters-bar" v-if="hasActiveFilters">
            <span class="active-label">已选条件：</span>
            <div class="active-tags">
              <span v-if="activeFilters.city" class="active-tag">
                {{ getCityLabel(activeFilters.city) }}
                <el-icon @click="removeFilter('city')"><Close /></el-icon>
              </span>
              <span v-if="activeFilters.destination" class="active-tag">
                {{ getDestinationLabel(activeFilters.destination) }}
                <el-icon @click="removeFilter('destination')"><Close /></el-icon>
              </span>
              <span v-if="activeFilters.days" class="active-tag">
                {{ getDaysLabel(activeFilters.days) }}
                <el-icon @click="removeFilter('days')"><Close /></el-icon>
              </span>
              <span v-if="activeFilters.month" class="active-tag">
                {{ getMonthLabel(activeFilters.month) }}
                <el-icon @click="removeFilter('month')"><Close /></el-icon>
              </span>
              <span v-if="activeFilters.priceRange" class="active-tag">
                {{ getPriceLabel(activeFilters.priceRange) }}
                <el-icon @click="removeFilter('priceRange')"><Close /></el-icon>
              </span>
              <span v-if="activeFilters.theme" class="active-tag">
                {{ getThemeLabel(activeFilters.theme) }}
                <el-icon @click="removeFilter('theme')"><Close /></el-icon>
              </span>
              <span class="clear-all" @click="clearAllFilters">清除全部</span>
            </div>
          </div>
        </div>

        <!-- 排序和结果统计 -->
        <div class="sort-bar" v-if="hasSearched">
          <div class="result-stats">
            <template v-if="searchKeyword">
              搜索“<strong class="search-keyword">{{ searchKeyword }}</strong>” 共找到 <strong>{{ filteredList.length }}</strong> 个行程
            </template>
            <template v-else>
              共找到 <strong>{{ filteredList.length }}</strong> 个行程
            </template>
          </div>
          <div class="sort-options">
            <span class="sort-label">排序：</span>
            <div class="sort-tags">
              <span
                v-for="item in sortOptions"
                :key="item.value"
                :class="['sort-tag', { active: sortType === item.value }]"
                @click="sortType = item.value"
              >
                {{ item.label }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 行程列表区域 -->
    <div class="tickets-list">
      <div
        v-for="item in paginatedList"
        :key="item.id"
        class="ticket-card"
        @click="goToDetail(item.id)"
      >
        <!-- 左侧图片 -->
        <div class="card-image">
          <img :src="item.mainImage" :alt="item.title" />
          <span class="image-tag">{{ item.tag }}</span>
        </div>

        <!-- 中间信息 -->
        <div class="card-content">
          <div class="card-title">
            <div class="star-badge">
              <span class="num">{{ item.starRating || 4.8 }}</span>
              <span class="star">★</span>
            </div>
            <h3>{{ item.title }}</h3>
          </div>

          <!-- 出发城市 - 左对齐显示 -->
          <div class="card-row departure-row">
            <span class="row-label departure-label">出发城市：</span>
            <span class="row-departure">{{ item.subtitle }}</span>
          </div>

          <div class="card-row">
            <span class="row-label">推荐班期：</span>
            <span class="row-date">{{ item.recommendDate }}</span>
            <span class="row-label more-label">更多班期：</span>
            <span class="row-more">{{ item.moreDates }}</span>
          </div>

          <div class="card-row feature-row">
            <span class="row-label">班期特色：</span>
            <span class="row-feature">{{ item.feature }}</span>
          </div>

          <!-- 标签组 -->
          <div class="card-tags">
            <span class="card-tag" v-for="tag in item.tags" :key="tag">{{ tag }}</span>
          </div>
        </div>

        <!-- 右侧价格 - 底部对齐 -->
        <div class="card-price">
          <div class="price-wrapper">
            <span class="currency">¥</span>
            <span class="price">{{ formatPrice(item.minPrice) }}</span>
            <span class="unit">起/人</span>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container" v-if="filteredList.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="filteredList.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 空状态 -->
      <div v-if="filteredList.length === 0 && hasSearched && !loading" class="empty-state">
        <el-empty :description="`没有找到“${searchKeyword}”相关的行程`" />
        <el-button type="primary" plain @click="resetSearch">查看全部行程</el-button>
      </div>

      <!-- 初始状态 - 未搜索时显示热门推荐 -->
      <div v-if="!hasSearched && !loading" class="initial-state">
        <div class="hot-search">
          <span class="hot-title">热门推荐：</span>
          <span class="hot-tag" @click="quickSearch('西沙')">西沙</span>
          <span class="hot-tag" @click="quickSearch('重庆')">重庆</span>
          <span class="hot-tag" @click="quickSearch('徒步')">徒步</span>
          <span class="hot-tag" @click="quickSearch('邮轮')">邮轮</span>
          <span class="hot-tag" @click="quickSearch('四川')">四川</span>
          <span class="hot-tag" @click="quickSearch('云南')">云南</span>
        </div>
        <div class="recommend-section">
          <h3>精选推荐</h3>
          <div class="recommend-list">
            <div class="recommend-card" v-for="item in recommendList" :key="item.id" @click="goToDetail(item.id)">
              <img :src="item.mainImage" :alt="item.title" />
              <div class="recommend-info">
                <h4>{{ item.title }}</h4>
                <p class="recommend-price">¥{{ formatPrice(item.minPrice) }}起</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Loading, Close } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// =============================================
// 常量定义
// =============================================
// 出发城市映射
const cityMap = {
  chongqing: '重庆', chengdu: '成都', kunming: '昆明', guiyang: '贵阳',
  sanya: '三亚', beijing: '北京', shanghai: '上海', changsha: '长沙',
  yichang: '宜昌', hangzhou: '杭州', haikou: '海口', wanzhou: '万州',
  fuling: '涪陵', enshi: '恩施', guangzhou: '广州', shenzhen: '深圳'
}

// 解析标签（处理字符串或数组格式）
const parseTags = (tags) => {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  if (typeof tags === 'string') {
    // 尝试解析JSON数组
    try {
      return JSON.parse(tags)
    } catch {
      // 如果不是JSON，按逗号分隔
      return tags.split(',').map(t => t.trim()).filter(t => t)
    }
  }
  return []
}

// 目标地点映射（原目的地）
const destinationMap = {
  chongqing: '重庆', sichuan: '四川', yunnan: '云南', guizhou: '贵州',
  hunan: '湖南', hubei: '湖北', hainan: '海南',
  sanyan: '三峡', xisha: '西沙'
}

const daysMap = {
  // 周边游精确天数
  '1': '1天', '2': '2天', '3': '3天', '4': '4天', '5': '5天',
  // 普通行程范围
  '1-3': '1-3天', '4-6': '4-6天', '7-9': '7-9天', '10+': '10天以上'
}

const monthMap = {
  '1': '1月', '2': '2月', '3': '3月', '4': '4月', '5': '5月',
  '6': '6月', '7': '7月', '8': '8月', '9': '9月', '10': '10月',
  '11': '11月', '12': '12月'
}

const priceMap = {
  '0-500': '¥500以下', '500-1000': '¥500-1000',
  '1000-2000': '¥1000-2000', '2000+': '¥2000以上'
}

const themeMap = {
  hiking: '户外徒步', cultural: '人文古迹', scenic: '自然风光',
  city: '城市漫步', family: '亲子游'
}

// 行程类型映射
const tourTypeMap = {
  around: '周边游', long: '长线游', team: '跟团游', cruise: '邮轮出行'
}

// 排序选项
const sortOptions = ref([
  { value: 'default', label: '默认排序' },
  { value: 'price_asc', label: '价格升序' },
  { value: 'price_desc', label: '价格降序' },
  { value: 'popular', label: '人气最高' }
])

// =============================================
// 响应式数据
// =============================================
const searchKeyword = ref('')
const hasSearched = ref(false)
const loading = ref(false)
const sortType = ref('default')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 当前活跃的筛选条件
const activeFilters = ref({
  tourType: '',
  city: '',
  destination: '',
  days: '',
  month: '',
  priceRange: '',
  theme: ''
})

// 基于当前搜索结果可用的筛选选项
const availableFilters = ref({
  tourTypes: [],
  cities: [],
  destinations: [],
  daysList: [],
  months: [],
  priceRanges: [],
  themes: []
})

// 完整的行程列表（静态数据）
const fullTicketsList = ref([])

// 当前搜索结果列表
const currentSearchResults = ref([])

// 总数量（用于全部标签显示）
const totalCount = computed(() => currentSearchResults.value.length)

// =============================================
// Mock 数据（增加了 city 和 month 字段）
// =============================================
const mockTicketsList = [
  {
    id: 1,
    title: '极道·小鹿池 | 金佛山强度穿越，重庆毕业线',
    subtitle: '重庆出发',
    mainImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop',
    tag: '跟团游·户外徒步',
    city: 'chongqing',
    destination: 'chongqing',
    days: 1,
    month: 5,
    minPrice: 158,
    starRating: 4.9,
    recommendDate: '2026-05-05 周一',
    moreDates: '05-10、05-12、05-17、05-21、06-01',
    feature: '18km累计爬升1200米，龙岩城-小鹿池-石人峰，新人勿入！！！',
    tags: ['强度穿越', '山城经典', '林海秘境'],
    enrolledCount: 253,
    theme: 'hiking'
  },
  {
    id: 2,
    title: '南海邮轮·南海之梦·三亚-三沙-三亚·3天2晚',
    subtitle: '三亚出发',
    mainImage: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=400&h=300&fit=crop',
    tag: '邮轮船票·西沙群岛航线',
    tourType: 'cruise',
    city: 'sanya',
    destination: 'xisha',
    days: 3,
    month: 5,
    minPrice: 4680,
    starRating: 4.8,
    recommendDate: '2026-05-01 周五',
    moreDates: '05-13、05-21、05-25、05-29',
    feature: '"五一特惠"预定南海之梦号邮轮5月1日航次，16岁以下青少年儿童入...',
    tags: ['邮轮', '海岛', '西沙群岛'],
    enrolledCount: 128,
    theme: 'scenic'
  },
  {
    id: 3,
    title: '海南海峡·祥龙岛·三亚-三沙-三亚·3天2晚',
    subtitle: '三亚出发',
    mainImage: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=400&h=300&fit=crop',
    tag: '邮轮船票·西沙群岛航线',
    tourType: 'cruise',
    city: 'sanya',
    destination: 'xisha',
    days: 3,
    month: 5,
    minPrice: 5490,
    starRating: 4.7,
    recommendDate: '2026-05-23 周六',
    moreDates: '04-28、05-03、05-07、05-11、05-15、05-19、05-27',
    feature: '官方代理【咨询客服享优惠】圆梦西沙 登赵述岛升国旗唱国歌 父母...',
    tags: ['邮轮', '官方代理', '西沙'],
    enrolledCount: 89,
    theme: 'scenic'
  },
  {
    id: 4,
    title: '峨眉山·乐山大佛·都江堰·青城山·4天3晚深度游',
    subtitle: '成都出发·纯玩无购物',
    mainImage: 'https://images.unsplash.com/photo-1554048612-b6a482bc67a4?w=400&h=300&fit=crop',
    tag: '跟团游·文化古迹',
    city: 'chengdu',
    destination: 'sichuan',
    days: 4,
    month: 5,
    minPrice: 1280,
    starRating: 4.6,
    recommendDate: '2026-05-15 周四',
    moreDates: '05-22、05-29、06-05',
    feature: '深度游览四川四大景点，含全程星级住宿，金牌导游讲解',
    tags: ['佛教圣地', '世界遗产', '纯玩'],
    enrolledCount: 156,
    theme: 'cultural'
  },
  {
    id: 5,
    title: '稻城亚丁·色达·新都桥·7天6晚摄影之旅',
    subtitle: '成都出发·摄影团·小团出行',
    mainImage: 'https://images.unsplash.com/photo-1516483638261-f4dbaf03663a?w=400&h=300&fit=crop',
    tag: '跟团游·摄影专线',
    city: 'chengdu',
    destination: 'sichuan',
    days: 7,
    month: 6,
    minPrice: 3280,
    starRating: 4.9,
    recommendDate: '2026-05-20 周三',
    moreDates: '06-03、06-17、07-01',
    feature: '摄影领队全程跟拍，独家机位，邂逅"蓝色星球上最后一片净土"',
    tags: ['摄影天堂', '高原风光', '小团'],
    enrolledCount: 67,
    theme: 'scenic'
  },
  {
    id: 6,
    title: '大理·丽江·泸沽湖·6天5晚休闲游',
    subtitle: '昆明出发·丽江散团',
    mainImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
    tag: '跟团游·休闲度假',
    city: 'kunming',
    destination: 'yunnan',
    days: 6,
    month: 5,
    minPrice: 1980,
    starRating: 4.7,
    recommendDate: '2026-05-18 周一',
    moreDates: '05-25、06-08、06-22',
    feature: '慢游云南经典环线，入住特色客栈，含泸沽湖猪槽船体验',
    tags: ['风花雪月', '慢生活', '网红打卡'],
    enrolledCount: 203,
    theme: 'city'
  },
  {
    id: 7,
    title: '西江千户苗寨·黄果树瀑布·荔波小七孔·5天4晚',
    subtitle: '贵阳出发·深度贵州',
    mainImage: 'https://images.unsplash.com/photo-1528127269322-5398015f1a5b?w=400&h=300&fit=crop',
    tag: '跟团游·自然风光',
    city: 'guiyang',
    destination: 'guizhou',
    days: 5,
    month: 6,
    minPrice: 1680,
    starRating: 4.8,
    recommendDate: '2026-05-12 周二',
    moreDates: '05-19、05-26、06-02',
    feature: '含西江苗寨长桌宴，黄果树VIP通道，荔波小七孔精华景点全覆盖',
    tags: ['瀑布', '苗寨', '喀斯特'],
    enrolledCount: 142,
    theme: 'scenic'
  },
  {
    id: 8,
    title: '西沙群岛·全富岛·银屿岛·4天3晚圆梦之旅',
    subtitle: '三亚出发·南海之梦号',
    mainImage: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=400&h=300&fit=crop',
    tag: '邮轮船票·西沙群岛航线',
    tourType: 'cruise',
    city: 'sanya',
    destination: 'xisha',
    days: 4,
    month: 6,
    minPrice: 5980,
    starRating: 4.9,
    recommendDate: '2026-06-01 周一',
    moreDates: '06-08、06-15、06-22',
    feature: '【西沙圆梦】登全富岛升国旗，银屿岛浮潜，体验西沙纯净海域',
    tags: ['西沙群岛', '邮轮', '升旗仪式'],
    enrolledCount: 234,
    theme: 'scenic'
  },
  // ==================== 三峡邮轮 ====================
  {
    id: 10,
    title: '长江三峡·世纪荣耀号·重庆-宜昌·3天2晚',
    subtitle: '重庆朝天门码头登船',
    mainImage: 'https://images.unsplash.com/photo-1537531383496-f4749b85ceb3?w=400&h=300&fit=crop',
    tag: '邮轮船票·三峡航线',
    tourType: 'cruise',
    city: 'chongqing',
    destination: 'sanyan',
    days: 3,
    month: 5,
    minPrice: 1680,
    starRating: 4.8,
    recommendDate: '2026-05-15 周四',
    moreDates: '05-22、05-29、06-05、06-12',
    feature: '乘坐世纪荣耀号五星豪华游轮，畅游三峡精华段，含船上自助餐',
    tags: ['豪华游轮', '三峡风光', '五星服务'],
    enrolledCount: 312,
    theme: 'scenic'
  },
  {
    id: 11,
    title: '长江三峡·华夏神女号·重庆-宜昌·4天3晚',
    subtitle: '重庆朝天门码头登船',
    mainImage: 'https://images.unsplash.com/photo-1537531383496-f4749b85ceb3?w=400&h=300&fit=crop',
    tag: '邮轮船票·三峡航线',
    tourType: 'cruise',
    city: 'chongqing',
    destination: 'sanyan',
    days: 4,
    month: 6,
    minPrice: 2280,
    starRating: 4.9,
    recommendDate: '2026-06-10 周二',
    moreDates: '06-17、06-24、07-01',
    feature: '华夏神女号主题游轮，含丰都鬼城、白帝城、瞿塘峡、巫峡、西陵峡',
    tags: ['主题游轮', '三峡全景', '精华景点'],
    enrolledCount: 256,
    theme: 'scenic'
  },
  {
    id: 12,
    title: '长江三峡·美维凯珍号·宜昌-重庆·5天4晚',
    subtitle: '宜昌港登船',
    mainImage: 'https://images.unsplash.com/photo-1537531383496-f4749b85ceb3?w=400&h=300&fit=crop',
    tag: '邮轮船票·三峡航线',
    tourType: 'cruise',
    city: 'yichang',
    destination: 'sanyan',
    days: 5,
    month: 7,
    minPrice: 3180,
    starRating: 4.7,
    recommendDate: '2026-07-05 周六',
    moreDates: '07-12、07-19、07-26',
    feature: '逆流而上深度游三峡，含三峡大坝、升船机体验、神农溪漂流',
    tags: ['逆流深度', '升船机', '神农溪'],
    enrolledCount: 178,
    theme: 'scenic'
  },
  {
    id: 9,
    title: '重庆武隆·天生三桥·仙女山·2天1晚',
    subtitle: '重庆出发·自然奇观',
    mainImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop',
    tag: '跟团游·自然风光',
    city: 'chongqing',
    destination: 'chongqing',
    days: 2,
    month: 5,
    minPrice: 398,
    starRating: 4.7,
    recommendDate: '2026-05-14 周四',
    moreDates: '05-21、05-28、06-04',
    feature: '《变形金刚4》取景地，天生三桥震撼景观，仙女山草原漫步',
    tags: ['武隆', '天生三桥', '仙女山'],
    enrolledCount: 178,
    theme: 'scenic'
  },
  {
    id: 10,
    title: '张家界·天门山·凤凰古城·5天4晚',
    subtitle: '长沙出发',
    mainImage: 'https://images.unsplash.com/photo-1516307361326-6a09d2adf6d0?w=400&h=300&fit=crop',
    tag: '跟团游·自然风光',
    city: 'changsha',
    destination: 'hunan',
    days: 5,
    month: 7,
    minPrice: 1880,
    starRating: 4.8,
    recommendDate: '2026-07-10 周五',
    moreDates: '07-17、07-24、07-31',
    feature: '张家界核心景区+玻璃桥+凤凰古城夜景',
    tags: ['张家界', '凤凰古城', '玻璃桥'],
    enrolledCount: 112,
    theme: 'scenic'
  },
  // ==================== 重庆周边游 ====================
  {
    id: 101,
    title: '重庆一日游 | 洪崖洞、解放碑、长江索道',
    subtitle: '重庆出发',
    mainImage: 'https://images.unsplash.com/photo-1548611716-b3013a5efb29?w=400&h=300&fit=crop',
    tag: '周边游·一日游',
    tourType: 'around',
    city: 'chongqing',
    destination: 'chongqing',
    days: 1,
    month: 5,
    minPrice: 168,
    starRating: 4.6,
    recommendDate: '2026-05-10 周六',
    moreDates: '每天发团',
    feature: '打卡重庆网红景点，解放碑步行街、洪崖洞夜景、长江索道观江景',
    tags: ['网红打卡', '一日游', '纯玩'],
    enrolledCount: 325,
    theme: 'city'
  },
  {
    id: 102,
    title: '重庆二日游 | 武隆天生三桥、仙女山',
    subtitle: '重庆出发',
    mainImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop',
    tag: '周边游·二日游',
    tourType: 'around',
    city: 'chongqing',
    destination: 'chongqing',
    days: 2,
    month: 5,
    minPrice: 458,
    starRating: 4.8,
    recommendDate: '2026-05-11 周日',
    moreDates: '每周六发团',
    feature: '探秘世界自然遗产天生三桥，畅游仙女山国家森林公园',
    tags: ['世界遗产', '自然奇观', '避暑'],
    enrolledCount: 256,
    theme: 'scenic'
  },
  {
    id: 103,
    title: '重庆三日游 | 大足石刻、黑山谷、龙鳞石海',
    subtitle: '重庆出发',
    mainImage: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=300&fit=crop',
    tag: '周边游·三日游',
    tourType: 'around',
    city: 'chongqing',
    destination: 'chongqing',
    days: 3,
    month: 5,
    minPrice: 688,
    starRating: 4.7,
    recommendDate: '2026-05-16 周五',
    moreDates: '05-23、05-30',
    feature: '世界文化遗产大足石刻，巴渝古韵自然风光三日深度游',
    tags: ['世界遗产', '石刻艺术', '深度游'],
    enrolledCount: 189,
    theme: 'cultural'
  },
  {
    id: 104,
    title: '重庆四日游 | 三峡博物馆、白帝城、夔门、巫山',
    subtitle: '重庆出发',
    mainImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    tag: '周边游·四日游',
    tourType: 'around',
    city: 'chongqing',
    destination: 'chongqing',
    days: 4,
    month: 6,
    minPrice: 898,
    starRating: 4.9,
    recommendDate: '2026-06-05 周四',
    moreDates: '06-12、06-19',
    feature: '游览三峡起点白帝城，夔门雄姿，巫山小三峡画廊',
    tags: ['三峡风光', '诗词文化', '船游'],
    enrolledCount: 145,
    theme: 'scenic'
  },
  {
    id: 105,
    title: '重庆五日游 | 武隆、大足、涪陵816、丰都鬼城',
    subtitle: '重庆出发',
    mainImage: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=300&fit=crop',
    tag: '周边游·五日游',
    tourType: 'around',
    city: 'chongqing',
    destination: 'chongqing',
    days: 5,
    month: 6,
    minPrice: 1280,
    starRating: 4.8,
    recommendDate: '2026-06-08 周一',
    moreDates: '06-15、06-22',
    feature: '全景重庆五日深度游，涵盖世界遗产、三线遗迹、鬼城文化',
    tags: ['全景重庆', '文化之旅', '深度游'],
    enrolledCount: 98,
    theme: 'cultural'
  },
  // ==================== 宜昌周边游 ====================
  {
    id: 201,
    title: '宜昌一日游 | 三峡大坝、坛子岭',
    subtitle: '宜昌出发',
    mainImage: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=300&fit=crop',
    tag: '周边游·一日游',
    tourType: 'around',
    city: 'yichang',
    destination: 'hubei',
    days: 1,
    month: 5,
    minPrice: 198,
    starRating: 4.7,
    recommendDate: '2026-05-10 周六',
    moreDates: '每天发团',
    feature: '参观当今世界最大的水利发电工程，三峡大坝坛子岭观景区',
    tags: ['大国重器', '水利工程', '纯玩'],
    enrolledCount: 278,
    theme: 'scenic'
  },
  {
    id: 202,
    title: '宜昌二日游 | 三峡人家、西陵峡',
    subtitle: '宜昌出发',
    mainImage: 'https://images.unsplash.com/photo-1548611716-b3013a5efb29?w=400&h=300&fit=crop',
    tag: '周边游·二日游',
    tourType: 'around',
    city: 'yichang',
    destination: 'hubei',
    days: 2,
    month: 5,
    minPrice: 428,
    starRating: 4.6,
    recommendDate: '2026-05-11 周日',
    moreDates: '每周六发团',
    feature: '畅游三峡人家景区，品味峡江民俗风情，观赏西陵峡绝美风光',
    tags: ['峡江风情', '民俗体验', '摄影'],
    enrolledCount: 196,
    theme: 'scenic'
  },
  {
    id: 203,
    title: '宜昌三日游 | 神农架、大九湖',
    subtitle: '宜昌出发',
    mainImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
    tag: '周边游·三日游',
    tourType: 'around',
    city: 'yichang',
    destination: 'hubei',
    days: 3,
    month: 5,
    minPrice: 798,
    starRating: 4.9,
    recommendDate: '2026-05-16 周五',
    moreDates: '05-23、05-30',
    feature: '探访华中屋脊神农架，漫步大九湖高山湿地，感受原始生态之美',
    tags: ['神农架', '湿地风光', '洗肺之旅'],
    enrolledCount: 167,
    theme: 'scenic'
  },
  {
    id: 204,
    title: '宜昌四日游 | 神农架、三峡大坝、巫山',
    subtitle: '宜昌出发',
    mainImage: 'https://images.unsplash.com/photo-1516483638261-f4dbaf03663a?w=400&h=300&fit=crop',
    tag: '周边游·四日游',
    tourType: 'around',
    city: 'yichang',
    destination: 'hubei',
    days: 4,
    month: 6,
    minPrice: 1098,
    starRating: 4.8,
    recommendDate: '2026-06-05 周四',
    moreDates: '06-12、06-19',
    feature: '神农架深度游+三峡大坝+巫山小三峡，四日全景峡江之旅',
    tags: ['全景三峡', '神农架', '深度游'],
    enrolledCount: 123,
    theme: 'scenic'
  },
  {
    id: 205,
    title: '宜昌五日游 | 神农架、大九湖、三峡人家、恩施大峡谷',
    subtitle: '宜昌出发',
    mainImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    tag: '周边游·五日游',
    tourType: 'around',
    city: 'yichang',
    destination: 'hubei',
    days: 5,
    month: 6,
    minPrice: 1580,
    starRating: 4.9,
    recommendDate: '2026-06-08 周一',
    moreDates: '06-15、06-22',
    feature: '宜昌、恩施全景五日游，涵盖神农架、大峡谷两大核心景区',
    tags: ['全景鄂西', '世界遗产', '精华游'],
    enrolledCount: 89,
    theme: 'scenic'
  },
  // ==================== 海南周边游 ====================
  {
    id: 301,
    title: '三亚一日游 | 天涯海角、鹿回头公园',
    subtitle: '三亚出发',
    mainImage: 'https://images.unsplash.com/photo-1559628233-100c798642d4?w=400&h=300&fit=crop',
    tag: '周边游·一日游',
    tourType: 'around',
    city: 'sanya',
    destination: 'hainan',
    days: 1,
    month: 5,
    minPrice: 188,
    starRating: 4.5,
    recommendDate: '2026-05-10 周六',
    moreDates: '每天发团',
    feature: '打卡海南标志性景点，天涯海角浪漫打卡，鹿回头俯瞰三亚全景',
    tags: ['浪漫打卡', '海滨风光', '纯玩'],
    enrolledCount: 456,
    theme: 'scenic'
  },
  {
    id: 302,
    title: '三亚二日游 | 蜈支洲岛、南山寺',
    subtitle: '三亚出发',
    mainImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    tag: '周边游·二日游',
    tourType: 'around',
    city: 'sanya',
    destination: 'hainan',
    days: 2,
    month: 5,
    minPrice: 598,
    starRating: 4.8,
    recommendDate: '2026-05-11 周日',
    moreDates: '每周六发团',
    feature: '中国版马尔代夫蜈支洲岛，佛教圣地南山寺祈福两日游',
    tags: ['海岛度假', '佛教祈福', '休闲游'],
    enrolledCount: 378,
    theme: 'scenic'
  },
  {
    id: 303,
    title: '三亚三日游 | 亚龙湾、呀诺达、分界洲岛',
    subtitle: '三亚出发',
    mainImage: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&h=300&fit=crop',
    tag: '周边游·三日游',
    tourType: 'around',
    city: 'sanya',
    destination: 'hainan',
    days: 3,
    month: 5,
    minPrice: 888,
    starRating: 4.7,
    recommendDate: '2026-05-16 周五',
    moreDates: '05-23、05-30',
    feature: '海南精华三日游，亚龙湾海滨、呀诺达雨林、分界洲岛海景全覆盖',
    tags: ['雨林探秘', '海滨度假', '精华游'],
    enrolledCount: 267,
    theme: 'scenic'
  },
  {
    id: 304,
    title: '三亚四日游 | 亚特兰蒂斯、槟榔谷、三亚千古情',
    subtitle: '三亚出发',
    mainImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
    tag: '周边游·四日游',
    tourType: 'around',
    city: 'sanya',
    destination: 'hainan',
    days: 4,
    month: 6,
    minPrice: 1388,
    starRating: 4.9,
    recommendDate: '2026-06-05 周四',
    moreDates: '06-12、06-19',
    feature: '高端度假四日游，亚特兰蒂斯水族馆、槟榔谷黎苗文化、三亚千古情',
    tags: ['高端度假', '文化体验', '亲子游'],
    enrolledCount: 189,
    theme: 'family'
  },
  {
    id: 305,
    title: '海南五日游 | 海口、博鳌、三亚、西沙群岛',
    subtitle: '三亚出发',
    mainImage: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=400&h=300&fit=crop',
    tag: '周边游·五日游',
    tourType: 'around',
    city: 'sanya',
    destination: 'hainan',
    days: 5,
    month: 6,
    minPrice: 5980,
    starRating: 5.0,
    recommendDate: '2026-06-08 周一',
    moreDates: '06-15、06-22',
    feature: '海南环岛+西沙群岛五日游，圆梦西沙，踏上祖国最南端的海岛',
    tags: ['西沙群岛', '环岛游', '圆梦之旅'],
    enrolledCount: 156,
    theme: 'scenic'
  }
]

// 推荐列表（精选几个热门）
const recommendList = computed(() => {
  return mockTicketsList.slice(0, 4)
})

// =============================================
// 辅助函数：获取标签显示名称
// =============================================
const getCityLabel = (value) => cityMap[value] || value
const getDestinationLabel = (value) => destinationMap[value] || value
const getDaysLabel = (value) => daysMap[value] || value
const getMonthLabel = (value) => monthMap[value] || value + '月'
const getPriceLabel = (value) => priceMap[value] || value
const getThemeLabel = (value) => themeMap[value] || value
const getTourTypeLabel = (value) => tourTypeMap[value] || value

// =============================================
// 核心函数：根据关键词和筛选条件搜索
// =============================================
const performSearch = () => {
  loading.value = true
  
  // 模拟异步搜索（实际应为API调用）
  setTimeout(() => {
    let results = [...fullTicketsList.value]
    const keyword = searchKeyword.value.trim().toLowerCase()
    
    // 1. 关键词筛选
    if (keyword) {
      results = results.filter(item =>
        item.title.toLowerCase().includes(keyword) ||
        item.subtitle.toLowerCase().includes(keyword) ||
        item.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
        (item.destination && destinationMap[item.destination]?.includes(keyword)) ||
        (item.city && cityMap[item.city]?.includes(keyword))
      )
    }
    
    // 2. 应用当前活跃的筛选条件
    if (activeFilters.value.tourType) {
      results = results.filter(item => item.tourType === activeFilters.value.tourType)
    }
    if (activeFilters.value.city) {
      results = results.filter(item => item.city === activeFilters.value.city)
    }
    if (activeFilters.value.destination) {
      results = results.filter(item => item.destination === activeFilters.value.destination)
    }
    if (activeFilters.value.days) {
      // 根据行程类型选择匹配方式
      if (activeFilters.value.tourType === 'around') {
        // 周边游：精确天数匹配
        results = results.filter(item => item.days === parseInt(activeFilters.value.days))
      } else {
        // 普通行程：范围匹配
        results = results.filter(item => matchDaysRange(item.days, activeFilters.value.days))
      }
    }
    if (activeFilters.value.month) {
      results = results.filter(item => item.month === parseInt(activeFilters.value.month))
    }
    if (activeFilters.value.priceRange) {
      results = results.filter(item => matchPriceRange(item.minPrice, activeFilters.value.priceRange))
    }
    if (activeFilters.value.theme) {
      results = results.filter(item => item.theme === activeFilters.value.theme)
    }

    currentSearchResults.value = results
    
    // 3. 基于搜索结果生成可用的筛选选项
    generateAvailableFilters(results)
    
    hasSearched.value = true
    currentPage.value = 1
    loading.value = false
    
    // 搜索后页面往下滑动一小段距离
    setTimeout(() => {
      document.documentElement.scrollTop = 220
    }, 500)
  }, 200)
}

// 天数匹配函数 - 同时支持精确天数和范围格式
// 周边游传精确天数：'1', '2', '3', '4', '5'
// 普通行程使用范围：'1-3', '4-6', '7-9', '10+'
const matchDaysRange = (days, range) => {
  if (!range) return true
  
  // 精确天数匹配（周边游）
  if (/^\d+$/.test(range)) {
    return days === parseInt(range)
  }
  
  // 范围匹配（普通行程）
  switch (range) {
    case '1-3': 
      return days >= 1 && days <= 3
    case '4-6': 
      return days >= 4 && days <= 6
    case '7-9': 
      return days >= 7 && days <= 9
    case '10+': 
      return days >= 10
    default: return true
  }
}

// 价格范围匹配函数
const matchPriceRange = (price, range) => {
  if (!range) return true
  switch (range) {
    case '0-500': return price <= 500
    case '500-1000': return price > 500 && price <= 1000
    case '1000-2000': return price > 1000 && price <= 2000
    case '2000+': return price > 2000
    default: return true
  }
}

// 基于搜索结果生成可用的筛选选项
const generateAvailableFilters = (results) => {
  // 统计行程类型的出现次数
  const tourTypeMapCount = new Map()
  // 统计出发城市的出现次数
  const cityMapCount = new Map()
  // 统计目标地点的出现次数
  const destMapCount = new Map()
  // 统计天数的出现次数
  const daysMapCount = new Map()
  // 统计月份的出现次数
  const monthMapCount = new Map()
  // 统计价格区间的出现次数
  const priceMapCount = new Map()
  // 统计主题的出现次数
  const themeMapCount = new Map()

  results.forEach(item => {
    // 行程类型
    if (item.tourType) {
      tourTypeMapCount.set(item.tourType, (tourTypeMapCount.get(item.tourType) || 0) + 1)
    }
    // 出发城市
    if (item.city) {
      cityMapCount.set(item.city, (cityMapCount.get(item.city) || 0) + 1)
    }
    // 目标地点
    if (item.destination) {
      destMapCount.set(item.destination, (destMapCount.get(item.destination) || 0) + 1)
    }
    // 天数 - 统一转换为范围格式进行统计
    const daysRange = getDaysRangeFromDays(item.days)
    if (daysRange) {
      daysMapCount.set(daysRange, (daysMapCount.get(daysRange) || 0) + 1)
    }
    // 月份
    if (item.month) {
      const monthKey = item.month.toString()
      monthMapCount.set(monthKey, (monthMapCount.get(monthKey) || 0) + 1)
    }
    // 价格区间
    const priceRangeKey = getPriceRangeFromPrice(item.minPrice)
    if (priceRangeKey) {
      priceMapCount.set(priceRangeKey, (priceMapCount.get(priceRangeKey) || 0) + 1)
    }
    // 主题
    if (item.theme) {
      themeMapCount.set(item.theme, (themeMapCount.get(item.theme) || 0) + 1)
    }
  })
  
  // 生成可用选项列表
  availableFilters.value.tourTypes = Array.from(tourTypeMapCount.entries())
    .map(([value, count]) => ({ value, label: tourTypeMap[value] || value, count }))
    .sort((a, b) => b.count - a.count)
  
  availableFilters.value.cities = Array.from(cityMapCount.entries())
    .map(([value, count]) => ({ value, label: cityMap[value] || value, count }))
    .sort((a, b) => b.count - a.count)
  
  availableFilters.value.destinations = Array.from(destMapCount.entries())
    .map(([value, count]) => ({ value, label: destinationMap[value] || value, count }))
    .sort((a, b) => b.count - a.count)
  
  // 天数选项：统一使用范围格式，所有行程类型都用范围筛选
  // 天数选项：根据行程类型显示不同格式
  // 周边游显示精确天数（1天、2天...），普通行程显示范围（1-3天、4-6天...）
  if (activeFilters.value.tourType === 'around') {
    // 周边游：精确天数
    const exactDaysMap = new Map()
    results.forEach(item => {
      if (item.tourType === 'around') {
        const d = item.days.toString()
        exactDaysMap.set(d, (exactDaysMap.get(d) || 0) + 1)
      }
    })
    availableFilters.value.daysList = [
      { value: '1', label: '1天', count: exactDaysMap.get('1') || 0 },
      { value: '2', label: '2天', count: exactDaysMap.get('2') || 0 },
      { value: '3', label: '3天', count: exactDaysMap.get('3') || 0 },
      { value: '4', label: '4天', count: exactDaysMap.get('4') || 0 },
      { value: '5', label: '5天', count: exactDaysMap.get('5') || 0 }
    ].filter(item => item.count > 0)
  } else {
    // 普通行程：范围格式
    availableFilters.value.daysList = [
      { value: '1-3', label: '1-3天', count: daysMapCount.get('1-3') || 0 },
      { value: '4-6', label: '4-6天', count: daysMapCount.get('4-6') || 0 },
      { value: '7-9', label: '7-9天', count: daysMapCount.get('7-9') || 0 },
      { value: '10+', label: '10天以上', count: daysMapCount.get('10+') || 0 }
    ].filter(item => item.count > 0)
  }
  
  availableFilters.value.months = Array.from(monthMapCount.entries())
    .map(([value, count]) => ({ value, label: monthMap[value] || value + '月', count }))
    .sort((a, b) => parseInt(a.value) - parseInt(b.value))
  
  availableFilters.value.priceRanges = [
    { value: '0-500', label: '¥500以下', count: priceMapCount.get('0-500') || 0 },
    { value: '500-1000', label: '¥500-1000', count: priceMapCount.get('500-1000') || 0 },
    { value: '1000-2000', label: '¥1000-2000', count: priceMapCount.get('1000-2000') || 0 },
    { value: '2000+', label: '¥2000以上', count: priceMapCount.get('2000+') || 0 }
  ].filter(item => item.count > 0)
  
  availableFilters.value.themes = Array.from(themeMapCount.entries())
    .map(([value, count]) => ({ value, label: themeMap[value] || value, count }))
    .sort((a, b) => b.count - a.count)
}

// 根据天数获取天数区间
const getDaysRangeFromDays = (days) => {
  if (days <= 3) return '1-3'
  if (days <= 6) return '4-6'
  if (days <= 9) return '7-9'
  return '10+'
}

// 根据价格获取价格区间
const getPriceRangeFromPrice = (price) => {
  if (price <= 500) return '0-500'
  if (price <= 1000) return '500-1000'
  if (price <= 2000) return '1000-2000'
  return '2000+'
}

// =============================================
// 计算属性
// =============================================
// 过滤并排序后的列表
const filteredList = computed(() => {
  let result = [...currentSearchResults.value]
  
  // 排序
  switch (sortType.value) {
    case 'price_asc':
      result.sort((a, b) => a.minPrice - b.minPrice)
      break
    case 'price_desc':
      result.sort((a, b) => b.minPrice - a.minPrice)
      break
    case 'popular':
      result.sort((a, b) => b.enrolledCount - a.enrolledCount)
      break
    default:
      result.sort((a, b) => b.id - a.id)
      break
  }
  
  return result
})

// 分页后的列表
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredList.value.slice(start, end)
})

// 是否有活跃的筛选条件
const hasActiveFilters = computed(() => {
  return activeFilters.value.tourType ||
         activeFilters.value.city ||
         activeFilters.value.destination ||
         activeFilters.value.days ||
         activeFilters.value.month ||
         activeFilters.value.priceRange ||
         activeFilters.value.theme
})

// =============================================
// 方法
// =============================================

// 格式化价格
const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/ticket/booking/${id}`)
}

// 执行搜索
const executeSearch = () => {
  // 如果没有关键词且没有筛选条件，提示用户
  if (!searchKeyword.value.trim() && !hasActiveFilters.value) {
    ElMessage.warning('请输入搜索关键词或选择筛选条件')
    return
  }
  performSearch()
}

// 快速搜索（热门词）
const quickSearch = (keyword) => {
  searchKeyword.value = keyword
  executeSearch()
}

// 切换筛选条件
const toggleFilter = (type, value) => {
  if (activeFilters.value[type] === value) {
    // 如果点击的是已选中的，则取消
    activeFilters.value[type] = ''
  } else {
    // 否则选中新的
    activeFilters.value[type] = value
  }
  // 重新执行搜索（在当前搜索结果基础上）
  performSearch()
}

// 移除某个筛选条件
const removeFilter = (type) => {
  activeFilters.value[type] = ''
  performSearch()
}

// 清除所有筛选条件
const clearAllFilters = () => {
  activeFilters.value = { tourType: '', city: '', destination: '', days: '', month: '', priceRange: '', theme: '' }
  performSearch()
}

// 重置搜索（回到初始状态）
const resetSearch = () => {
  searchKeyword.value = ''
  activeFilters.value = { tourType: '', city: '', destination: '', days: '', month: '', priceRange: '', theme: '' }
  currentSearchResults.value = []
  hasSearched.value = false
  sortType.value = 'default'
  currentPage.value = 1
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 从URL参数初始化搜索
const initFromUrl = () => {
  const searchParam = route.query.search
  const tourTypeParam = route.query.tourType
  const cityParam = route.query.city
  const daysParam = route.query.days
  const destinationParam = route.query.destination

  // 处理搜索关键词
  if (searchParam) {
    searchKeyword.value = decodeURIComponent(searchParam)
  }

  // 处理行程类型筛选（周边游/邮轮出行）
  if (tourTypeParam) {
    activeFilters.value.tourType = tourTypeParam
  }

  // 处理出发城市筛选
  if (cityParam) {
    activeFilters.value.city = cityParam
  }

  // 处理天数筛选 - 直接使用原始值
  if (daysParam) {
    activeFilters.value.days = daysParam
  }

  // 处理目的地筛选
  if (destinationParam) {
    activeFilters.value.destination = destinationParam
  }

  // 如果有任何筛选条件，执行搜索
  if (searchKeyword.value.trim() || tourTypeParam || cityParam || daysParam || destinationParam) {
    hasSearched.value = true
    executeSearch()
  }
}

// 监听排序变化，重置页码
watch(sortType, () => {
  currentPage.value = 1
})

// 监听路由变化，当搜索参数改变时重新搜索
watch(() => route.query, (query) => {
  const newSearch = query.search
  const newTourType = query.tourType
  const newCity = query.city
  const newDays = query.days
  const newDestination = query.destination

  let needSearch = false

  if (newSearch !== undefined) {
    searchKeyword.value = newSearch ? decodeURIComponent(newSearch) : ''
    needSearch = true
  }

  if (newTourType !== undefined) {
    activeFilters.value.tourType = newTourType || ''
    needSearch = true
  }

  if (newCity !== undefined) {
    activeFilters.value.city = newCity || ''
    needSearch = true
  }

  if (newDays !== undefined) {
    activeFilters.value.days = newDays || ''
    needSearch = true
  }

  if (newDestination !== undefined) {
    activeFilters.value.destination = newDestination || ''
    needSearch = true
  }

  if (needSearch && hasSearched.value) {
    executeSearch()
  }
}, { deep: true })

// =============================================
// 从后端获取数据
// =============================================
import { getTourList } from '@/api/tour'

const fetchTickets = async () => {
  loading.value = true
  try {
    await getTourList().then(res => {
      if (res && Array.isArray(res)) {
        // 处理后端返回的数据，将 tags 字符串转换为数组
        fullTicketsList.value = res.map(item => ({
          ...item,
          tags: parseTags(item.tags)
        }))
      } else {
        fullTicketsList.value = mockTicketsList
      }
    })
  } catch (error) {
    console.error('获取行程列表失败:', error)
    // 接口失败时使用本地模拟数据
    fullTicketsList.value = mockTicketsList
  } finally {
    loading.value = false
  }
}

// =============================================
// 生命周期
// =============================================
onMounted(async () => {
  await fetchTickets()
  initFromUrl()
})
</script>

<style scoped>
.tickets-page {
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  background: #FFFFFF;
  min-height: 100vh;
}

/* =============================================
   筛选区域样式
============================================= */
.filters-section {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  position: sticky;
  top: 0;
  z-index: 99;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filters-container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 20px;
}

/* 筛选条件外层橙色细框 */
.filters-wrapper {
  border: 1px solid #ffa500;
  border-radius: 12px;
  margin-bottom: 20px;
  padding: 16px 20px;
}

.filters-row {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* 每个筛选条件行 - 虚线分隔 */
.filter-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  padding: 12px 0;
  border-bottom: 1px dashed #e0e0e0;
}

.filter-item:last-child {
  border-bottom: none;
}

.filter-label {
  font-size: 14px;
  color: #666;
  width: 80px;
  flex-shrink: 0;
  line-height: 32px;
  font-weight: 500;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  flex: 1;
}

.filter-tag {
  display: inline-block;
  padding: 6px 16px;
  font-size: 13px;
  color: #666;
  background: #FFFFFF;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tag:hover {
  background: #ffede0;
  color: #f60;
}

.filter-tag.active {
  background: #FF9A00;
  color: #fff;
}

.filter-count {
  font-size: 11px;
  margin-left: 4px;
  opacity: 0.7;
}

/* 已选条件栏 */
.active-filters-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 0 0 0;
  margin-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.active-label {
  font-size: 13px;
  color: #666;
}

.active-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.active-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  font-size: 12px;
  color: #f60;
  background: #fff5f0;
  border-radius: 16px;
  border: 1px solid #ffe0c0;
}

.active-tag .el-icon {
  cursor: pointer;
  font-size: 14px;
}

.active-tag .el-icon:hover {
  color: #e55a00;
}

.clear-all {
  font-size: 12px;
  color: #999;
  cursor: pointer;
  padding: 4px 8px;
}

.clear-all:hover {
  color: #f60;
}

/* 排序栏 */
.sort-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.result-stats {
  font-size: 14px;
  color: #666;
}

.result-stats strong {
  color: #f60;
  font-size: 18px;
}

.search-keyword {
  color: #e94560;
  font-size: 16px;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-label {
  font-size: 14px;
  color: #666;
}

.sort-tags {
  display: flex;
  gap: 8px;
}

.sort-tag {
  padding: 6px 16px;
  font-size: 13px;
  color: #666;
  background: #FFFFFF;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-tag:hover {
  background: #ffede0;
  color: #f60;
}

.sort-tag.active {
  background: #FF9A00;
  color: #fff;
}

/* =============================================
   行程列表样式
============================================= */
.tickets-list {
  max-width: 1320px;
  margin: 0 auto;
  padding: 20px;
}

.ticket-card {
  display: flex;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.ticket-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-image {
  position: relative;
  width: 300px;
  flex-shrink: 0;
  overflow: hidden;
  background: #f0f0f0;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.ticket-card:hover .card-image img {
  transform: scale(1.05);
}

.image-tag {
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, #FF9A00, #ff8c42);
  color: #fff;
  font-size: 12px;
  padding: 4px 12px;
  border-bottom-right-radius: 12px;
  font-weight: 500;
}

.card-content {
  flex: 1;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.star-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: linear-gradient(135deg, #ff9a3c, #FF9A00);
  color: #fff;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 16px;
  flex-shrink: 0;
}

.star-badge .star {
  font-size: 11px;
}

.card-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #222;
  line-height: 1.4;
}

.card-row {
  display: flex;
  align-items: flex-start;
  font-size: 13px;
  color: #666;
  flex-wrap: wrap;
  gap: 4px;
  line-height: 1.5;
}

/* 出发城市行 - 左对齐 */
.departure-row {
  margin-bottom: 2px;
}

.departure-label {
  color: #999;
  flex-shrink: 0;
}

.row-departure {
  color: #333;
  font-weight: 500;
}

.row-label {
  color: #999;
  flex-shrink: 0;
}

.more-label {
  margin-left: 24px;
}

.row-date {
  color: #333;
  font-weight: 500;
}

.row-more {
  color: #666;
}

/* 班期特色行 - 左对齐且可换行 */
.feature-row {
  align-items: flex-start;
}

.feature-row .row-feature {
  color: #f60;
  flex: 0 1 auto;
  min-width: 0;
  word-break: break-word;
  white-space: normal;
  line-height: 1.5;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.card-tag {
  display: inline-block;
  padding: 2px 10px;
  font-size: 11px;
  color: #f60;
  background: #fff5f0;
  border-radius: 12px;
  border: 1px solid #ffe0c0;
}

/* 右侧价格区域 - 底部对齐 */
.card-price {
  width: 150px;
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 20px;
  background: #fefaf5;
  border-left: 1px solid #f0f0f0;
}

.price-wrapper {
  text-align: center;
}

.card-price .currency {
  font-size: 16px;
  font-weight: 500;
  color: #f60;
}

.card-price .price {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  margin: 0 2px;
  color: #f60;
}

.card-price .unit {
  font-size: 12px;
  color: #999;
}

/* 初始状态样式 */
.initial-state {
  padding: 20px 0;
}

.hot-search {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 24px;
}

.hot-title {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.hot-tag {
  padding: 6px 16px;
  font-size: 13px;
  color: #f60;
  background: #fff5f0;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.hot-tag:hover {
  background: #f60;
  color: #fff;
}

.recommend-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.recommend-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.recommend-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.recommend-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.recommend-card img {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.recommend-info {
  padding: 12px;
}

.recommend-info h4 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recommend-price {
  font-size: 16px;
  font-weight: 600;
  color: #f60;
  margin: 0;
}

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding: 20px 0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 0;
  background: #fff;
  border-radius: 12px;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 80px 0;
  color: #999;
}

/* 响应式 */
@media (max-width: 1024px) {
  .recommend-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .ticket-card {
    flex-direction: column;
  }
  
  .card-image {
    width: 100%;
    height: 200px;
  }
  
  .card-price {
    width: 100%;
    padding: 16px 20px;
    justify-content: flex-start;
    border-left: none;
    border-top: 1px solid #f0f0f0;
  }
  
  .price-wrapper {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }
  
  .more-label {
    margin-left: 8px;
  }
  
  .sort-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .recommend-list {
    grid-template-columns: 1fr;
  }
  
  .filter-label {
    width: 70px;
  }
  
  .filters-wrapper {
    padding: 12px 16px;
  }
  
  /* 班期特色行 - 左对齐，描述跟在标签后面 */
  .feature-row {
    align-items: flex-start;
  }

  .feature-row .row-feature {
    color: #f60;
    flex: 0 1 auto;
    min-width: 0;
    word-break: break-word;
    white-space: normal;
    line-height: 1.5;
  }
}
</style>