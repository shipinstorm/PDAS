import { useDispatch, useSelector } from 'react-redux';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import ElasticSearchService from '../../services/ElasticSearch.service';

import { globalImagePaths, globalViewLog } from '../../store/actions/globalAction';
import { jobJobSelected, jobRowsSelected } from '../../store/actions/jobAction';

export default function TaskTableRow({
  searchTaskData,
  arrayRow,
  childArrayText,
  columnOrder
}) {
  const dispatch = useDispatch();
  const imagePaths = useSelector((state) => state.global.imagePaths);
  const jobSelected = useSelector((state) => state.job.jobSelected);

  return (
    searchTaskData[arrayRow.aid].map((taskRow) => {
      const childTaskText = `${childArrayText}.${taskRow.aid}`;
      const isSelected = (jobSelected === childTaskText);
      const tmpArray2 = [
        { name: '' },
        { name: childTaskText },
        { name: taskRow.title },
        { name: taskRow._statusname },
        { name: '' },
        { name: '' },
        { name: '' },
        { name: '' },
        { name: taskRow._exechost ? taskRow._exechost : '(' + taskRow._granted?.cpus + ')' },
        { name: '' },
        { name: '' + taskRow._memused + '/' + taskRow._granted?.memory },
        { name: 'View Log' },
      ]
      return (
        <TableRow
          key={childTaskText}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            // Remove select of graph data when task is selected
            dispatch(jobRowsSelected([]));
            dispatch(jobJobSelected(childTaskText));
            let jobID = childTaskText.toString().split('.');
            imagePaths[jobID[0] + '.' + jobID[1] + '.' + jobID[2]] = ElasticSearchService.playImages(jobID[0], jobID[1], jobID[2]);
            dispatch(globalImagePaths(imagePaths));
          }}
        >
          <TableCell
            padding="checkbox"
            sx={isSelected ?
              { background: '#383838 !important' } :
              { background: '#282828 !important' }}
          />
          {[...Array(12)].map((value, index) => {
            return (
              <TableCell
                key={index}
                sx={isSelected ?
                  { background: '#383838 !important' } :
                  { background: '#282828 !important' }}
              >
                {tmpArray2[columnOrder[index]].name === "View Log" ?
                  <p
                    onClick={() => {
                      dispatch(globalViewLog(true));
                    }}
                    className="btn btn-link btn-xs"
                  >
                    {tmpArray2[columnOrder[index]].name}
                  </p> :
                  tmpArray2[columnOrder[index]].name}
              </TableCell>
            )
          })}
        </TableRow>
      )
    })
  )
}