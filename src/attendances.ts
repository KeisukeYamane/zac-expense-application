import {japanDayjs} from "./japanDayjs";
const japaneseHolidays = require('japanese-holidays');

const week = {
	sunday: 0,
	monday: 1,
	tuesday: 2,
	wednesday: 3,
	thursday: 4,
	friday: 5,
	saturday: 6,
}

const remoteDays = [week['tuesday'], week['thursday']]
const holidays = [week['saturday'], week['sunday']]

export const retrieveAttendances = (date: Date): number => {
	const endOfThisMonth = japanDayjs(date).endOf('month')

	const lastDayOfMonth = endOfThisMonth.format('D');
	const dates = [...Array(Number(lastDayOfMonth))].map((_, index) => {
		const year = endOfThisMonth.format('YYYY')
		const month = endOfThisMonth.format('MM')

		return japanDayjs(`${year}-${month}-${(index + 1)}`);
	})

	const attendancesCount = dates
		.filter((d) => japaneseHolidays.isHoliday(d.toDate()) === undefined)
		.filter((d) => !remoteDays.includes(d.day()))
		.filter((d) => !holidays.includes(d.day()))

	return attendancesCount.length
};
