default: setup run

run:
	nf start --procfile Procfile.local

setup:
	npm install -g nodemon
	npm install -g foreman
	npm install
	git remote add heroku git@heroku.com:goaskamt.git

deploy:
	git push heroku master
