export default function StatusBar({
  statuses
}) {
  return (
    <div className="status-bar">
    {
      statuses.map((status) => {
        return (
          <div
            className={"percentage-" + status.statusClass}
            style={{
              width: status.percent + "%"
            }}
          >
            &nbsp;
          </div>
        )
      })
    }
    </div>
  )
}