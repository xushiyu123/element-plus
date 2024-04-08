import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

export const useYearRangeHeader = ({ date }: { date: Ref<Dayjs> }) => {
  const leftLabel = ref(Math.floor(date.value.year() / 10) * 10)

  const rightLabel = ref(Math.floor(date.value.year() / 10) * 10 + 10)

  const leftDate = computed(() => dayjs().year(leftLabel.value))

  const rightDate = computed(() => dayjs().year(rightLabel.value))

  const nextYear = () => {
    leftLabel.value += 10
    rightLabel.value += 10
  }

  const preYear = () => {
    leftLabel.value -= 10
    rightLabel.value -= 10
  }

  return {
    nextYear,
    preYear,
    leftDate,
    rightDate,
    leftLabel,
    rightLabel,
  }
}
