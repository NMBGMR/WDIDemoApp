
import React, {Component} from 'react'
import {Map, CircleMarker, TileLayer, LayersControl, LayerGroup, FeatureGroup, GeoJSON} from "react-leaflet";
import axios from 'axios';
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import * as nmbg from './local_locations.json'
import {EditControl} from "react-leaflet-draw";
import retrieveItems from "./util";
import MapSaveDialog from "./map_save_dialog";
import MapFilter from "./mapfilter"
import CONSTANTS from "./constants";
const LOCAL = false


const { BaseLayer, Overlay } = LayersControl

// const usgs_ngwm_base = 'https://frost-nm.internetofwater.dev/api/v1.0/'
// const nmbg_base = 'http://104.196.225.45/v1.0/'
// const  nmbg_base = 'http://st.newmexicowaterdata.org/FROST-Server/v1.1/'

function saveFile(txt, name){
    const blob = new Blob([txt], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement("a")

    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
}

function toCSV(items){
    return items.reduce((acc, cur)=>(acc+','+cur))+'\n'
}
function storageURL(name, gen){
    const STORAGE_BASE ='https://storage.googleapis.com/download/storage/v1/b/'
    const BUCKET = 'waterdatainitiative/'
    return STORAGE_BASE+BUCKET+'o/'+name+'?'+'generation='+gen+'&alt=media'

}

function overlay(name, data, onClick, color, checked){
    return <Overlay checked={checked} name={name}>
                <LayerGroup>
                    {data ? data.map(l=>(
                        <CircleMarker
                            radius={5}
                            key={l.link}
                            color={color}
                            onClick={onClick}
                            center={[l.geometry.coordinates[1], l.geometry.coordinates[0]]}
                            properties={l}/>
                    )):null}
                </LayerGroup>
            </Overlay>
}

class ThingsMap extends Component{
    state = {
        hasLocation: false,
        latlng: null,
        nmbg_wl_data: null,
        onmbg_wl_data: null,
        nmbg_wq_data: null,
        cabq_data: null,
        usgs_ngwmn_data: null,
        show_save_modal: false,
        use_atomic: false,
        filter_str: '1950',
        filter_comp: 'gt',
        filter_attr: 'observation_date',
        center: [34.359593, -106.906871],
        selectedPoints: null
    }

    componentDidMount() {
            // is local
        if (LOCAL){
            this.setState({nmbg_wl_data: nmbg.default.features.filter(l=>(l.properties[0].name === 'WaterLevelPressure')),
                                nmbg_wq_data: nmbg.default.features.filter(l=>(l.properties[0].name === 'WaterChemistryAnalysis'))})
        }else{
            axios.get(storageURL('nmbg_locations.json',
                '1592500801745747')).then(success =>{
            // axios.get('https://storage.googleapis.com/download/storage/v1/b/waterdatainitiative/o/nmbg_st_locations.json?generation=1592239299382115&alt=media',).then(success =>{

                let features = success.data.features
                function f(tag){
                    return (l)=> (l.things[0].name === tag)
                }
                let nmbg_wl = features.filter(f('WaterLevelPressure'))
                let cabq_data = features.filter(f('CABQWaterLevels'))
                let nmbg_wq = features.filter(f('WaterQuality'))
                console.log(nmbg_wq)

                function af(tag){
                    return (l)=>(

                        l.things.some((t)=>(t['datastreams'].some((d)=>(d['name'].startsWith(tag)))))
                    )
                }

                this.setState({nmbg_wl_data: nmbg_wl,
                                    onmbg_wl_data: nmbg_wl,
                                    cabq_data: cabq_data,
                                    ocabq_data: cabq_data,
                                    nmbg_arsenic: nmbg_wq.filter(af('Arsenic')),
                                    nmbg_hco3: nmbg_wq.filter(af('HCO3')),
                                    nmbg_ca: nmbg_wq.filter(af('Ca')),
                                    nmbg_tds: nmbg_wq.filter(af('TDS'))
                                })
            })

            axios.get(storageURL('ose_locations_things_datastreams.json', '1594678670124235')).then(success=>{
                this.setState({ose_pod_data: success.data.features,
                                    oose_pod_data: success.data.features})
            })

            axios.get(storageURL('usgs_ngwmn_locations.json',
                '1589236443170202')).then(success =>{
                // let data = success.data
                // let features = data.features.slice(0,1)
                // data.features = features
                this.setState({usgs_ngwmn_data: success.data.features,
                                    ousgs_ngwmn_data: success.data.features})
            })
        }
    }

    // rect selection
    handleCreate(e){
        let sw = e.layer._bounds._southWest
        let ne = e.layer._bounds._northEast

        function getLocations(data, source){
            return data.filter((d)=>{
                const lat = d.geometry.coordinates[1]
                const lon = d.geometry.coordinates[0]
                if (sw.lng<=lon && lon<=ne.lng){
                    return sw.lat<=lat && lat<=ne.lat
                }
            }).map(loc=>{loc['source']=source
            return loc})
        }

        let locations = getLocations(this.state.usgs_ngwmn_data, 'USGS NGWMN')
        locations = locations.concat(getLocations(this.state.nmbg_wl_data, 'NMBGMR'))
        locations = locations.concat(getLocations(this.state.cabq_data, 'CABQ'))

        e.layer.remove()

        this.setState({'show_save_modal': true, locations: locations})

    }

    handleSave = e=>{
        this.setState({'show_save_modal': false})

        if (this.state.use_atomic){
            this.state.locations.forEach(this.exportLocation)
        }else{
            this.exportAtomic()
        }

        this.setState({locations: null})
    }

    handleCancel = e=>{
        console.log('cancel', e)
        this.setState({'show_save_modal': false})

    }

    handleAtomic = e=>{
        this.setState({'use_atomic': !this.state.use_atomic})
    }

    exportAtomic(){
        console.debug('n selected', this.state.locations.length)
        const n = this.state.locations.length-1
        // // create a single csv file
        function getAtomicObservations(locations, idx, doc, resolve, reject){
            let loc = locations[idx]
            axios.get(loc.link+'?$expand=Things/Datastreams').then(success=>{
                    const thing = success.data.Things[0]
                    const name = success.data.name
                    const ds = thing.Datastreams.filter(d=> (
                        d['name'] === 'Depth Below Surface'))[0]

                    axios.get(ds['@iot.selfLink']+
                                    '/Observations?$orderby=phenomenonTime DESC &$top=1').then(success=>{
                        let obs = success.data.value[0]
                        doc += toCSV([name,
                            loc.properties[0].name,
                            loc.geometry.coordinates[1],
                            loc.geometry.coordinates[0],
                            obs['phenomenonTime'],
                            obs['result'].toFixed(2),
                            loc.source])

                        if (idx<n){
                            getAtomicObservations(locations,idx+1, doc, resolve, reject)
                        }else{
                            resolve(doc)
                        }
                    })
                })
        }
        new Promise((resolve, reject)=>{
            getAtomicObservations(this.state.locations, 0,
                'location, thing, lat, lon, time, result, source\n',
                resolve, reject)
        }).then(result=>{
            saveFile(result, 'output.csv')
        })

    }
    exportLocation(loc){
        // going to assume first thing
        const thing_idx = 0

        axios.get(loc.link+'?$expand=Things/Datastreams').then(success=>{
            const thing = success.data.Things[thing_idx]

            const ds= thing.Datastreams.filter(d=> {
                return d['name'] === 'Depth Below Surface'
            })[0]

            const url = ds['@iot.selfLink']+'/Observations?$orderBy=phenomenonTime'
            const filename = loc.properties[0].name+'_'+thing.name+'_'+ds.name+'.csv'
            retrieveItems(url, -1, items=>{
                let csv = 'Time,Result\n';
                items.forEach(function(row) {
                    csv+=toCSV([row['phenomenonTime'],
                        row['result'].toFixed(2)])
                });
                saveFile(csv, filename)

            })
        })
    }


    // filtering
    handleClear = e=>{
        this.setState({usgs_ngwmn_data: this.state.ousgs_ngwmn_data,
                            nmbg_wl_data: this.state.onmbg_wl_data})
    }

    handleFilter = e=>{
        console.debug('handle filter')
        console.debug(this.state.filter_attr)
        console.debug(this.state.filter_comp)
        console.debug(this.state.filter_str)

        switch (this.state.filter_attr){
            case 'observation_date':
                function datafilter(base, comp, str, cb){
                    let url = base
                    let d = new Date(str)
                    url =base+"Locations?$filter=Locations/Things/Datastreams/name eq 'Depth Below Surface'" +
                        " and Things/Datastreams/Observations/phenomenonTime "
                    url +=comp
                    url +=' '+d.toISOString()
                    console.debug(url)
                    retrieveItems(url, -1, items=>{
                        console.debug('matches', items.length)
                        function f(d){
                            for (let l of items){
                                if (d.link==l['@iot.selfLink']){
                                    return true
                                }}
                        }
                        cb(f)
                    })
                }
                datafilter(CONSTANTS.NM_NGWMN_ST_URL,
                    this.state.filter_comp,
                    this.state.filter_str,
                    f=>(this.setState({usgs_ngwmn_data: this.state.ousgs_ngwmn_data.filter(f)})))
                datafilter(CONSTANTS.NMBG_ST_URL,
                    this.state.filter_comp,
                    this.state.filter_str,
                    f=>(this.setState({nmbg_wl_data: this.state.onmbg_wl_data.filter(f)})))
                break
            case 'location_name':
                let fstr = this.state.filter_str
                function f(fi){
                    return fi['name'] == fstr
                }
                this.setState({usgs_ngwmn_data: this.state.ousgs_ngwmn_data.filter(f),
                                    nmbg_wl_data: this.state.onmbg_wl_data.filter(f)
                })
                break
        }


    }

    handleStr = e=>{
        this.setState({filter_str: e.target.value})
    }
    handleAttr = e=>{
        this.setState({filter_attr: e.target.value})
    }
    handleComp = e=>{
        this.setState({filter_comp:e.target.value})
    }

    render() {
        // if(this.props.selectedCounties){
        //     var i;
        //     for (i=0; i<this.props.selectedCounties.features.length; i++){
        //         console.log(this.props.selectedCounties.features[i])
        //     }
        // }

        return (
            <div className={'group'}>
                <MapSaveDialog open={this.state.show_save_modal}
                            handleSave={this.handleSave}
                            handleCancel={this.handleCancel}
                            handleAtomic={this.handleAtomic}/>
                <MapFilter
                    filter_comp={this.state.filter_comp}
                    filter_attr={this.state.filter_attr}
                    handleAttr={this.handleAttr}
                    handleStr={this.handleStr}
                    handleComp={this.handleComp}
                    handleFilter={this.handleFilter}
                    handleClear={this.handleClear}
                />
                <div className={'subgroup'}>

                <Map center={this.state.center}
                     zoom={this.props.zoom}
                     minZoom={4}
                     maxZoom={20}
                     ref={this.mapRef}>
                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <FeatureGroup>
                        <EditControl positon="topleft"
                                     onCreated={(event)=> this.handleCreate(event)}
                                     draw={{
                                         polyline: false,
                                         marker: false,
                                         circle: false,
                                         circlemarker: false,
                                         polygon: false
                                     }}
                                     edit = {{edit: false, remove: false}}

                        />
                    </FeatureGroup>

                    <GeoJSON key={this.props.selectedCounties?this.props.selectedCounties.features.length:-1}
                        data={this.props.selectedCounties}/>

                    <GeoJSON data={this.state.selectedPoints}/>

                    <LayersControl position="topright">
                        <BaseLayer name='OpenStreetMap'>
                            <TileLayer
                                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                        </BaseLayer>
                        <BaseLayer name='OpenTopoMap'>
                            <TileLayer
                                attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                            />
                        </BaseLayer>
                        <BaseLayer name='Esri.WorldImagery'>
                            <TileLayer
                                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'"
                            />
                        </BaseLayer>
                        <BaseLayer name='Esri.WorldStreetMap'>
                            <TileLayer
                                url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
                                attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
                            />
                        </BaseLayer>
                        <BaseLayer name='Esri.WorldShadedRelief'>
                            <TileLayer
                                url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}'
                                attribution='Tiles &copy; Esri &mdash; Source: Esri'
                                maxZoom= {13}
                            />
                        </BaseLayer>

                        <BaseLayer checked name='Stamen.Terrain'>
                            <TileLayer
                                url='https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}'
                                attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                subdomains='abcd'
                                minZoom= {0}
                                maxZoom= {18}
                                ext='png'
                            />

                        </BaseLayer>

                        {overlay('USGS NGWMN',
                            this.state.usgs_ngwmn_data,
                            this.props.onSelect,
                            'blue',
                            true)}

                        {/*<Overlay checked name="WaterLevelCABQ">*/}
                        {/*    <LayerGroup>*/}
                        {/*        {this.state.cabq_data ? this.state.cabq_data.map(l => (*/}
                        {/*            <CircleMarker*/}
                        {/*                radius={5}*/}
                        {/*                key={l.link}*/}
                        {/*                color={'#fce066'}*/}
                        {/*                onClick={this.props.onSelect}*/}
                        {/*                center={[l.geometry.coordinates[1], l.geometry.coordinates[0]]}*/}
                        {/*                properties={l}/>*/}
                        {/*        )): null}*/}
                        {/*    </LayerGroup>*/}
                        {/*</Overlay>*/}

                        {overlay("NMBG WaterLevelPressure",
                                  this.state.nmbg_wl_data,
                                  this.props.onSelect,
                                  'green',
                                  false)}
                        {overlay("NMBG Arsenic",
                                 this.state.nmbg_arsenic,
                                 this.props.onSelect,
                            'red',
                            false)}
                        {overlay('NMBG HCO3',
                                this.state.nmbg_hco3,
                                this.props.onSelect,
                            'purple',
                            false)}
                        {overlay('NMBG Ca',
                                this.state.nmbg_ca,
                                this.props.onSelect,
                            'orange',
                            false)}
                        {overlay('NMBG TDS',
                                this.state.nmbg_tds,
                                this.props.onSelect,
                            'lightblue',
                            false)}
                        {overlay('OSE POD',
                        this.state.ose_pod_data,
                        this.props.onSelect,
                            'violet',
                            false)}
                    </LayersControl>
                </Map>
                </div>
            </div>


        )
    }
}
export default ThingsMap