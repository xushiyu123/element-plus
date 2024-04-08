<template>
  <div
    :class="[
      ppNs.b(),
      dpNs.b(),
      {
        'has-sidebar': Boolean($slots.sidebar) || hasShortcuts,
      },
    ]"
  >
    <div :class="ppNs.e('body-wrapper')">
      <slot name="sidebar" :class="ppNs.e('sidebar')" />
      <div v-if="hasShortcuts" :class="ppNs.e('sidebar')">
        <button
          v-for="(shortcut, key) in shortcuts"
          :key="key"
          type="button"
          :class="ppNs.e('shortcut')"
          @click="handleShortcutClick(shortcut)"
        >
          {{ shortcut.text }}
        </button>
      </div>
      <div :class="ppNs.e('body')">
        <div :class="[ppNs.e('content')]" class="is-left">
          <div :class="[dpNs.e('header'), dpNs.e('header--bordered')]">
            <span :class="dpNs.e('prev-btn')">
              <button
                type="button"
                :class="ppNs.e('icon-btn')"
                class="d-arrow-left"
                @click="preYear"
              >
                <el-icon><d-arrow-left /></el-icon>
              </button>
            </span>
            <span :class="dpNs.e('header-label')">{{ leftLabel }}</span>
            <span :class="dpNs.e('header-label')">-</span>
            <span :class="dpNs.e('header-label')">{{ rightLabel }}</span>
            <span :class="dpNs.e('next-btn')">
              <button
                type="button"
                :class="[ppNs.e('icon-btn')]"
                class="d-arrow-right"
                @click="nextYear"
              >
                <el-icon><d-arrow-right /></el-icon>
              </button>
            </span>
          </div>
          <year-table
            selection-mode="range"
            :date="leftDate"
            :min-date="minDate"
            :max-date="maxDate"
            :range-state="rangeState"
            :disabled-date="disabledDate"
            @changerange="handleChangeRange"
            @pick="handleRangePick"
            @select="onSelect"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, ref, toRef } from 'vue'
import dayjs from 'dayjs'
import ElIcon from '@element-plus/components/icon'
import { useLocale, useNamespace } from '@element-plus/hooks'
import { DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
import {
  panelMonthRangeEmits,
  panelMonthRangeProps,
} from '../props/panel-month-range'
import { useYearRangeHeader } from '../composables/use-year-range-header'
import { useRangePicker } from '../composables/use-range-picker'
import YearTable from './basic-year-table.vue'

import type { Dayjs } from 'dayjs'

defineOptions({
  name: 'DatePickerYearRange',
})

const props = defineProps(panelMonthRangeProps)
const emit = defineEmits(panelMonthRangeEmits)
const unit = 'year'

const { lang } = useLocale()
const pickerBase = inject('EP_PICKER_BASE') as any
const { shortcuts, disabledDate, format } = pickerBase.props
const defaultValue = toRef(pickerBase.props, 'defaultValue')
const date = ref(dayjs().locale(lang.value))

const dpNs = useNamespace('date-picker')

const hasShortcuts = computed(() => !!shortcuts.length)

const { preYear, nextYear, leftDate, rightDate, leftLabel, rightLabel } =
  useYearRangeHeader({
    date,
  })

const {
  minDate,
  maxDate,
  rangeState,
  ppNs,
  handleChangeRange,
  handleRangeConfirm,
  handleShortcutClick,
  onSelect,
} = useRangePicker(props, {
  defaultValue,
  leftDate,
  rightDate,
  unit,
  onParsedValueChanged,
})

type RangePickValue = {
  minDate: Dayjs
  maxDate: Dayjs
}

const handleRangePick = (val: RangePickValue, close = true) => {
  const minDate_ = val.minDate
  const maxDate_ = val.maxDate
  if (maxDate.value === maxDate_ && minDate.value === minDate_) {
    return
  }
  emit('calendar-change', [minDate_.toDate(), maxDate_ && maxDate_.toDate()])
  maxDate.value = maxDate_
  minDate.value = minDate_

  if (!close) return
  handleRangeConfirm()
}

const formatToString = (days: Dayjs[]) => {
  return days.map((day) => day.format(format))
}

function onParsedValueChanged(
  minDate: Dayjs | undefined,
  maxDate: Dayjs | undefined
) {
  // if (props.unlinkPanels && maxDate) {
  //   const minDateYear = minDate?.year() || 0
  //   const maxDateYear = maxDate.year()
  //   rightDate.value =
  //     minDateYear === maxDateYear ? maxDate.add(1, unit) : maxDate
  // } else {
  //   rightDate.value = leftDate.value.add(1, unit)
  // }
}

emit('set-picker-option', ['formatToString', formatToString])
</script>
