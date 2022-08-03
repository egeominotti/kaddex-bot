const axios = require('axios').default;
const schedule = require('node-schedule');
const moment = require('moment')
require('dotenv').config();

const telegram = 'https://api.telegram.org/bot' + process.env.BOT_TOEKN + '/sendMessage?chat_id=' + process.env.CHAT_ID + '&parse_mode=Markdown&text='

async function main() {

    let tvl = 0;
    let price = 0

    let current_date = moment().format("Y-MM-DD")

    let res_kd = await axios.get(process.env.URL_API_KADDEX + "dateStart=" + current_date + "&dateEnd=" + current_date)
    let res_dl = await axios.get(process.env.URL_API_DEFILAMA)


    if (res_kd.status === 200) {
        console.log(res_kd)
        price = res_kd.data[0].usdPrice.close.toFixed(3);
    }

    if (res_dl.status === 200) {
        tvl = res_dl.data.currentChainTvls.Kadena.toFixed(0);
    }

    let text = 'TVL: ' + tvl + " PRICE: " + price;
    await axios.get(telegram + text)
}

//main().then().catch()

schedule.scheduleJob('* * * * *', async function () {
    await main();
});

