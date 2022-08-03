const axios = require('axios').default;
const schedule = require('node-schedule');
const moment = require('moment')

const URL_API_DEFILAMA = 'https://api.llama.fi/protocol/kaddex';
const URL_API_KADDEX = 'https://analytics-api.kaddex.com/candles?currency=coin&asset=kaddex.kdx&'


const chat_id = '-699520069';
const bot_token = '2136128892:AAFOQs6Qri5eqZKIeEovq8wthAxPYDjkBkY'
const send_text = 'https://api.telegram.org/bot' + bot_token + '/sendMessage?chat_id=' + chat_id + '&parse_mode=Markdown&text='

async function main() {

    let tvl = 0;
    let price = 0

    let current_date = moment().format("Y-MM-DD")

    let res_kd = await axios.get(URL_API_KADDEX + "dateStart=" + current_date + "&dateEnd=" + current_date)
    let res_dl = await axios.get(URL_API_DEFILAMA)


    if (res_kd.status === 200) {
        price = res_kd.data[0].usdPrice.close.toFixed(3);
    }

    if (res_dl.status === 200) {
        tvl = res_dl.data.currentChainTvls.Kadena.toFixed(0);
    }

    let text = 'TVL: ' + tvl + " PRICE: "+ price;
    await axios.get(send_text + text)
}

main().then().catch()

/*
schedule.scheduleJob('* * * * *', async function () {
    await main();
});

 */

