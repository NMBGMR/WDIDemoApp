const axios =require('axios');
let base = 'https://frost-nm.internetofwater.dev/api/v1.0/Locations?$filter='
base = 'http://104.196.225.45/v1.0/Locations?$filter='

let d = new Date('2017-01-01')
let url =base+ "Things/Datastreams/Observations/phenomenonTime lt "+d.toISOString()
console.log(url)


axios.get(url).then(success=>{
    console.log(success.data)
})