export const baseUrl = 'http://coda-rest.dyn.fa.disney.com/';
export const nfsBaseURL = 'http://coda-rest-nfs-dev.dyn.fa.disney.com/';
export const elasticsearchURL = 'https://wdas-elastic.fas.fa.disney.com:9200/coda_6';

class ElasticSearchService {
  static getDgraphs(query, from, size, hidden, devMode = false) {
    let headers = new Headers();
    if (devMode === false) {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchQuery = (hidden ? '' : '!clienthide:1 ') + (query ? ('_exists_:did !_exists_:aid ' + query) : '_exists_:did !_exists_:aid');
    let searchUrl = elasticsearchURL + '/_search?default_operator=AND&sort=did:desc&from=' + from + '&size=' + size + '&q=' + encodeURIComponent(searchQuery);
    return fetch(searchUrl, { headers: headers })
      .then(res => res.json());
  }

  static getDgraph(dgraphId, devMode = false) {
    let headers = new Headers();
    if (devMode === false) {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = baseUrl + 'noauth/' + dgraphId + '?metadataValue=true';
    return fetch(searchUrl, { headers: headers })
      .then(res => res.json());
  }

  static getArrays(did, devMode = false) {
    let headers = new Headers();
    if (devMode === false) {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchQuery = '_exists_:aid !_exists_:tid did:' + did;
    let searchUrl = elasticsearchURL + '/_search?default_operator=AND&sort=aid:asc&q=' + encodeURIComponent(searchQuery);
    return fetch(searchUrl, { headers: headers })
      .then(res => res.json());
  }

  static getArray(dgraphId, arrayId, devMode = false) {
    let headers = new Headers();
    if (devMode === false) {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = baseUrl + 'noauth/' + dgraphId + '/' + arrayId + '?metadataValue=true';
    return fetch(searchUrl, { headers: headers })
      .then(res => res.json());
  }

  static getTasks(did, aid, devMode = false) {
    let headers = new Headers();
    if (devMode === false) {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchQuery = '_exists_:tid did:' + did + ' aid: ' + aid;
    let searchUrl = elasticsearchURL + '/_search?default_operator=AND&sort=tid:asc&q=' + encodeURIComponent(searchQuery);
    return fetch(searchUrl, { headers: headers })
      .then(res => res.json());
  }

  static getTask(dgraphId, arrayId, taskId, devMode = false) {
    let headers = new Headers();
    if (devMode === false) {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = baseUrl + 'noauth/' + dgraphId + '/' + arrayId + '/' + taskId + '?metadataValue=true';
    return fetch(searchUrl, { headers: headers })
      .then(res => res.json());
  }

  static setDgraphMeta(did, key, value, errorCallback, devMode = false) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (devMode === false) {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = baseUrl + 'noauth/actions/setMeta/dgraph.' + did + '.' + key;
    return fetch(searchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(value),
    }).then(res => res);
  };

  static setArrayMeta(did, aid, key, value, devMode = false) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (devMode === false) {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = baseUrl + 'noauth/actions/setMeta/array.' + did + '.' + aid + '.' + key;
    return fetch(searchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(value),
    }).then(res => res);
  };

  static setTaskMeta(did, aid, tid, key, value, devMode = false) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (devMode === false) {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = baseUrl + 'noauth/actions/setMeta/task.' + did + '.' + aid + '.' + tid + '.' + key;
    return fetch(searchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(value),
    }).then(res => {
      let body = res.json();
      return body.data || {};
    });
  };

  static getPoolData(devMode = false) {
    let headers = new Headers();
    if (devMode === false) {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = baseUrl + 'noauth/getMeta/stats.cpupools?usecache=True&expire=30';
    return fetch(searchUrl, { headers: headers })
      .then(res => res.json());
  };

  static getLogHtml(dgraphId, arrayId, taskId, devMode = false) {
    let headers = new Headers();
    if (devMode === false) {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = nfsBaseURL + 'logJSON/' + dgraphId + '/' + arrayId + '/' + taskId + '/' + 1024000;
    return fetch(searchUrl, { headers: headers })
      .then(res => res.json());
  }

  static networkCheck(devMode = false) {
    let headers = new Headers();
    if (devMode === false) {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = baseUrl + 'noauth/health_rest';
    return fetch(searchUrl, { headers: headers })
      .then(res => {
        let body = res.json();
        return body.data || {};
      });
  }

  // Query the coda-rest-nfs service to get a baked rvspec for our list of
  // ids.
  static getRVSpec(idList, externalIP, devMode = false) {
    let headers = new Headers();
    if (devMode === false) {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    console.log("[DEBUG] In getRVSpec()")
    console.log("[DEBUG] - idList=" + idList.join(","))
    let searchUrl = nfsBaseURL + 'rvspec/?ids=' + idList.join(",");
    if (!externalIP) {
      return fetch(searchUrl, { headers: headers })
        .then(res => res.json());
    }
  }

  static playImages(dgraphId, arrayId = 0, taskId = 0, devMode = false) {
    // return new Promise((resolve, reject) => { resolve([]) });
    let headers = new Headers();
    if (devMode === false) {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = '';
    console.log("[DEBUG] In playImages()")
    if (taskId) {
      console.log("[DEBUG] - dgraphId=" + dgraphId)
      console.log("[DEBUG] - arrayId=" + arrayId)
      console.log("[DEBUG] - taskId=" + taskId)
      searchUrl = nfsBaseURL + 'imagepaths/' + dgraphId + '/' + arrayId + '/' + taskId;
      return fetch(searchUrl, { headers: headers })
        .then(res => {
          let body = res.json();
          return body.data || {};
        })
    }
    else if (arrayId) {
      console.log("[DEBUG] - dgraphId=" + dgraphId)
      console.log("[DEBUG] - arrayId=" + arrayId)
      searchUrl = nfsBaseURL + 'imagepaths/' + dgraphId + '/' + arrayId;
      return fetch(searchUrl, { headers: headers })
        .then(res => {
          let body = res.json();
          return body.data || {};
        })
    }
    console.log("[DEBUG] - dgraphId=" + dgraphId)
    searchUrl = nfsBaseURL + 'imagepaths/' + dgraphId;
    return fetch(searchUrl, { headers: headers })
      .then(res => {
        let body = res.json();
        return body.data || {};
      })
  }

  static requeueAll(dgraphId, arrayId = null, taskId = null, devMode = false) {
    let jobId = "" + dgraphId;
    if (arrayId) {
      jobId = jobId + "." + arrayId;
    }
    if (taskId) {
      jobId = jobId + "." + taskId;
    }
    console.log("requeueAll(" + jobId + ")");
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (devMode === false) {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = baseUrl + 'noauth/actions/requeueAll/' + jobId;
    return fetch(searchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(""),
    }).then(res => res);
  }

  static requeueRun(dgraphId, arrayId = null, taskId = null, devMode = false) {
    let jobId = "" + dgraphId;
    if (arrayId) {
      jobId = jobId + "." + arrayId;
    }
    if (taskId) {
      jobId = jobId + "." + taskId;
    }
    console.log("requeueRun(" + jobId + ")");
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (devMode === false) {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = baseUrl + 'noauth/actions/requeueRun/' + jobId;
    return fetch(searchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(""),
    }).then(res => res);
  }

  static requeueExit(dgraphId, arrayId = null, taskId = null, devMode = false) {
    let jobId = "" + dgraphId;
    if (arrayId) {
      jobId = jobId + "." + arrayId;
    }
    if (taskId) {
      jobId = jobId + "." + taskId;
    }
    console.log("requeueExit(" + jobId + ")");
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (devMode === false) {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = baseUrl + 'noauth/actions/requeueExit/' + jobId;
    return fetch(searchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(""),
    }).then(res => res);
  }

  static kill(dgraphId, arrayId = null, taskId = null, devMode = false) {
    let jobId = "" + dgraphId;
    if (arrayId) {
      jobId = jobId + "." + arrayId;
    }
    if (taskId) {
      jobId = jobId + "." + taskId;
    }
    console.log("kill(" + jobId + ")");
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (devMode === false) {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = baseUrl + 'noauth/actions/kill/' + jobId;
    return fetch(searchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(""),
    }).then(res => res);
  }

  static killToDone(dgraphId, arrayId = null, taskId = null, devMode = false) {
    let jobId = "" + dgraphId;
    if (arrayId) {
      jobId = jobId + "." + arrayId;
    }
    if (taskId) {
      jobId = jobId + "." + taskId;
    }
    console.log("killToDone(" + jobId + ")");
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (devMode === false) {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = baseUrl + 'noauth/actions/killToDone/' + jobId;
    return fetch(searchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(""),
    }).then(res => res);
  }

  static requeueLocal(hostname, isexclusive, dgraphId, arrayId = null, taskId = null, devMode = false) {
    let token = { hostlist: hostname, exclusive: isexclusive };
    let jobId = "" + dgraphId;
    if (arrayId) {
      jobId = jobId + "." + arrayId;
    }
    if (taskId) {
      jobId = jobId + "." + taskId;
    }
    console.log("requeueLocal(" + jobId + ") on " + hostname + " exclusive: " + isexclusive);
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (devMode === false) {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = baseUrl + 'noauth/actions/requeueLocal/' + jobId;
    return fetch(searchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(token),
    }).then(res => res);
  }

  static breakDgraphDependencies(dgraphId, devMode = false) {
    let depExpRequest = this.setDgraphMeta(dgraphId, "depexp", "true", devMode);
    let dgraphDepExpRequest = this.setDgraphMeta(dgraphId, "dgraphdepexp", "true", devMode);
    let arrayDepExpRequest = this.setDgraphMeta(dgraphId, "arraydepexp", "true", devMode);
    let taskDepExpRequest = this.setDgraphMeta(dgraphId, "taskdepexp", "true", devMode);
    return Promise.all([depExpRequest, dgraphDepExpRequest, arrayDepExpRequest, taskDepExpRequest]);
  }

  static breakArrayDependencies(dgraphId, arrayId, devMode = false) {
    let depExpRequest = this.setArrayMeta(dgraphId, arrayId, "depexp", "true", devMode);
    let dgraphDepExpRequest = this.setArrayMeta(dgraphId, arrayId, "dgraphdepexp", "true", devMode);
    let arrayDepExpRequest = this.setArrayMeta(dgraphId, arrayId, "arraydepexp", "true", devMode);
    let taskDepExpRequest = this.setArrayMeta(dgraphId, arrayId, "taskdepexp", "true", devMode);
    return Promise.all([depExpRequest, dgraphDepExpRequest, arrayDepExpRequest, taskDepExpRequest]);
  }

  static breakTaskDependencies(dgraphId, arrayId, taskId, devMode = false) {
    let depExpRequest = this.setTaskMeta(dgraphId, arrayId, taskId, "depexp", "true", devMode);
    let dgraphDepExpRequest = this.setTaskMeta(dgraphId, arrayId, taskId, "dgraphdepexp", "true", devMode);
    let arrayDepExpRequest = this.setTaskMeta(dgraphId, arrayId, taskId, "arraydepexp", "true", devMode);
    let taskDepExpRequest = this.setTaskMeta(dgraphId, arrayId, taskId, "taskdepexp", "true", devMode);
    return Promise.all([depExpRequest, dgraphDepExpRequest, arrayDepExpRequest, taskDepExpRequest]);
  }
}

export default ElasticSearchService;
