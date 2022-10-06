import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

export default function TaskTableRow({
  searchTaskData,
  arrayRow,
  childArrayText,
  columnOrder,
  setJobSelected
}) {
  return (
    searchTaskData[arrayRow.aid].map((taskRow) => {
      const childTaskText = `${childArrayText}.${taskRow.aid}`;
      const tmpArray2 = [
        { name: '' },
        { name: childTaskText },
        { name: taskRow.title },
        { name: taskRow._statusname },
        { name: taskRow._exechost ? taskRow._exechost : '' + '(' + taskRow._granted?.cpus + ')' },
        { name: '' },
        { name: '' + taskRow._memused + '/' + taskRow._granted?.memory },
        { name: '' },
      ]
      return (
        <TableRow
          key={childTaskText}
          style={{cursor: 'pointer'}}
          onClick={() => {
            setJobSelected(childTaskText);
          }}
        >
          <TableCell padding="checkbox" />
          {[...Array(8)].map((value, index) => {
            return (
              <TableCell key={index}>{tmpArray2[columnOrder[index]].name}</TableCell>
            )
          })}
        </TableRow>
      )
    })
  )
}