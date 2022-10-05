const  elasticsearchURL = 'https://wdas-elastic.fas.fa.disney.com:9200/coda_6';

class ElasticSearchService {
    static getDgraphs(query, from, size, hidden) {
        let searchQuery = (hidden ? '' : '!clienthide:1 ') + (query ? ('_exists_:did !_exists_:aid ' + query) : '_exists_:did !_exists_:aid');
        let searchUrl = elasticsearchURL+'/_search?default_operator=AND&sort=did:desc&from=' + from + '&size=' + size + '&q=' + encodeURIComponent(searchQuery);
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
