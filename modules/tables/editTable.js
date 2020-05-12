import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, } from '@material-ui/core';

const EditTable = ({rows, header, addRow, importInputs}) => (
    <TableContainer>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            {header.map((title,i) => (
                <TableCell key={i+'head'} align={i==0?"left":"right"}>{title}</TableCell>    
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
            <TableRow>
                {importInputs.map((input,i) => (
                    <TableCell key={i+'input'} align={i==0?"left":"right"}>
                        {input}
                    </TableCell>    
                ))}
            </TableRow>
            {rows.map((row,i) => (
                <TableRow key={i}>
                {row.map((cell,i) => (
                    <TableCell key={i} component={i==0?"th":null} scope={i==0?"row":null} align={i==0?"left":"right"}><div>{cell}</div></TableCell>
                    ))}
                </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
);
export default EditTable