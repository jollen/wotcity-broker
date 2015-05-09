# DEPRECATED

* This project has been move to `https://github.com/wotcity/dotcity-websocket-broker`.
* This project has been migrated from BSD license to Apache 2.0 license (prepare to open source).

## WoT.City

Websocket channel for ARM mbed.

## Install

## Usage

## Try *ws://wot.city*

To send the data over the Internet, mbed device should use the url below to establish a connection with the server.

```
ws://wot.city/object/[name]/send
```

You must specify a object name for the connection. For example:

```
ws://wot.city/object/mbedtaiwan/send
```

To receive data from the server, the frontend should use the url below to establish a connection with the server.

```
ws://wot.city/object/[name]/viewer
```

Also, you need to specify the object name. For example:

```
ws://wot.city/object/mbedtaiwan/viewer
```

An mbed object has two significant resources, *send* and *viewer*. *send* receives data streams over Websocket connection, and *viewer* sends data streams to Websocket clients.

