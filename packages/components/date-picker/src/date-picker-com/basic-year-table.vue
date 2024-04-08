<template>
  <table
    role="grid"
    :aria-label="t('el.datepicker.yearTablePrompt')"
    :class="ns.b()"
    @click="handleYearTableClick"
  >
    <tbody ref="tbodyRef">
      <tr v-for="(row, key) in rows" :key="key">
        <template v-for="cell in row">
          <td
            v-if="cell.row * 4 + cell.column < 10"
            :ref="
              (el) =>
                isSelectedCell(cell.text) && (currentCellRef = el as HTMLElement)
            "
            class="available"
            :class="getCellKls(cell)"
            :aria-selected="`${isSelectedCell(cell.text)}`"
            :tabindex="
              isSelectedCell(startYear + cell.row * 4 + cell.column) ? 0 : -1
            "
            @keydown.space.prevent.stop="handleYearTableClick"
            @keydown.enter.prevent.stop="handleYearTableClick"
          >
            <div>
              <span class="cell">{{
                startYear + cell.row * 4 + cell.column
              }}</span>
            </div>
          </td>
          <td v-else />
        </template>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { useLocale, useNamespace } from '@element-plus/hooks'
import { rangeArr } from '@element-plus/components/time-picker'
import { castArray, hasClass } from '@element-plus/utils'
import { basicYearTableProps } from '../props/basic-year-table'

type YearCell = {
  column: number
  row: number
  disabled: boolean
  start: boolean
  end: boolean
  text: number
  type: 'normal' | 'today'
  inRange: boolean
}

const datesInYear = (year: number, lang: string) => {
  const firstDay = dayjs(String(year)).locale(lang).startOf('year')
  const lastDay = firstDay.endOf('year')
  const numOfDays = lastDay.dayOfYear()
  return rangeArr(numOfDays).map((n) => firstDay.add(n, 'day').toDate())
}

const props = defineProps(basicYearTableProps)
const emit = defineEmits(['pick', 'select'])

const ns = useNamespace('year-table')

const { t, lang } = useLocale()
const tbodyRef = ref<HTMLElement>()
const currentCellRef = ref<HTMLElement>()
const startYear = computed(() => {
  return Math.floor(props.date.year() / 10) * 10
})

const tableRows = ref<YearCell[][]>([
  [] as YearCell[],
  [] as YearCell[],
  [] as YearCell[],
])

const rows = computed<YearCell[][]>(() => {
  const rows = tableRows.value

  const now = dayjs().locale(lang.value).startOf('year')

  for (let i = 0; i < 3; i++) {
    const row = rows[i]
    for (let j = 0; j < 4 && i * 4 + j < 10; j++) {
      const cell = (row[j] ||= {
        row: i,
        column: j,
        type: 'normal',
        inRange: false,
        start: false,
        end: false,
        text: -1,
        disabled: false,
      })

      cell.type = 'normal'

      const index = startYear.value + i * 4 + j

      const calTime = props.date.year(index)
      const calEndDate =
        props.rangeState.endDate ||
        props.maxDate ||
        (props.rangeState.selecting && props.minDate) ||
        null

      cell.inRange =
        !!(
          props.minDate &&
          calTime.isSameOrAfter(props.minDate, 'year') &&
          calEndDate &&
          calTime.isSameOrBefore(calEndDate, 'year')
        ) ||
        !!(
          props.minDate &&
          calTime.isSameOrBefore(props.minDate, 'year') &&
          calEndDate &&
          calTime.isSameOrAfter(calEndDate, 'year')
        )

      if (props.minDate?.isSameOrAfter(calEndDate)) {
        cell.start = !!(calEndDate && calTime.isSame(calEndDate, 'year'))
        cell.end = props.minDate && calTime.isSame(props.minDate, 'year')
      } else {
        cell.start = !!(props.minDate && calTime.isSame(props.minDate, 'year'))
        cell.end = !!(calEndDate && calTime.isSame(calEndDate, 'year'))
      }

      const isToday = now.isSame(calTime)
      if (isToday) {
        cell.type = 'today'
      }

      cell.text = index
      cell.disabled = props.disabledDate?.(calTime.toDate()) || false
    }
  }
  return rows
})

const focus = () => {
  currentCellRef.value?.focus()
}

const getCellKls = (cell: YearCell) => {
  const kls: Record<string, boolean> = {}
  const today = dayjs().locale(lang.value)
  kls.disabled = props.disabledDate
    ? datesInYear(cell.text, lang.value).every(props.disabledDate)
    : false
  kls.current =
    castArray(props.parsedValue).findIndex((d) => d!.year() === cell.text) >= 0
  kls.today = today.year() === cell.text
  if (cell.inRange) {
    kls['in-range'] = true
    if (cell.start) {
      kls['start-date'] = true
    }
    if (cell.end) {
      kls['end-date'] = true
    }
  }
  return kls
}

const isSelectedCell = (year: number) => {
  if (props.selectionMode === 'range') {
    const start = props.date.year()
    return year >= start
  } else {
    return (
      (year === startYear.value &&
        props.date.year() < startYear.value &&
        props.date.year() > startYear.value + 9) ||
      castArray(props.date).findIndex((date) => date.year() === year) >= 0 ||
      castArray(props.parsedValue).findIndex((date) => date?.year() === year) >=
        0
    )
  }
}

const handleYearTableClick = (event: MouseEvent | KeyboardEvent) => {
  const clickTarget = event.target as HTMLDivElement
  const target = clickTarget.closest('td')
  if (target && target.textContent) {
    if (hasClass(target, 'disabled')) return
    const year = target.textContent || target.innerText
    if (props.selectionMode === 'range') {
      const column = target.cellIndex
      const row = (target.parentNode as HTMLTableRowElement).rowIndex
      const year = row * 4 + column
      const newDate = props.date.year(year + startYear.value)
      if (!props.rangeState.selecting) {
        emit('pick', { minDate: newDate, maxDate: null })
        emit('select', true)
      } else {
        if (props.minDate && newDate >= props.minDate) {
          emit('pick', { minDate: props.minDate, maxDate: newDate })
        } else {
          emit('pick', { minDate: newDate, maxDate: props.minDate })
        }
        emit('select', false)
      }
    } else if (props.selectionMode === 'years') {
      if (event.type === 'keydown') {
        emit('pick', castArray(props.parsedValue), false)
        return
      }
      const newValue = hasClass(target, 'current')
        ? castArray(props.parsedValue).filter((d) => d?.year() !== Number(year))
        : castArray(props.parsedValue).concat([dayjs(year)])
      emit('pick', newValue)
    } else {
      emit('pick', Number(year))
    }
  }
}

watch(
  () => props.date,
  async () => {
    if (tbodyRef.value?.contains(document.activeElement)) {
      await nextTick()
      currentCellRef.value?.focus()
    }
  }
)

defineExpose({
  /**
   * @description focus on the current cell
   */
  focus,
})
</script>
