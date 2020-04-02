import React, {Component} from "react";
import SelectableTable from './tables/selectable_table'



class ThingsTable extends Component {

    render() {

        const columns = [{'label': 'ID', 'key': 'id'},
            {'label': 'Name', 'key': 'name'},
        ]
        return (<div><SelectableTable
            columns = {columns}
            items={this.props.things}
            onSelect={this.props.onSelect}
        /></div>)
    }

}

export default ThingsTable;