const axios = require('axios').default;
const moment = require('moment')
const Binance = require('node-binance-api');
const binance = new Binance().options({});
const express = require('express')

const app = express()

require('dotenv').config();

let tvl_stored = 0;
let price_stored = 0;

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

        let res_kd = await axios.get(process.env.URL_API_KADDEX + "dateStart=" + current_date + "&dateEnd=" + current_date)
        let res_dl = await axios.get(process.env.URL_API_DEFILAMA)

        if (res_kd.status === 200) {
            price = res_kd.data[0].usdPrice.close.toFixed(3);
        }

        if (res_dl.status === 200) {
            tvl = parseFloat(res_dl.data.currentChainTvls.Kadena).toFixed(2);
        }

        console.log(tvl)
        console.log(tvl_stored)
        console.log(price)
        console.log(price_stored)

        if (tvl !== tvl_stored || price !== price_stored) {

            let ticker = await binance.prices();

            tvl_stored = tvl;
            price_stored = price;

            let txt = '-- Bot Staking Kaddex --\n ' +
                '\nKDA Price: ' + parseFloat(ticker.KDAUSDT).toFixed(3) + '$' +
                "\nKDX Price: " + price + "$" +
                '\nCurrent TVL: ' + formatNumber(tvl) + "$" +
                "\n" + "" +
                "\nValue Updated: " + "" + moment().format("Y-MM-DD h:mm:ss a") + " \n" +
                '---------------------------------------------------------------------\n '

                await axios.get(telegram + txt)
        }

    } catch (e) {
        await axios.get(telegram + e.toString())
    }
}

app.listen(process.env.PORT || process.env.EXPRESS_PORT, () => {
    console.log(`Kaddex-Api-Fetcher running on ${process.env.PORT || process.env.EXPRESS_PORT}`)
}).on('error', (err) => {
    console.error(err)
})


setInterval(main, 30000);
