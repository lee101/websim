[webSim](https://webSim.netwrck.com)
==================

[webSim](https://webSim.netwrck.com) AI Code editor for building the web.

Built with Python running on the Google App Engine.

Built by leeleepenkman [twitter](https://twitter.com/leeleepenkman)

and [Netwrck.com](https://netwrck.com)
### setup

```
virtualenv .env
. ./.env/bin/activate
pip install -r requirements.txt
pip install -r dev-requirements.txt
```

### running


```
GOOGLE_APPLICATION_CREDENTIALS=secrets/google-credentials.json NLTK_DATA=gaedata gunicorn -k gthread -b :$PORT main:app --timeout 120 --workers 1 --threads 1
```

### testing

```
GOOGLE_APPLICATION_CREDENTIALS=secrets/google-credentials.json PYTHONPATH=$(pwd) NLTK_DATA=gaedata pytest .
```
