
tools:
check autoreloading server logs (im running it for you dont run a server)
tail -n 300 server.log

testing
source .venv/bin/activate && pytest .

but ideally run one test at a time
