import React, {Component} from 'react'
import SimpleTable from "./tables/simple_table";

class LocationsTable extends Component{
    constructor(props){
        super(props);
    }

    render() {

        const columns = [{'label': 'ID', 'key': 'id'},
                        {'label': 'Name', 'key': 'name'},
                        // {'label': 'Description', 'key': 'description'},
                        {'label':'Lat', 'key': 'lat'},
                        {'label':'Lon', 'key': 'lon'}]
        return (
            <div>
                <SimpleTable
                    columns = {columns}
                    items={this.props.locations}
                />
            </div>
        )
    }
}

export default LocationsTable
