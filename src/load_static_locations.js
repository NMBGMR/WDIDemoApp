const fs = require('fs');

var request = require('request');

const USE_NMBG = false
const base = USE_NMBG ? 'http://104.196.225.45/v1.0': 'https://frost-nm.internetofwater.dev/api/v1.0'

request(base+'/Locations?$expand=Things', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var info = JSON.parse(body)

        // console.log(info)
        var newData = info.value.map((loc, index) => (
            {
                type: 'feature',
                geometry: loc.location,
                properties: loc.Things,
                link: loc['@iot.selfLink']

            }))
        // console.log(info.value)
        console.log(newData)

        let data = {type: 'FeatureCollection',
                    features: newData}
                    let sdata =JSON.stringify(data, null , ' ')

        // fs.writeFileSync('nmbg_locations.json', sdata)
        fs.writeFileSync('usgs_ngwmn_locations.json', sdata)
    }
})