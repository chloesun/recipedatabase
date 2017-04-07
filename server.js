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
	var resultArray = [];
	mongo.connect(url, function(err, db){
		assert.equal(null, err);
		var cursor = db.collection('recipes').find();
		cursor.forEach(function(doc, err){
			assert.equal(null, err);
			resultArray.push(doc);
		}, function(){
			db.close();
			res.render('index');
		});
	});

});

app.post('/recipe', function(req, res, next){
	console.log(req.body);

	var item = {
		name: req.body.name,
		duration: req.body.duration,
		ingredients: req.body.ingredients,
		steps: req.body.steps,
		notes: req.body.notes
	}

	mongo.connect(url, function(err, db){
		assert.equal(null, err);
		db.collection('recipes').save(item, function(err, req, res){
			assert.equal(null, err);
			console.log('Item saved');
			db.close();
			//res.redirect('/');
		})
	})

});

