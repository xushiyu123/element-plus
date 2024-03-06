import DatePickPanel from './date-picker-com/panel-date-pick.vue'
import DateRangePickPanel from './date-picker-com/panel-date-range.vue'
import MonthRangePickPanel from './date-picker-com/panel-month-range.vue'
import YearDatePickPanel from './date-picker-com/panel-year-date-pick.vue'
import MonthDatePickPanel from './date-picker-com/panel-month-date-pick.vue'
import type { IDatePickerType } from './date-picker.type'

export const getPanel = function (type: IDatePickerType) {
  switch (type) {
    case 'daterange':
    case 'datetimerange': {
      return DateRangePickPanel
    }
    case 'monthrange': {
      return MonthRangePickPanel
    }
    case 'yeardate': {
      return YearDatePickPanel
    }
    case 'monthdate': {
      return MonthDatePickPanel
    }
    default: {
      return DatePickPanel
    }
  }
}
