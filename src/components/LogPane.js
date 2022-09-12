function LogPane(props) {
  let className = "log-pane";
  className += props.isHidden ? " hidden" : "";
  className += props.viewDetails ? "" : " full-width";

  return (
    <div className={className}>
      Select a task to view log file
    </div>
  )
}

export default LogPane;