import puppeteer, {Page} from 'puppeteer';
import {japanDayjs} from "./japanDayjs";
import dotenv from "dotenv"
dotenv.config({path: '.env'})

/** ZACのUI依存 */
const USER_NAME_INPUT = 'input[name="user_name"]';
const PASSWORD_INPUT = 'input[name="password"]';
const LOGIN_BUTTON = 'button[type=submit]';
const FRAME_NAME = 'classic_window';
const NEW_REQUEST_INPUT_ID = '#button1';
const YEAR_INPUT = 'input[name="y_date_hassei_selected"]';
const MONTH_INPUT = 'input[name="m_date_hassei_selected"]';
const DAY_INPUT = 'input[name="d_date_hassei_selected"]';
const JOB_NO_INPUT = 'input[name="code_project_selected"]';
const URIAGE_KUBUN_SELECT = 'select[name="id_uriage_kubun_selected"]';
const URIAGE_KUBUN_OPTION_VALUE = '78456' // 売上項目[その他]
const HIMOKU_SELECT = 'select[name="id_himoku_selected"]';
const HIMOKU_OPTION_VALUE = '84' // 費目[旅費交通費（原価2]
const ZEIKOMI_KINGAKU_INPUT = 'input[name="zeikomi_kingaku_selected"]';
const SHOUHIZEI_SELECT = 'select[name="id_master_shouhizei_selected"]';
const SHOUHIZEI_OPTION_VALUE = '5'; // 税率[10％]
const KOUTUKIKANN_SELECT = 'select[name="memo1_selectedcombobox"]';
const KOUTUKIKANN_OPTION_VALUE = '1'; // 交通機関[電車]
const JOSHA_KUKAN_INPUT = 'input[name="memo2_selected"]';
const REMARKS_INPUT = 'input[name="memo3_selected"]';
const REGISTER_BUTTON = 'input[name="submit3"]';

/** 環境変数 */
const {USER_ID = '', PASSWORD = '', JOB_NO = '', SECTION_OF_LINE = '', LOGIN_PAGE_URL = '', KEIHI_ZENPAN_PAGE_URL = ''} = process.env

/** 申請日付 */
const requestDate = japanDayjs().endOf("month");

type Props = {
    attendanceCount: number,
    travelCost: number
}

export const zac = (async ({attendanceCount, travelCost}: Props) => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(LOGIN_PAGE_URL, {waitUntil: ['load', 'networkidle0']});
    page.setDefaultNavigationTimeout(0)

    /* ログイン */
    await page.type(USER_NAME_INPUT, USER_ID);
    await page.type(PASSWORD_INPUT, PASSWORD);
    await page.click(LOGIN_BUTTON);

    /* 申請一覧画面へ遷移 */
    await page.goto(KEIHI_ZENPAN_PAGE_URL, {waitUntil: ['load', 'networkidle0']});
    page.setDefaultNavigationTimeout(0)
    const frame = await page.frames().find((f) => f.name() === FRAME_NAME);
    if (frame === undefined) {
        console.log('frameが見つかりませんでした。')
        await browser.close();
        return;
    }

    const newRequestButton = await frame.$(NEW_REQUEST_INPUT_ID);
    if (newRequestButton === null) return;

    /* 申請入力画面へ遷移 */
    await newRequestButton.click();
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));
    const subwindow = await newPagePromise as Page;
    await subwindow.on('dialog',  (dialog) =>  dialog.accept());
    await subwindow.waitForNavigation({waitUntil: ['load', 'networkidle0']})

    await subwindow.type(YEAR_INPUT, requestDate.format('YYYY'))
    await subwindow.type(MONTH_INPUT, requestDate.format('M'))
    await subwindow.type(DAY_INPUT, requestDate.format('D'))
    await subwindow.type(JOB_NO_INPUT, JOB_NO);
    await subwindow.focus(URIAGE_KUBUN_SELECT);
    await subwindow.waitForTimeout(2000);
    await subwindow.select(URIAGE_KUBUN_SELECT, URIAGE_KUBUN_OPTION_VALUE);
    await subwindow.select(HIMOKU_SELECT, HIMOKU_OPTION_VALUE);
    await subwindow.type(ZEIKOMI_KINGAKU_INPUT, (attendanceCount * travelCost).toString());
    await subwindow.select(SHOUHIZEI_SELECT, SHOUHIZEI_OPTION_VALUE);
    await subwindow.select(KOUTUKIKANN_SELECT, KOUTUKIKANN_OPTION_VALUE);
    await subwindow.type(JOSHA_KUKAN_INPUT, SECTION_OF_LINE);
    await subwindow.type(REMARKS_INPUT, `リモート勤務のため、交通費実費精算${attendanceCount}日分`); // 乗車区間（駅名・地名)

    await subwindow.click(REGISTER_BUTTON); // 明細登録
});