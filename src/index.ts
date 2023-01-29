const inquirer = require('inquirer');
import {japanDayjs} from "./japanDayjs";
import {zac} from "./zac";
import {retrieveAttendances} from "./attendances";

const requestDate = japanDayjs().endOf("month");

type Props = {
    yearMonth: string,
    attendanceCountInCalender: number, // 暦通りの出勤日数
}

const askQuestions = ({yearMonth, attendanceCountInCalender}: Props) => {
    const questions = [
        {
            name: "ATTENDANCE_COUNT",
            type: "input",
            message: `${yearMonth}の出勤日数は暦通りだと${attendanceCountInCalender}日だ！君の出勤日数を入力してくれ！`
        },
        {
            name: "TRAVEL_COST",
            type: "input",
            message: "往復の交通費を入力してくれ！",
        }
    ];

    return inquirer.prompt(questions);
};

(async () => {
    const answers = await askQuestions({
        yearMonth: requestDate.tz().format('YYYY年M月'),
        attendanceCountInCalender: retrieveAttendances(requestDate.toDate())
    });
    const { ATTENDANCE_COUNT, TRAVEL_COST } = answers;
    if (isNaN(ATTENDANCE_COUNT)) {
        console.log('出勤日数は数値で入力してくれ...');
        return;
    }
    if (isNaN(TRAVEL_COST)) {
        console.log('交通費は数値で入力してくれ...');
        return;
    }

    await zac({
        attendanceCount: ATTENDANCE_COUNT,
        travelCost: TRAVEL_COST
    })
})()