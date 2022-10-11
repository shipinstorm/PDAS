import { useSelector } from "react-redux";

function DetailsPane({
  isHidden,
  jobSelected
}) {
  let className = "details-pane";
  className += isHidden ? " hidden" : "";
  
  const graphData = useSelector((state) => state.global.graphData);
	const arrayData = useSelector((state) => state.global.arrayData);
	const taskData = useSelector((state) => state.global.taskData);
  const jobIDs = jobSelected.split('.');
  const graphID = jobIDs[0];
  const arrayID = jobIDs[1];
  const taskID = jobIDs[2];

  // console.log(graphData);
  // console.log(arrayData[graphID][0]);
  // console.log(taskData[graphID][arrayID]);

  return (
    <div className={className}>
      Select job to view details<br />
      <p>Job ID: <span>{jobSelected}</span></p>
      <p>sleep 100</p>
      <p>gwhitted</p>
      <p>5:44 pm</p>
      <p>Frames</p>
      <p>No available frames</p>
      <p>Status</p>
      <p>Memory (MB)</p>
      <p>Elapsed Time</p>
      <p>Priority</p>
      <p>Show All Metadata</p>
    </div>
  )
}

export default DetailsPane;
