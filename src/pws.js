import React, {Component} from "react";
import {GeoJSON, LayersControl, Map, TileLayer, CircleMarker, LayerGroup} from "react-leaflet";
import * as pwsboundaries from './data/pws_nm.json'
import SimpleTable from "./tables/simple_table";
import Geocode from "react-geocode";


const { BaseLayer, Overlay } = LayersControl
Geocode.setApiKey('AIzaSyDOVhaCsxL9tzlHTNNTjrZJJEN1mp4e5n4')
function inside(point, vs) {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

    var x = point['lng'], y = point['lat'];
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

function makePWSProperties(props){
    return Object.entries(props).map((pi)=>{


        return {'key': pi[0], 'value': pi[1], 'id': pi[0]}
        })
}

class PWSMap extends Component {
    state={
        center: [34.359593, -106.906871],
        geocode_str: 'Socorro, NM'
        // active_location: {lat: 34.1054432, lng: -106.8414374}
    }
    componentDidMount() {
        let features = pwsboundaries.default.features

        this.setState({'pwsboundaries': features.filter(f=>{
            return f['geometry']['type']!='Point'
        }),
        'pwspoints': features.filter(f=>{
            return f['geometry']['type']==='Point'
        })})
    }
    clickToFeature(e){
        let feature = e.target.feature
        console.log(feature)

        this.setState({'pws': feature,
            'pwsproperties': makePWSProperties(feature['properties'])}
        )
    }
    onEachFeature(feature, layer){
        layer.on({click: this.clickToFeature.bind(this)})
    }
    onPointClick(e){
        this.setState({'pwspointproperties': makePWSProperties(e.target.options.properties.properties)})
        // console.log(makePWSProperties(e.target.options.properties.properties))
    }

    handleGeocodeStr(e){
        this.setState({'geocode_str': e.target.value})
    }
    handleGeocodeFilter(e){
        console.log('filter', this.state['geocode_str'])
        Geocode.fromAddress(this.state['geocode_str']).then(resp=>{
             const location = resp.results[0].geometry.location;

             // determine pws boundary
             let pws = this.state.pwsboundaries.filter(pws=>{
                     return inside(location, pws.geometry.coordinates[0][0])
             })
             console.log(pws)

             this.setState({active_location: resp.results[0].geometry.location,
                                  pwsproperties: pws ? makePWSProperties(pws[0].properties): null
             })

        })
    }


    render() {
        const columns = [{'label': 'Key', 'key': 'key'},
                        {'label': 'Value', 'key': 'value'},
                        ]

        const al = this.state['active_location']
        return (<div>
                    <div style={{padding: '20px'}}>
                        <input id="standard-basic"
                               value={this.state.geocode_str}
                        onChange={this.handleGeocodeStr.bind(this)}
                        style={{width: '300px'}}/>
                         <button onClick={this.handleGeocodeFilter.bind(this)}>Filter</button>
                    </div>
                    <div className='hcontainer'  style={{height: '800px'}}>
                        <div className='divL'>
                            <Map center={this.state.center}
                                     zoom={7}
                                     minZoom={4}
                                     maxZoom={20}
                                  style={{height: '100%'}}
                                >
                                <LayersControl position="topright">
                                    <BaseLayer name='OpenStreetMap'>
                                        <TileLayer
                                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                                    </BaseLayer>
                                    <BaseLayer name='OpenTopoMap'>
                                        <TileLayer
                                            attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                                            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"/>
                                    </BaseLayer>
                                    <BaseLayer name='Esri.WorldImagery'>
                                        <TileLayer
                                            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'"/>
                                    </BaseLayer>
                                    <BaseLayer name='Esri.WorldStreetMap'>
                                        <TileLayer
                                            url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
                                            attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'/>
                                    </BaseLayer>
                                    <BaseLayer name='Esri.WorldShadedRelief'>
                                        <TileLayer
                                            url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}'
                                            attribution='Tiles &copy; Esri &mdash; Source: Esri'
                                            maxZoom= {13}/>
                                    </BaseLayer>
                                    <BaseLayer checked name='Stamen.Terrain'>
                                        <TileLayer
                                            url='https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}'
                                            attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            subdomains='abcd'
                                            minZoom= {0}
                                            maxZoom= {18}
                                            ext='png'/>
                                    </BaseLayer>

                                    <Overlay name={'Boundaries'} checked={true}>
                                        <GeoJSON data={this.state['pwsboundaries']}
                                                 onEachFeature={this.onEachFeature.bind(this)}/>
                                    </Overlay>

                                    <Overlay name={'Points'} checked={true}>
                                        <LayerGroup>
                                        {this.state['pwspoints'] ? this.state['pwspoints'].map(l=>(
                                            <CircleMarker
                                                radius={5}
                                                color={'red'}
                                                onClick={this.onPointClick.bind(this)}
                                                center={[l.geometry.coordinates[1], l.geometry.coordinates[0]]}
                                                properties={l}/>
                                        )):null}
                                        </LayerGroup>
                                        {/*<LayerGroup>*/}

                                        {/*</LayerGroup>*/}
                                    </Overlay>

                                </LayersControl>
                                {this.state['active_location']? <CircleMarker
                                            radius={10}
                                            color={'yellow'}
                                            center={[al['lat'], al['lng']]}/> : null}

                            </Map>
                        </div>
                        <div className='divR'>
                            <h3>Boundary Metadata</h3>
                            <SimpleTable
                                columns = {columns}
                                items={this.state['pwsproperties']?this.state['pwsproperties']: []}
                                />
                        </div>
                        <div className='divR'>
                            <h3>Point Metadata</h3>
                            <SimpleTable
                                columns = {columns}
                                items={this.state['pwspointproperties']?this.state['pwspointproperties']: []}
                                />
                        </div>
                </div>
        </div>
        )
    }
}

export default PWSMap