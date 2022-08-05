const axios = require('axios').default;
const moment = require('moment')
const puppeteer = require('puppeteer');
const Binance = require('node-binance-api');
const binance = new Binance().options({});

require('dotenv').config();

let tvl_stored = 0;
let price_stored = 0;

const URL_API_KADDEX_STATS = 'https://swap.kaddex.com/analytics/kdx';

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
    '&parse_mode=Markdown&text='


async function main() {

    console.log("I'm alive!!");

    const current_date = moment().format("Y-MM-DD")

    let tvl = 0;
    let price = 0

    try {

        const browser = await puppeteer.launch({
            headless: true,
            slowMo: 500,
            args: ['--no-sandbox']
        });


        let res_kd = await axios.get(process.env.URL_API_KADDEX + "dateStart=" + current_date + "&dateEnd=" + current_date)
        let res_dl = await axios.get(process.env.URL_API_DEFILAMA)

        if (res_kd.status === 200) {
            price = res_kd.data[0].usdPrice.close.toFixed(3);
        }

        if (res_dl.status === 200) {
            tvl = parseFloat(res_dl.data.currentChainTvls.Kadena).toFixed(2);
        }

        console.log("TVL: " + tvl)
        console.log("TVL Stored: " + tvl_stored)
        console.log("Price KDX: " + price)
        console.log("Price Stored: " + price_stored)

        if (tvl !== tvl_stored || price !== price_stored) {

            const page = await browser.newPage();
            await page.goto(URL_API_KADDEX_STATS, {waitUntil: 'networkidle2'});
            const element = await page.waitForSelector('.FlexContainer__STYFlexContainer-sc-16sly3k-0.flviZN.column');
            const value = await element.evaluate(el => el.textContent);
            console.log(value.split(" "))

            const value_splitted = value.split(" ");
            const market_cap = value_splitted[5].replace('supply', '').replace('-', '').replace(' ', '')
            const circulating_supply = value_splitted[8].replace('supply', ' ').replace(' ', '')
            const burned = value_splitted[10].replace('%Burned', ' ').replace(' ', '')

            console.log("Market cap: " + market_cap)
            console.log("Circulating supply: " + circulating_supply)
            console.log("Burned: " + burned)

            let ticker = await binance.prices();

            tvl_stored = tvl;
            price_stored = price;

            let txt = '-- KADDEX BOT --\n ' +
                '\nKDA Price: ' + parseFloat(ticker.KDAUSDT).toFixed(3) + '$' +
                "\nKDX Price: " + price + "$" +
                '\nCurrent TVL: ' + formatNumber(tvl) + "$" +
                '\nMarket Cap: ' + market_cap + "$" +
                '\nCirculating supply: ' + circulating_supply + "$" +
                '\nBurned: ' + burned + "$" +
                "\n" + "" +
                "\nValue Updated: " + "" + moment().format("Y-MM-DD") + " \n" +
                "\n" + ""

            await axios.get(telegram + txt)
        }

    } catch (e) {
        await axios.get(telegram + e.toString())
    }
}

setInterval(main, 50000);
