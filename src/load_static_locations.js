const fs = require('fs');
const axios =require('axios');
// const base = 'http://104.196.225.45/v1.0'
// const base = 'http://34.106.252.186/FROST-Server/v1.1'
// const base = 'http://localhost:8080/v1.0'
const base = 'https://frost-nm.internetofwater.dev/api/v1.0'
const path = 'usgs_ngwmn_locations.json'


const getItems = (url, items, resolve, reject) =>{
    axios.get(url).then(response=>{
        const ritems = items.concat(response.data.value)
        if (response.data['@iot.nextLink']!=null){
            getItems(response.data['@iot.nextLink'], ritems, resolve, reject)
        }else{
            resolve(ritems)
        }
    })
}

new Promise((resolve, reject) => {
    getItems(base+'/Locations?$expand=Things', [], resolve, reject)}).then(response=>{
    fs.writeFileSync(path,  JSON.stringify({type: 'FeatureCollection',
                                                  features: response.map( loc => (
                                                      {
                                                          type: 'feature',
                                                          geometry: loc.location,
                                                          properties: loc.Things.map(t=> ({name: t['name']})),
                                                          link: loc['@iot.selfLink'],
                                                          name: loc.name
                                                      }
                                                      ))},
                    null , ' '))
})
