function DetailsPane(props) {
  let className = "details-pane";
  className += props.isHidden ? " hidden" : "";

  return (
    <div className={className}>
      Select job to view details<br />
      <p>Job ID: <span>{props.jobSelected}</span></p>
    </div>
  )
}

export default DetailsPane;
