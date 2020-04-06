import React  from 'react'
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

        return (
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
                                        <TableCell style={dense}>{r.result.toFixed(2)}</TableCell>
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

        )
}
export default ObservationsTable