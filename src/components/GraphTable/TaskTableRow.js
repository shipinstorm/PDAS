import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

export default function TaskTableRow({
  searchTaskData,
  arrayRow,
  childArrayText,
  columnOrder,
  jobSelected,
  setJobSelected
}) {
  return (
    searchTaskData[arrayRow.aid].map((taskRow) => {
      const childTaskText = `${childArrayText}.${taskRow.aid}`;
      const isSelected = (jobSelected === childTaskText);
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
          <TableCell
            padding="checkbox"
            sx={isSelected ?
            { background: '#383838 !important' } :
            { background: '#282828 !important' }}
          />
          {[...Array(8)].map((value, index) => {
            return (
              <TableCell
                key={index}
                sx={isSelected ?
                { background: '#383838 !important' } :
                { background: '#282828 !important' }}
              >
                {tmpArray2[columnOrder[index]].name}
              </TableCell>
            )
          })}
        </TableRow>
      )
    })
  )
}