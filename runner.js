const axios = require('axios').default;
const schedule = require('node-schedule');
const moment = require('moment')

const URL_API_DEFILAMA = 'https://api.llama.fi/protocol/kaddex';
const URL_API_KADDEX = 'https://analytics-api.kaddex.com/candles?currency=coin&asset=kaddex.kdx&'

async function main() {

    let current_date = moment().format("Y-MM-DD")

    const res_kd = await axios.get(URL_API_KADDEX + "dateStart=" + current_date + "&dateEnd=" + current_date)
    if(res_kd.status === 200){
        const close = res_kd.data[0].usdPrice.close;
        console.log(close)
    }

    const res_dl = await axios.get(URL_API_DEFILAMA)
    if(res_dl.status === 200){
        let tvl = res_dl.data.currentChainTvls.Kadena;
        console.log(tvl)
    }
}

main().then().catch()

/*
schedule.scheduleJob('* * * * *', async function () {
    await main();
});

 */

