# CodingQuests

CodingQuests is a new algorithm visualization workbench. Open source, MIT license.


## Current Status

Right now... early days. Polymorphic data viewers are the main thing currently.

## Project Structure

```
/                            #
├─ c_src/                    # C++ and Metal source code
├─ data/                     # Small sample data files for development (not full data files)
├─ website/                  # HTML, CSS, JavaScript for the web interface
│  ├─ gguf-explorer.html     #  View meta data for LLMs
│  ├─ css-refactor.html      #  CSS Refactoring tool
│  ├─ include-path-tool.html #  Restores js relative include paths, after you move js libs
│  ├─ scatter-gather.html    #  Collects from markdown files, and sends back to them.
│  ├─ omni<something>.html   #  Morphing data viewers
│  ├─ algorith-explorer.html #  Classic algorithms data flow demo
│  └─ 3sat.html              #  How computers solve 3Sat
├─ py/                       # Python scripts
│  ├─ ready_to_rock.py       #  Checks readiness; Sets up environment; Compiles code
│  └─ web_server.py          #  Web browser front end
├─ docs/                     # Docs (work in progress).
│  ├─ explanations/          #  Background rather than how to
│  ├─ how-to/                #  Recipes organised by related topics
│  ├─ reference/             #  Settings for the various scripts 
│  └─ tutorials/             #  Tutorial content
├─ GETTING_STARTED.md        # How to set up the system
├─ LICENSE.md                # Copyright licenses
├─ CITATION.cff              # Citing this work
└─ README.md                 # This README
```



## Getting started

For the viewers in /website you don't need a webserver, so you can just use them as is already and drag and drop files into them. The web server will be needed when there is heavy data crunching happenning and databases to access.

