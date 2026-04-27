<template>
  <el-dialog
    :title="`预订详情管理 - ${tourTitle}`"
    v-model="dialogVisible"
    width="900px"
    :close-on-click-modal="false"
    class="tour-detail-dialog"
  >
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 图片管理 -->
      <el-tab-pane label="图片管理" name="images">
        <div class="image-section">
          <div class="image-list">
            <div v-for="(img, index) in images" :key="index" class="image-item">
              <span class="image-label">{{ index + 1 }}</span>
              <el-upload
                class="image-uploader"
                :show-file-list="false"
                :http-request="(opt) => handleImageUpload(opt, index)"
                :before-upload="beforeImageUpload"
              >
                <img v-if="img" :src="img" class="uploaded-image" />
                <div v-else class="upload-placeholder">
                  <el-icon><Plus /></el-icon>
                  <span>上传图片</span>
                </div>
              </el-upload>
              <el-button v-if="img" type="danger" size="small" @click="removeImage(index)">删除</el-button>
            </div>
          </div>
          <div class="image-tip">建议尺寸：800x600，支持 JPG、PNG 格式</div>
          <div class="section-actions">
            <el-button type="primary" @click="saveImages">保存图片</el-button>
          </div>
        </div>
      </el-tab-pane>

      <!-- 视频管理 -->
      <el-tab-pane label="视频管理" name="video">
        <div class="video-section">
          <el-form label-width="100px">
            <el-form-item label="启用视频">
              <el-switch v-model="videoEnabled" @change="handleVideoEnabledChange" />
            </el-form-item>
            <el-form-item v-if="videoEnabled" label="视频上传">
              <el-upload
                class="video-uploader"
                :show-file-list="false"
                :http-request="handleVideoUpload"
                :before-upload="beforeVideoUpload"
                accept="video/*"
              >
                <div v-if="videoUrl" class="video-preview">
                  <video :src="videoUrl" controls class="preview-video" />
                  <el-button type="danger" size="small" @click.stop="handleRemoveVideo">删除视频</el-button>
                </div>
                <div v-else class="upload-placeholder">
                  <el-icon><Upload /></el-icon>
                  <span>点击上传视频</span>
                </div>
              </el-upload>
            </el-form-item>
            <el-form-item v-if="videoUrl" label="视频封面">
              <el-upload
                class="image-uploader"
                :show-file-list="false"
                :http-request="handlePosterUpload"
                :before-upload="beforeImageUpload"
              >
                <img v-if="videoPoster" :src="videoPoster" class="poster-image" />
                <div v-else class="upload-placeholder small">
                  <el-icon><Plus /></el-icon>
                  <span>上传封面</span>
                </div>
              </el-upload>
            </el-form-item>
          </el-form>
          <div class="video-tip">支持 MP4、AVI 格式，建议大小不超过 100MB</div>
        </div>
      </el-tab-pane>

      <!-- 行程套餐 -->
      <el-tab-pane label="行程套餐" name="tripPackages">
        <div class="package-section">
          <div class="section-header">
            <span class="section-title">行程套餐（成人/儿童价格）</span>
            <el-button type="primary" size="small" @click="showAddTripPackage">
              <el-icon><Plus /></el-icon> 添加套餐
            </el-button>
          </div>
          <el-table :data="tripPackages" border style="width: 100%" size="small">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="name" label="套餐名称" min-width="120" />
            <el-table-column label="成人价" width="100">
              <template #default="scope">
                <span class="price">¥{{ scope.row.adultPrice }}</span>
              </template>
            </el-table-column>
            <el-table-column label="儿童价" width="100">
              <template #default="scope">
                <span>{{ scope.row.childPrice > 0 ? '¥' + scope.row.childPrice : '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
            <el-table-column label="状态" width="70">
              <template #default="scope">
                <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
                  {{ scope.row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140">
              <template #default="scope">
                <el-button type="primary" size="small" @click="editTripPackage(scope.row)">编辑</el-button>
                <el-button type="danger" size="small" @click="handleDeleteTripPackage(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 批次套餐 -->
      <el-tab-pane label="批次套餐" name="batchPackages">
        <div class="package-section">
          <div class="section-header">
            <span class="section-title">批次套餐（附加费）</span>
            <el-button type="primary" size="small" @click="showAddBatchPackage">
              <el-icon><Plus /></el-icon> 添加套餐
            </el-button>
          </div>
          <el-table :data="batchPackages" border style="width: 100%" size="small">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="name" label="套餐名称" min-width="150" />
            <el-table-column label="附加费/人" width="110">
              <template #default="scope">
                <span class="price">+¥{{ scope.row.extraFeePerPerson }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
            <el-table-column label="状态" width="70">
              <template #default="scope">
                <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
                  {{ scope.row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140">
              <template #default="scope">
                <el-button type="primary" size="small" @click="editBatchPackage(scope.row)">编辑</el-button>
                <el-button type="danger" size="small" @click="handleDeleteBatchPackage(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 出发班期 -->
      <el-tab-pane label="出发班期" name="batches">
        <div class="batch-section">
          <div class="section-header">
            <span class="section-title">出发日期管理</span>
            <div class="header-actions">
              <el-button type="primary" size="small" @click="showAddBatch">
                <el-icon><Plus /></el-icon> 添加班期
              </el-button>
              <el-button type="success" size="small" @click="showBatchAdd">
                <el-icon><Plus /></el-icon> 批量添加
              </el-button>
            </div>
          </div>
          <el-table :data="batches" border style="width: 100%" size="small">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column label="出发日期" width="120">
              <template #default="scope">
                <span :class="{ expired: isExpired(scope.row.departureDate) }">
                  {{ scope.row.departureDate }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="成人附加费" width="110">
              <template #default="scope">
                {{ scope.row.adultDateExtraFee > 0 ? '+¥' + scope.row.adultDateExtraFee : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="儿童附加费" width="110">
              <template #default="scope">
                {{ scope.row.childDateExtraFee > 0 ? '+¥' + scope.row.childDateExtraFee : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="余位/容量" width="100">
              <template #default="scope">
                <span :class="{ warning: scope.row.remaining <= 5 }">
                  {{ scope.row.remaining }}/{{ scope.row.maxCapacity }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="scope">
                <div style="display: flex; gap: 4px; flex-wrap: nowrap;">
                  <el-button type="primary" size="small" @click="editBatch(scope.row)">编辑</el-button>
                  <el-button type="warning" size="small" @click="updateRemaining(scope.row)">余位</el-button>
                  <el-button type="danger" size="small" @click="deleteBatch(scope.row)">删除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 出团通知 -->
      <el-tab-pane label="出团通知" name="notice">
        <div class="notice-section">
          <el-form label-width="100px">
            <el-form-item label="出团通知">
              <el-input
                v-model="notice"
                type="textarea"
                :rows="4"
                placeholder="请输入出团通知内容，如：周边游提前1天，国内游提前3天..."
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-form>
          <div class="notice-actions">
            <el-button type="primary" @click="saveNotice" :loading="noticeLoading">保存通知</el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="dialog-footer">
      <el-button @click="dialogVisible = false">关闭</el-button>
    </div>

    <!-- 添加/编辑行程套餐对话框 -->
    <el-dialog
      :title="isTripPackageEdit ? '编辑行程套餐' : '添加行程套餐'"
      v-model="tripPackageDialogVisible"
      width="450px"
      append-to-body
    >
      <el-form ref="tripPackageFormRef" :model="tripPackageForm" label-width="90px">
        <el-form-item label="套餐名称" prop="name">
          <el-input v-model="tripPackageForm.name" placeholder="如：标准套餐、VIP套餐" />
        </el-form-item>
        <el-form-item label="成人价格" prop="adultPrice">
          <el-input-number v-model="tripPackageForm.adultPrice" :precision="2" :min="0" :step="10" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="儿童价格" prop="childPrice">
          <el-input-number v-model="tripPackageForm.childPrice" :precision="2" :min="0" :step="10" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="tripPackageForm.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="tripPackageForm.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tripPackageDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTripPackage" :loading="tripPackageLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑批次套餐对话框 -->
    <el-dialog
      :title="isBatchPackageEdit ? '编辑批次套餐' : '添加批次套餐'"
      v-model="batchPackageDialogVisible"
      width="450px"
      append-to-body
    >
      <el-form ref="batchPackageFormRef" :model="batchPackageForm" label-width="90px">
        <el-form-item label="套餐名称" prop="name">
          <el-input v-model="batchPackageForm.name" placeholder="如：节假日套餐、周末套餐" />
        </el-form-item>
        <el-form-item label="附加费/人" prop="extraFeePerPerson">
          <el-input-number v-model="batchPackageForm.extraFeePerPerson" :precision="2" :min="0" :step="10" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="batchPackageForm.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="batchPackageForm.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchPackageDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBatchPackage" :loading="batchPackageLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑班期对话框 -->
    <el-dialog
      :title="isBatchEdit ? '编辑班期' : '添加班期'"
      v-model="batchDialogVisible"
      width="450px"
      append-to-body
    >
      <el-form ref="batchFormRef" :model="batchForm" label-width="100px">
        <el-form-item label="出发日期" prop="departureDate">
          <el-date-picker
            v-model="batchForm.departureDate"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="成人附加费">
          <el-input-number v-model="batchForm.adultDateExtraFee" :precision="2" :min="0" :step="10" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="儿童附加费">
          <el-input-number v-model="batchForm.childDateExtraFee" :precision="2" :min="0" :step="10" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="batchForm.status" style="width: 100%;">
            <el-option label="可报名" value="可报名" />
            <el-option label="已满员" value="已满员" />
            <el-option label="已结束" value="已结束" />
          </el-select>
        </el-form-item>
        <el-form-item label="余位">
          <el-input-number v-model="batchForm.remaining" :min="0" :max="999" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="最大容量">
          <el-input-number v-model="batchForm.maxCapacity" :min="1" :max="999" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBatch" :loading="batchLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量添加班期对话框 -->
    <el-dialog title="批量添加班期" v-model="batchAddDialogVisible" width="500px" append-to-body>
      <el-form :model="batchAddForm" label-width="100px">
        <el-form-item label="开始日期">
          <el-date-picker v-model="batchAddForm.startDate" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" :disabled-date="disabledDate" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker v-model="batchAddForm.endDate" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" :disabled-date="disabledDate" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="重复周期">
          <el-select v-model="batchAddForm.frequency" style="width: 100%;">
            <el-option label="每天" :value="1" />
            <el-option label="每2天" :value="2" />
            <el-option label="每3天" :value="3" />
            <el-option label="每5天" :value="5" />
            <el-option label="每周" :value="7" />
            <el-option label="每2周" :value="14" />
          </el-select>
        </el-form-item>
        <el-form-item label="成人附加费">
          <el-input-number v-model="batchAddForm.adultDateExtraFee" :precision="2" :min="0" :step="10" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="儿童附加费">
          <el-input-number v-model="batchAddForm.childDateExtraFee" :precision="2" :min="0" :step="10" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="余位">
          <el-input-number v-model="batchAddForm.remaining" :min="0" :max="999" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="最大容量">
          <el-input-number v-model="batchAddForm.maxCapacity" :min="1" :max="999" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="batchAddForm.status" style="width: 100%;">
            <el-option label="可报名" value="可报名" />
            <el-option label="已满员" value="已满员" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchAddDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBatchAdd" :loading="batchAddLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 修改余位对话框 -->
    <el-dialog title="修改余位" v-model="remainingDialogVisible" width="350px" append-to-body>
      <el-form label-width="80px">
        <el-form-item label="班期">
          <span>{{ currentBatch?.departureDate }}</span>
        </el-form-item>
        <el-form-item label="新余位">
          <el-input-number v-model="newRemaining" :min="0" :max="999" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="remainingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRemaining">确定</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'
import request from '@/utils/request'
import {
  getTourPackages,
  addTourPackage,
  updateTourPackage,
  deleteTourPackage,
  getBatchPackages,
  addBatchPackage,
  updateBatchPackage,
  deleteBatchPackage,
  getTourBatches,
  addTourBatch,
  addTourBatchesBatch,
  updateTourBatch,
  deleteTourBatch
} from '@/api/tourDetail'
import { getTourDetailFull } from '@/api/tour'
import { updateTourImages, updateTourVideo } from '@/api/tour'

const props = defineProps({
  modelValue: Boolean,
  tourId: [Number, String],
  tourTitle: String
})

const emit = defineEmits(['update:modelValue'])

const dialogVisible = ref(false)
const activeTab = ref('images')
const loading = ref(false)

// 图片管理
const images = ref(['', '', '', '', ''])
const videoEnabled = ref(false)
const videoUrl = ref('')
const videoPoster = ref('')

// 行程套餐
const tripPackages = ref([])
const tripPackageDialogVisible = ref(false)
const isTripPackageEdit = ref(false)
const tripPackageLoading = ref(false)
const tripPackageFormRef = ref(null)
const tripPackageForm = ref({
  id: null, name: '', adultPrice: 0, childPrice: 0, description: '', status: 1
})

// 批次套餐
const batchPackages = ref([])
const batchPackageDialogVisible = ref(false)
const isBatchPackageEdit = ref(false)
const batchPackageLoading = ref(false)
const batchPackageFormRef = ref(null)
const batchPackageForm = ref({
  id: null, name: '', extraFeePerPerson: 0, description: '', status: 1
})

// 班期
const batches = ref([])
const batchDialogVisible = ref(false)
const isBatchEdit = ref(false)
const batchLoading = ref(false)
const batchFormRef = ref(null)
const batchForm = ref({
  id: null, departureDate: '', adultDateExtraFee: 0, childDateExtraFee: 0,
  status: '可报名', remaining: 30, maxCapacity: 50
})

// 批量添加班期
const batchAddDialogVisible = ref(false)
const batchAddLoading = ref(false)
const batchAddForm = ref({
  startDate: '', endDate: '', frequency: 7, adultDateExtraFee: 0, childDateExtraFee: 0,
  remaining: 30, maxCapacity: 50, status: '可报名'
})

// 余位修改
const remainingDialogVisible = ref(false)
const currentBatch = ref(null)
const newRemaining = ref(0)

// 出团通知
const notice = ref('')
const noticeLoading = ref(false)

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val && props.tourId) {
    loadAllData()
  }
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

const loadAllData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchTourDetail(),
      fetchTripPackages(),
      fetchBatchPackages(),
      fetchBatches()
    ])
  } finally {
    loading.value = false
  }
}

const fetchTourDetail = async () => {
  try {
    const res = await getTourDetailFull(props.tourId)
    if (res) {
      // 图片
      images.value = res.images?.main?.length > 0 ? res.images.main : ['', '', '', '', '']
      while (images.value.length < 5) images.value.push('')
      // 视频（读取后端的启用状态）
      videoEnabled.value = res.video?.enabled === 1
      videoUrl.value = res.video?.url || ''
      videoPoster.value = res.video?.poster || ''
      // 出团通知
      notice.value = res.tour?.notice || ''
    }
  } catch (error) {
    console.error('获取行程详情失败:', error)
  }
}

const fetchTripPackages = async () => {
  try {
    const res = await getTourPackages(props.tourId)
    tripPackages.value = res || []
  } catch (error) {
    console.error('获取行程套餐失败:', error)
  }
}

const fetchBatchPackages = async () => {
  try {
    const res = await getBatchPackages(props.tourId)
    batchPackages.value = res || []
  } catch (error) {
    console.error('获取批次套餐失败:', error)
  }
}

const fetchBatches = async () => {
  try {
    const res = await getTourBatches(props.tourId)
    batches.value = res || []
  } catch (error) {
    console.error('获取班期失败:', error)
  }
}

// 图片上传
const handleImageUpload = async (options, index) => {
  const { file, onSuccess, onError } = options
  const formData = new FormData()
  formData.append('file', file)
  try {
    console.log('开始上传图片, index:', index, 'file:', file.name)
    const imageUrl = await request.upload('/file/upload/img', formData, { showDefaultMsg: false })
    console.log('上传成功, 返回URL:', imageUrl)
    if (imageUrl) {
      images.value[index] = imageUrl
      ElMessage.success('图片上传成功')
      onSuccess()
    } else {
      console.error('上传失败, imageUrl为空')
      ElMessage.error('上传失败')
      onError(new Error('上传失败'))
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败: ' + (error.message || '未知错误'))
    onError(error)
  }
}

const removeImage = (index) => {
  images.value[index] = ''
}

const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isImage) ElMessage.error('只能上传图片!')
  if (!isLt5M) ElMessage.error('图片大小不能超过5MB!')
  return isImage && isLt5M
}

// 视频上传
const handleVideoUpload = async (options) => {
  const { file, onSuccess, onError } = options
  const formData = new FormData()
  formData.append('file', file)
  try {
    const url = await request.upload('/file/upload/img', formData, { showDefaultMsg: false })
    if (url) {
      videoUrl.value = url
      ElMessage.success('视频上传成功')
      onSuccess()
    } else {
      ElMessage.error('上传失败')
      onError(new Error('上传失败'))
    }
  } catch (error) {
    ElMessage.error('视频上传失败')
    onError(error)
  }
}

const removeVideo = () => {
  videoUrl.value = ''
  videoPoster.value = ''
}

const beforeVideoUpload = (file) => {
  const isVideo = file.type.startsWith('video/')
  const isLt100M = file.size / 1024 / 1024 < 100
  if (!isVideo) ElMessage.error('只能上传视频!')
  if (!isLt100M) ElMessage.error('视频大小不能超过100MB!')
  return isVideo && isLt100M
}

const handlePosterUpload = async (options) => {
  const { file, onSuccess, onError } = options
  const formData = new FormData()
  formData.append('file', file)
  try {
    const poster = await request.upload('/file/upload/img', formData, { showDefaultMsg: false })
    if (poster) {
      videoPoster.value = poster
      ElMessage.success('封面上传成功')
      onSuccess()
    } else {
      ElMessage.error('上传失败')
      onError(new Error('上传失败'))
    }
  } catch (error) {
    ElMessage.error('封面上传失败')
    onError(error)
  }
}

// 行程套餐管理
const showAddTripPackage = () => {
  isTripPackageEdit.value = false
  tripPackageForm.value = { id: null, name: '', adultPrice: 0, childPrice: 0, description: '', status: 1 }
  tripPackageDialogVisible.value = true
}

const editTripPackage = (row) => {
  isTripPackageEdit.value = true
  tripPackageForm.value = { ...row }
  tripPackageDialogVisible.value = true
}

const submitTripPackage = async () => {
  tripPackageLoading.value = true
  try {
    const data = { ...tripPackageForm.value, tourId: props.tourId }
    if (isTripPackageEdit.value) {
      await updateTourPackage(tripPackageForm.value.id, data)
    } else {
      await addTourPackage(data)
    }
    ElMessage.success('保存成功')
    tripPackageDialogVisible.value = false
    fetchTripPackages()
  } catch (error) {
    console.error('操作失败:', error)
  } finally {
    tripPackageLoading.value = false
  }
}

// 行程套餐删除处理函数
const handleDeleteTripPackage = (row) => {
  ElMessageBox.confirm(`删除套餐"${row.name}"?`, '提示', { type: 'warning' })
    .then(async () => {
      await deleteTourPackage(row.id)
      ElMessage.success('删除成功')
      fetchTripPackages()
    }).catch(() => {})
}

// 批次套餐管理
const showAddBatchPackage = () => {
  isBatchPackageEdit.value = false
  batchPackageForm.value = { id: null, name: '', extraFeePerPerson: 0, description: '', status: 1 }
  batchPackageDialogVisible.value = true
}

const editBatchPackage = (row) => {
  isBatchPackageEdit.value = true
  batchPackageForm.value = { ...row }
  batchPackageDialogVisible.value = true
}

const submitBatchPackage = async () => {
  batchPackageLoading.value = true
  try {
    const data = { ...batchPackageForm.value, tourId: props.tourId }
    if (isBatchPackageEdit.value) {
      await updateBatchPackage(batchPackageForm.value.id, data)
    } else {
      await addBatchPackage(data)
    }
    ElMessage.success('保存成功')
    batchPackageDialogVisible.value = false
    fetchBatchPackages()
  } catch (error) {
    console.error('操作失败:', error)
  } finally {
    batchPackageLoading.value = false
  }
}

// 批次套餐删除直接使用 API
const handleDeleteBatchPackage = (row) => {
  ElMessageBox.confirm(`删除套餐"${row.name}"?`, '提示', { type: 'warning' })
    .then(async () => {
      await deleteBatchPackage(row.id)
      ElMessage.success('删除成功')
      fetchBatchPackages()
    }).catch(() => {})
}

// 班期管理
const isExpired = (dateStr) => {
  if (!dateStr) return false
  return new Date(dateStr) < new Date(new Date().toDateString())
}

const getStatusType = (status) => {
  switch (status) {
    case '可报名': return 'success'
    case '已满员': return 'warning'
    case '已结束': return 'info'
    default: return 'info'
  }
}

const disabledDate = (date) => {
  return date < new Date(new Date().toDateString())
}

const showAddBatch = () => {
  isBatchEdit.value = false
  batchForm.value = { id: null, departureDate: '', adultDateExtraFee: 0, childDateExtraFee: 0, status: '可报名', remaining: 30, maxCapacity: 50 }
  batchDialogVisible.value = true
}

const editBatch = (row) => {
  isBatchEdit.value = true
  batchForm.value = { ...row }
  batchDialogVisible.value = true
}

const submitBatch = async () => {
  if (!batchForm.value.departureDate) {
    ElMessage.warning('请选择出发日期')
    return
  }
  batchLoading.value = true
  try {
    const data = { ...batchForm.value, tourId: props.tourId }
    if (isBatchEdit.value) {
      await updateTourBatch(batchForm.value.id, data)
    } else {
      await addTourBatch(data)
    }
    ElMessage.success('保存成功')
    batchDialogVisible.value = false
    fetchBatches()
  } catch (error) {
    console.error('操作失败:', error)
  } finally {
    batchLoading.value = false
  }
}

const deleteBatch = (row) => {
  ElMessageBox.confirm(`删除 ${row.departureDate} 的班期?`, '提示', { type: 'warning' })
    .then(async () => {
      await deleteTourBatch(row.id)
      ElMessage.success('删除成功')
      fetchBatches()
    }).catch(() => {})
}

const showBatchAdd = () => {
  batchAddForm.value = { startDate: '', endDate: '', frequency: 7, adultDateExtraFee: 0, childDateExtraFee: 0, remaining: 30, maxCapacity: 50, status: '可报名' }
  batchAddDialogVisible.value = true
}

const submitBatchAdd = async () => {
  if (!batchAddForm.value.startDate || !batchAddForm.value.endDate) {
    ElMessage.warning('请选择开始和结束日期')
    return
  }
  if (new Date(batchAddForm.value.startDate) > new Date(batchAddForm.value.endDate)) {
    ElMessage.warning('开始日期不能晚于结束日期')
    return
  }
  batchAddLoading.value = true
  try {
    const dates = []
    let current = new Date(batchAddForm.value.startDate)
    const end = new Date(batchAddForm.value.endDate)
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + batchAddForm.value.frequency)
    }
    const batchList = dates.map(date => ({
      tourId: props.tourId, departureDate: date,
      adultDateExtraFee: batchAddForm.value.adultDateExtraFee,
      childDateExtraFee: batchAddForm.value.childDateExtraFee,
      status: batchAddForm.value.status,
      remaining: batchAddForm.value.remaining, maxCapacity: batchAddForm.value.maxCapacity
    }))
    await addTourBatchesBatch(batchList)
    ElMessage.success(`成功添加 ${batchList.length} 个班期`)
    batchAddDialogVisible.value = false
    fetchBatches()
  } catch (error) {
    console.error('批量添加失败:', error)
  } finally {
    batchAddLoading.value = false
  }
}

const updateRemaining = (row) => {
  currentBatch.value = row
  newRemaining.value = row.remaining
  remainingDialogVisible.value = true
}

const submitRemaining = async () => {
  if (!currentBatch.value) return
  try {
    await updateTourBatch(currentBatch.value.id, { ...currentBatch.value, remaining: newRemaining.value, tourId: props.tourId })
    ElMessage.success('余位更新成功')
    remainingDialogVisible.value = false
    fetchBatches()
  } catch (error) {
    console.error('更新余位失败:', error)
  }
}

// 出团通知
const saveNotice = async () => {
  noticeLoading.value = true
  try {
    await request.put(`/tour/${props.tourId}`, { notice: notice.value }, { successMsg: '保存成功' })
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    noticeLoading.value = false
  }
}

// 保存图片
const saveImages = async () => {
  try {
    const imagesToSave = images.value.filter(img => img)
    console.log('=== 保存图片 ===')
    console.log('images.value:', images.value)
    console.log('imagesToSave:', imagesToSave)
    console.log('tourId:', props.tourId)
    const res = await updateTourImages(props.tourId, imagesToSave)
    console.log('保存响应:', res)
    ElMessage.success('图片保存成功')
  } catch (error) {
    console.error('保存图片失败:', error)
  }
}

// 保存视频
const saveVideo = async () => {
  try {
    await updateTourVideo(props.tourId, {
      videoUrl: videoUrl.value,
      videoPoster: videoPoster.value,
      videoEnabled: videoEnabled.value ? 1 : 0
    })
    ElMessage.success('视频保存成功')
  } catch (error) {
    console.error('保存视频失败:', error)
  }
}

// 启用视频开关变化时自动保存
const handleVideoEnabledChange = () => {
  saveVideo()
}

// 监听视频相关数据变化，自动保存
watch([videoUrl, videoPoster], () => {
  if (props.tourId && videoUrl.value) {
    saveVideo()
  }
})

// 删除视频后自动保存
const handleRemoveVideo = () => {
  videoUrl.value = ''
  videoPoster.value = ''
  saveVideo()
}
</script>

<style scoped>
.image-section, .video-section, .package-section, .batch-section, .notice-section {
  padding: 10px 0;
}

.image-list {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.image-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.image-label {
  font-weight: 600;
  color: #409eff;
}

.image-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    overflow: hidden;
  }
}

.uploaded-image, .poster-image {
  width: 140px;
  height: 100px;
  object-fit: cover;
  display: block;
}

.upload-placeholder {
  width: 140px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c939d;
  font-size: 12px;
}

.upload-placeholder.small {
  width: 140px;
  height: 80px;
}

.image-tip, .video-tip {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
}

.video-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
  }
}

.video-preview {
  position: relative;
  display: inline-block;
}

.preview-video {
  width: 300px;
  height: 170px;
  object-fit: cover;
}

.video-preview .el-button {
  position: absolute;
  bottom: 8px;
  right: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.price {
  color: #f56c6c;
  font-weight: 600;
}

.warning {
  color: #e6a23c;
  font-weight: 600;
}

.expired {
  color: #c0c4cc;
}

.notice-actions {
  margin-top: 15px;
}

.section-actions {
  margin-top: 15px;
}

:deep(.tour-detail-dialog .el-dialog__body) {
  padding: 15px 20px;
}

:deep(.el-tab-pane) {
  padding: 10px 0;
}

.dialog-footer {
  margin-top: 20px;
  text-align: right;
}
</style>
