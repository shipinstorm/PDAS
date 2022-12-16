export const submittedTime = (dateString) => {
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
  if (graphData._statusname) {
    if (taskData.tid !== undefined) {
      status = taskData._statusname;
    } else if (arrayData.aid !== undefined) {
      status = arrayData._statusname;
    } else {
      status = graphData._statusname;
    }
  }

  if (!(graphData._firsttaskstart || taskData._starttime) || !status || status === "dependent" || status === "in-queue") {
    return "";
  }

  let startTime = typeof graphData._firsttaskstart == "number" ? new Date(graphData._firsttaskstart*1000) : new Date(graphData._firsttaskstart);
  if (taskData._starttime){
      startTime = typeof taskData._starttime == "number" ? new Date(taskData._starttime*1000) : new Date(taskData._starttime);
  }
  let elapsedTime;
  if (status === "done" || status === "paused" || status === "killed" || status === "exited" || status === "killed-wait" || status === "exit-wait"){
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
  if (hours === 0 && minutes === 0) {
    return "< 1m";
  }
  if (hours === 0) {
    return minutes + "m";
  }
  return hours + "h " + minutes + "m";
}

export const generateSearchQueries = (newSearchQuery, filterQueryFlag) => {
  var now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

  let elasticSearchQuery = '(';
  let urlSearchQuery = '';
  let tmpFilterQueryFlag = {
    status: {},
    dept: {},
    type: {},
    display: {},
    show: "All Shows",
    after: filterQueryFlag.after ? filterQueryFlag.after : now.toISOString().slice(0,16)
  };

  let beforeHeader = '-1';
  const generateSubQuery = (header) => {
    if (beforeHeader !== header) {
      if (beforeHeader !== '-1') {
        elasticSearchQuery = elasticSearchQuery.slice(0, -4);
        elasticSearchQuery += ') AND '
      }
      elasticSearchQuery += '(';
      beforeHeader = header;
    }
  }

  newSearchQuery.map((query) => {
    // Generate urlSearchQuery
    if (query.header) {
      urlSearchQuery += query.header + ':' + query.title + ',';
    } else {
      urlSearchQuery += query.title + ',';
    }

    // Generate elasticSearchQuery
    if (query.header !== 'display') {
      generateSubQuery(query.header);
    }

    if (query.header === '') {
      elasticSearchQuery += 'icoda_username:' + query.title + ' OR title:' + query.title + ' OR did:' + query.title + ' OR ';
    } else if (query.header === 'user') {
      elasticSearchQuery += 'icoda_username:' + query.title + ' OR ';
    } else if (query.header === 'title') {
      elasticSearchQuery += 'title:' + query.title + ' OR ';
    } else if (query.header === 'status') {
      tmpFilterQueryFlag.status[query.title] = true;
      elasticSearchQuery += '_statusname:' + query.title + ' OR ';
    } else if (query.header === 'dept') {
      tmpFilterQueryFlag.dept[query.title] = true;
      elasticSearchQuery += 'title:*' + query.title + '* OR ';
    } else if (query.header === 'type') {
      tmpFilterQueryFlag.type[query.title] = true;
      elasticSearchQuery += 'title:*' + query.title + '* OR ';
    } else if (query.header === 'show') {
      tmpFilterQueryFlag.show = query.title;
      elasticSearchQuery += 'title:*' + query.title + '* OR ';
    } else if (query.header === 'display') {
      /**
       * https://wdas-elastic.fas.fa.disney.com:9200/coda_6/_search?q=%20!clienthide%3A1%20_exists_%3Adid%20!_exists_%3Aaid&size=200&from=0&sort=did%3Adesc&default_operator=AND
       * https://wdas-elastic.fas.fa.disney.com:9200/coda_6/_search?q=%20_exists_%3Adid%20!_exists_%3Aaid&size=200&from=0&sort=did%3Adesc&default_operator=AND
       */
       tmpFilterQueryFlag.display[query.title] = true;
    } else if (query.header === 'after') {
      tmpFilterQueryFlag.after = query.title;
      elasticSearchQuery += '_submittime:[' + query.title + ' TO *] OR ';
    }
  })

  if (elasticSearchQuery === '(') {
    elasticSearchQuery = '';
  } else {
    elasticSearchQuery = elasticSearchQuery.slice(0, -4) + '))';
  }

  urlSearchQuery = urlSearchQuery.slice(0, -1);

  return [urlSearchQuery, elasticSearchQuery, tmpFilterQueryFlag];
}

export const setStatusPercents = (tmpStatuses, tmpData, flag) => {
  let statuses = tmpStatuses;

  let total = 0;
  for (var status of statuses) {
    total += parseInt(tmpData[status.mapping]);
  }

  if (total > 0) {
    for (var status of statuses) {
      status.percent = (parseInt(tmpData[status.mapping]) / total) * 100;
      status.value = parseInt(tmpData[status.mapping]);
      if (status.percent > 0 && status.percent < 1) {
        status.percent = 1;
      } else {
        status.percent = Math.round(status.percent);
      }
    }
  }

  return statuses;
};