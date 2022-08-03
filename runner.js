const axios = require('axios').default;
const schedule = require('node-schedule');
const moment = require('moment')
const express = require('express')
const app = express()

require('dotenv').config();


const telegram =
    'https://api.telegram.org/bot'
    + process.env.BOT_TOEKN
    + '/sendMessage?chat_id='
    + process.env.CHAT_ID +
    '&parse_mode=Markdown&text='

async function main() {

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
            tvl = res_dl.data.currentChainTvls.Kadena.toFixed(0);
        }

        let text = 'Bot Staking Kaddex \nCurrent TVL: ' + tvl + "\nCurrent PRICE: " + price + " \n" + "\n By kernelvoid <3";
        await axios.get(telegram + text)

    } catch (e) {
        await axios.get(telegram + e.toString())
    }

}


schedule.scheduleJob('* * * * *', async function () {
    await main();
});


app.listen(process.env.PORT || process.env.EXPRESS_PORT, () => {
    console.log(`Kaddex-Api-Fetcher running on ${process.env.PORT || process.env.EXPRESS_PORT}`)
}).on('error', (err) => {
    console.error(err)
})
