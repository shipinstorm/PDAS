class ElasticSearchService {
  devMode = process.env.REACT_APP_DEV_MODE;

  baseUrl = 'https://coda-rest.dyn.fa.disney.com/';
  nfsBaseURL = 'https://coda-rest-nfs.dyn.fa.disney.com/';
  elasticsearchURL = 'https://wdas-elastic.fas.fa.disney.com:9200/coda_6';
  userUrl = '/getUser.json';
  prismEventURL = "https://api.disneyanimation.com/prism/event";
  apollosearchURL = "https://api.disneyanimation.com/apollosearch/apollosearch/person";
  user = {};

  constructor() {
    if (this.devMode === "false") {
      this.baseUrl = '/api/';
      this.nfsBaseURL = '/api-nfs/';
      this.elasticsearchURL = window.location.protocol + '//' + window.location.host + '/elastic/coda_6';
      this.apollosearchURL = window.location.protocol + '//' + window.location.host + '/apollosearch/apollosearch/person';
      this.prismEventURL = "/prism/event";
      // this.userUrl = '/getUser.php';
    }
    this.getUser().then(userObj => this.user = userObj);
  }

  getUser() {
    let headers = new Headers();

    return fetch(this.userUrl, { headers: headers })
      .then(res => res.json());
  }

  getUserName() {
    return this.user['username'];
  }

  getDgraphs(query, from, size, hidden) {
    let headers = new Headers();
    if (this.devMode === "false") {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchQuery = (hidden ? '' : '!clienthide:1 ') + (query ? ('_exists_:did !_exists_:aid ' + query) : '_exists_:did !_exists_:aid');
    let searchUrl = this.elasticsearchURL + '/_search?default_operator=AND&sort=did:desc&from=' + from + '&size=' + size + '&q=' + encodeURIComponent(searchQuery);
    return fetch(searchUrl, { headers: headers })
      .then(res => res.json());
  }

  getDgraph(dgraphId) {
    let headers = new Headers();
    if (this.devMode === "false") {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = this.baseUrl + 'noauth/' + dgraphId + '?metadataValue=true';
    return fetch(searchUrl, { headers: headers })
      .then(res => res.json());
  }

  getArrays(did) {
    let headers = new Headers();
    if (this.devMode === "false") {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchQuery = '_exists_:aid !_exists_:tid did:' + did;
    let searchUrl = this.elasticsearchURL + '/_search?default_operator=AND&sort=aid:asc&q=' + encodeURIComponent(searchQuery);
    return fetch(searchUrl, { headers: headers })
      .then(res => res.json());
  }

  getArray(dgraphId, arrayId) {
    let headers = new Headers();
    if (this.devMode === "false") {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = this.baseUrl + 'noauth/' + dgraphId + '/' + arrayId + '?metadataValue=true';
    return fetch(searchUrl, { headers: headers })
      .then(res => res.json());
  }

  getTasks(did, aid) {
    let headers = new Headers();
    if (this.devMode === "false") {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchQuery = '_exists_:tid did:' + did + ' aid: ' + aid;
    let searchUrl = this.elasticsearchURL + '/_search?default_operator=AND&sort=tid:asc&q=' + encodeURIComponent(searchQuery);
    return fetch(searchUrl, { headers: headers })
      .then(res => res.json());
  }

  getTask(dgraphId, arrayId, taskId) {
    let headers = new Headers();
    if (this.devMode === "false") {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = this.baseUrl + 'noauth/' + dgraphId + '/' + arrayId + '/' + taskId + '?metadataValue=true';
    return fetch(searchUrl, { headers: headers })
      .then(res => res.json());
  }

  setDgraphMeta(did, key, value, errorCallback) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (this.devMode === "false") {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = this.baseUrl + 'noauth/actions/setMeta/dgraph.' + did + '.' + key;
    return fetch(searchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(value),
    }).then(res => res);
  };

  setArrayMeta(did, aid, key, value) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (this.devMode === "false") {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = this.baseUrl + 'noauth/actions/setMeta/array.' + did + '.' + aid + '.' + key;
    return fetch(searchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(value),
    }).then(res => res);
  };

  setTaskMeta(did, aid, tid, key, value) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (this.devMode === "false") {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = this.baseUrl + 'noauth/actions/setMeta/task.' + did + '.' + aid + '.' + tid + '.' + key;
    return fetch(searchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(value),
    }).then(res => {
      let body = res.json();
      return body.data || {};
    });
  };

  getPoolData() {
    let headers = new Headers();
    if (this.devMode === "false") {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = this.baseUrl + 'noauth/getMeta/stats.cpupools?usecache=True&expire=30';
    return fetch(searchUrl, { headers: headers })
      .then(res => res.json());
  };

  getBannerData(url) {
    let headers = new Headers();
    if (this.devMode === "false") {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = this.baseUrl + `noauth/getMeta/${url}?usecache=True&expire=30`;
    return fetch(searchUrl, { headers: headers })
      .then(res => res.json());
  }

  getLogHtml(dgraphId, arrayId, taskId) {
    let headers = new Headers();
    if (this.devMode === "false") {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = this.nfsBaseURL + 'logJSON/' + dgraphId + '/' + arrayId + '/' + taskId + '/' + 1024000;
    return fetch(searchUrl, { headers: headers })
      .then(res => res.json());
  }

  networkCheck() {
    let headers = new Headers();
    if (this.devMode === "false") {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = this.baseUrl + 'noauth/health_rest';
    return fetch(searchUrl, { headers: headers })
      .then(res => {
        let body = res.json();
        return body.data || {};
      });
  }

  // Query the coda-rest-nfs service to get a baked rvspec for our list of
  // ids.
  getRVSpec(idList, externalIP) {
    let headers = new Headers();
    if (this.devMode === "false") {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    console.log("[DEBUG] In getRVSpec()")
    console.log("[DEBUG] - idList=" + idList.join(","))
    let searchUrl = this.nfsBaseURL + 'rvspec/?ids=' + idList.join(",");
    if (!externalIP) {
      return fetch(searchUrl, { headers: headers })
        .then(res => res.json());
    }
  }

  playImages(dgraphId, arrayId = 0, taskId = 0) {
    // return new Promise((resolve, reject) => { resolve([]) });
    let headers = new Headers();
    if (this.devMode === "false") {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = '';
    console.log("[DEBUG] In playImages()")
    if (taskId) {
      console.log("[DEBUG] - dgraphId=" + dgraphId)
      console.log("[DEBUG] - arrayId=" + arrayId)
      console.log("[DEBUG] - taskId=" + taskId)
      searchUrl = this.nfsBaseURL + 'imagepaths/' + dgraphId + '/' + arrayId + '/' + taskId;
      return fetch(searchUrl, { headers: headers })
        .then(res => {
          let body = res.json();
          return body.data || {};
        })
    }
    else if (arrayId) {
      console.log("[DEBUG] - dgraphId=" + dgraphId)
      console.log("[DEBUG] - arrayId=" + arrayId)
      searchUrl = this.nfsBaseURL + 'imagepaths/' + dgraphId + '/' + arrayId;
      return fetch(searchUrl, { headers: headers })
        .then(res => {
          let body = res.json();
          return body.data || {};
        })
    }
    console.log("[DEBUG] - dgraphId=" + dgraphId)
    searchUrl = this.nfsBaseURL + 'imagepaths/' + dgraphId;
    return fetch(searchUrl, { headers: headers })
      .then(res => {
        let body = res.json();
        return body.data || {};
      })
  }

  requeueAll(dgraphId, arrayId = null, taskId = null) {
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
    if (this.devMode === "false") {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = this.baseUrl + 'noauth/actions/requeueAll/' + jobId;
    return fetch(searchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(""),
    }).then(res => res);
  }

  requeueRun(dgraphId, arrayId = null, taskId = null) {
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
    if (this.devMode === "false") {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = this.baseUrl + 'noauth/actions/requeueRun/' + jobId;
    return fetch(searchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(""),
    }).then(res => res);
  }

  requeueExit(dgraphId, arrayId = null, taskId = null) {
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
    if (this.devMode === "false") {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = this.baseUrl + 'noauth/actions/requeueExit/' + jobId;
    return fetch(searchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(""),
    }).then(res => res);
  }

  kill(dgraphId, arrayId = null, taskId = null) {
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
    if (this.devMode === "false") {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = this.baseUrl + 'noauth/actions/kill/' + jobId;
    return fetch(searchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(""),
    }).then(res => res);
  }

  killToDone(dgraphId, arrayId = null, taskId = null) {
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
    if (this.devMode === "false") {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = this.baseUrl + 'noauth/actions/killToDone/' + jobId;
    return fetch(searchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(""),
    }).then(res => res);
  }

  requeueLocal(hostname, isexclusive, dgraphId, arrayId = null, taskId = null) {
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
    if (this.devMode === "false") {
      headers.append('X-Requested-With', 'XMLHttpRequest');
    }
    let searchUrl = this.baseUrl + 'noauth/actions/requeueLocal/' + jobId;
    return fetch(searchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(token),
    }).then(res => res);
  }

  breakDgraphDependencies(dgraphId) {
    let depExpRequest = this.setDgraphMeta(dgraphId, "depexp", "true", this.devMode);
    let dgraphDepExpRequest = this.setDgraphMeta(dgraphId, "dgraphdepexp", "true", this.devMode);
    let arrayDepExpRequest = this.setDgraphMeta(dgraphId, "arraydepexp", "true", this.devMode);
    let taskDepExpRequest = this.setDgraphMeta(dgraphId, "taskdepexp", "true", this.devMode);
    return Promise.all([depExpRequest, dgraphDepExpRequest, arrayDepExpRequest, taskDepExpRequest]);
  }

  breakArrayDependencies(dgraphId, arrayId) {
    let depExpRequest = this.setArrayMeta(dgraphId, arrayId, "depexp", "true", this.devMode);
    let dgraphDepExpRequest = this.setArrayMeta(dgraphId, arrayId, "dgraphdepexp", "true", this.devMode);
    let arrayDepExpRequest = this.setArrayMeta(dgraphId, arrayId, "arraydepexp", "true", this.devMode);
    let taskDepExpRequest = this.setArrayMeta(dgraphId, arrayId, "taskdepexp", "true", this.devMode);
    return Promise.all([depExpRequest, dgraphDepExpRequest, arrayDepExpRequest, taskDepExpRequest]);
  }

  breakTaskDependencies(dgraphId, arrayId, taskId) {
    let depExpRequest = this.setTaskMeta(dgraphId, arrayId, taskId, "depexp", "true", this.devMode);
    let dgraphDepExpRequest = this.setTaskMeta(dgraphId, arrayId, taskId, "dgraphdepexp", "true", this.devMode);
    let arrayDepExpRequest = this.setTaskMeta(dgraphId, arrayId, taskId, "arraydepexp", "true", this.devMode);
    let taskDepExpRequest = this.setTaskMeta(dgraphId, arrayId, taskId, "taskdepexp", "true", this.devMode);
    return Promise.all([depExpRequest, dgraphDepExpRequest, arrayDepExpRequest, taskDepExpRequest]);
  }

  getSearchSuggestions(searchValue) {
    let searchFields = [
      { elasticsearchName: "icoda_username", displayName: "user" },
      // { elasticsearchName: "title", displayName: "title" },
      { elasticsearchName: "dept", displayName: "dept" },
      { elasticsearchName: "production", displayName: "show" },
      { elasticsearchName: "shot", displayName: "shot" },
      { elasticsearchName: "seq", displayName: "seq" },
      { elasticsearchName: "_statusname", displayName: "status" }
    ]
    let searchUrl = this.elasticsearchURL + '/_search';

    //construct POST requests
    let searchRequests = [];
    searchFields.forEach(field => {
      let query = { "query": searchValue, "operator": "and" };
      let searchBody = {
        "size": 0,
        "query": {
          "match": {}
        },
        "aggs": {}
      }
      searchBody.query.match[field.elasticsearchName] = query;
      searchBody.aggs[field.displayName] = { "terms": { "field": field.elasticsearchName + ".raw", "size": 4 } };
      searchRequests.push(fetch(searchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchBody),
      }));
    });

    //send requests
    return Promise.all(searchRequests).then(
      (responses) => Promise.all(responses.map(response => response.json()))
    ).then(responseData => {
      //parse through all responses
      let suggestions = [];
      responseData.map(data => {
        for (let field in data.aggregations) {
          if (data.aggregations[field].buckets) {
            suggestions = suggestions.concat(data.aggregations[field].buckets.map(bucket => { return { "title": bucket.key, "header": field } }));
          }
        }
      });
      //return results concatenated
      return suggestions;
    });
  }

  // Work In Progress: We are not calling this yet in SearchBar.js but may do so in
  // order to separate the fetch to get titles from the other field suggestions since
  // titles suggestions take so long to come back
  getTitleSearchSuggestions(searchValue) {
    let searchUrl = this.elasticsearchURL + '/_search';

    //construct POST body
    let searchBody = {
      "size": 0,
      "query": {
        "match": {
          "title": { "query": searchValue, "operator": "and" }
        }
      },
      "aggs": {
        "title": { "terms": { "field": "title.raw", "size": 4 } }
      }
    }
    //fetch results
    return fetch(searchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchBody),
    }).then(response => response.json()).then(respData => {
      //restructure data before returning response
      let suggestions = [];
      if (respData.aggregations && respData.aggregations["title"]) {
        suggestions = suggestions.concat(respData.aggregations["title"].buckets.map(bucket => { return { "title": bucket.key, "header": "title" } }));
      }
      return suggestions;
    });
  }
}

export default ElasticSearchService;