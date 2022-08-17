const axios = require('axios').default;
const moment = require('moment')
const puppeteer = require('puppeteer');
const Binance = require('node-binance-api');
const schedule = require('node-schedule');
const EventEmitter = require('events');

const binance = new Binance().options({});

const emitter = new EventEmitter()
emitter.setMaxListeners(1000)

require('dotenv').config();

const URL_API_KADDEX_STATS = 'https://swap.kaddex.com/analytics/kdx';

const PAIR = [
    'KISHK',
    'KAPY',
    'HYPE',
    'MOK',
    'kwUSDC',
    'KDL',
    'KDS',
    'BKA',
]


let formatNumber = function (number) {
    let splitNum;
    number = Math.abs(number);
    number = number.toFixed(2);
    splitNum = number.split('.');
    splitNum[0] = splitNum[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return splitNum.join(".");
}

const telegram =
    'https://api.telegram.org/bot'
    + process.env.BOT_TOEKN
    + '/sendMessage?chat_id='
    + process.env.CHAT_ID +
    'parse_mode=html&text='


async function main() {

    let tvl = 0;

    const browser = await puppeteer.launch({
        headless: true,
        slowMo: 500,
        args: ['--no-sandbox']
    });


    try {

        let res_dl = await axios.get(process.env.URL_API_DEFILAMA)

        if (res_dl.status === 200) {
            if (res_dl.data.currentChainTvls !== undefined) {
                tvl = parseFloat(res_dl.data.currentChainTvls.Kadena).toFixed(2);
            }
        }

        const page = await browser.newPage();
        await page.goto(URL_API_KADDEX_STATS, {waitUntil: 'networkidle2'});
        const element = await page.waitForSelector('.column.w-100.h-100.main');
        const value = await element.evaluate(el => el.textContent);
        await page.close();

        console.log(value.split(" "))

        const value_splitted = value.split(" ");

        let percentage = '';

        let stats = '';

        for (const pair of PAIR) {

            const page = await browser.newPage();
            await page.goto('https://swap.kaddex.com/token-info/' + pair, {waitUntil: 'networkidle2'});
            const element = await page.waitForSelector('.flex.column.w-100.justify-sb');
            let value = await element.evaluate(el => el.textContent);

            let split = value.split(' ');
            let price = split[1]
            let inc_dec = split[2]

            stats += pair + " " + "Price " + price + " " + inc_dec + "%" + "\n";
            console.log(stats)
            await page.close();
        }

        console.log(stats)

        if (!value_splitted[1].includes('--') || !value_splitted[1].includes('-NaN')) {

            if (value_splitted[1].includes('+')) percentage = ' incremento del ';
            if (value_splitted[1].includes('-')) percentage = ' decrementato del ';

            const value_kdx = value_splitted[1] + "$ " + percentage + " " + value_splitted[3]
            const market_cap = value_splitted[5].replace('supply', '').replace('-', '').replace(' ', '')
            const circulating_supply = value_splitted[8].replace('supply', ' ').replace(' ', '')
            const burned = value_splitted[10].replace('%Burned', ' ').replace('%detailsBurned', '').replace(' ', '')

            console.log("Value kdx: " + value_kdx)
            console.log("Market cap: " + market_cap)
            console.log("Circulating supply: " + circulating_supply)
            console.log("Burned: " + burned)

            let ticker = await binance.prices();

            let txt = '-- KADDEX BOT --\n ' +
                '\nKDA Price: ' + parseFloat(ticker.KDAUSDT).toFixed(3) + '$' +
                "\n" + "" +
                "\nKDX Price: " + String(value_kdx) + "%" +
                '\nCurrent TVL: ' + formatNumber(tvl) + "$" +
                '\nMarket Cap: ' + market_cap + "$" +
                '\nCirculating supply: ' + circulating_supply + " KDX" +
                '\nBurned: ' + burned + " KDX" +
                "\n" + "" +
                "\n" + stats +
                "\n" + "" +
                "\nValue Updated: " + "" + moment().format("Y-MM-DD h:mm:ss") + " \n" +
                "\n" + ""

            await axios.get(telegram + txt)
        }

        await browser.close();


    } catch (e) {
        await browser.close();
        console.error(e)
    }

}

schedule.scheduleJob('*/30 * * * *', async function () {
    await main();
});
