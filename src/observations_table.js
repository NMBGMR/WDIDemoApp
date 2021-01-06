import React, {Component}  from 'react'
import Paper from "@material-ui/core/Paper/Paper";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import TableBody from "@material-ui/core/TableBody";
import TableContainer from "@material-ui/core/TableContainer";
import useStyles from "./styles";
import TablePagination from "@material-ui/core/TablePagination";



function ObservationsTable(props){
    const data = props.items ? props.items : []
    const classes = useStyles();
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

    const dense = {height: '10px', padding: '5px'}

    const exportCSV = (event)=>{
        var csv = 'phenomenonTime,Result\n';
        data.forEach(function(row) {
            csv += row.phenomenonTime+','+row.result+'\n'});

        console.log(csv);
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = props.observationsExportPath + '.csv';
        hiddenElement.click();
    }

    const formatResult = (r)=>{
        let f
        if (r instanceof Number){
            f=r.toFixed(2)
        }else{
            f = r
        }

        return f
    }
    return (
        <div>
            <button onClick={exportCSV} >Export CSV</button>

            <TableContainer component={Paper}>
                <Table className={classes.table}  aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                            <TableCell style={dense}>Time</TableCell>
                            <TableCell style={dense}>Result</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((r, index) => {
                                return (
                                    <TableRow
                                        key={index}
                                        hover>
                                        <TableCell style={dense}>{r.phenomenonTime}</TableCell>
                                        <TableCell style={dense}>{formatResult(r.result)}</TableCell>
                                    </TableRow>
                                )})
                        }
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </TableContainer>
        </div>
        )}



export default ObservationsTable