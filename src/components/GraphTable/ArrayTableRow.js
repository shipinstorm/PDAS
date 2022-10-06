import { useState } from "react";

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';

import TaskTableRow from "./TaskTableRow";

const ExpandableTableRow = ({ children, expandComponent, ...otherProps }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <TableRow {...otherProps}>
        <TableCell
          padding="checkbox"
          sx={{
            '& .MuiButtonBase-root': {
              color: '#848285 !important',
            },
          }}
        >
          <IconButton onClick={() => setIsExpanded(!isExpanded)}>
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
              setJobSelected={setJobSelected}
            />
          }
          sx={jobSelected ?
          {
            cursor: 'pointer',
            backgroundColor: 'red'
          } :
          {
            cursor: 'pointer'
          }}
          onClick={() => {
            setJobSelected(childArrayText);
          }}
        >
          {[...Array(8)].map((value, index) => {
            return (
              <TableCell
                key={index}
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