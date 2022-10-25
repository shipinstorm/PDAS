export default function StatusBar({
  statuses
}) {
  return (
    <>
    {
      statuses.map((status) => {
        return (
          <div
            class={"percentage-" + status.statusClass}
            // [style.width.%]="status.percent"
          >
            &nbsp;
          </div>
        )
      })
    }
    </>
  )
}