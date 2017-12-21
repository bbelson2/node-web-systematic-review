# Origin 
This repo is forked from the following:

> Name: node-web-systematic-review  
> Version: 1.0.0  
> Author: Luis Augusto Melo Rohten  
> Date: 05/02/2016  
> Execute: node app.js  

# Purpose
The main purpose of the script remains the same: to download citations from the SpringerLink web-site.

# Changes
## Infrastructure

New infrastructure has been added, to help with URL construction, and to make the script more general.

Logging has been added.

## Workflow

The script downloads the SpringerLink citation page via the URL on the article page, in bibtex format. Formerly, the citiation was composed from screen-scraped fragments on the article page.

The script runs until all requests have returned or failed, and reports the total counts of found, missing and null citations.

All bibtex pages are concatenated into a single output file: springerlink.bib.

# Future changes

It is intended to add support for IEEE and ScienceDirect databases. These will require new infrastructure, particularly for AJAX (asynchronous) result pages.
