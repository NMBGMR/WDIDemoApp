
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

const LOCAL = false


const { BaseLayer, Overlay } = LayersControl

function saveFile(txt, name){
    const blob = new Blob([txt], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement("a")

    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
}


class ThingsMap extends Component{
    state = {
        hasLocation: false,
        latlng: null,
        nmbg_data: null,
        usgs_ngwmn_data: null,
        show_save_modal: false,
        use_atomic: false
    }

    componentDidMount() {
            // is local
        if (LOCAL){
            this.setState({nmbg_data: nmbg.default})
        }else{
            axios.get('https://storage.googleapis.com/download/storage/v1/b/waterdatainitiative/o/nmbg_locations.json?&alt=media',).then(success =>{
                this.setState({nmbg_data: success.data})
            })
            axios.get('https://storage.googleapis.com/download/storage/v1/b/waterdatainitiative/o/usgs_ngwmn_locations.json?&alt=media',).then(success =>{
                // let data = success.data
                // let features = data.features.slice(0,1)
                // data.features = features
                this.setState({usgs_ngwmn_data: success.data})
            })
        }
    }
    handleCreate(e){
        let sw = e.layer._bounds._southWest
        let ne = e.layer._bounds._northEast
        let locations = this.state.usgs_ngwmn_data.features.filter((d)=>{
            const lat = d.geometry.coordinates[1]
            const lon = d.geometry.coordinates[0]
            if (sw.lng<=lon && lon<=ne.lng){
                return sw.lat<=lat && lat<=ne.lat
            }

        })
        e.layer.remove()

        this.setState({'show_save_modal': true, locations: locations})

    }
    handleSave = e=>{
        this.setState({'show_save_modal': false})

        if (this.state.use_atomic){
            this.state.locations.forEach(this.exportLocation)
        }else{
            const n = this.state.locations.length-1
            // create a single csv file
            let csv = 'well, lat, lon, time, result\n';
            this.state.locations.forEach((row, idx)=>{
                // get the last observation
                const thing_idx = 0
                const ds_idx = 0
                axios.get(row.link+'?$expand=Things/Datastreams').then(success=>{
                    const thing = success.data.Things[thing_idx]
                    const ds = thing.Datastreams[ds_idx]
                    const url = ds['@iot.selfLink']+'/Observations?$orderBy=phenomenonTime DESC &$top=1'

                    axios.get(url).then(success=>{
                        let obs = success.data.value[0]
                        csv += row.properties[0].name+','
                        csv +=row.geometry.coordinates[1]+','+row.geometry.coordinates[0]+','
                        csv +=obs['phenomenonTime']+','+obs['result']+'\n'

                        if (idx==n){
                            saveFile(csv, 'output.csv')
                        }
                    })
                })

            })


        }
    }

    handleCancel = e=>{
        console.log('cancel', e)
        this.setState({'show_save_modal': false})

    }

    handleAtomic = e=>{
        console.log('asfdafasdfasdfasdfsa')
        this.setState({'use_atomic': !this.state.use_atomic})
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
                    csv += row['phenomenonTime']
                    csv +=','
                    csv += row['result']
                    csv += '\n'
                });
                saveFile(csv, filename)

            })
        })
    }

    render() {
        return (
            <div>
                <MapSaveDialog open={this.state.show_save_modal}
                            handleSave={this.handleSave}
                            handleCancel={this.handleCancel}
                            handleAtomic={this.handleAtomic}/>
                <Map center={this.props.center}
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
                                {this.state.usgs_ngwmn_data ? this.state.usgs_ngwmn_data.features.map((l, index)=>(
                                    <CircleMarker
                                        radius={5}
                                        key={index}
                                        color={'blue'}
                                        onClick={this.props.onSelect}
                                        center={[l.geometry.coordinates[1], l.geometry.coordinates[0]]}
                                        properties={l}/>
                                )):null}
                            </LayerGroup>
                        </Overlay>
                        <Overlay checked name="WaterLevelCABQ">
                            <LayerGroup>
                                {this.state.nmbg_data ? this.state.nmbg_data.features.filter(l=>(
                                    l.properties[0].name === 'WaterLevels'
                                )).map((l, index) => (
                                    <CircleMarker
                                        radius={5}
                                        key={index}
                                        color={'#fce066'}
                                        onClick={this.props.onSelect}
                                        center={[l.geometry.coordinates[1], l.geometry.coordinates[0]]}
                                        properties={l}/>
                                )): null}
                            </LayerGroup>

                        </Overlay>
                        <Overlay checked name="WaterLevelPressure">
                            <LayerGroup>
                                {this.state.nmbg_data ? this.state.nmbg_data.features.filter(l=>(
                                    l.properties[0].name === 'WaterLevelPressure'
                                )).map((l, index) => (
                                    <CircleMarker
                                        radius={5}
                                        key={index}
                                        color={'green'}
                                        onClick={this.props.onSelect}
                                        center={[l.geometry.coordinates[1], l.geometry.coordinates[0]]}
                                        properties={l}/>
                                )): null}
                            </LayerGroup>

                        </Overlay>
                        <Overlay checked name="WaterChemistry">
                            <LayerGroup>
                                {this.state.nmbg_data ? this.state.nmbg_data.features.filter(l=>(
                                    l.properties[0].name === 'WaterChemistryAnalysis'
                                )).map((l, index) => (
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


        )
    }
}
export default ThingsMap