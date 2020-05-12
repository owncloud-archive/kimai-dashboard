import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, } from '@material-ui/core';


const DynamicTable = ({rows, header, tableId, addRow}) => (
    <TableContainer>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            {header.map((title,i) => (
                <TableCell key={i+'head'+tableId} align={i==0?"left":"right"}>{title}</TableCell>    
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row,i) => (
            <TableRow key={i+tableId}>
              {row.map((cell,i) => (
                    <TableCell key={i} component={i==0?"th":null} scope={i==0?"row":null} align={i==0?"left":"right"}><div>{cell}</div></TableCell>
                ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
);
export default DynamicTable