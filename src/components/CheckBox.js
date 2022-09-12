function CheckBox(props){

	let className = "check-box";
    className += props.isHidden ? " hidden" : "";
	className += props.viewDetails ? "" : " full-width";

	let checkboxes = [];

	for(let key in props.prefState.columns){

		checkboxes.push(
		   <input
		    key={props.prefState.columns[key].name +"-checkbox"}
			type="checkbox"
			checked = {props.prefState.columns[key].status}
			onChange={(e) => props.onCheckClick(key,e.target.checked)}

		  />)
		  checkboxes.push(
			<label key={props.prefState.columns[key].name +"-label"}> {props.prefState.columns[key].name}</label>
		  )

			checkboxes.push(
				<br key={props.prefState.columns[key].name +"-break"}></br>
		  )}

	return (
		<div className={className}>
			<ul className="checkbox">
				<li>{checkboxes}</li>
			</ul>
		</div>
);}

export default CheckBox;
