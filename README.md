#Words visualization
This is a client-server app with mongodb and node.js on the server side.

###Description
App works with two steps:


1. Populating the database.
Here is a parsing script (parseFilesToDb.js) which can be run by node.js.
This script looking for nouns in books (specified in config variable inside the script) and stores it into the mongodb.
Nouns are taken from the dictionaries. The algorithm used is quite naive so parsing takes a bit of time (about 5-8 minutes at my machine).
Here is a wide field for improvements.
After parsing we have database with only two collections: words and sentences. Each *word* has \_id equals to the word itself,
and array of 'links', where each link is another word and array of sentence numbers (where these words are present).
Each *sentence* is just a number and sentence from book itself.

2. Running the server. Now we could see our nouns and how they are connected. At the 'localhost:8080' now available some UI:
![UI](https://cloud.githubusercontent.com/assets/4989157/7406661/b15bb330-ef52-11e4-920c-5ac01d133260.png)
When the page is loaded list of words is empty. You could type part of some word or just click at search-icon to show all nouns.
They will be shown at the first column. Choose the word and click the picture-icon for drawing a graph of connections.
For a graph available zoom and drag the vertices. Graph provided by d3.js library.

###Installation
You need the following components are pre-installed to run this app:

+ Mongodb
+ node.js
+ npm
+ bower

After you could run app with a few steps:  
```
git clone https://github.com/Alendorff/Connected-nouns.git  
cd Connected-nouns  
npm install  
cd ./public  
bower install 
cd ../ 
```
To perform the following steps, you will need a running mongodb instance.

```
node parseFilesToDb.js
```

Parsing will take some time...
After it you could run the server.

```
node server.js
```

Visit localhost:8080

