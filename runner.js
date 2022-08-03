const axios = require('axios').default;
const schedule = require('node-schedule');

const URL_API_DEFILAMA = 'https://api.llama.fi/protocol/kaddex';
const URL_API_KADDEX = 'https://analytics-api.kaddex.com/candles?currency=coin&asset=kaddex.kdx&'

// dateStart=2022-08-03&dateEnd=2022-08-03

async function main() {

    const res_kaddex = await axios.get(URL_API_KADDEX + "")
    console.log(res_kaddex)

    const res_defi = await axios.get(URL_API_DEFILAMA)
    if (res_defi.data !== undefined) {
        let tvl = res_defi.data.currentChainTvls.Kadena;
        console.log(tvl)
    }
}

schedule.scheduleJob('* * * * *', async function () {
    await main();
});

