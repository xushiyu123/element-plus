import DatePickPanel from './date-picker-com/panel-date-pick.vue'
import DateRangePickPanel from './date-picker-com/panel-date-range.vue'
import MonthRangePickPanel from './date-picker-com/panel-month-range.vue'
import YearRangePickPanel from './date-picker-com/panel-year-range.vue'
import MonthDatePickPanel from './date-picker-com/panel-month-date-pick.vue'
import type { IDatePickerType } from './date-picker.type'

export const getPanel = function (type: IDatePickerType): any {
  switch (type) {
    case 'daterange':
    case 'datetimerange': {
      return DateRangePickPanel
    }
    case 'monthrange': {
      return MonthRangePickPanel
    }
    case 'yearrange': {
      return YearRangePickPanel
    }
    case 'monthdate': {
      return MonthDatePickPanel
    }
    default: {
      return DatePickPanel
    }
  }
}
