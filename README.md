# Cosmic.Link website

* Sources: https://github.com/cosmic-plus/webapp-cosmic-link
* Build: https://github.com/cosmic-plus/https-cosmic-link
* Website: https://cosmic.link

The website is served directly from the GitHub repository, thanks to CloudFlare
CDN. More precisely, what is served is the HEAD of the master branch of the
build repository.

You can run this website locally, or run your own fork of the web quite easily. 
This ensure the CosmicLink protocol doesn't stay under its creator control and 
can spread around in a decentralized manner.

## Run it locally 1 (download)

You can get an archive of the website at: 
https://github.com/cosmic-plus/https-cosmic-link/archive/master.zip

Some browsers will accept to `index.html` like this (like Firefox), some other 
won't (like Chrome).

## Run it locally 2 (git, npm & live-server)

If you have git and npm, you can serve the website localy:

```sh
git clone https://github.com/cosmic-plus/https-cosmic-link
cd https-cosmic-link
npm install --global live-server
live-server
```

The website should be available at http://127.0.0.1:8080. If you want to use it
with your Ledger Wallet, you'll need to serve the website over a local https
layer. To do so:

```sh
npm install --global live-server-https
live-server --https=/usr/local/lib/node_modules/live-server-https
```

## Serve it on the web

You can serve your own clone of the Cosmic.Link website on Github simply by 
forking the `https://github.com/cosmic-plus/https-cosmic-link` repository. Then 
go to the repository settings and under `GitHub Pages` select `Master` as 
Source. Your clone will be available at:

> https://{username}.github.io/{repository}

You can serve it over your own by tweaking the `CNAME` file and [making your 
domain point to 
GitHub](https://help.github.com/articles/quick-start-setting-up-a-custom-domain/)

You can then use it to link Stellar transactions from static documents, social 
medias and your websites.

## Tweak it

If you only want to change the way the website display, you can edit the files 
`index.html` and `main.css` of the build repository.

If you want to play with the javascript sources, you need to get them 
beforehand:

```sh
git clone https://github.com/cosmic-plus/webapp-cosmic-link
cd webapp-cosmic-link
npm install
npm run get
npm run serve
```

The changes made to the javascripts files into the `src/` directory will be 
pushed to the website automatically. The changes to the html and css files in 
the `src/` directory have to be manually pushed using:

```sh
npm build-html
npm build-css
```

Remember that the source repository contains the build repository as a 
submodule at `web/`. All you'll have to do to publish your modified version of
the website is to push this submodule to your own GitHub repository.


## Build it

To pack the production version:

```sh
npm run format
npm run build
```

## Check build integrity

The git status should show no modified files after running:

```sh
npm run check
```

## Roadmap

https://github.com/cosmic-plus/webapp-cosmic-link/TODO.md
