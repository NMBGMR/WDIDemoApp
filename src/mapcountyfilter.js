import React, {Component} from 'react'
import axios from 'axios';
import SelectableTable from "./tables/selectable_table";

class MapCountyFilter extends Component {
    constructor(props) {
        super(props);
        this.state = {counties: null}

    }
    componentDidMount() {
        axios.get('https://info.geoconnex.us/collections/counties/items?STATEFP=35&f=json').then(success=>{
            var counties = success.data.features.map(f=>(
                {name: f.properties['NAME'],
                    id: f.properties['NAME'],
                    link: <a href={f.id} target='_blank'>{f.properties['NAME']}</a>,
                    isSelected: false,
                    value: f}
            ))
            function compare(a, b) {
                  // Use toUpperCase() to ignore character casing
                  const bandA = a.name.toUpperCase();
                  const bandB = b.name.toUpperCase();

                  let comparison = 0;
                  if (bandA > bandB) {
                    comparison = 1;
                  } else if (bandA < bandB) {
                    comparison = -1;
                  }
                  return comparison;
                }
            counties.sort(compare)
            // console.log(counties)
            this.setState({counties: counties})
        })
    }

    onSelect =e=>{
        var county = this.state['counties'].find(f=>{
            return f.name===e.row['name']})
        county.isSelected = e.isSelected
        var selected = this.state['counties']
            .filter(f=>(f.isSelected))
            .map(f=>(f.value))
        selected.forEach(c=>{delete c.id})
        this.props.handleCountyChange({'type': 'FeatureCollection', 'features': selected})
    }

    render() {

        const columns = [{'label': 'County', 'key': 'link'},
                         // {'label': 'Link', 'key': 'link'}
                         ]

        return <div className={'subgroup'}>
            <SelectableTable
                columns = {columns}
                items = {this.state['counties']}
                onSelect = {this.onSelect}
            />

            {/*<label>County  </label>*/}
            {/*<select onChange={this.handleCountyChange}>*/}
            {/*    {this.state.counties ? this.state.counties.map(c=>(*/}
            {/*        <option key={c.name} value={c.name}>{c.name}</option>*/}
            {/*    )): null}*/}
            {/*</select>*/}
        </div>
    }
}

export default MapCountyFilter
