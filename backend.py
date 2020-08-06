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

@application.route('/update', methods = ['POST'])
def update():
    data = request.json
    data = urllib.parse.urlencode({"data":data}).encode()
    print(data)
    url = "http://localhost:8983/solr/Diabetes/update/json?_=1596513024938&commitWithin=1000&overwrite=true&wt=json"
    req =  request.Request(url, data=data)
    resp = request.urlopen(req)
    #response = urllib.request.urlopen(url, data)
    print(resp)
    responsejson = json.load(resp)
    return json.dumps(responsejson)

@application.route('/test', methods = ['POST'])
def testPOST():
    print('req received')
    data = request.json
    print('data obtained')
    responsejson = json.load(data)
    print('data into json')
    return json.dumps(responsejson)

@application.route('/calltest', methods = ['GET'])
def callTest():
    info = '[{"id": "f261-02-9780323640596","isbn": "9780323640596","book": "Cameron/Current Surgical Therapy","figure": "200"}]'
    data = urllib.parse.urlencode({"data":info}).encode()
    print(data)
    url1 = "http://localhost:5000/test"
    resp = request.post(url1, data=json.dumps(info))
    print(resp)
    responsejson = json.load(resp)
    return json.dumps(responsejson)

if __name__ == '__main__':
    application.run(host='0.0.0.0')
