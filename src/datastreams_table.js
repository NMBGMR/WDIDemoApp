import React, {Component} from "react";
import SelectableTable from './tables/selectable_table';



class DatastreamsTable extends Component{
    constructor(props){
        super(props);
    }

    render() {

        const columns = [{'label': 'ID', 'key': 'id'},
            {'label': 'Name', 'key': 'name'},
            {'label': 'Units', 'key': 'unit'}]
        return (
            <div>
                <SelectableTable
                    columns = {columns}
                    items={this.props.datastreams}
                    onSelect={this.props.onSelect}
                />
            </div>
        )
    }
}

export default DatastreamsTable
