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

export const elapsedTime = (graphData, arrayData, taskData) => {
  if (!graphData) return '';
  
  let status = '';
  if (graphData._statusname){
    if (taskData.tid != undefined){
      status = taskData._statusname;
    } else if (arrayData.aid != undefined){
      status = arrayData._statusname;
    } else {
      status = graphData._statusname;
    }
  }

  if (!(graphData._firsttaskstart || taskData._starttime) || !status || status == "dependent" || status == "in-queue") {
    return "";
  }

  let startTime = typeof graphData._firsttaskstart == "number" ? new Date(graphData._firsttaskstart*1000) : new Date(graphData._firsttaskstart);
  if (taskData._starttime){
      startTime = typeof taskData._starttime == "number" ? new Date(taskData._starttime*1000) : new Date(taskData._starttime);
  }
  let elapsedTime;
  if (status == "done" || status == "paused" || status == "killed" || status == "exited" || status == "killed-wait" || status == "exit-wait"){
    let endTime = typeof graphData._lasttaskend == "number" ? new Date(graphData._lasttaskend*1000) : new Date(graphData._lasttaskend);
    if (taskData._endtime){
      endTime = typeof taskData._endtime == "number" ? new Date(taskData._endtime*1000) : new Date(taskData._endtime);
    }
    elapsedTime = endTime - startTime;
  } else {
    let now = new Date();
    now.setMinutes(now.getMinutes() + now.getTimezoneOffset());
    elapsedTime = now - startTime;
  }
  return timeString(elapsedTime);
}

export const timeString = (num) => {
  let hours = Math.floor(num / 3600000);
  let minutes = Math.floor(num / 60000) - hours * 60;
  if (hours == 0 && minutes == 0) {
    return "< 1m";
  }
  if (hours == 0) {
    return minutes + "m";
  }
  return hours + "h " + minutes + "m";
}