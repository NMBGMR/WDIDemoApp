const fs = require('fs');
const axios =require('axios');
// const base = 'https://st.newmexicowaterdata.org/FROST-Server/v1.1'
const base = 'https://nm.ngwmn.internetofwater.dev/api/v1.1'
// const base = 'https://ose.newmexicowaterdata.org/FROST-Server/v1.1'
// const base = 'https://frost-nm.internetofwater.dev/api/v1.0'
// const path = './data/nmbg_locations_things_datastreams.json'
const path = './data/ngwmn_locations_things_datastreams.json'
// const path = './data/ose_locations_things_datastreams.json'


const getItems = (url, items, resolve, reject) =>{
    console.log(url)
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
    // getItems(base+'/Locations?$expand=Things', [], resolve, reject)}).then(response=>{
    getItems(base+"/Locations?$expand=Things/Datastreams/Sensor", [], resolve, reject)}).then(response=>{
    fs.writeFileSync(path,  JSON.stringify({type: 'FeatureCollection',
                                                  features: response.map( loc => (
                                                      {
                                                          type: 'feature',
                                                          geometry: loc.location,
                                                          things: loc.Things.map(t=> (
                                                              {
                                                                  name: t['name'],
                                                                  // description: t['description'],
                                                                  // properties: t['properties'],
                                                                  datastreams: t['Datastreams'].map(d=>(
                                                                      {
                                                                          name: d['name'],
                                                                          sensor: d['Sensor']['name']
                                                                          // description: d['description'],
                                                                          // link: d['@iot.selfLink']
                                                                      }
                                                                  ))
                                                              })),
                                                          link: loc['@iot.selfLink'],
                                                          name: loc.name
                                                      }
                                                      ))},
                    null , ' '))
})


// use the following command to upload to g storage bucket

