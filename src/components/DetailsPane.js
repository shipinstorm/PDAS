function DetailsPane(props) {
    let className = "details-pane";
    className += props.isHidden ? " hidden" : "";

    return (
        <div className={className}>
            Select job to view details
        </div>
    )
}

export default DetailsPane;
