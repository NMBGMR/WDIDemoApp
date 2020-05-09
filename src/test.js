const axios =require('axios');
let base = 'https://frost-nm.internetofwater.dev/api/v1.0/'
base = 'http://104.196.225.45/v1.0/'

let d = new Date('2018-10-20')
let url =base+ "Locations?$filter=Things/Datastreams/Observations/phenomenonTime gt "+d.toISOString()
// url+= ', '
// let url = base +"Locations?$filter=Things/Datastreams/name eq 'Depth Below Surface'" +
//     " and Things/Datastreams/Observations/phenomenonTime gt "+d.toISOString()


console.log(url)


axios.get(url).then(success=>{
    console.log(success.data)
})