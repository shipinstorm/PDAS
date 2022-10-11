export const submitTime = (dateString) => {
  if (!dateString) return "";

  let date = new Date(dateString+"Z");
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  let hours = date.getHours();
  let minutes = date.getMinutes();
  minutes = minutes < 10 ? "0"+minutes : minutes;
  if (hours > 12){
    return (hours-12)+":"+minutes+" pm";
  } else {
    return hours+":"+minutes+" am";
  }
}