function LinkButton(props) {
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
      }}
    >
      <span className="material-icons">{props.icon}</span>
    </a>
  )
}

function Button(props) {
  return (
    <button
      id={props.id}
      onClick={props.onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
      }}
    >
      <span className="material-icons">{props.icon}</span>
      {props.text}
    </button>
  )
}

function HeaderButtons(props) {
  return(
    <div className="header-buttons">
      <Button icon="view_column" text="Column" onClick={props.toggleCheck}/>
      <LinkButton href="https://coda.disneyanimation.com/api/noauth/status" icon="stacked_bar_chart" />
      <LinkButton href="https://techweb.disneyanimation.com/docs/DOC-33061" icon="question_mark" />
      <Button icon="vertical_split" text="Details" onClick={props.toggleDetails} />
      <Button icon="horizontal_split" text="Log" id="logPaneButton" onClick={props.toggleLog} />
    </div>
  )
}

export default HeaderButtons;
