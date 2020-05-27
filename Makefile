.PHONY: run log hrestart hdyno
run:
	nodemon start

open:
	heroku open -a robot-control-server

log:
	heroku logs -a robot-control-server -t

restart:
	heroku restart -a robot-control-server

dyno:
	heroku ps -a robot-control-server
