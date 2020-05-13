
import React, {Component} from 'react'
import {Map, CircleMarker, TileLayer, LayersControl, LayerGroup, FeatureGroup} from "react-leaflet";
import axios from 'axios';
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
// import * as nmbg from './nmbg_locations.json'
// import * as ngwmn from './usgs_ngwmn_locations.json'
import * as nmbg from './local_locations.json'
import {EditControl} from "react-leaflet-draw";
import retrieveItems from "./util";
import MapSaveDialog from "./map_save_dialog";
import MapFilter from "./mapfilter"

const LOCAL = false


const { BaseLayer, Overlay } = LayersControl

const usgs_ngwm_base = 'https://frost-nm.internetofwater.dev/api/v1.0/'
// const nmbg_base = 'http://104.196.225.45/v1.0/'
const  nmbg_base = 'http://34.106.252.186/FROST-Server/v1.1/'

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
        center: [34.359593, -106.906871]
    }

    componentDidMount() {
            // is local
        if (LOCAL){
            this.setState({nmbg_wl_data: nmbg.default.features.filter(l=>(l.properties[0].name === 'WaterLevelPressure')),
                                nmbg_wq_data: nmbg.default.features.filter(l=>(l.properties[0].name === 'WaterChemistryAnalysis'))})
        }else{
            axios.get('https://storage.googleapis.com/download/storage/v1/b/waterdatainitiative/o/nmbg_st_locations.json?&alt=media',).then(success =>{
                let features = success.data.features
                function f(tag){
                    return (l)=> (l.properties[0].name === tag)
                }
                let nmbg_wl = features.filter(f('WaterLevelPressure'))
                let cabq_data = features.filter(f('CABQWaterLevels'))
                let nmbg_wq = features.filter(f('NMBGWaterChemistryAnalysis'))

                this.setState({nmbg_wl_data: nmbg_wl,
                                    onmbg_wl_data: nmbg_wl,
                                    cabq_data: cabq_data,
                                    ocabq_data: cabq_data,
                                    nmbg_wq_data: nmbg_wq})
            })
            axios.get('https://storage.googleapis.com/download/storage/v1/b/waterdatainitiative/o/usgs_ngwmn_locations.json?&alt=media',).then(success =>{
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
                datafilter(usgs_ngwm_base,
                    this.state.filter_comp,
                    this.state.filter_str,
                    f=>(this.setState({usgs_ngwmn_data: this.state.ousgs_ngwmn_data.filter(f)})))
                datafilter(nmbg_base,
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
                    handleClear={this.handleClear}/>
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
                        <Overlay checked name='USGS NGWMN'>
                            <LayerGroup>
                                {this.state.usgs_ngwmn_data ? this.state.usgs_ngwmn_data.map(l=>(
                                    <CircleMarker
                                        radius={5}
                                        key={l.link}
                                        color={'blue'}
                                        onClick={this.props.onSelect}
                                        center={[l.geometry.coordinates[1], l.geometry.coordinates[0]]}
                                        properties={l}/>
                                )):null}
                            </LayerGroup>
                        </Overlay>
                        <Overlay checked name="WaterLevelCABQ">
                            <LayerGroup>
                                {this.state.cabq_data ? this.state.cabq_data.map(l => (
                                    <CircleMarker
                                        radius={5}
                                        key={l.link}
                                        color={'#fce066'}
                                        onClick={this.props.onSelect}
                                        center={[l.geometry.coordinates[1], l.geometry.coordinates[0]]}
                                        properties={l}/>
                                )): null}
                            </LayerGroup>

                        </Overlay>
                        <Overlay checked name="WaterLevelPressure">
                            <LayerGroup>
                                {this.state.nmbg_wl_data ? this.state.nmbg_wl_data.map(l => (
                                    <CircleMarker
                                        radius={5}
                                        key={l.link}
                                        color={'green'}
                                        onClick={this.props.onSelect}
                                        center={[l.geometry.coordinates[1], l.geometry.coordinates[0]]}
                                        properties={l}/>
                                )): null}
                            </LayerGroup>

                        </Overlay>
                        <Overlay checked name="WaterChemistry">
                            <LayerGroup>
                                {this.state.nmbg_wq_data ? this.state.nmbg_wq_data.map((l, index) => (
                                    <CircleMarker
                                        radius={5}
                                        key={index}
                                        color={'red'}
                                        onClick={this.props.onSelect}
                                        center={[l.geometry.coordinates[1], l.geometry.coordinates[0]]}
                                        properties={l}
                                    >
                                    </CircleMarker>
                                )): null
                                }
                            </LayerGroup>
                        </Overlay>
                    </LayersControl>
                </Map>
                </div>
            </div>


        )
    }
}
export default ThingsMap