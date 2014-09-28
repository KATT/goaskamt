default: setup run

run:
	./node_modules/foreman/nf.js start --procfile Procfile.local

build:
	./node_modules/brunch/bin/brunch build --production

setup:
	npm install
	git remote add heroku git@heroku.com:goaskamt.git

deploy: build
	git add --force public/css/style.css
	# git add --force public/js/app.js

	git commit -m "heroku deploy"

	git push heroku master --force
	git reset HEAD~1

	heroku open
