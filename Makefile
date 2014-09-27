default: setup run

run:
	nodemon app.js

setup:
	npm install -g nodemon
	npm install
	git remote add heroku git@heroku.com:goaskamt.git

deploy:
	git push heroku master
