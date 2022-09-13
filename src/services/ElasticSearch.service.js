const  elasticsearchURL = '';

class ElasticSearchService {

  //FUNCTIONS WILL NOT WORK SO USE MOCKDATA.JS to replace what this endpoints would had provided.
  // Q: ASK ME IF YOU HAVE ANY QUESTIONS.

    static getDgraphs(query, from, size) {
        let searchQuery = query ? '_exists_:did !_exists_:aid '+query : '_exists_:did !_exists_:aid';
        let searchUrl = elasticsearchURL+'/_search?default_operator=AND&sort=did:desc&from=' + from + '&size=' + size + '&q='+encodeURIComponent(searchQuery);
        return fetch(searchUrl).then(res => res.json());
    }

    static getArrays(did) {
        let searchQuery = '_exists_:aid !_exists_:tid did:'+did;
        let searchUrl = elasticsearchURL+'/_search?default_operator=AND&sort=aid:asc&q='+encodeURIComponent(searchQuery);
        return fetch(searchUrl).then(res => res.json());
    }

    static getTasks(did, aid) {
        let searchQuery = '_exists_:tid did:'+did+' aid: '+aid;
        let searchUrl = elasticsearchURL+'/_search?default_operator=AND&sort=tid:asc&q='+encodeURIComponent(searchQuery);
        return fetch(searchUrl).then(res => res.json());
    }
}

export default ElasticSearchService;
