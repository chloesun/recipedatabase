var express = require ('express');
var fs = require('fs');
var app = express();
var mongo = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var assert = require('assert');
var url = 'mongodb://localhost:27017/recipeDB';
const ROOT = "./public";

//set up the pug
app.set('views', 'public/views');
app.set('view engine', 'pug');

app.use(express.static(ROOT));  //handle all static requests
app.use(bodyParser.urlencoded({extended:true}));

// app.all("*",function(req,res){
// 	res.sendStatus(404);
// });

app.listen(2406, function () {  
	console.log('Example app listening on port 2406!')
});


//routing
app.use(function(req,res,next){
	console.log(req.method+" request for "+req.url);
	next();
});

app.get('/', function (req, res) {
	res.render('index');
});

app.get('/recipes', function(req, res, next){
	mongo.connect(url, function(err, db){
		assert.equal(null, err);
		db.collection('recipes').find().toArray(function(err, docs) {
			assert.equal(null, err);
			db.close();
			var names = docs.map(function(doc){ return doc.name;}); //return an array of names [name1, name2, ...]
			res.json({'names': names}); // {names: [name1, name2, ...]}
		});
	});
});

app.post('/recipe', function(req, res, next){
	console.log(req.body);

	var item = {
		name: req.body.name,
		duration: req.body.duration,
		ingredients: req.body.ingredients,
		directions: req.body.directions,
		notes: req.body.notes
	};

	if(!item.name){
		res.status(400).send("Bad Request: name missing");
	}else{
		mongo.connect(url, function(err, db){
			assert.equal(null, err);
			db.collection('recipes').save(item, function(err){
				if(err){
					res.status(500).send("server error!");
				}else{
					console.log('Item saved');
				
					//res.redirect('/');
					res.end();
				}
				db.close();
			});
		});
	}
});


app.get('/recipe/:name', function(req, res, next){
	console.log("recipe name: " + req.params.name);

	mongo.connect(url, function(err, db){
		assert.equal(null, err);
		db.collection('recipes').findOne({'name': req.params.name}, function(err, item){
			res.json(item);
			console.log(item);
		});
	})
});



