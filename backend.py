from flask import Flask, render_template, request
from flask_cors import CORS
import urllib.request
import urllib.parse
import json

application = Flask(__name__)
cors = CORS(application, resources={r"/*": {"origins": "*"}})

solr_ip = 'http://localhost:8983/solr/Diabetes/select?'

@application.route("/")
def home():
    return render_template("index.html")

@application.route('/query', methods = ['GET'])
def fetchData():
    try:
        filters = request.args
        queryStr = ''
        for filt in filters:
            if filt == 'q':
                queryStr += filt + "=text:" + filters[filt]
            else:
                queryStr += "&" + filt + "=" + filters[filt]

        print(queryStr)
        datatest = urllib.request.urlopen(solr_ip + queryStr)
        docstest = json.load(datatest)
    except:
        print("An exception occurred for Query: " + query)
        docstest = '[]'
    return json.dumps(docstest)

@application.route('/queryWithFilters', methods = ['POST'])
def fetchDataAndFilter():
    query = 'tweet_text:' + request.args.get('q')
    query = urllib.parse.quote(query)
    filters = request.get_json().get('data')
    resp = {'tweets': [], 'count': 0}
    facetq = ''
    print(filters)
    for f in filters:
        if f == 'includeReplies':
            if filters[f] == False:
                facetq += '&fq=-in_reply_to_status_id:' + urllib.parse.quote('[* TO *]')
        elif filters[f] != '' and filters[f] != None:
            facetq += '&fq=' + f + ':' + urllib.parse.quote(filters[f])
    print(facetq)
    url = tweets_url.format(query, facetq)
    print(url)
    try:
        datatest = json.load(urllib.request.urlopen(url))
        resp['tweets'] = datatest['response']['docs']
        resp['count'] = datatest['response']['numFound']
    except:
        print("An exception occurred for Query: " + query)
    resp = json.dumps(resp)
    return resp

if __name__ == '__main__':
    application.run(host='0.0.0.0')
