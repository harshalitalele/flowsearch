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
        #queryStr = urllib.parse.quote(queryStr)
        #print(queryStr)
        datatest = urllib.request.urlopen(solr_ip + queryStr)
        docstest = json.load(datatest)
    except:
        print("An exception occurred for Query: " + query)
        docstest = '[]'
    return json.dumps(docstest)

@application.route('/update', methods = ['POST'])
def update():
    data = request.json
    #data = urllib.parse.urlencode({"data":data}).encode()
    print(data)
    url = "http://localhost:8983/solr/Diabetes/update/json?_=1596513024938&commitWithin=1000&overwrite=true&wt=json"
    resp = urllib.request.urlopen(url, data={"data": data})
    print(resp)
    responsejson = json.load(resp)
    return json.dumps(responsejson)

if __name__ == '__main__':
    application.run(host='0.0.0.0')
