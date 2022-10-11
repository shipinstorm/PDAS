import { useState } from "react";
import { useDispatch } from 'react-redux';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';

import { jobRowsSelected } from '../../store/actions/jobAction';

import TaskTableRow from "./TaskTableRow";

const ExpandableTableRow = ({ children, expandComponent, isSelected, ...otherProps }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <TableRow {...otherProps}>
        <TableCell
          padding="checkbox"
          sx={isSelected ?
          {
            background: '#383838 !important',
            '& .MuiButtonBase-root': {
              color: '#848285 !important',
            },
          } : 
          {
            '& .MuiButtonBase-root': {
              color: '#848285 !important',
            }
          }}
        >
          <IconButton
            onClick={(event) => {
              event.preventDefault();
              setIsExpanded(!isExpanded);
            }}
          >
          {isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
          </IconButton>
        </TableCell>
        {children}
      </TableRow>
      {isExpanded && expandComponent}
    </>
  );
};

export default function ArrayTableRow({
  searchArrayData,
  searchTaskData,
  did,
  columnOrder,
  jobSelected,
  setJobSelected
}) {
  const dispatch = useDispatch();

  return (
    searchArrayData.map((arrayRow)=> {
      const childArrayText = `${did}.${arrayRow.aid}`;
      const isSelected = (jobSelected === childArrayText);
      const tmpArray1 = [
        { name: '' },
        { name: childArrayText },
        { name: '' },
        { name: '' },
        { name: '' },
        { name: '' },
        { name: '' },
        { name: '' },
      ]
      return (
        <ExpandableTableRow
          key={childArrayText}
          expandComponent={
            <TaskTableRow
              searchTaskData={searchTaskData}
              arrayRow={arrayRow}
              childArrayText={childArrayText}
              columnOrder={columnOrder}
              jobSelected={jobSelected}
              setJobSelected={setJobSelected}
            />
          }
          sx={{ cursor: 'pointer' }}
          onClick={() => {
            /**
             * Remove select of graph data when array is selected
             */
            dispatch(jobRowsSelected([]));
            setJobSelected(childArrayText);
          }}
          isSelected={isSelected}
        >
          {[...Array(8)].map((value, index) => {
            return (
              <TableCell
                key={index}
                sx={isSelected ?
                { background: '#383838 !important' } :
                { background: '#282828 !important' }}
              >
                {tmpArray1[columnOrder[index]].name}
              </TableCell>
            )
          })}
        </ExpandableTableRow>
      );
    })
  )
}