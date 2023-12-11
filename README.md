# stats-demo-server
Demo of stats web application backend

The dummy and default stats implementation is only a dummy implementation that returns random data.
The data is stored in memory and is not persistent.
Any number of clients will receive updates immediatly upon changes.
This includes additions and deletions of statistics entries
The number of stats is capped to 100

## Build the docker image
```
docker build -t stats-demo-server .
```

## Run the docker image
```
docker run -p 3001:3001 stats-demo-server
```