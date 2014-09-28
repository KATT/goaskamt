default: setup run

run:
	./node_modules/foreman/nf.js start --procfile Procfile.local


setup:
	npm install
	git remote add heroku git@heroku.com:goaskamt.git

deploy:
	git push heroku master
