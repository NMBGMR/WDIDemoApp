
import React, {Component} from 'react'
import { Map, CircleMarker, TileLayer, LayersControl, LayerGroup} from "react-leaflet";
import axios from 'axios';
import 'leaflet/dist/leaflet.css'

// import * as nmbg from './nmbg_locations.json'
// import * as ngwmn from './usgs_ngwmn_locations.json'
import * as nmbg from './local_locations.json'
const LOCAL = false

const { BaseLayer, Overlay } = LayersControl



class ThingsMap extends Component{
    state = {
        hasLocation: false,
        latlng: null,
        nmbg_data: null,
        usgs_ngwmn_data: null
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
                this.setState({usgs_ngwmn_data: success.data})
            })
        }
    }

    render() {

        return (
            <Map center={this.props.center}
                 zoom={this.props.zoom}
                 minZoom={4}
                 maxZoom={20}
                 ref={this.mapRef}
            >
                <TileLayer
                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

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
        )
    }
}
export default ThingsMap