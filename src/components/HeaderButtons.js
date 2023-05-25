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
      className={ props.toggled ? "toggled" : "" }
    >
      <span className="material-icons">{props.icon}</span>
      {props.text}
    </button>
  )
}

function HeaderButtons(props) {
  return(
    <div className="header-buttons">
      <LinkButton href="https://coda.disneyanimation.com/api/noauth/status" icon="troubleshoot" />
      <LinkButton href="https://techweb.disneyanimation.com/docs/DOC-33061" icon="question_mark" />
      <Button icon="info" text="Details" onClick={props.toggleDetails} toggled={props.viewDetails} />
      <Button icon="text_snippet" text="Log" id="logPaneButton" onClick={props.toggleLog} toggled={props.viewLog} />
    </div>
  )
}

export default HeaderButtons;
