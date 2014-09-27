default: setup run

run:
	nodemon app.js

setup:
	npm install -g nodemon
	npm install
